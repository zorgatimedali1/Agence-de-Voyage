const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // fail fast if Atlas unreachable
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,          // keep at least 2 connections warm
      heartbeatFrequencyMS: 10000,
    });
    console.log(`✅ MongoDB connecté : ${conn.connection.host}`);
    console.log('🔥 Connexion préchauffée — prêt à servir');

    // Ping every 4 minutes to prevent Atlas from sleeping the connection
    setInterval(async () => {
      try {
        await mongoose.connection.db.admin().ping();
        console.log('💓 MongoDB keep-alive ping OK');
      } catch (e) {
        console.warn('⚠ Keep-alive ping failed:', e.message);
      }
    }, 4 * 60 * 1000);

  } catch (error) {
    console.error(`❌ Erreur de connexion MongoDB : ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
