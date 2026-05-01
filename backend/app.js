require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const destinationRoutes = require('./routes/destination.routes');
const voyageRoutes = require('./routes/voyage.routes');
const authRoutes = require('./routes/auth.routes');
const orderRoutes = require('./routes/order.routes');

connectDB();

const app = express();

// FIX: Change 'origin' to your NETLIFY URL (the one where the website is)
app.use(cors({
  origin: ['https://your-netlify-site-name.netlify.app', 'http://localhost:4200'], 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/voyages', voyageRoutes);
app.use('/api/orders', orderRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '🚀 Zorgati Voyage API opérationnelle', timestamp: new Date() });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} non trouvée` });
});

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
// FIX: Listen on 0.0.0.0 for Render
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌍 Serveur démarré sur le port ${PORT}`);
});

module.exports = app;