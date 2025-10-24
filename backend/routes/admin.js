const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('../database/db');

const router = express.Router();
const db = new Database();

// JWT Secret (in production, this should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'enagarika_admin_secret_key_2024';

// Middleware to verify admin token
const verifyAdminToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. No token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid token.'
    });
  }
};

// POST - Admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // Find admin user
    const admin = await db.get('SELECT * FROM admin_users WHERE username = ? AND is_active = 1', [username]);

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        department: admin.department
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last login
    await db.run('UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [admin.id]);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          fullName: admin.full_name,
          email: admin.email,
          role: admin.role,
          department: admin.department
        }
      }
    });

  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error.message
    });
  }
});

// GET - Admin dashboard overview
router.get('/dashboard', verifyAdminToken, async (req, res) => {
  try {
    // Get application statistics
    const totalApplications = await db.get('SELECT COUNT(*) as total FROM applications');
    const todayApplications = await db.get(`
      SELECT COUNT(*) as today 
      FROM applications 
      WHERE DATE(created_at) = DATE('now')
    `);
    const pendingApplications = await db.get("SELECT COUNT(*) as pending FROM applications WHERE status = 'submitted'");

    // Get payment statistics
    const totalPayments = await db.get('SELECT COUNT(*) as total, SUM(amount) as totalAmount FROM payments');
    const todayPayments = await db.get(`
      SELECT COUNT(*) as today, SUM(amount) as todayAmount 
      FROM payments 
      WHERE DATE(created_at) = DATE('now')
    `);
    const successfulPayments = await db.get('SELECT COUNT(*) as count FROM payments WHERE status = "success"');

    // Get notification statistics
    const totalNotifications = await db.get('SELECT COUNT(*) as total FROM notifications');
    const unreadNotifications = await db.get('SELECT COUNT(*) as unread FROM notifications WHERE is_read = 0');

    // Get recent applications
    const recentApplications = await db.all(`
      SELECT a.*, p.amount as payment_amount, p.status as payment_status
      FROM applications a
      LEFT JOIN payments p ON a.application_id = p.application_id
      ORDER BY a.created_at DESC 
      LIMIT 10
    `);

    // Get application status breakdown
    const statusBreakdown = await db.all(`
      SELECT status, COUNT(*) as count
      FROM applications 
      GROUP BY status
    `);

    // Get service type breakdown
    const serviceBreakdown = await db.all(`
      SELECT service_type, COUNT(*) as count
      FROM applications 
      GROUP BY service_type
    `);

    res.json({
      success: true,
      data: {
        overview: {
          applications: {
            total: totalApplications.total,
            today: todayApplications.today,
            pending: pendingApplications.pending
          },
          payments: {
            total: totalPayments.total,
            totalAmount: totalPayments.totalAmount || 0,
            today: todayPayments.today || 0,
            todayAmount: todayPayments.todayAmount || 0,
            successful: successfulPayments.count
          },
          notifications: {
            total: totalNotifications.total,
            unread: unreadNotifications.unread
          }
        },
        recentApplications,
        statusBreakdown,
        serviceBreakdown
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data',
      message: error.message
    });
  }
});

// GET - Get all applications for admin
router.get('/applications', verifyAdminToken, async (req, res) => {
  try {
    const { status, service_type, search, limit = 100, offset = 0 } = req.query;
    
    let sql = `
      SELECT a.*, p.payment_id, p.amount as payment_amount, p.status as payment_status, p.payment_method
      FROM applications a
      LEFT JOIN payments p ON a.application_id = p.application_id
      WHERE 1=1
    `;
    let params = [];

    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }

    if (service_type) {
      sql += ' AND a.service_type = ?';
      params.push(service_type);
    }

    if (search) {
      sql += ' AND (a.applicant_name LIKE ? OR a.application_id LIKE ? OR a.aadhaar_number LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const applications = await db.all(sql, params);

    // Get total count for pagination
    let countSql = 'SELECT COUNT(*) as total FROM applications WHERE 1=1';
    let countParams = [];
    
    if (status) {
      countSql += ' AND status = ?';
      countParams.push(status);
    }
    
    if (service_type) {
      countSql += ' AND service_type = ?';
      countParams.push(service_type);
    }

    if (search) {
      countSql += ' AND (applicant_name LIKE ? OR application_id LIKE ? OR aadhaar_number LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const countResult = await db.get(countSql, countParams);

    res.json({
      success: true,
      data: applications,
      pagination: {
        total: countResult.total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: countResult.total > (parseInt(offset) + parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching applications for admin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch applications',
      message: error.message
    });
  }
});

// PUT - Update application status (Admin)
router.put('/applications/:applicationId/status', verifyAdminToken, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, reason } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
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

    const oldStatus = application.status;
    const adminUsername = req.admin.username;

    // Update application status
    await db.run(`
      UPDATE applications 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE application_id = ?
    `, [status, applicationId]);

    // Add to status history
    await db.run(`
      INSERT INTO application_status_history (application_id, old_status, new_status, changed_by, reason)
      VALUES (?, ?, ?, ?, ?)
    `, [applicationId, oldStatus, status, adminUsername, reason || 'Status updated by admin']);

    // Create notification for citizen
    const statusMessages = {
      'approved': 'Your application has been approved! 🎉 You can now collect your documents.',
      'rejected': 'Your application has been rejected. Please check the reason and reapply if necessary.',
      'under_review': 'Your application is now under review by our officials.',
      'document_required': 'Additional documents are required for your application. Please submit them at your earliest convenience.',
      'completed': 'Your application has been completed successfully! 🎉',
      'processing': 'Your application is being processed.',
      'on_hold': 'Your application is temporarily on hold. We will update you soon.'
    };

    if (statusMessages[status]) {
      const notificationId = `NOT${Date.now()}`;
      await db.run(`
        INSERT INTO notifications (
          notification_id, application_id, type, title, message, category, action_required
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        notificationId,
        applicationId,
        status === 'approved' || status === 'completed' ? 'success' : status === 'rejected' ? 'error' : 'info',
        `Application ${status.replace('_', ' ').toUpperCase()}`,
        statusMessages[status],
        'application',
        status === 'document_required' ? 1 : 0
      ]);
    }

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: {
        applicationId,
        oldStatus,
        newStatus: status,
        updatedBy: adminUsername,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update application status',
      message: error.message
    });
  }
});

// POST - Send broadcast notification
router.post('/broadcast', verifyAdminToken, async (req, res) => {
  try {
    const {
      title,
      message,
      type = 'info',
      category = 'announcement'
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Title and message are required'
      });
    }

    // Generate unique notification ID
    const notificationId = `ADMIN_BROADCAST_${Date.now()}`;
    
    // Insert broadcast notification
    await db.run(`
      INSERT INTO notifications (
        notification_id, type, title, message, category
      ) VALUES (?, ?, ?, ?, ?)
    `, [
      notificationId,
      type,
      `📢 ADMIN: ${title}`,
      message,
      category
    ]);

    res.status(201).json({
      success: true,
      message: 'Broadcast notification sent successfully',
      data: {
        notificationId,
        title,
        message,
        type,
        category,
        broadcastBy: req.admin.username,
        broadcastAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error broadcasting notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to broadcast notification',
      message: error.message
    });
  }
});

// GET - Admin activity logs
router.get('/logs', verifyAdminToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const logs = await db.all(`
      SELECT 
        'status_change' as action_type,
        application_id,
        old_status,
        new_status,
        changed_by,
        reason,
        created_at
      FROM application_status_history
      WHERE changed_by IS NOT NULL
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), parseInt(offset)]);

    res.json({
      success: true,
      data: logs
    });

  } catch (error) {
    console.error('Error fetching admin logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin logs',
      message: error.message
    });
  }
});

// GET - Export applications data
router.get('/export/applications', verifyAdminToken, async (req, res) => {
  try {
    const { format = 'json', status, service_type } = req.query;

    let sql = `
      SELECT a.*, p.payment_id, p.amount as payment_amount, p.status as payment_status
      FROM applications a
      LEFT JOIN payments p ON a.application_id = p.application_id
      WHERE 1=1
    `;
    let params = [];

    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }

    if (service_type) {
      sql += ' AND a.service_type = ?';
      params.push(service_type);
    }

    sql += ' ORDER BY a.created_at DESC';

    const applications = await db.all(sql, params);

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = Object.keys(applications[0] || {}).join(',');
      const csvRows = applications.map(app => 
        Object.values(app).map(value => 
          typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        ).join(',')
      );
      const csvContent = [csvHeaders, ...csvRows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=applications_${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvContent);
    } else {
      res.json({
        success: true,
        data: applications,
        exportedAt: new Date().toISOString(),
        totalRecords: applications.length
      });
    }

  } catch (error) {
    console.error('Error exporting applications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export applications',
      message: error.message
    });
  }
});

module.exports = router;