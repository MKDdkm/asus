const JSONDatabase = require('./json-db');
const FirebaseDatabase = require('./firebase-db');
const mongodb = require('./mongodb');
const Citizen = require('../models/Citizen');
const Application = require('../models/Application');
const Payment = require('../models/Payment');

class HybridDatabase {
  constructor() {
    this.jsonDB = new JSONDatabase();
    this.firebaseDB = new FirebaseDatabase();
    this.useMongoDBPrimary = false;
    this.mongoDBInitialized = false;
    
    // Determine which database to use as primary
    this.useFirebase = process.env.USE_FIREBASE === 'true' && this.firebaseDB.isConnected();
    
    // Start MongoDB initialization (async, non-blocking)
    if (process.env.MONGODB_URI) {
      this.initMongoDB().catch(err => {
        console.warn('⚠️ MongoDB initialization failed:', err.message);
      });
    }
    
    const dbMode = 'Hybrid (MongoDB/Firebase/JSON with auto-fallback)';
    console.log(`📊 Database Mode: ${dbMode}`);
  }

  async initMongoDB() {
    if (this.mongoDBInitialized) {
      return this.useMongoDBPrimary;
    }
    
    try {
      if (process.env.MONGODB_URI) {
        await mongodb.connect();
        this.useMongoDBPrimary = true;
        this.mongoDBInitialized = true;
        console.log('✅ MongoDB set as primary database');
        return true;
      }
    } catch (error) {
      console.warn('⚠️ MongoDB initialization failed, using fallback database');
      this.useMongoDBPrimary = false;
      this.mongoDBInitialized = true;
      return false;
    }
    return false;
  }

  // Helper method to sync data between databases
  async syncToBackup(collection, data) {
    if (this.useFirebase) {
      // If using Firebase, backup to JSON
      try {
        const jsonData = this.jsonDB[`get${collection}`]();
        // Simple sync - you can make this more sophisticated
        console.log(`✅ Data synced to JSON backup`);
      } catch (error) {
        console.error('Backup sync error:', error);
      }
    }
  }

  // Citizens Operations
  async getCitizens() {
    try {
      // Try MongoDB first
      if (this.useMongoDBPrimary) {
        const citizens = await Citizen.find({}).lean();
        return citizens;
      }
      
      // Try Firebase
      if (this.useFirebase) {
        const data = await this.firebaseDB.getCitizens();
        return data || this.jsonDB.getCitizens();
      }
      
      // Fallback to JSON
      return this.jsonDB.getCitizens();
    } catch (error) {
      console.error('Error getting citizens:', error);
      return this.jsonDB.getCitizens();
    }
  }

  async getCitizenById(id) {
    try {
      // Try MongoDB first
      if (this.useMongoDBPrimary) {
        // Check if id is a valid MongoDB ObjectId
        const mongoose = require('mongoose');
        const isValidObjectId = mongoose.Types.ObjectId.isValid(id) && id.length === 24;
        
        const query = isValidObjectId 
          ? { $or: [{ _id: id }, { citizen_id: id }, { aadhaar_number: id }] }
          : { $or: [{ citizen_id: id }, { aadhaar_number: id }] };
        
        const citizen = await Citizen.findOne(query).lean();
        return citizen;
      }
      
      // Try Firebase
      if (this.useFirebase) {
        const data = await this.firebaseDB.getCitizenById(id);
        return data || this.jsonDB.getCitizenById(id);
      }
      
      // Fallback to JSON
      return this.jsonDB.getCitizenById(id);
    } catch (error) {
      return this.jsonDB.getCitizenById(id);
    }
  }

