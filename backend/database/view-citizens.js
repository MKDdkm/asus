const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to your SQLite database
const dbPath = path.join(__dirname, 'enagarika.db');

console.log('🔍 Reading Citizen Data from Database...');
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

// Function to display citizens data
function displayCitizens() {
  console.log('\n👥 CITIZENS DATA:');
  console.log('-'.repeat(60));
  
  db.all('SELECT * FROM citizens ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error('❌ Error fetching citizens:', err.message);
      return;
    }
    
    if (rows.length === 0) {
      console.log('📭 No citizens found in database');
    } else {
      console.log(`📊 Found ${rows.length} citizens:`);
      console.log('');
      
      rows.forEach((citizen, index) => {
        console.log(`${index + 1}. 👤 ${citizen.name}`);
        console.log(`   🆔 ID: ${citizen.citizen_id}`);
        console.log(`   📧 Email: ${citizen.email}`);
        console.log(`   📱 Phone: ${citizen.phone}`);
        console.log(`   🏠 Address: ${citizen.address}`);
        console.log(`   🌍 District: ${citizen.district || 'N/A'}`);
        console.log(`   💼 Occupation: ${citizen.occupation || 'N/A'}`);
        console.log(`   📅 Registered: ${new Date(citizen.created_at).toLocaleDateString()}`);
        console.log(`   🔄 Status: ${citizen.status}`);
        if (citizen.name_kannada) {
          console.log(`   🔤 Kannada: ${citizen.name_kannada}`);
        }
        console.log('-'.repeat(40));
      });
    }
    
    // Close database connection
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err.message);
      } else {
        console.log('✅ Database connection closed');
      }
    });
  });
}

// Function to show all tables
function showTables() {
  console.log('\n📋 DATABASE TABLES:');
  console.log('-'.repeat(30));
  
  db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, rows) => {
    if (err) {
      console.error('❌ Error fetching tables:', err.message);
      return;
    }
    
    rows.forEach((table, index) => {
      console.log(`${index + 1}. ${table.name}`);
    });
    
    // Now display citizens data
    displayCitizens();
  });
}

// Start by showing tables
showTables();