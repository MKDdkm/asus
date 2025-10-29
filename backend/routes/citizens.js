const express = require('express');
const router = express.Router();
const Citizen = require('../models/Citizen');

// Get all citizens
router.get('/', async (req, res) => {
  try {
    const dbType = req.app.get('dbType');
    
    if (dbType === 'mongodb') {
      // Use MongoDB
      const citizens = await Citizen.find().sort({ created_at: -1 });
      res.json({
        success: true,
        data: citizens
      });
    } else {
      // Use JSON Database
      const db = req.app.get('db');
      const citizens = db.getCitizens();
      res.json({
        success: true,
        data: citizens
      });
    }
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
    const dbType = req.app.get('dbType');
    const { id } = req.params;
    
    if (dbType === 'mongodb') {
      // Use MongoDB
      const citizen = await Citizen.findOne({
        $or: [
          { citizen_id: id },
          { _id: id }
        ]
      });
      
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
    } else {
      // Use JSON Database
      const db = req.app.get('db');
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
    }
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
    const dbType = req.app.get('dbType');
    const {
      name,
      name_kannada,
      email,
      phone,
      phone_number,
      address,
      address_kannada,
      date_of_birth,
      gender,
      occupation,
      district,
      pincode,
      aadhaar_number
    } = req.body;

    // Generate citizen ID
    const citizen_id = 'CIT' + Date.now().toString().slice(-6);

    if (dbType === 'mongodb') {
      // Use MongoDB
      const newCitizen = new Citizen({
        citizen_id,
        name,
        name_kannada: name_kannada || '',
        aadhaar_number: aadhaar_number || `TEMP-${Date.now()}`,
        phone_number: phone_number || phone,
        email: email || '',
        date_of_birth: date_of_birth ? new Date(date_of_birth) : new Date(),
        gender: gender || 'male',
        address,
        address_kannada: address_kannada || '',
        pincode,
        district,
        state: 'Karnataka'
      });

      await newCitizen.save();

      console.log(`✅ New citizen added to MongoDB: ${name} (ID: ${citizen_id})`);

      res.status(201).json({
        success: true,
        message: 'Citizen registered successfully',
        data: newCitizen
      });
    } else {
      // Use JSON Database
      const db = req.app.get('db');
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
      
      const newCitizen = db.addCitizen(citizenData);

      console.log(`✅ New citizen added: ${name} (ID: ${citizen_id})`);

      res.status(201).json({
        success: true,
        message: 'Citizen registered successfully',
        data: newCitizen
      });
    }
  } catch (error) {
    console.error('Error adding citizen:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to register citizen',
      error: error.message
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
    
    const updatedCitizen = db.updateCitizen(id, updates);
    
    if (!updatedCitizen) {
      return res.status(404).json({
        success: false,
        message: 'Citizen not found'
      });
    }

    console.log(`✅ Citizen updated: ${name} (ID: ${id})`);

    res.json({
      success: true,
      message: 'Citizen updated successfully',
      data: updatedCitizen
    });
  } catch (error) {
    console.error('Error updating citizen:', error);

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

    const deleted = db.deleteCitizen(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Citizen not found'
      });
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