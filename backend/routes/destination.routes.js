const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const destinationController = require('../controllers/destination.controller');
const { protect } = require('../middleware/auth.middleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'dest-' + uniqueSuffix + path.extname(file.originalname));
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

router.get('/', destinationController.getAllDestinations);
router.get('/:id', destinationController.getDestinationById);
router.post('/', protect, uploadSingle, destinationController.createDestination);
router.put('/:id', protect, uploadSingle, destinationController.updateDestination);
router.delete('/:id', protect, destinationController.deleteDestination);

module.exports = router;
