const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to your SQLite database
const dbPath = path.join(__dirname, 'enagarika.db');

console.log('➕ Adding Test Citizens to Database...');
console.log('📁 Database Path:', dbPath);
console.log('=' .repeat(60));

// Open database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  console.log('✅ Connected to SQLite database');
});

// Test citizens data
const testCitizens = [
  {
    citizen_id: 'CIT' + Date.now() + '01',
    name: 'Ravi Kumar',
    name_kannada: 'ರವಿ ಕುಮಾರ್',
    email: 'ravi.kumar@example.com',
    phone: '9876543201',
    address: '123 MG Road, Bangalore',
    date_of_birth: '1990-05-15',
    gender: 'Male',
    occupation: 'Software Developer',
    district: 'Bangalore Urban',
    pincode: '560001'
  },
  {
    citizen_id: 'CIT' + Date.now() + '02',
    name: 'Lakshmi Devi',
    name_kannada: 'ಲಕ್ಷ್ಮೀ ದೇವಿ',
    email: 'lakshmi.devi@example.com',
    phone: '9876543202',
    address: '456 Brigade Road, Bangalore',
    date_of_birth: '1985-08-22',
    gender: 'Female',
    occupation: 'Teacher',
    district: 'Bangalore Urban',
    pincode: '560025'
  },
  {
    citizen_id: 'CIT' + Date.now() + '03',
    name: 'Suresh Reddy',
    name_kannada: 'ಸುರೇಶ್ ರೆಡ್ಡಿ',
    email: 'suresh.reddy@example.com',
    phone: '9876543203',
    address: '789 Jayanagar 4th Block, Bangalore',
    date_of_birth: '1988-12-10',
    gender: 'Male',
    occupation: 'Business Owner',
    district: 'Bangalore Urban',
    pincode: '560011'
  }
];

// Function to add citizens
function addTestCitizens() {
  console.log('➕ Adding test citizens...');
  
  // Create table if not exists
  db.run(`
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
  `, (err) => {
    if (err) {
      console.error('❌ Error creating table:', err.message);
      return;
    }
    
    console.log('✅ Citizens table ready');
    
    // Insert test citizens
    let completed = 0;
    testCitizens.forEach((citizen, index) => {
      db.run(`
        INSERT INTO citizens (
          citizen_id, name, name_kannada, email, phone, address,
          date_of_birth, gender, occupation, district, pincode
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        citizen.citizen_id, citizen.name, citizen.name_kannada,
        citizen.email, citizen.phone, citizen.address,
        citizen.date_of_birth, citizen.gender, citizen.occupation,
        citizen.district, citizen.pincode
      ], function(err) {
        completed++;
        
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT') {
            console.log(`⚠️  Citizen ${citizen.name} already exists (skipped)`);
          } else {
            console.error(`❌ Error adding ${citizen.name}:`, err.message);
          }
        } else {
          console.log(`✅ Added: ${citizen.name} (ID: ${citizen.citizen_id})`);
        }
        
        // Close connection when all are processed
        if (completed === testCitizens.length) {
          console.log('\n🎉 All test citizens processed!');
          console.log('📋 Run "node view-citizens.js" to see all data');
          
          db.close((err) => {
            if (err) {
              console.error('❌ Error closing database:', err.message);
            } else {
              console.log('✅ Database connection closed');
            }
          });
        }
      });
    });
  });
}

// Start adding test citizens
addTestCitizens();