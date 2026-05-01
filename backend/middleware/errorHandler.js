// Middleware de gestion globale des erreurs
const errorHandler = (err, req, res, next) => {
  console.error('❌ Erreur :', err.stack);

  // Erreur Multer
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: "L'image ne peut pas dépasser 5MB" });
  }

  // Erreur Mongoose : ID invalide
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'ID invalide' });
  }

  // Erreur Mongoose : Validation
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: 'Données invalides', errors: messages });
  }

  // Erreur Mongoose : Duplicate Key
  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: 'Cette ressource existe déjà' });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Erreur interne du serveur',
  });
};

module.exports = errorHandler;
