// Add Test Citizen to MongoDB
require('dotenv').config();
const mongodb = require('./database/mongodb');
const Citizen = require('./models/Citizen');

async function addTestCitizen() {
  try {
    console.log('🔄 Connecting to MongoDB...\n');
    await mongodb.connect();

    const testCitizen = {
      citizen_id: 'CIT' + Date.now(),
      name: 'Priya Sharma',
      aadhaar_number: '987654321012',
      phone_number: '9876543210',
      email: 'priya.sharma@example.com',
      date_of_birth: new Date('1995-05-15'),
      gender: 'female',
      address: '456 MG Road, Bangalore',
      district: 'Bangalore Urban',
      pincode: '560001',
      state: 'Karnataka'
    };

    console.log('➕ Adding new citizen...');
    console.log(`   Name: ${testCitizen.name}`);
    console.log(`   Aadhaar: ${testCitizen.aadhaar_number}`);
    console.log(`   Email: ${testCitizen.email}\n`);

    const citizen = new Citizen(testCitizen);
    const saved = await citizen.save();

    console.log('✅ Citizen added successfully!');
    console.log(`   MongoDB ID: ${saved._id}`);
    console.log(`   Created at: ${saved.createdAt}\n`);

    // Show all citizens now
    const allCitizens = await Citizen.find({}).lean();
    console.log(`📊 Total citizens in database: ${allCitizens.length}\n`);

    await mongodb.disconnect();
    console.log('✅ Done!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addTestCitizen();
