const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom de la destination est obligatoire'],
      trim: true,
      maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères'],
    },
    pays: {
      type: String,
      required: [true, 'Le pays est obligatoire'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères'],
    },
    image: {
      type: String,
      default: null,
    },
    climat: {
      type: String,
      enum: ['tropical', 'désertique', 'méditerranéen', 'continental', 'polaire', 'tempéré'],
      default: 'méditerranéen',
    },
    langueLocale: {
      type: String,
      trim: true,
    },
    monnaie: {
      type: String,
      trim: true,
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

module.exports = mongoose.model('Destination', destinationSchema);
