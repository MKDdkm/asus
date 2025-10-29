// View MongoDB Data
require('dotenv').config();
const mongodb = require('./database/mongodb');
const Citizen = require('./models/Citizen');
const Application = require('./models/Application');
const Payment = require('./models/Payment');

async function viewData() {
  try {
    console.log('🔄 Connecting to MongoDB...\n');
    await mongodb.connect();

    // Get all citizens
    console.log('👥 ============ CITIZENS ============');
    const citizens = await Citizen.find({}).lean();
    console.log(`Total Citizens: ${citizens.length}\n`);
    
    if (citizens.length > 0) {
      citizens.forEach((citizen, index) => {
        console.log(`${index + 1}. ${citizen.name}`);
        console.log(`   ID: ${citizen.citizen_id || citizen._id}`);
        console.log(`   Aadhaar: ${citizen.aadhaar_number || 'N/A'}`);
        console.log(`   Email: ${citizen.email || 'N/A'}`);
        console.log(`   Phone: ${citizen.phone_number || 'N/A'}`);
        console.log(`   District: ${citizen.district || 'N/A'}`);
        console.log(`   Pincode: ${citizen.pincode || 'N/A'}`);
        console.log(`   Created: ${citizen.created_at ? new Date(citizen.created_at).toLocaleString() : 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('   No citizens found.\n');
    }

    // Get all applications
    console.log('📋 ========== APPLICATIONS ==========');
    const applications = await Application.find({}).lean();
    console.log(`Total Applications: ${applications.length}\n`);
    
    if (applications.length > 0) {
      applications.forEach((app, index) => {
        console.log(`${index + 1}. ${app.serviceType}`);
        console.log(`   Applicant ID: ${app.applicantId}`);
        console.log(`   Status: ${app.status}`);
        console.log(`   Submitted: ${new Date(app.submittedAt).toLocaleString()}`);
        console.log('');
      });
    } else {
      console.log('   No applications found.\n');
    }

    // Get all payments
    console.log('💰 =========== PAYMENTS ============');
    const payments = await Payment.find({}).lean();
    console.log(`Total Payments: ${payments.length}\n`);
    
    if (payments.length > 0) {
      payments.forEach((payment, index) => {
        console.log(`${index + 1}. Application: ${payment.applicationId}`);
        console.log(`   Amount: ₹${payment.amount}`);
        console.log(`   Status: ${payment.status}`);
        console.log(`   Method: ${payment.paymentMethod || 'N/A'}`);
        console.log(`   Created: ${new Date(payment.createdAt).toLocaleString()}`);
        console.log('');
      });
    } else {
      console.log('   No payments found.\n');
    }

    console.log('✅ Data retrieved successfully!');
    
    await mongodb.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

viewData();
