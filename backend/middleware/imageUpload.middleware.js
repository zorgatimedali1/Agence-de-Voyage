const multer = require('multer');
const sharp = require('sharp');

// Store file in memory (not disk) so we can compress and convert to base64
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max input
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ok = allowed.test(file.mimetype) && allowed.test(file.originalname.toLowerCase());
    ok ? cb(null, true) : cb(new Error('Seules les images JPEG, PNG et WebP sont acceptées'));
  },
});

// Middleware: parse file, compress with sharp, convert to base64 data URI
const uploadToBase64 = (req, res, next) => {
  upload.single('image')(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });

    if (req.file) {
      try {
        // Resize to max 800px wide, compress to JPEG quality 75
        // This reduces a 3MB photo to ~50-80KB
        const compressed = await sharp(req.file.buffer)
          .resize({ width: 800, withoutEnlargement: true })
          .jpeg({ quality: 75, progressive: true })
          .toBuffer();

        req.imageBase64 = `data:image/jpeg;base64,${compressed.toString('base64')}`;
      } catch (sharpErr) {
        console.error('Image compression failed:', sharpErr.message);
        // Fallback: store original if sharp fails
        const mime = req.file.mimetype;
        req.imageBase64 = `data:${mime};base64,${req.file.buffer.toString('base64')}`;
      }
    }
    next();
  });
};

module.exports = { uploadToBase64 };
