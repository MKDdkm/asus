const mongoose = require('mongoose');

class MongoDB {
  constructor() {
    if (MongoDB.instance) {
      return MongoDB.instance;
    }
    MongoDB.instance = this;
  }

  async connect() {
    try {
      const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/enagarika';
      
      await mongoose.connect(MONGODB_URI);

      console.log('✅ Connected to MongoDB successfully');
      console.log('📊 Database:', mongoose.connection.name);
      
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB disconnected');
      });

      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      });

    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error.message);
      throw error;
    }
  }

  async disconnect() {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }

  getConnection() {
    return mongoose.connection;
  }
}

module.exports = new MongoDB();
