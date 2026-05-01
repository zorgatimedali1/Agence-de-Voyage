const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const voyageController = require('../controllers/voyage.controller');
const { protect } = require('../middleware/auth.middleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'voyage-' + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const isValid = allowedTypes.test(file.mimetype) && allowedTypes.test(path.extname(file.originalname).toLowerCase());
    isValid ? cb(null, true) : cb(new Error('Seules les images JPEG, PNG et WebP sont acceptées'));
  },
});

const uploadSingle = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
};

router.get('/', voyageController.getAllVoyages);
router.get('/:id', voyageController.getVoyageById);
router.post('/', protect, uploadSingle, voyageController.createVoyage);
router.put('/:id', protect, uploadSingle, voyageController.updateVoyage);
router.delete('/:id', protect, voyageController.deleteVoyage);

module.exports = router;
