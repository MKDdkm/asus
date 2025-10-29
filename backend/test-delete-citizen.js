// Test Delete Citizen from MongoDB
require('dotenv').config();
const mongodb = require('./database/mongodb');
const HybridDatabase = require('./database/hybrid-db');

async function testDelete() {
  try {
    console.log('🔄 Connecting to MongoDB...\n');
    await mongodb.connect();

    const db = new HybridDatabase();
    await db.initMongoDB();

    // Get all citizens first
    const allCitizens = await db.getCitizens();
    console.log(`📊 Total citizens before delete: ${allCitizens.length}\n`);

    if (allCitizens.length === 0) {
      console.log('❌ No citizens to delete');
      process.exit(0);
    }

    // Try to delete the last citizen
    const citizenToDelete = allCitizens[allCitizens.length - 1];
    const deleteId = citizenToDelete.citizen_id || citizenToDelete._id;
    
    console.log(`🗑️  Attempting to delete citizen:`);
    console.log(`   Name: ${citizenToDelete.name}`);
    console.log(`   ID: ${deleteId}`);
    console.log(`   citizen_id: ${citizenToDelete.citizen_id}`);
    console.log(`   _id: ${citizenToDelete._id}\n`);

    const result = await db.deleteCitizen(deleteId);
    
    if (result) {
      console.log('✅ Delete successful!\n');
      
      // Check remaining citizens
      const remaining = await db.getCitizens();
      console.log(`📊 Total citizens after delete: ${remaining.length}\n`);
      
      // Verify the citizen is gone
      const checkDeleted = await db.getCitizenById(deleteId);
      if (!checkDeleted) {
        console.log('✅ Confirmed: Citizen was deleted from MongoDB');
      } else {
        console.log('❌ Warning: Citizen still exists in MongoDB');
      }
    } else {
      console.log('❌ Delete failed!');
    }

    await mongodb.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testDelete();
