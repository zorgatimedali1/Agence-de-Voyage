const mongoose = require('mongoose');
const https = require('https');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      heartbeatFrequencyMS: 10000,
    });
    console.log(`✅ MongoDB connecté : ${conn.connection.host}`);
    console.log('🔥 Connexion préchauffée — prêt à servir');

    // Keep MongoDB connection alive
    setInterval(async () => {
      try {
        await mongoose.connection.db.admin().ping();
      } catch (e) {
        console.warn('⚠ MongoDB ping failed:', e.message);
      }
    }, 4 * 60 * 1000);

    // Keep Render server alive (free tier sleeps after 15 min)
    if (process.env.RENDER_EXTERNAL_URL) {
      setInterval(() => {
        https.get(`${process.env.RENDER_EXTERNAL_URL}/api/health`, (res) => {
          console.log(`💓 Self-ping OK — status ${res.statusCode}`);
        }).on('error', (e) => {
          console.warn('⚠ Self-ping failed:', e.message);
        });
      }, 14 * 60 * 1000);
      console.log('🔄 Self-ping activé pour Render');
    }

  } catch (error) {
    console.error(`❌ Erreur de connexion MongoDB : ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
