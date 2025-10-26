// Simple viewer to check all applications
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'enagarika.db');
const db = new sqlite3.Database(dbPath);

console.log('📋 E-NAGARIKA APPLICATIONS VIEWER\n');
console.log('='.repeat(80));

// View all applications
db.all(`
  SELECT 
    application_id,
    service_type,
    applicant_name,
    phone_number,
    aadhaar_number,
    license_type,
    status,
    created_at
  FROM applications 
  ORDER BY created_at DESC
`, [], (err, rows) => {
  if (err) {
    console.error('❌ Error:', err.message);
    db.close();
    return;
  }

  if (rows.length === 0) {
    console.log('📭 No applications yet.');
  } else {
    console.log(`\n✅ Found ${rows.length} applications:\n`);
    
    rows.forEach((row, index) => {
      console.log(`${index + 1}. Application ID: ${row.application_id}`);
      console.log(`   Service: ${row.service_type}`);
      console.log(`   Name: ${row.applicant_name}`);
      console.log(`   Phone: ${row.phone_number}`);
      console.log(`   Aadhaar: ${row.aadhaar_number}`);
      console.log(`   License Type: ${row.license_type || 'N/A'}`);
      console.log(`   Status: ${row.status}`);
      console.log(`   Applied: ${new Date(row.created_at).toLocaleString()}`);
      console.log('-'.repeat(80));
    });
  }

  db.close();
  console.log('\n✅ Done!\n');
});
