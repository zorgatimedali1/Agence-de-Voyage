const Destination = require('../models/destination.model');

// GET /destinations — Toutes les destinations
exports.getAllDestinations = async (req, res) => {
  try {
    const { search, actif } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { pays: { $regex: search, $options: 'i' } },
      ];
    }

    if (actif !== undefined) {
      filter.actif = actif === 'true';
    }

    const destinations = await Destination.find(filter).sort({ nom: 1 });
    res.status(200).json({ success: true, count: destinations.length, data: destinations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// GET /destinations/:id — Une destination par ID
exports.getDestinationById = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination non trouvée' });
    }
    res.status(200).json({ success: true, data: destination });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID invalide' });
    }
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// POST /destinations — Créer une destination
exports.createDestination = async (req, res) => {
  try {
    const image = req.imageBase64 || null;
    const destination = await Destination.create({ ...req.body, image });
    res.status(201).json({ success: true, message: 'Destination créée avec succès', data: destination });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: 'Données invalides', errors: messages });
    }
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// PUT /destinations/:id — Mettre à jour une destination
exports.updateDestination = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.imageBase64) {
      updateData.image = req.imageBase64;
    }

    const destination = await Destination.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination non trouvée' });
    }
    res.status(200).json({ success: true, message: 'Destination mise à jour', data: destination });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID invalide' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: 'Données invalides', errors: messages });
    }
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// DELETE /destinations/:id — Supprimer une destination
exports.deleteDestination = async (req, res) => {
  try {
    const destination = await Destination.findByIdAndDelete(req.params.id);
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination non trouvée' });
    }
    res.status(200).json({ success: true, message: 'Destination supprimée avec succès' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID invalide' });
    }
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};
