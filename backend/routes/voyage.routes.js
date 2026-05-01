const express = require('express');
const router = express.Router();
const voyageController = require('../controllers/voyage.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadToBase64 } = require('../middleware/imageUpload.middleware');

router.get('/', voyageController.getAllVoyages);
router.get('/:id', voyageController.getVoyageById);
router.post('/', protect, uploadToBase64, voyageController.createVoyage);
router.put('/:id', protect, uploadToBase64, voyageController.updateVoyage);
router.delete('/:id', protect, voyageController.deleteVoyage);

module.exports = router;
