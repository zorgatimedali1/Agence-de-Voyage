const Voyage = require('../models/voyage.model');
const Destination = require('../models/destination.model');

// GET /voyages — Tous les voyages avec filtres
exports.getAllVoyages = async (req, res) => {
  try {
    const { search, destination, dateDepart, type, sortBy, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (search) {
      filter.titre = { $regex: search, $options: 'i' };
    }

    if (destination) {
      filter.destination = destination;
    }

    if (dateDepart) {
      const date = new Date(dateDepart);
      filter.dateDepart = {
        $gte: new Date(date.getFullYear(), date.getMonth(), 1),
        $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1),
      };
    }

    if (type) {
      filter.typeVoyage = type;
    }

    // Tri
    let sortOption = { createdAt: -1 };
    if (sortBy === 'prix_asc') sortOption = { prix: 1 };
    else if (sortBy === 'prix_desc') sortOption = { prix: -1 };
    else if (sortBy === 'duree_asc') sortOption = { duree: 1 };
    else if (sortBy === 'duree_desc') sortOption = { duree: -1 };
    else if (sortBy === 'date_asc') sortOption = { dateDepart: 1 };

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Voyage.countDocuments(filter);
    const voyages = await Voyage.find(filter)
      .populate('destination', 'nom pays image climat')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: voyages.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: voyages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// GET /voyages/:id — Un voyage par ID
exports.getVoyageById = async (req, res) => {
  try {
    const voyage = await Voyage.findById(req.params.id).populate('destination');
    if (!voyage) {
      return res.status(404).json({ success: false, message: 'Voyage non trouvé' });
    }
    res.status(200).json({ success: true, data: voyage });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID invalide' });
    }
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// POST /voyages — Créer un voyage
exports.createVoyage = async (req, res) => {
  try {
    // Vérifier que la destination existe
    const dest = await Destination.findById(req.body.destination);
    if (!dest) {
      return res.status(404).json({ success: false, message: 'Destination introuvable' });
    }

    const image = req.imageBase64 || null;
    const voyage = await Voyage.create({ ...req.body, image });
    const populated = await voyage.populate('destination', 'nom pays image');

    res.status(201).json({ success: true, message: 'Voyage créé avec succès', data: populated });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: 'Données invalides', errors: messages });
    }
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// PUT /voyages/:id — Mettre à jour un voyage
exports.updateVoyage = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.imageBase64) {
      updateData.image = req.imageBase64;
    }

    // Vérifier destination si modifiée
    if (updateData.destination) {
      const dest = await Destination.findById(updateData.destination);
      if (!dest) {
        return res.status(404).json({ success: false, message: 'Destination introuvable' });
      }
    }

    const voyage = await Voyage.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('destination', 'nom pays image');

    if (!voyage) {
      return res.status(404).json({ success: false, message: 'Voyage non trouvé' });
    }
    res.status(200).json({ success: true, message: 'Voyage mis à jour', data: voyage });
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

// DELETE /voyages/:id — Supprimer un voyage
exports.deleteVoyage = async (req, res) => {
  try {
    const voyage = await Voyage.findByIdAndDelete(req.params.id);
    if (!voyage) {
      return res.status(404).json({ success: false, message: 'Voyage non trouvé' });
    }
    res.status(200).json({ success: true, message: 'Voyage supprimé avec succès' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID invalide' });
    }
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};
