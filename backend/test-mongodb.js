require('dotenv').config();
const mongoose = require('mongoose');
const Citizen = require('./models/Citizen');
const Application = require('./models/Application');
const Payment = require('./models/Payment');

// Test MongoDB Connection and CRUD Operations
async function testMongoDB() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!\n');

    // Test 1: Create a Citizen
    console.log('📝 Test 1: Creating a citizen...');
    const testCitizen = new Citizen({
      citizen_id: 'CIT' + Date.now(),
      name: 'Ramesh Kumar',
      name_kannada: 'ರಮೇಶ್ ಕುಮಾರ್',
      aadhaar_number: '1234-5678-' + Math.floor(Math.random() * 10000),
      phone_number: '9876543210',
      email: 'ramesh@example.com',
      date_of_birth: new Date('1990-01-15'),
      gender: 'male',
      address: '123 MG Road, Bangalore',
      address_kannada: '೧೨೩ ಎಂ.ಜಿ ರೋಡ್, ಬೆಂಗಳೂರು',
      pincode: '560001',
      district: 'Bangalore Urban',
      state: 'Karnataka'
    });
    
    await testCitizen.save();
    console.log('✅ Citizen created:', testCitizen.name);
    console.log('   Citizen ID:', testCitizen.citizen_id);
    console.log('   Aadhaar:', testCitizen.aadhaar_number);

    // Test 2: Create an Application
    console.log('\n📝 Test 2: Creating an application...');
    const testApplication = new Application({
      application_id: 'APP' + Date.now(),
      service_type: 'Driving License',
      applicant_name: testCitizen.name,
      applicant_name_kannada: testCitizen.name_kannada,
      aadhaar_number: testCitizen.aadhaar_number,
      phone_number: testCitizen.phone_number,
      email: testCitizen.email,
      address: testCitizen.address,
      date_of_birth: testCitizen.date_of_birth,
      gender: testCitizen.gender,
      pincode: testCitizen.pincode,
      district: testCitizen.district,
      status: 'pending',
      service_data: {
        license_type: 'Two Wheeler',
        test_date: new Date('2025-11-15')
      }
    });
    
    await testApplication.save();
    console.log('✅ Application created:', testApplication.application_id);
    console.log('   Service:', testApplication.service_type);
    console.log('   Status:', testApplication.status);

    // Test 3: Create a Payment
    console.log('\n📝 Test 3: Creating a payment...');
    const testPayment = new Payment({
      payment_id: 'PAY' + Date.now(),
      application_id: testApplication.application_id,
      citizen_id: testCitizen.citizen_id,
      amount: 500,
      payment_method: 'upi',
      transaction_id: 'TXN' + Date.now(),
      status: 'completed',
      service_type: testApplication.service_type,
      description: 'Driving License Application Fee'
    });
    
    await testPayment.save();
    console.log('✅ Payment created:', testPayment.payment_id);
    console.log('   Amount: ₹', testPayment.amount);
    console.log('   Status:', testPayment.status);

    // Test 4: Query Data
    console.log('\n📊 Test 4: Querying data...');
    
    const citizenCount = await Citizen.countDocuments();
    const applicationCount = await Application.countDocuments();
    const paymentCount = await Payment.countDocuments();
    
    console.log('✅ Total Citizens:', citizenCount);
    console.log('✅ Total Applications:', applicationCount);
    console.log('✅ Total Payments:', paymentCount);

    // Test 5: Find specific data
    console.log('\n🔍 Test 5: Finding data...');
    const foundCitizen = await Citizen.findOne({ citizen_id: testCitizen.citizen_id });
    console.log('✅ Found citizen:', foundCitizen.name);
    
    const pendingApplications = await Application.find({ status: 'pending' });
    console.log('✅ Pending applications:', pendingApplications.length);

    const completedPayments = await Application.find({ status: 'completed' });
    console.log('✅ Completed payments:', completedPayments.length);

    // Test 6: Update data
    console.log('\n✏️  Test 6: Updating application status...');
    testApplication.status = 'under_review';
    testApplication.remarks = 'Documents verified, processing started';
    await testApplication.save();
    console.log('✅ Application updated to:', testApplication.status);

    // Summary
    console.log('\n🎉 =======================================');
    console.log('✅ ALL MONGODB TESTS PASSED!');
    console.log('🎉 =======================================');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🔗 Connection:', process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@'));
    console.log('📦 Collections created:');
    console.log('   - citizens');
    console.log('   - applications');
    console.log('   - payments');
    console.log('🎉 =======================================\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
}

// Run tests
testMongoDB();
