const express = require('express');
const router = express.Router();
const destinationController = require('../controllers/destination.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadToBase64 } = require('../middleware/imageUpload.middleware');

router.get('/', destinationController.getAllDestinations);
router.get('/:id', destinationController.getDestinationById);
router.post('/', protect, uploadToBase64, destinationController.createDestination);
router.put('/:id', protect, uploadToBase64, destinationController.updateDestination);
router.delete('/:id', protect, destinationController.deleteDestination);

module.exports = router;
