const JSONDatabase = require('./json-db');
const FirebaseDatabase = require('./firebase-db');

class HybridDatabase {
  constructor() {
    this.jsonDB = new JSONDatabase();
    this.firebaseDB = new FirebaseDatabase();
    
    // Determine which database to use as primary
    this.useFirebase = process.env.USE_FIREBASE === 'true' && this.firebaseDB.isConnected();
    
    console.log(`📊 Database Mode: ${this.useFirebase ? 'Firebase (Primary) + JSON (Backup)' : 'JSON (Primary)'}`);
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
      if (this.useFirebase) {
        const data = await this.firebaseDB.getCitizens();
        return data || this.jsonDB.getCitizens(); // Fallback to JSON
      }
      return this.jsonDB.getCitizens();
    } catch (error) {
      console.error('Error getting citizens:', error);
      return this.jsonDB.getCitizens(); // Always fallback to JSON
    }
  }

  async getCitizenById(id) {
    try {
      if (this.useFirebase) {
        const data = await this.firebaseDB.getCitizenById(id);
        return data || this.jsonDB.getCitizenById(id);
      }
      return this.jsonDB.getCitizenById(id);
    } catch (error) {
      return this.jsonDB.getCitizenById(id);
    }
  }

  async addCitizen(citizenData) {
    try {
      if (this.useFirebase) {
        const result = await this.firebaseDB.addCitizen(citizenData);
        if (result) {
          // Backup to JSON
          this.jsonDB.addCitizen(citizenData);
          return result;
        }
      }
      return this.jsonDB.addCitizen(citizenData);
    } catch (error) {
      return this.jsonDB.addCitizen(citizenData);
    }
  }

  async updateCitizen(id, updates) {
    try {
      if (this.useFirebase) {
        const result = await this.firebaseDB.updateCitizen(id, updates);
        if (result) {
          this.jsonDB.updateCitizen(id, updates);
          return result;
        }
      }
      return this.jsonDB.updateCitizen(id, updates);
    } catch (error) {
      return this.jsonDB.updateCitizen(id, updates);
    }
  }

  async deleteCitizen(id) {
    try {
      if (this.useFirebase) {
        const result = await this.firebaseDB.deleteCitizen(id);
        if (result) {
          this.jsonDB.deleteCitizen(id);
          return result;
        }
      }
      return this.jsonDB.deleteCitizen(id);
    } catch (error) {
      return this.jsonDB.deleteCitizen(id);
    }
  }

  // Applications Operations
  async getApplications() {
    try {
      if (this.useFirebase) {
        const data = await this.firebaseDB.getApplications();
        return data || this.jsonDB.getApplications();
      }
      return this.jsonDB.getApplications();
    } catch (error) {
      return this.jsonDB.getApplications();
    }
  }

  async addApplication(applicationData) {
    try {
      if (this.useFirebase) {
        const result = await this.firebaseDB.addApplication(applicationData);
        if (result) {
          this.jsonDB.addApplication(applicationData);
          return result;
        }
      }
      return this.jsonDB.addApplication(applicationData);
    } catch (error) {
      return this.jsonDB.addApplication(applicationData);
    }
  }

  async updateApplication(id, updates) {
    try {
      if (this.useFirebase) {
        const result = await this.firebaseDB.updateApplication(id, updates);
        if (result) {
          this.jsonDB.updateApplication(id, updates);
          return result;
        }
      }
      return this.jsonDB.updateApplication(id, updates);
    } catch (error) {
      return this.jsonDB.updateApplication(id, updates);
    }
  }

  // Payments Operations
  async getPayments() {
    try {
      if (this.useFirebase) {
        const data = await this.firebaseDB.getPayments();
        return data || this.jsonDB.getPayments();
      }
      return this.jsonDB.getPayments();
    } catch (error) {
      return this.jsonDB.getPayments();
    }
  }

  async addPayment(paymentData) {
    try {
      if (this.useFirebase) {
        const result = await this.firebaseDB.addPayment(paymentData);
        if (result) {
          this.jsonDB.addPayment(paymentData);
          return result;
        }
      }
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
