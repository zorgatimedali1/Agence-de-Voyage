const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders, updateOrderStatut, deleteOrder } = require('../controllers/order.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', createOrder);                          // Public
router.get('/', protect, getAllOrders);                 // Admin
router.patch('/:id/statut', protect, updateOrderStatut); // Admin
router.delete('/:id', protect, deleteOrder);            // Admin

module.exports = router;
