require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const passport = require('./config/passport');

// Route imports
const authRoutes = require('./routes/auth');
const requestRoutes = require('./routes/requests');
const attendanceRoutes = require('./routes/attendance');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust Vercel's reverse proxy (WAJIB agar cookie secure=true bisa terkirim)
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// Middleware
const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session configuration (stored in MongoDB)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fallback_secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/sikelas_db',
      collectionName: 'sessions',
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 hari
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    },
  }),
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', requestRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server (hanya di lokal, bukan di Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 SIKELAS Backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;
