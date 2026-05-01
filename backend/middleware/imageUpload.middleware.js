const multer = require('multer');

// Store file in memory (not disk) so we can convert to base64
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ok = allowed.test(file.mimetype) && allowed.test(file.originalname.toLowerCase());
    ok ? cb(null, true) : cb(new Error('Seules les images JPEG, PNG et WebP sont acceptées'));
  },
});

// Middleware: parse file, convert to base64 data URI, attach to req.imageBase64
const uploadToBase64 = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });

    if (req.file) {
      const mime = req.file.mimetype;
      const base64 = req.file.buffer.toString('base64');
      req.imageBase64 = `data:${mime};base64,${base64}`;
    }
    next();
  });
};

module.exports = { uploadToBase64 };
