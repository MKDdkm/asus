const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import database
const HybridDatabase = require('./database/hybrid-db');

// Import route modules
const applicationRoutes = require('./routes/applications');
const paymentRoutes = require('./routes/payments');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');
const citizenRoutes = require('./routes/citizens');
const digilockerRoutes = require('./routes/digilocker');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for production (Render, Heroku, etc.)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Initialize Hybrid Database (supports MongoDB, Firebase, and JSON)
const db = new HybridDatabase();
app.set('db', db);
app.set('dbType', 'hybrid');

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:8080', 
    'http://localhost:8081', 
    'http://localhost:3000',
    'https://asus-amber.vercel.app',
    'https://asus-29iggr8ur-mkds-projects-3539950d.vercel.app',
    /\.vercel\.app$/ // Allow all Vercel preview deployments
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/applications', applicationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/citizens', citizenRoutes);
app.use('/api/digilocker', digilockerRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'e-Nagarika Backend Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🏛️ e-Nagarika Backend API Server',
    description: 'Government Services Backend for Karnataka State',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      applications: '/api/applications',
      payments: '/api/payments',
      notifications: '/api/notifications',
      admin: '/api/admin'
    },
    documentation: 'Visit /api/health for server status'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: ['/api/health', '/api/applications', '/api/payments', '/api/notifications', '/api/admin', '/api/citizens']
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 ============================================');
  console.log('🏛️  e-Nagarika Backend Server Started');
  console.log('🚀 ============================================');
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
  console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Database: JSON Database`);
  console.log('🚀 ============================================');
});

module.exports = app;