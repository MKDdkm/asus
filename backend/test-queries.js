require('dotenv').config();
const mongoose = require('mongoose');
const Citizen = require('./models/Citizen');
const Application = require('./models/Application');
const Payment = require('./models/Payment');

// MongoDB Query Examples
async function testQueries() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!\n');

    // ============================================
    // 1. BASIC QUERIES
    // ============================================
    console.log('📋 1. BASIC QUERIES');
    console.log('═══════════════════════════════════\n');

    // Find all citizens
    console.log('🔍 Query: Find ALL citizens');
    const allCitizens = await Citizen.find();
    console.log(`✅ Found ${allCitizens.length} citizens`);
    allCitizens.forEach(c => console.log(`   - ${c.name} (${c.district})`));

    // Find one citizen by name
    console.log('\n🔍 Query: Find citizen by name "Ramesh"');
    const ramesh = await Citizen.findOne({ name: /Ramesh/i });
    if (ramesh) {
      console.log(`✅ Found: ${ramesh.name}, ${ramesh.email}`);
    }

    // Count documents
    console.log('\n🔍 Query: Count total citizens');
    const count = await Citizen.countDocuments();
    console.log(`✅ Total citizens: ${count}`);

    // ============================================
    // 2. ADVANCED FILTERS
    // ============================================
    console.log('\n\n📋 2. ADVANCED FILTERS');
    console.log('═══════════════════════════════════\n');

    // Filter by district
    console.log('🔍 Query: Find citizens in "Bangalore Urban"');
    const bangaloreCitizens = await Citizen.find({ district: 'Bangalore Urban' });
    console.log(`✅ Found ${bangaloreCitizens.length} citizens in Bangalore Urban`);

    // Filter by gender
    console.log('\n🔍 Query: Find male citizens');
    const maleCitizens = await Citizen.find({ gender: 'male' });
    console.log(`✅ Found ${maleCitizens.length} male citizens`);

    // Filter by date range (citizens born after 1990)
    console.log('\n🔍 Query: Find citizens born after 1990');
    const youngCitizens = await Citizen.find({
      date_of_birth: { $gt: new Date('1990-01-01') }
    });
    console.log(`✅ Found ${youngCitizens.length} citizens born after 1990`);

    // Multiple conditions (AND)
    console.log('\n🔍 Query: Find male citizens in Bangalore');
    const bangaloreMales = await Citizen.find({
      gender: 'male',
      district: 'Bangalore Urban'
    });
    console.log(`✅ Found ${bangaloreMales.length} results`);

    // ============================================
    // 3. SEARCH QUERIES
    // ============================================
    console.log('\n\n📋 3. SEARCH QUERIES (Regex)');
    console.log('═══════════════════════════════════\n');

    // Search by partial name
    console.log('🔍 Query: Search names containing "a"');
    const searchResults = await Citizen.find({
      name: { $regex: 'a', $options: 'i' } // i = case insensitive
    });
    console.log(`✅ Found ${searchResults.length} citizens with "a" in name`);
    searchResults.forEach(c => console.log(`   - ${c.name}`));

    // Search by phone number
    console.log('\n🔍 Query: Search phone number starting with "987"');
    const phoneResults = await Citizen.find({
      phone_number: { $regex: '^987' }
    });
    console.log(`✅ Found ${phoneResults.length} citizens`);

    // ============================================
    // 4. SORTING & LIMITING
    // ============================================
    console.log('\n\n📋 4. SORTING & LIMITING');
    console.log('═══════════════════════════════════\n');

    // Sort by name (A-Z)
    console.log('🔍 Query: Get citizens sorted by name (A-Z)');
    const sortedCitizens = await Citizen.find().sort({ name: 1 }); // 1 = ascending
    console.log(`✅ Sorted ${sortedCitizens.length} citizens:`);
    sortedCitizens.forEach(c => console.log(`   - ${c.name}`));

    // Sort by date (newest first)
    console.log('\n🔍 Query: Get newest citizens first');
    const newestFirst = await Citizen.find().sort({ created_at: -1 }); // -1 = descending
    console.log(`✅ Newest citizen: ${newestFirst[0]?.name || 'None'}`);

    // Limit results
    console.log('\n🔍 Query: Get only 2 citizens');
    const limitedResults = await Citizen.find().limit(2);
    console.log(`✅ Got ${limitedResults.length} citizens (limited to 2)`);

    // ============================================
    // 5. SPECIFIC FIELD SELECTION
    // ============================================
    console.log('\n\n📋 5. SELECT SPECIFIC FIELDS');
    console.log('═══════════════════════════════════\n');

    // Get only name and phone number
    console.log('🔍 Query: Get only names and phone numbers');
    const namesOnly = await Citizen.find().select('name phone_number -_id');
    console.log(`✅ Got ${namesOnly.length} results:`);
    namesOnly.forEach(c => console.log(`   - ${c.name}: ${c.phone_number}`));

    // ============================================
    // 6. APPLICATION QUERIES
    // ============================================
    console.log('\n\n📋 6. APPLICATION QUERIES');
    console.log('═══════════════════════════════════\n');

    // Find pending applications
    console.log('🔍 Query: Find pending applications');
    const pendingApps = await Application.find({ status: 'pending' });
    console.log(`✅ Found ${pendingApps.length} pending applications`);

    // Find applications by service type
    console.log('\n🔍 Query: Find Driving License applications');
    const drivingLicenseApps = await Application.find({ 
      service_type: 'Driving License' 
    });
    console.log(`✅ Found ${drivingLicenseApps.length} Driving License applications`);

    // Find applications with status NOT pending
    console.log('\n🔍 Query: Find non-pending applications');
    const nonPending = await Application.find({
      status: { $ne: 'pending' } // $ne = not equal
    });
    console.log(`✅ Found ${nonPending.length} non-pending applications`);
    nonPending.forEach(app => console.log(`   - ${app.application_id}: ${app.status}`));

    // ============================================
    // 7. PAYMENT QUERIES
    // ============================================
    console.log('\n\n📋 7. PAYMENT QUERIES');
    console.log('═══════════════════════════════════\n');

    // Find completed payments
    console.log('🔍 Query: Find completed payments');
    const completedPayments = await Payment.find({ status: 'completed' });
    console.log(`✅ Found ${completedPayments.length} completed payments`);

    // Calculate total amount
    console.log('\n🔍 Query: Calculate total payment amount');
    const allPayments = await Payment.find();
    const totalAmount = allPayments.reduce((sum, p) => sum + p.amount, 0);
    console.log(`✅ Total payments: ₹${totalAmount}`);

    // Find payments by method
    console.log('\n🔍 Query: Find UPI payments');
    const upiPayments = await Payment.find({ payment_method: 'upi' });
    console.log(`✅ Found ${upiPayments.length} UPI payments`);

    // ============================================
    // 8. AGGREGATION QUERIES
    // ============================================
    console.log('\n\n📋 8. AGGREGATION (Advanced)');
    console.log('═══════════════════════════════════\n');

    // Group by district
    console.log('🔍 Query: Count citizens by district');
    const byDistrict = await Citizen.aggregate([
      { $group: { _id: '$district', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    console.log('✅ Citizens by district:');
    byDistrict.forEach(d => console.log(`   - ${d._id}: ${d.count} citizens`));

    // Group applications by status
    console.log('\n🔍 Query: Count applications by status');
    const byStatus = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    console.log('✅ Applications by status:');
    byStatus.forEach(s => console.log(`   - ${s._id}: ${s.count}`));

    // ============================================
    // 9. OR QUERIES
    // ============================================
    console.log('\n\n📋 9. OR QUERIES');
    console.log('═══════════════════════════════════\n');

    // Find citizens from multiple districts
    console.log('🔍 Query: Find citizens from Bangalore OR Mysore');
    const multiDistrict = await Citizen.find({
      $or: [
        { district: 'Bangalore Urban' },
        { district: 'Mysore' }
      ]
    });
    console.log(`✅ Found ${multiDistrict.length} citizens`);

    // ============================================
    // 10. UPDATE QUERIES
    // ============================================
    console.log('\n\n📋 10. UPDATE EXAMPLES');
    console.log('═══════════════════════════════════\n');

    // Update one document
    console.log('🔍 Query: Update application status');
    const appToUpdate = await Application.findOne({ status: 'pending' });
    if (appToUpdate) {
      appToUpdate.status = 'approved';
      appToUpdate.remarks = 'Documents verified and approved';
      await appToUpdate.save();
      console.log(`✅ Updated: ${appToUpdate.application_id} → ${appToUpdate.status}`);
    }

    // Update multiple documents
    console.log('\n🔍 Query: Add verified flag to all citizens');
    const updateResult = await Citizen.updateMany(
      {}, // empty filter = all documents
      { $set: { verified: true } }
    );
    console.log(`✅ Updated ${updateResult.modifiedCount} citizens`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n\n🎉 ═══════════════════════════════════');
    console.log('✅ ALL QUERIES TESTED SUCCESSFULLY!');
    console.log('🎉 ═══════════════════════════════════');
    console.log('📊 Summary:');
    console.log(`   - Total Citizens: ${await Citizen.countDocuments()}`);
    console.log(`   - Total Applications: ${await Application.countDocuments()}`);
    console.log(`   - Total Payments: ${await Payment.countDocuments()}`);
    console.log('🎉 ═══════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Query test failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
}

// Run query tests
testQueries();
