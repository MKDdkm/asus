// Add Mithun citizen via API
const API_URL = 'http://localhost:3001/api';

async function addMithun() {
  const mithunData = {
    name: 'Mithun',
    name_kannada: 'ಮಿಥುನ್',
    aadhaar_number: '1234-5678-' + Math.floor(Math.random() * 10000),
    phone_number: '9988776655',
    phone: '9988776655',
    email: 'mithun@example.com',
    date_of_birth: '1992-03-15',
    gender: 'male',
    address: '789 MG Road, Bangalore',
    address_kannada: '೭೮೯ ಎಂ.ಜಿ ರೋಡ್, ಬೆಂಗಳೂರು',
    pincode: '560001',
    district: 'Bangalore Urban'
  };

  try {
    console.log('🔄 Adding Mithun via API...');
    const response = await fetch(`${API_URL}/citizens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mithunData)
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Mithun added successfully!');
      console.log('📋 Citizen ID:', data.data.citizen_id);
      console.log('👤 Name:', data.data.name);
      console.log('📱 Phone:', data.data.phone_number);
      console.log('\n🌐 NOW CHECK MONGODB ATLAS:');
      console.log('1. Go to MongoDB Atlas Dashboard');
      console.log('2. Click "Browse Collections"');
      console.log('3. Select database: enagarika');
      console.log('4. Open collection: citizens');
      console.log('5. You should see Mithun there! 🎉\n');
    } else {
      console.log('❌ Failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addMithun();
