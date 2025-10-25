const admin = require('firebase-admin');

class FirebaseDatabase {
  constructor() {
    this.initialized = false;
    this.db = null;
    this.initializeFirebase();
  }

  initializeFirebase() {
    try {
      // Check if Firebase credentials are provided
      if (!process.env.FIREBASE_PROJECT_ID) {
        console.log('⚠️  Firebase not configured - using JSON database as fallback');
        return;
      }

      // Initialize Firebase Admin with credentials from environment variables
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
      });

      this.db = admin.firestore();
      this.initialized = true;
      console.log('✅ Firebase connected successfully');
    } catch (error) {
      console.error('❌ Firebase initialization error:', error.message);
      console.log('📝 Falling back to JSON database');
    }
  }

  isConnected() {
    return this.initialized && this.db !== null;
  }

  // Citizens Operations
  async getCitizens() {
    if (!this.isConnected()) return null;
    
    try {
      const snapshot = await this.db.collection('citizens').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting citizens from Firebase:', error);
      return null;
    }
  }

  async getCitizenById(id) {
    if (!this.isConnected()) return null;
    
    try {
      const doc = await this.db.collection('citizens').doc(id).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (error) {
      console.error('Error getting citizen by ID:', error);
      return null;
    }
  }

  async addCitizen(citizenData) {
    if (!this.isConnected()) return null;
    
    try {
      const docRef = await this.db.collection('citizens').add({
        ...citizenData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      const doc = await docRef.get();
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error adding citizen:', error);
      return null;
    }
  }

  async updateCitizen(id, updates) {
    if (!this.isConnected()) return null;
    
    try {
      await this.db.collection('citizens').doc(id).update({
        ...updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      const doc = await this.db.collection('citizens').doc(id).get();
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error updating citizen:', error);
      return null;
    }
  }

  async deleteCitizen(id) {
    if (!this.isConnected()) return false;
    
    try {
      await this.db.collection('citizens').doc(id).delete();
      return true;
    } catch (error) {
      console.error('Error deleting citizen:', error);
      return false;
    }
  }

  // Applications Operations
  async getApplications() {
    if (!this.isConnected()) return null;
    
    try {
      const snapshot = await this.db.collection('applications').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting applications:', error);
      return null;
    }
  }

  async addApplication(applicationData) {
    if (!this.isConnected()) return null;
    
    try {
      const docRef = await this.db.collection('applications').add({
        ...applicationData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      const doc = await docRef.get();
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error adding application:', error);
      return null;
    }
  }

  async updateApplication(id, updates) {
    if (!this.isConnected()) return null;
    
    try {
      await this.db.collection('applications').doc(id).update({
        ...updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      const doc = await this.db.collection('applications').doc(id).get();
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error updating application:', error);
      return null;
    }
  }

  // Payments Operations
  async getPayments() {
    if (!this.isConnected()) return null;
    
    try {
      const snapshot = await this.db.collection('payments').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting payments:', error);
      return null;
    }
  }

  async addPayment(paymentData) {
    if (!this.isConnected()) return null;
    
    try {
      const docRef = await this.db.collection('payments').add({
        ...paymentData,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      const doc = await docRef.get();
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error adding payment:', error);
      return null;
    }
  }

  // Notifications Operations
  async getNotifications() {
    if (!this.isConnected()) return null;
    
    try {
      const snapshot = await this.db.collection('notifications').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting notifications:', error);
      return null;
    }
  }

  async addNotification(notificationData) {
    if (!this.isConnected()) return null;
    
    try {
      const docRef = await this.db.collection('notifications').add({
        ...notificationData,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      const doc = await docRef.get();
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error adding notification:', error);
      return null;
    }
  }
}

module.exports = FirebaseDatabase;
