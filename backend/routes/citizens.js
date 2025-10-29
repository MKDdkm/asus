const express = require('express');
const router = express.Router();

// Get all citizens
router.get('/', async (req, res) => {
  try {
    const db = req.app.get('db');
    const citizens = db.getCitizens();
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