// Fetch and display citizens from production (Render)
// Run with: node view-production-data.js

const API_URL = 'https://asus-2.onrender.com/api';

async function viewProductionData() {
  console.log('🌐 E-NAGARIKA PRODUCTION DATA VIEWER\n');
  console.log('='.repeat(80));
  
  try {
    // Fetch citizens
    console.log('\n📋 Fetching Citizens from Production...\n');
    const citizensResponse = await fetch(`${API_URL}/citizens`);
    const citizensData = await citizensResponse.json();
    
    if (citizensData.success && citizensData.data.length > 0) {
      console.log(`✅ Found ${citizensData.data.length} citizens:\n`);
      citizensData.data.forEach((citizen, index) => {
        console.log(`${index + 1}. ID: ${citizen.citizen_id}`);
        console.log(`   Name: ${citizen.name}`);
        console.log(`   Phone: ${citizen.phone}`);
        console.log(`   Email: ${citizen.email}`);
        console.log(`   Status: ${citizen.status}`);
        console.log('-'.repeat(80));
      });
    } else {
      console.log('📭 No citizens found in production.');
    }
    
    // Fetch applications
    console.log('\n📋 Fetching Applications from Production...\n');
    const appsResponse = await fetch(`${API_URL}/applications`);
    const appsData = await appsResponse.json();
    
    if (appsData.success && appsData.data.length > 0) {
      console.log(`✅ Found ${appsData.data.length} applications:\n`);
      appsData.data.forEach((app, index) => {
        console.log(`${index + 1}. Application ID: ${app.application_id}`);
        console.log(`   Service: ${app.service_type}`);
        console.log(`   Name: ${app.applicant_name}`);
        console.log(`   Status: ${app.status}`);
        console.log('-'.repeat(80));
      });
    } else {
      console.log('📭 No applications found in production.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n✅ Done!\n');
}

viewProductionData();
