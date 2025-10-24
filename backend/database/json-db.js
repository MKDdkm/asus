const fs = require('fs');
const path = require('path');

class JSONDatabase {
  constructor() {
    this.dataPath = path.join(__dirname, 'citizens-data.json');
    this.init();
  }

  init() {
    // Check if file exists, if not create it
    if (!fs.existsSync(this.dataPath)) {
      this.saveData({
        citizens: [],
        nextId: 1,
        lastUpdated: new Date().toISOString()
      });
    }
    console.log('✅ JSON Database initialized');
  }

  // Read data from JSON file
  loadData() {
    try {
      const data = fs.readFileSync(this.dataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Error loading data:', error);
      return { citizens: [], nextId: 1, lastUpdated: new Date().toISOString() };
    }
  }

  // Save data to JSON file
  saveData(data) {
    try {
      data.lastUpdated = new Date().toISOString();
      fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
      console.log('💾 Data saved to JSON file');
      return true;
    } catch (error) {
      console.error('❌ Error saving data:', error);
      return false;
    }
  }

  // Get all citizens
  async all(sql, params = []) {
    const data = this.loadData();
    return data.citizens;
  }

  // Get single citizen
  async get(sql, params = []) {
    const data = this.loadData();
    
    // Simple query parsing for finding by ID or citizen_id
    if (sql.includes('WHERE')) {
      const id = params[0];
      return data.citizens.find(citizen => 
        citizen.id == id || citizen.citizen_id == id
      );
    }
    
    return data.citizens[0] || null;
  }

  // Add new citizen
  async run(sql, params = []) {
    const data = this.loadData();
    
    if (sql.includes('INSERT')) {
      const [citizen_id, name, name_kannada, email, phone, address, 
             date_of_birth, gender, occupation, district, pincode] = params;
      
      // Check if email already exists
      const existingCitizen = data.citizens.find(c => c.email === email);
      if (existingCitizen) {
        throw new Error('UNIQUE constraint failed: citizens.email');
      }
      
      const newCitizen = {
        id: data.nextId,
        citizen_id,
        name,
        name_kannada,
        email,
        phone,
        address,
        date_of_birth,
        gender,
        occupation,
        district,
        state: 'Karnataka',
        pincode,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      data.citizens.push(newCitizen);
      data.nextId++;
      
      this.saveData(data);
      
      return { lastID: newCitizen.id, changes: 1 };
    }
    
    if (sql.includes('UPDATE')) {
      const [name, name_kannada, email, phone, address, date_of_birth, 
             gender, occupation, district, pincode, status, id] = params;
      
      const citizenIndex = data.citizens.findIndex(c => 
        c.id == id || c.citizen_id == id
      );
      
      if (citizenIndex === -1) {
        return { changes: 0 };
      }
      
      // Check if email already exists (but not for the same citizen)
      const existingCitizen = data.citizens.find(c => 
        c.email === email && c.id != data.citizens[citizenIndex].id
      );
      if (existingCitizen) {
        throw new Error('UNIQUE constraint failed: citizens.email');
      }
      
      data.citizens[citizenIndex] = {
        ...data.citizens[citizenIndex],
        name,
        name_kannada,
        email,
        phone,
        address,
        date_of_birth,
        gender,
        occupation,
        district,
        pincode,
        status,
        updated_at: new Date().toISOString()
      };
      
      this.saveData(data);
      
      return { changes: 1 };
    }
    
    if (sql.includes('DELETE')) {
      const id = params[0];
      const initialLength = data.citizens.length;
      
      data.citizens = data.citizens.filter(c => 
        c.id != id && c.citizen_id != id
      );
      
      const changes = initialLength - data.citizens.length;
      
      if (changes > 0) {
        this.saveData(data);
      }
      
      return { changes };
    }
    
    return { changes: 0 };
  }

  // Close connection (no-op for JSON)
  async close() {
    console.log('📥 JSON Database connection closed');
    return Promise.resolve();
  }
}

module.exports = JSONDatabase;