require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger.middleware');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter.middleware');

const destinationRoutes = require('./routes/destination.routes');
const voyageRoutes = require('./routes/voyage.routes');
const authRoutes = require('./routes/auth.routes');
const orderRoutes = require('./routes/order.routes');

connectDB();

const app = express();

// ── Security headers (helmet) ─────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ── CORS ──────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:4200',
    'https://zorgati-voyage.netlify.app',
    /\.vercel\.app$/,
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body parsing ──────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── NoSQL injection sanitization ──────────────
app.use(mongoSanitize());

// ── Request logger ────────────────────────────
app.use(requestLogger);

// ── No-cache for API responses ────────────────
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// ── Static uploads ────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);       // strict rate limit on auth
app.use('/api/destinations', apiLimiter, destinationRoutes);
app.use('/api/voyages', apiLimiter, voyageRoutes);
app.use('/api/orders', apiLimiter, orderRoutes);

// ── Health check ──────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Zorgati Voyage API opérationnelle',
    timestamp: new Date(),
    uptime: `${Math.floor(process.uptime())}s`,
    environment: process.env.NODE_ENV || 'development',
  });
});

// ── 404 ───────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} non trouvée` });
});

// ── Global error handler ──────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌍 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 API disponible sur http://localhost:${PORT}/api`);
});

module.exports = app;
