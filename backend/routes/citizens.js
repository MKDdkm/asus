const express = require('express');
const router = express.Router();

// Get all citizens
router.get('/', async (req, res) => {
  try {
    const db = req.app.get('db');
    let citizens;
    
    if (db.getCitizens) {
      // Hybrid database - handle async
      citizens = await db.getCitizens();
    } else {
      // SQL database fallback
      citizens = await db.all('SELECT * FROM citizens ORDER BY created_at DESC');
    }
    
    // Ensure citizens is always an array
    if (!Array.isArray(citizens)) {
      citizens = [];
    }
    
    res.json({
      success: true,
      data: citizens
    });
  } catch (error) {
    console.error('Error fetching citizens:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch citizens'
    });
  }
});

// Get citizen by ID
router.get('/:id', async (req, res) => {
  try {
    const db = req.app.get('db');
    const { id } = req.params;
    
    const citizen = await db.get('SELECT * FROM citizens WHERE citizen_id = ? OR id = ?', [id, id]);
    
    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: 'Citizen not found'
      });
    }
    
    res.json({
      success: true,
      data: citizen
    });
  } catch (error) {
    console.error('Error fetching citizen:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch citizen'
    });
  }
});

// Add new citizen
router.post('/', async (req, res) => {
  try {
    const db = req.app.get('db');
    const {
      name,
      name_kannada,
      email,
      phone,
      address,
      date_of_birth,
      gender,
      occupation,
      district,
      pincode
    } = req.body;

    // Generate citizen ID
    const citizen_id = 'CIT' + Date.now().toString().slice(-6);

    let newCitizen;
    
    if (db.addCitizen) {
      // Hybrid database (Firebase/JSON)
      const citizenData = {
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
        status: 'active'
      };
      
      newCitizen = await db.addCitizen(citizenData);
    } else {
      // SQL database fallback
      const result = await db.run(`
        INSERT INTO citizens (
          citizen_id, name, name_kannada, email, phone, address, 
          date_of_birth, gender, occupation, district, pincode
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [citizen_id, name, name_kannada, email, phone, address, date_of_birth, gender, occupation, district, pincode]);

      newCitizen = await db.get('SELECT * FROM citizens WHERE id = ?', [result.lastID]);
    }

    console.log(`✅ New citizen added: ${name} (ID: ${citizen_id})`);

    res.status(201).json({
      success: true,
      message: 'Citizen registered successfully',
      data: newCitizen
    });
  } catch (error) {
    console.error('Error adding citizen:', error);
    
    // Handle unique constraint errors
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to register citizen'
    });
  }
});

// Update citizen
router.put('/:id', async (req, res) => {
  try {
    const db = req.app.get('db');
    const { id } = req.params;
    const {
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
      status
    } = req.body;

    let updatedCitizen;

    if (db.updateCitizen) {
      // Hybrid database (Firebase/JSON)
      const updates = {
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
        status: status || 'active'
      };
      
      updatedCitizen = await db.updateCitizen(id, updates);
      
      if (!updatedCitizen) {
        return res.status(404).json({
          success: false,
          message: 'Citizen not found'
        });
      }
    } else {
      // SQL database fallback
      const existingCitizen = await db.get('SELECT * FROM citizens WHERE citizen_id = ? OR id = ?', [id, id]);
      
      if (!existingCitizen) {
        return res.status(404).json({
          success: false,
          message: 'Citizen not found'
        });
      }

      await db.run(`
        UPDATE citizens SET 
          name = ?, name_kannada = ?, email = ?, phone = ?, address = ?,
          date_of_birth = ?, gender = ?, occupation = ?, district = ?, pincode = ?,
          status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE citizen_id = ? OR id = ?
      `, [name, name_kannada, email, phone, address, date_of_birth, gender, occupation, district, pincode, status || existingCitizen.status, id, id]);

      updatedCitizen = await db.get('SELECT * FROM citizens WHERE citizen_id = ? OR id = ?', [id, id]);
    }

    console.log(`✅ Citizen updated: ${name} (ID: ${id})`);

    res.json({
      success: true,
      message: 'Citizen updated successfully',
      data: updatedCitizen
    });
  } catch (error) {
    console.error('Error updating citizen:', error);
    
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update citizen'
    });
  }
});

// Delete citizen
router.delete('/:id', async (req, res) => {
  try {
    const db = req.app.get('db');
    const { id } = req.params;

    let deleted;

    if (db.deleteCitizen) {
      // Hybrid database (Firebase/JSON)
      deleted = await db.deleteCitizen(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Citizen not found'
        });
      }
    } else {
      // SQL database fallback
      const existingCitizen = await db.get('SELECT * FROM citizens WHERE citizen_id = ? OR id = ?', [id, id]);
      
      if (!existingCitizen) {
        return res.status(404).json({
          success: false,
          message: 'Citizen not found'
        });
      }

      await db.run('DELETE FROM citizens WHERE citizen_id = ? OR id = ?', [id, id]);
    }

    console.log(`🗑️ Citizen deleted (ID: ${id})`);

    res.json({
      success: true,
      message: 'Citizen deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting citizen:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete citizen'
    });
  }
});

// Get citizen statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const db = req.app.get('db');
    
    const totalCitizens = await db.get('SELECT COUNT(*) as count FROM citizens');
    const activeCitizens = await db.get('SELECT COUNT(*) as count FROM citizens WHERE status = "active"');
    const genderStats = await db.all('SELECT gender, COUNT(*) as count FROM citizens GROUP BY gender');
    const districtStats = await db.all('SELECT district, COUNT(*) as count FROM citizens GROUP BY district ORDER BY count DESC LIMIT 5');

    res.json({
      success: true,
      data: {
        total: totalCitizens.count,
        active: activeCitizens.count,
        genderDistribution: genderStats,
        topDistricts: districtStats
      }
    });
  } catch (error) {
    console.error('Error fetching citizen statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;