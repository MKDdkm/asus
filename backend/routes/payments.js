const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Database = require('../database/db');

const router = express.Router();
const db = new Database();

// GET - Fetch all payments
router.get('/', async (req, res) => {
  try {
    const { status, application_id, limit = 50, offset = 0 } = req.query;
    
    let sql = `
      SELECT p.*, a.applicant_name, a.service_type
      FROM payments p
      LEFT JOIN applications a ON p.application_id = a.application_id
      WHERE 1=1
    `;
    let params = [];

    if (status) {
      sql += ' AND p.status = ?';
      params.push(status);
    }

    if (application_id) {
      sql += ' AND p.application_id = ?';
      params.push(application_id);
    }

    sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const payments = await db.all(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM payments WHERE 1=1';
    let countParams = [];
    
    if (status) {
      countSql += ' AND status = ?';
      countParams.push(status);
    }
    
    if (application_id) {
      countSql += ' AND application_id = ?';
      countParams.push(application_id);
    }

    const countResult = await db.get(countSql, countParams);

    res.json({
      success: true,
      data: payments,
      pagination: {
        total: countResult.total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: countResult.total > (parseInt(offset) + parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payments',
      message: error.message
    });
  }
});

// GET - Fetch single payment by ID
router.get('/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await db.get(`
      SELECT p.*, a.applicant_name, a.service_type, a.phone_number, a.email
      FROM payments p
      LEFT JOIN applications a ON p.application_id = a.application_id
      WHERE p.payment_id = ?
    `, [paymentId]);

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment',
      message: error.message
    });
  }
});

// POST - Process new payment
router.post('/', async (req, res) => {
  try {
    const {
      applicationId,
      amount,
      paymentMethod,
      serviceName
    } = req.body;

    // Validate required fields
    if (!applicationId || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['applicationId', 'amount', 'paymentMethod']
      });
    }

    // Check if application exists
    const application = await db.get('SELECT * FROM applications WHERE application_id = ?', [applicationId]);
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Check if payment already exists for this application
    const existingPayment = await db.get('SELECT * FROM payments WHERE application_id = ?', [applicationId]);
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        error: 'Payment already exists for this application',
        existingPaymentId: existingPayment.payment_id
      });
    }

    // Generate unique payment ID
    const paymentId = `PAY${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const transactionId = `TXN${Date.now()}`;
    
    // Insert payment record
    await db.run(`
      INSERT INTO payments (
        payment_id, application_id, amount, payment_method, 
        transaction_id, status
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      paymentId,
      applicationId,
      parseFloat(amount),
      paymentMethod,
      transactionId,
      'success' // For demo purposes, we'll mark as success immediately
    ]);

    // Create success notification
    const notificationId = `NOT${Date.now()}`;
    await db.run(`
      INSERT INTO notifications (
        notification_id, application_id, type, title, message, category
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      notificationId,
      applicationId,
      'success',
      'Payment Successful! 💰',
      `Your payment of ₹${amount} for ${serviceName || 'service'} has been processed successfully. Payment ID: ${paymentId}`,
      'payment'
    ]);

    // Update application status to indicate payment received
    await db.run(`
      UPDATE applications 
      SET status = 'payment_received', updated_at = CURRENT_TIMESTAMP 
      WHERE application_id = ?
    `, [applicationId]);

    // Add to status history
    await db.run(`
      INSERT INTO application_status_history (application_id, old_status, new_status, reason)
      VALUES (?, ?, ?, ?)
    `, [applicationId, application.status, 'payment_received', 'Payment received successfully']);

    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        paymentId,
        transactionId,
        applicationId,
        amount: parseFloat(amount),
        status: 'success',
        method: paymentMethod,
        processedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process payment',
      message: error.message
    });
  }
});

// PUT - Update payment status
router.put('/:paymentId/status', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status, failureReason, refundId } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    // Check if payment exists
    const payment = await db.get('SELECT * FROM payments WHERE payment_id = ?', [paymentId]);
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    // Update payment
    await db.run(`
      UPDATE payments 
      SET status = ?, failure_reason = ?, refund_id = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE payment_id = ?
    `, [status, failureReason || null, refundId || null, paymentId]);

    // Create notification based on status
    const statusMessages = {
      'success': 'Your payment has been confirmed! ✅',
      'failed': `Payment failed: ${failureReason || 'Unknown error'}`,
      'refunded': 'Your payment has been refunded successfully. 💰',
      'pending': 'Your payment is being processed...',
      'processing': 'Your payment is currently being processed...'
    };

    if (statusMessages[status]) {
      const notificationId = `NOT${Date.now()}`;
      await db.run(`
        INSERT INTO notifications (
          notification_id, application_id, type, title, message, category
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        notificationId,
        payment.application_id,
        status === 'success' || status === 'refunded' ? 'success' : status === 'failed' ? 'error' : 'info',
        `Payment ${status.toUpperCase()}`,
        statusMessages[status],
        'payment'
      ]);
    }

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: {
        paymentId,
        newStatus: status,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update payment status',
      message: error.message
    });
  }
});

// GET - Payment statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalPayments = await db.get('SELECT COUNT(*) as total, SUM(amount) as totalAmount FROM payments');
    const successfulPayments = await db.get('SELECT COUNT(*) as count, SUM(amount) as amount FROM payments WHERE status = "success"');
    const todayPayments = await db.get(`
      SELECT COUNT(*) as today, SUM(amount) as todayAmount 
      FROM payments 
      WHERE DATE(created_at) = DATE('now')
    `);

    const paymentsByMethod = await db.all(`
      SELECT payment_method, COUNT(*) as count, SUM(amount) as totalAmount
      FROM payments 
      GROUP BY payment_method
    `);

    const paymentsByStatus = await db.all(`
      SELECT status, COUNT(*) as count
      FROM payments 
      GROUP BY status
    `);

    res.json({
      success: true,
      data: {
        totalPayments: totalPayments.total || 0,
        totalAmount: totalPayments.totalAmount || 0,
        successfulPayments: successfulPayments.count || 0,
        successfulAmount: successfulPayments.amount || 0,
        todayPayments: todayPayments.today || 0,
        todayAmount: todayPayments.todayAmount || 0,
        paymentsByMethod,
        paymentsByStatus
      }
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment statistics',
      message: error.message
    });
  }
});

// POST - Generate payment receipt
router.post('/:paymentId/receipt', async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await db.get(`
      SELECT p.*, a.applicant_name, a.service_type, a.phone_number, a.email, a.address
      FROM payments p
      LEFT JOIN applications a ON p.application_id = a.application_id
      WHERE p.payment_id = ?
    `, [paymentId]);

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    const receipt = {
      receiptId: `RCP${paymentId}`,
      paymentId: payment.payment_id,
      applicationId: payment.application_id,
      applicantName: payment.applicant_name,
      serviceName: payment.service_type,
      amount: payment.amount,
      paymentMethod: payment.payment_method,
      transactionId: payment.transaction_id,
      status: payment.status,
      paymentDate: payment.created_at,
      generatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Receipt generated successfully',
      data: receipt
    });

  } catch (error) {
    console.error('Error generating receipt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate receipt',
      message: error.message
    });
  }
});

module.exports = router;