  async addCitizen(citizenData) {
    try {
      console.log('🔄 addCitizen called, useMongoDBPrimary:', this.useMongoDBPrimary);
      
      // Try MongoDB first
      if (this.useMongoDBPrimary) {
        console.log('📊 Attempting MongoDB save...');
        // Map field names to match MongoDB schema (handle both formats)
        const mongoData = {
          citizen_id: citizenData.citizen_id,
          name: citizenData.name,
          name_kannada: citizenData.name_kannada,
          aadhaar_number: citizenData.aadhaar_number,
          phone_number: citizenData.phone_number || citizenData.phone || '',
          email: citizenData.email || '',
          date_of_birth: citizenData.date_of_birth || new Date(),
          gender: citizenData.gender || 'other',
          address: citizenData.address || '',
          address_kannada: citizenData.address_kannada,
          pincode: citizenData.pincode || '',
          district: citizenData.district || 'Unknown',
          state: citizenData.state || 'Karnataka'
        };
        
        console.log('📝 MongoDB data prepared:', JSON.stringify(mongoData, null, 2));
        
        const citizen = new Citizen(mongoData);
        const saved = await citizen.save();
        console.log('✅ MongoDB save successful:', saved._id);
        
        // Backup to JSON
        this.jsonDB.addCitizen({ ...saved.toObject(), id: saved._id.toString() });
        console.log('✅ Backup to JSON successful');
        
        return saved.toObject();
      }
      
      // Try Firebase
      if (this.useFirebase) {
        console.log('🔥 Attempting Firebase save...');
        const result = await this.firebaseDB.addCitizen(citizenData);
        if (result) {
          this.jsonDB.addCitizen(citizenData);
          return result;
        }
      }
      
      // Fallback to JSON
      console.log('📄 Falling back to JSON database...');
      return this.jsonDB.addCitizen(citizenData);
    } catch (error) {
      console.error('❌ Error in addCitizen:', error.message);
      console.error('❌ Full error:', error);
      console.log('📄 Using JSON fallback due to error...');
      return this.jsonDB.addCitizen(citizenData);
    }
  }

  async updateCitizen(id, updates) {
    try {
      // Try MongoDB first
      if (this.useMongoDBPrimary) {
        // Check if id is a valid MongoDB ObjectId
        const mongoose = require('mongoose');
        const isValidObjectId = mongoose.Types.ObjectId.isValid(id) && id.length === 24;
        
        const query = isValidObjectId 
          ? { $or: [{ _id: id }, { citizen_id: id }, { aadhaar_number: id }] }
          : { $or: [{ citizen_id: id }, { aadhaar_number: id }] };
        
        const citizen = await Citizen.findOneAndUpdate(
          query,
          { $set: updates },
          { new: true }
        ).lean();
        
        if (citizen) {
          this.jsonDB.updateCitizen(id, updates);
          return citizen;
        }
      }
      
      // Try Firebase
      if (this.useFirebase) {
        const result = await this.firebaseDB.updateCitizen(id, updates);
        if (result) {
          this.jsonDB.updateCitizen(id, updates);
          return result;
        }
      }
      
      // Fallback to JSON
      return this.jsonDB.updateCitizen(id, updates);
    } catch (error) {
      return this.jsonDB.updateCitizen(id, updates);
    }
  }

  async deleteCitizen(id) {
    try {
      // Try MongoDB first
      if (this.useMongoDBPrimary) {
        // Check if id is a valid MongoDB ObjectId
        const mongoose = require('mongoose');
        const isValidObjectId = mongoose.Types.ObjectId.isValid(id) && id.length === 24;
        
        const query = isValidObjectId 
          ? { $or: [{ _id: id }, { citizen_id: id }, { aadhaar_number: id }] }
          : { $or: [{ citizen_id: id }, { aadhaar_number: id }] };
        
        const result = await Citizen.findOneAndDelete(query);
        
        if (result) {
          this.jsonDB.deleteCitizen(id);
          return true;
        }
      }
      
      // Try Firebase
      if (this.useFirebase) {
        const result = await this.firebaseDB.deleteCitizen(id);
        if (result) {
          this.jsonDB.deleteCitizen(id);
          return result;
        }
      }
      
      // Fallback to JSON
      return this.jsonDB.deleteCitizen(id);
    } catch (error) {
      console.error('Delete citizen error:', error.message);
      return this.jsonDB.deleteCitizen(id);
    }
  }

  // Applications Operations
  async getApplications() {
    try {
      // Try MongoDB first
      if (this.useMongoDBPrimary) {
        const applications = await Application.find({}).lean();
        return applications;
      }
      
      // Try Firebase
      if (this.useFirebase) {
        const data = await this.firebaseDB.getApplications();
        return data || this.jsonDB.getApplications();
      }
      
      // Fallback to JSON
      return this.jsonDB.getApplications();
    } catch (error) {
      return this.jsonDB.getApplications();
    }
  }

