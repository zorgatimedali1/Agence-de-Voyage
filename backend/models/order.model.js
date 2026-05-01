const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  voyage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Voyage',
    required: [true, 'Le voyage est obligatoire'],
  },
  client: {
    nom: { type: String, required: [true, 'Le nom est obligatoire'], trim: true },
    prenom: { type: String, required: [true, 'Le prénom est obligatoire'], trim: true },
    email: {
      type: String,
      required: [true, "L'email est obligatoire"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Email invalide'],
    },
    telephone: { type: String, trim: true },
  },
  nombrePersonnes: {
    type: Number,
    required: [true, 'Le nombre de personnes est obligatoire'],
    min: [1, 'Au moins 1 personne'],
  },
  prixTotal: { type: Number, required: true },
  statut: {
    type: String,
    enum: ['en_attente', 'confirmée', 'annulée'],
    default: 'en_attente',
  },
  message: { type: String, trim: true, maxlength: 500 },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
