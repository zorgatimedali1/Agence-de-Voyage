const mongoose = require('mongoose');

const voyageSchema = new mongoose.Schema(
  {
    titre: {
      type: String,
      required: [true, 'Le titre du voyage est obligatoire'],
      trim: true,
      maxlength: [150, 'Le titre ne peut pas dépasser 150 caractères'],
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: [true, 'La destination est obligatoire'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères'],
    },
    prix: {
      type: Number,
      required: [true, 'Le prix est obligatoire'],
      min: [0, 'Le prix ne peut pas être négatif'],
    },
    duree: {
      type: Number,
      required: [true, 'La durée est obligatoire'],
      min: [1, 'La durée doit être au moins 1 jour'],
    },
    dateDepart: {
      type: Date,
      required: [true, 'La date de départ est obligatoire'],
    },
    dateRetour: {
      type: Date,
      required: [true, 'La date de retour est obligatoire'],
    },
    placesDisponibles: {
      type: Number,
      required: [true, 'Le nombre de places est obligatoire'],
      min: [0, 'Le nombre de places ne peut pas être négatif'],
    },
    typeVoyage: {
      type: String,
      enum: ['aventure', 'culturel', 'balnéaire', 'montagne', 'citytrip', 'croisière'],
      default: 'culturel',
    },
    image: {
      type: String,
      default: null,
    },
    inclus: {
      type: [String],
      default: [],
    },
    actif: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Validation : dateRetour doit être après dateDepart
voyageSchema.pre('save', function (next) {
  if (this.dateRetour <= this.dateDepart) {
    return next(new Error('La date de retour doit être postérieure à la date de départ'));
  }
  next();
});

module.exports = mongoose.model('Voyage', voyageSchema);
