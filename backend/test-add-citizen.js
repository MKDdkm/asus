// Quick test to add a citizen via API
const API_URL = 'http://localhost:3001/api';

async function addCitizen() {
  const newCitizen = {
    name: 'Priya Sharma',
    name_kannada: 'ಪ್ರಿಯಾ ಶರ್ಮಾ',
    aadhaar_number: '9876-5432-' + Math.floor(Math.random() * 10000),
    phone_number: '9123456789',
    email: 'priya@example.com',
    date_of_birth: '1995-06-20',
    gender: 'female',
    address: '456 Brigade Road, Bangalore',
    address_kannada: '೪೫೬ ಬ್ರಿಗೇಡ್ ರೋಡ್, ಬೆಂಗಳೂರು',
    pincode: '560025',
    district: 'Bangalore Urban',
    state: 'Karnataka'
  };

  try {
    console.log('🔄 Adding new citizen via API...');
    const response = await fetch(`${API_URL}/citizens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newCitizen)
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Citizen added successfully!');
      console.log('📋 Citizen ID:', data.data.citizen_id);
      console.log('👤 Name:', data.data.name);
      console.log('\n🌐 Now go to MongoDB Atlas and refresh Collections!');
      console.log('📂 Path: enagarika → citizens');
      console.log('You should see 2 citizens now!\n');
    } else {
      console.log('❌ Failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addCitizen();
