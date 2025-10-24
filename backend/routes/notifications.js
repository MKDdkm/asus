const express = require('express');
const Database = require('../database/db');

const router = express.Router();
const db = new Database();

// GET - Fetch all notifications
router.get('/', async (req, res) => {
  try {
    const { user_id, application_id, is_read, category, limit = 50, offset = 0 } = req.query;
    
    let sql = 'SELECT * FROM notifications WHERE 1=1';
    let params = [];

    if (user_id) {
      sql += ' AND user_id = ?';
      params.push(user_id);
    }

    if (application_id) {
      sql += ' AND application_id = ?';
      params.push(application_id);
    }

    if (is_read !== undefined) {
      sql += ' AND is_read = ?';
      params.push(is_read === 'true' ? 1 : 0);
    }

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const notifications = await db.all(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM notifications WHERE 1=1';
    let countParams = [];
    
    if (user_id) {
      countSql += ' AND user_id = ?';
      countParams.push(user_id);
    }
    
    if (application_id) {
      countSql += ' AND application_id = ?';
      countParams.push(application_id);
    }
    
    if (is_read !== undefined) {
      countSql += ' AND is_read = ?';
      countParams.push(is_read === 'true' ? 1 : 0);
    }
    
    if (category) {
      countSql += ' AND category = ?';
      countParams.push(category);
    }

    const countResult = await db.get(countSql, countParams);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        total: countResult.total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: countResult.total > (parseInt(offset) + parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications',
      message: error.message
    });
  }
});

// GET - Get unread notification count
router.get('/unread/count', async (req, res) => {
  try {
    const { user_id } = req.query;
    
    let sql = 'SELECT COUNT(*) as count FROM notifications WHERE is_read = 0';
    let params = [];

    if (user_id) {
      sql += ' AND (user_id = ? OR user_id IS NULL)';
      params.push(user_id);
    }

    const result = await db.get(sql, params);

    res.json({
      success: true,
      data: {
        unreadCount: result.count
      }
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unread count',
      message: error.message
    });
  }
});

// POST - Create new notification
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      applicationId,
      type,
      title,
      message,
      category,
      actionRequired = false
    } = req.body;

    // Validate required fields
    if (!type || !title || !message || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['type', 'title', 'message', 'category']
      });
    }

    // Generate unique notification ID
    const notificationId = `NOT${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    // Insert notification
    await db.run(`
      INSERT INTO notifications (
        notification_id, user_id, application_id, type, title, 
        message, category, action_required
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      notificationId,
      userId || null,
      applicationId || null,
      type,
      title,
      message,
      category,
      actionRequired ? 1 : 0
    ]);

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: {
        notificationId,
        type,
        title,
        message,
        category,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create notification',
      message: error.message
    });
  }
});

// PUT - Mark notification as read
router.put('/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;

    // Check if notification exists
    const notification = await db.get('SELECT * FROM notifications WHERE notification_id = ?', [notificationId]);
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    // Mark as read
    await db.run('UPDATE notifications SET is_read = 1 WHERE notification_id = ?', [notificationId]);

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: {
        notificationId,
        markedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read',
      message: error.message
    });
  }
});

// PUT - Mark all notifications as read
router.put('/read/all', async (req, res) => {
  try {
    const { user_id } = req.body;

    let sql = 'UPDATE notifications SET is_read = 1 WHERE is_read = 0';
    let params = [];

    if (user_id) {
      sql += ' AND (user_id = ? OR user_id IS NULL)';
      params.push(user_id);
    }

    const result = await db.run(sql, params);

    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: {
        markedCount: result.changes,
        markedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read',
      message: error.message
    });
  }
});

// DELETE - Delete notification
router.delete('/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;

    // Check if notification exists
    const notification = await db.get('SELECT * FROM notifications WHERE notification_id = ?', [notificationId]);
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    // Delete notification
    await db.run('DELETE FROM notifications WHERE notification_id = ?', [notificationId]);

    res.json({
      success: true,
      message: 'Notification deleted successfully',
      data: {
        notificationId,
        deletedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification',
      message: error.message
    });
  }
});

// POST - Broadcast admin announcement
router.post('/broadcast', async (req, res) => {
  try {
    const {
      title,
      message,
      type = 'info',
      category = 'announcement',
      priority = 'normal'
    } = req.body;

    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Title and message are required'
      });
    }

    // Generate unique notification ID
    const notificationId = `BROADCAST${Date.now()}`;
    
    // Insert broadcast notification (no specific user_id means it's for everyone)
    await db.run(`
      INSERT INTO notifications (
        notification_id, type, title, message, category
      ) VALUES (?, ?, ?, ?, ?)
    `, [
      notificationId,
      type,
      `📢 ${title}`,
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

// GET - Notification statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalNotifications = await db.get('SELECT COUNT(*) as total FROM notifications');
    const unreadNotifications = await db.get('SELECT COUNT(*) as unread FROM notifications WHERE is_read = 0');
    const todayNotifications = await db.get(`
      SELECT COUNT(*) as today 
      FROM notifications 
      WHERE DATE(created_at) = DATE('now')
    `);

    const notificationsByCategory = await db.all(`
      SELECT category, COUNT(*) as count
      FROM notifications 
      GROUP BY category
    `);

    const notificationsByType = await db.all(`
      SELECT type, COUNT(*) as count
      FROM notifications 
      GROUP BY type
    `);

    res.json({
      success: true,
      data: {
        totalNotifications: totalNotifications.total,
        unreadNotifications: unreadNotifications.unread,
        todayNotifications: todayNotifications.today,
        notificationsByCategory,
        notificationsByType
      }
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notification statistics',
      message: error.message
    });
  }
});

module.exports = router;