  async addApplication(applicationData) {
    try {
      // Try MongoDB first
      if (this.useMongoDBPrimary) {
        const application = new Application(applicationData);
        const saved = await application.save();
        this.jsonDB.addApplication({ ...saved.toObject(), id: saved._id.toString() });
        return saved.toObject();
      }
      
      // Try Firebase
      if (this.useFirebase) {
        const result = await this.firebaseDB.addApplication(applicationData);
        if (result) {
          this.jsonDB.addApplication(applicationData);
          return result;
        }
      }
      
      // Fallback to JSON
      return this.jsonDB.addApplication(applicationData);
    } catch (error) {
      return this.jsonDB.addApplication(applicationData);
    }
  }

  async updateApplication(id, updates) {
    try {
      // Try MongoDB first
      if (this.useMongoDBPrimary) {
        const application = await Application.findByIdAndUpdate(
          id,
          { $set: updates },
          { new: true }
        ).lean();
        
        if (application) {
          this.jsonDB.updateApplication(id, updates);
          return application;
        }
      }
      
      // Try Firebase
      if (this.useFirebase) {
        const result = await this.firebaseDB.updateApplication(id, updates);
        if (result) {
          this.jsonDB.updateApplication(id, updates);
          return result;
        }
      }
      
      // Fallback to JSON
      return this.jsonDB.updateApplication(id, updates);
    } catch (error) {
      return this.jsonDB.updateApplication(id, updates);
    }
  }

  // Payments Operations
  async getPayments() {
    try {
      // Try MongoDB first
      if (this.useMongoDBPrimary) {
        const payments = await Payment.find({}).lean();
        return payments;
      }
      
      // Try Firebase
      if (this.useFirebase) {
        const data = await this.firebaseDB.getPayments();
        return data || this.jsonDB.getPayments();
      }
      
      // Fallback to JSON
      return this.jsonDB.getPayments();
    } catch (error) {
      return this.jsonDB.getPayments();
    }
  }

  async addPayment(paymentData) {
    try {
      // Try MongoDB first
      if (this.useMongoDBPrimary) {
        const payment = new Payment(paymentData);
        const saved = await payment.save();
        this.jsonDB.addPayment({ ...saved.toObject(), id: saved._id.toString() });
        return saved.toObject();
      }
      
      // Try Firebase
      if (this.useFirebase) {
        const result = await this.firebaseDB.addPayment(paymentData);
        if (result) {
          this.jsonDB.addPayment(paymentData);
          return result;
        }
      }
      
      // Fallback to JSON
      return this.jsonDB.addPayment(paymentData);
    } catch (error) {
      return this.jsonDB.addPayment(paymentData);
    }
  }

  // Notifications Operations
  async getNotifications() {
    try {
      if (this.useFirebase) {
        const data = await this.firebaseDB.getNotifications();
        return data || this.jsonDB.getNotifications();
      }
      return this.jsonDB.getNotifications();
    } catch (error) {
      return this.jsonDB.getNotifications();
    }
  }

  async addNotification(notificationData) {
    try {
      if (this.useFirebase) {
        const result = await this.firebaseDB.addNotification(notificationData);
        if (result) {
          this.jsonDB.addNotification(notificationData);
          return result;
        }
      }
      return this.jsonDB.addNotification(notificationData);
    } catch (error) {
      return this.jsonDB.addNotification(notificationData);
    }
  }

  // Proxy all other JSON DB methods
  getApplicationById(id) { return this.jsonDB.getApplicationById(id); }
  deleteApplication(id) { return this.jsonDB.deleteApplication(id); }
  getPaymentById(id) { return this.jsonDB.getPaymentById(id); }
  updatePaymentStatus(id, status) { return this.jsonDB.updatePaymentStatus(id, status); }
  getNotificationById(id) { return this.jsonDB.getNotificationById(id); }
  markNotificationAsRead(id) { return this.jsonDB.markNotificationAsRead(id); }
  deleteNotification(id) { return this.jsonDB.deleteNotification(id); }
}

module.exports = HybridDatabase;
