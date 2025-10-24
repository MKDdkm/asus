const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }
    
    this.dbPath = path.join(__dirname, 'enagarika.db');
    this.init();
    Database.instance = this;
  }

  init() {
    // Ensure database directory exists
    const dbDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error('❌ Error opening database:', err.message);
      } else {
        console.log('✅ Connected to SQLite database');
        this.createTables();
      }
    });
  }

  createTables() {
    // Applications table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_id TEXT UNIQUE NOT NULL,
        service_type TEXT NOT NULL,
        applicant_name TEXT NOT NULL,
        applicant_name_kannada TEXT,
        aadhaar_number TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        email TEXT,
        address TEXT NOT NULL,
        address_kannada TEXT,
        date_of_birth TEXT,
        gender TEXT,
        pincode TEXT,
        district TEXT,
        state TEXT DEFAULT 'Karnataka',
        father_name TEXT,
        mother_name TEXT,
        qualification TEXT,
        occupation TEXT,
        nationality TEXT DEFAULT 'Indian',
        religion TEXT,
        marital_status TEXT,
        blood_group TEXT,
        license_type TEXT,
        photo_url TEXT,
        signature_url TEXT,
        status TEXT DEFAULT 'submitted',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Citizens table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS citizens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        citizen_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        name_kannada TEXT,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        date_of_birth TEXT,
        gender TEXT,
        occupation TEXT,
        district TEXT,
        state TEXT DEFAULT 'Karnataka',
        pincode TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Payments table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        payment_id TEXT UNIQUE NOT NULL,
        application_id TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method TEXT NOT NULL,
        transaction_id TEXT,
        status TEXT DEFAULT 'pending',
        failure_reason TEXT,
        refund_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (application_id) REFERENCES applications (application_id)
      )
    `);

    // Notifications table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        notification_id TEXT UNIQUE NOT NULL,
        user_id TEXT,
        application_id TEXT,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        category TEXT NOT NULL,
        is_read BOOLEAN DEFAULT 0,
        action_required BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (application_id) REFERENCES applications (application_id)
      )
    `);

    // Admin users table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        email TEXT UNIQUE,
        full_name TEXT,
        role TEXT DEFAULT 'admin',
        department TEXT,
        last_login DATETIME,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Application status history
    this.db.run(`
      CREATE TABLE IF NOT EXISTS application_status_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_id TEXT NOT NULL,
        old_status TEXT,
        new_status TEXT NOT NULL,
        changed_by TEXT,
        reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (application_id) REFERENCES applications (application_id)
      )
    `);

    console.log('✅ Database tables created/verified');
    this.seedData();
  }

  seedData() {
    // Insert default admin user
    this.db.get("SELECT COUNT(*) as count FROM admin_users", (err, row) => {
      if (err) {
        console.error('Error checking admin users:', err);
        return;
      }
      
      if (row.count === 0) {
        const bcrypt = require('bcryptjs');
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        
        this.db.run(`
          INSERT INTO admin_users (username, password_hash, email, full_name, role, department)
          VALUES (?, ?, ?, ?, ?, ?)
        `, ['admin', hashedPassword, 'admin@enagarika.kar.gov.in', 'System Administrator', 'super_admin', 'IT Department'], (err) => {
          if (err) {
            console.error('Error creating default admin:', err);
          } else {
            console.log('✅ Default admin user created (username: admin, password: admin123)');
          }
        });
      }
    });

    // Insert sample notifications
    this.db.get("SELECT COUNT(*) as count FROM notifications", (err, row) => {
      if (err) return;
      
      if (row.count === 0) {
        const sampleNotifications = [
          {
            notification_id: 'NOT001',
            type: 'system',
            title: '🎉 Welcome to e-Nagarika!',
            message: 'Your digital government services platform is now active. Apply for licenses, certificates, and more!',
            category: 'announcement'
          },
          {
            notification_id: 'NOT002',
            type: 'info',
            title: '🔊 New Feature: Voice Input',
            message: 'You can now use voice commands to fill government forms in English and Kannada!',
            category: 'system'
          }
        ];

        sampleNotifications.forEach(notification => {
          this.db.run(`
            INSERT INTO notifications (notification_id, type, title, message, category)
            VALUES (?, ?, ?, ?, ?)
          `, [notification.notification_id, notification.type, notification.title, notification.message, notification.category]);
        });

        console.log('✅ Sample notifications created');
      }
    });

    // Insert sample citizens
    this.db.get("SELECT COUNT(*) as count FROM citizens", (err, row) => {
      if (err) return;
      
      if (row.count === 0) {
        const sampleCitizens = [
          {
            citizen_id: 'CIT001',
            name: 'Rajesh Kumar',
            name_kannada: 'ರಾಜೇಶ್ ಕುಮಾರ್',
            email: 'rajesh.kumar@example.com',
            phone: '9876543210',
            address: '123 Gandhi Road, Jayanagar',
            date_of_birth: '1985-06-15',
            gender: 'Male',
            occupation: 'Software Engineer',
            district: 'Bangalore Urban',
            pincode: '560041'
          },
          {
            citizen_id: 'CIT002', 
            name: 'Priya Sharma',
            name_kannada: 'ಪ್ರಿಯಾ ಶರ್ಮಾ',
            email: 'priya.sharma@example.com',
            phone: '9876543211',
            address: '456 MG Road, Malleshwaram',
            date_of_birth: '1990-03-22',
            gender: 'Female',
            occupation: 'Teacher',
            district: 'Bangalore Urban',
            pincode: '560003'
          }
        ];

        sampleCitizens.forEach(citizen => {
          this.db.run(`
            INSERT INTO citizens (citizen_id, name, name_kannada, email, phone, address, date_of_birth, gender, occupation, district, pincode)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [citizen.citizen_id, citizen.name, citizen.name_kannada, citizen.email, citizen.phone, citizen.address, citizen.date_of_birth, citizen.gender, citizen.occupation, citizen.district, citizen.pincode]);
        });

        console.log('✅ Sample citizens created');
      }
    });
  }

  // Helper methods for database operations
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else {
          console.log('📥 Database connection closed');
          resolve();
        }
      });
    });
  }
}

module.exports = Database;