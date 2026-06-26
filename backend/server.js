require('dotenv').config();
const express = require('express');
const dns = require('dns');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Force Node to use public DNS (helps resolve Atlas SRV when local DNS blocks SRV queries)
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
  console.log('Using DNS servers: 8.8.8.8, 8.8.4.4');
} catch (err) {
  console.warn('Failed to set custom DNS servers:', err.message);
}

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Uploads static dir
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes placeholder
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'NovaHR API is running' });
});

// Import routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/org', require('./routes/orgRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/approvals', require('./routes/approvalRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/shifts', require('./routes/shiftRoutes'));
app.use('/api/holidays', require('./routes/holidayRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Serve frontend static files when available
const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
  app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

// Error Handler Middleware
app.use(errorHandler);

// Database Connection
const PORT = process.env.PORT || 5000;

const connectDB = async (retries = 3) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { 
      family: 4,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      retryWrites: true
    });
    console.log('✓ Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(`✗ MongoDB connection error: ${err.message}`);
    if (retries > 0) {
      console.log(`Retrying... (${retries} attempts left)`);
      setTimeout(() => connectDB(retries - 1), 3000);
    } else {
      console.error('\n⚠ Cannot connect to MongoDB Atlas. Please:');
      console.error('  1. Check your MongoDB URI in .env');
      console.error('  2. Whitelist your IP in MongoDB Atlas → Network Access');
      console.error('  3. Verify credentials are correct');
      process.exit(1);
    }
  }
};

connectDB();
