const Order = require('../models/order.model');
const Voyage = require('../models/voyage.model');

// POST /api/orders — Public: place an order
exports.createOrder = async (req, res) => {
  try {
    const { voyage: voyageId, client, nombrePersonnes, message } = req.body;

    const voyage = await Voyage.findById(voyageId);
    if (!voyage) return res.status(404).json({ success: false, message: 'Voyage introuvable' });
    if (voyage.placesDisponibles < nombrePersonnes)
      return res.status(400).json({ success: false, message: 'Pas assez de places disponibles' });

    const prixTotal = voyage.prix * nombrePersonnes;
    const order = await Order.create({ voyage: voyageId, client, nombrePersonnes, prixTotal, message });
    const populated = await order.populate('voyage', 'titre dateDepart prix');

    res.status(201).json({ success: true, message: 'Réservation envoyée avec succès !', data: populated });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: 'Données invalides', errors: messages });
    }
    res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
  }
};

// GET /api/orders — Admin: get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const { statut, page = 1, limit = 20 } = req.query;
    const filter = statut ? { statut } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('voyage', 'titre dateDepart prix destination')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ success: true, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
  }
};

// PATCH /api/orders/:id/statut — Admin: update order status
exports.updateOrderStatut = async (req, res) => {
  try {
    const { statut } = req.body;
    if (!['en_attente', 'confirmée', 'annulée'].includes(statut))
      return res.status(400).json({ success: false, message: 'Statut invalide' });

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { statut },
      { new: true }
    ).populate('voyage', 'titre dateDepart prix');

    if (!order) return res.status(404).json({ success: false, message: 'Commande introuvable' });
    res.json({ success: true, message: 'Statut mis à jour', data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
  }
};

// DELETE /api/orders/:id — Admin: delete order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Commande introuvable' });
    res.json({ success: true, message: 'Commande supprimée' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
  }
};
