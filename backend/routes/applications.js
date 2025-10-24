const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Database = require('../database/db');

const router = express.Router();
const db = new Database();

// GET - Fetch all applications
router.get('/', async (req, res) => {
  try {
    const { status, service_type, limit = 50, offset = 0 } = req.query;
    
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
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch applications',
      message: error.message
    });
  }
});

// GET - Fetch single application by ID
router.get('/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    const application = await db.get(`
      SELECT a.*, p.payment_id, p.amount as payment_amount, p.status as payment_status, p.payment_method
      FROM applications a
      LEFT JOIN payments p ON a.application_id = p.application_id
      WHERE a.application_id = ?
    `, [applicationId]);

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Get status history
    const statusHistory = await db.all(`
      SELECT * FROM application_status_history 
      WHERE application_id = ? 
      ORDER BY created_at DESC
    `, [applicationId]);

    res.json({
      success: true,
      data: {
        ...application,
        statusHistory
      }
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch application',
      message: error.message
    });
  }
});

// POST - Submit new application
router.post('/', async (req, res) => {
  try {
    const {
      serviceName,
      applicantData,
      licenseType,
      aadhaarNumber
    } = req.body;

    // Validate required fields
    if (!serviceName || !applicantData || !aadhaarNumber) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['serviceName', 'applicantData', 'aadhaarNumber']
      });
    }

    // Generate unique application ID
    const applicationId = `${serviceName.toUpperCase().substring(0, 2)}${Date.now()}`;
    
    // Insert application
    const result = await db.run(`
      INSERT INTO applications (
        application_id, service_type, applicant_name, applicant_name_kannada,
        aadhaar_number, phone_number, email, address, address_kannada,
        date_of_birth, gender, pincode, district, state, father_name,
        mother_name, qualification, occupation, nationality, religion,
        marital_status, blood_group, license_type, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      applicationId,
      serviceName,
      applicantData.name || '',
      applicantData.nameKannada || '',
      aadhaarNumber,
      applicantData.phone || '',
      applicantData.email || '',
      applicantData.address || '',
      applicantData.addressKannada || '',
      applicantData.dob || '',
      applicantData.gender || '',
      applicantData.pincode || '',
      applicantData.district || '',
      applicantData.state || 'Karnataka',
      applicantData.fatherName || '',
      applicantData.motherName || '',
      applicantData.qualification || '',
      applicantData.occupation || '',
      applicantData.nationality || 'Indian',
      applicantData.religion || '',
      applicantData.maritalStatus || '',
      applicantData.bloodGroup || '',
      licenseType || '',
      'submitted'
    ]);

    // Create status history entry
    await db.run(`
      INSERT INTO application_status_history (application_id, new_status, reason)
      VALUES (?, ?, ?)
    `, [applicationId, 'submitted', 'Application submitted by citizen']);

    // Create notification for citizen
    const notificationId = `NOT${Date.now()}`;
    await db.run(`
      INSERT INTO notifications (
        notification_id, application_id, type, title, message, category
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      notificationId,
      applicationId,
      'success',
      'Application Submitted Successfully!',
      `Your ${serviceName} application ${applicationId} has been submitted and is under review.`,
      'application'
    ]);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        applicationId,
        status: 'submitted',
        serviceName,
        applicantName: applicantData.name,
        submittedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit application',
      message: error.message
    });
  }
});

// PUT - Update application status (Admin only)
router.put('/:applicationId/status', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, reason, updatedBy } = req.body;

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
    `, [applicationId, oldStatus, status, updatedBy || 'System', reason || 'Status updated']);

    // Create notification based on status
    const statusMessages = {
      'approved': 'Your application has been approved! 🎉',
      'rejected': 'Your application has been rejected. Please check the reason.',
      'under_review': 'Your application is now under review.',
      'document_required': 'Additional documents are required for your application.',
      'completed': 'Your application has been completed successfully! 🎉'
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

// GET - Application statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await db.all(`
      SELECT 
        status,
        COUNT(*) as count,
        service_type
      FROM applications 
      GROUP BY status, service_type
    `);

    const totalApplications = await db.get('SELECT COUNT(*) as total FROM applications');
    const todayApplications = await db.get(`
      SELECT COUNT(*) as today 
      FROM applications 
      WHERE DATE(created_at) = DATE('now')
    `);

    res.json({
      success: true,
      data: {
        totalApplications: totalApplications.total,
        todayApplications: todayApplications.today,
        statusBreakdown: stats
      }
    });
  } catch (error) {
    console.error('Error fetching application stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

module.exports = router;