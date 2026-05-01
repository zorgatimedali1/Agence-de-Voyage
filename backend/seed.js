/**
 * Script de données de démonstration — Zorgati Voyage
 * Usage : node backend/seed.js
 */

require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const Destination = require('./models/destination.model');
const Voyage = require('./models/voyage.model');

const DESTINATIONS = [
  {
    nom: 'Djerba',
    pays: 'Tunisie',
    description: "Île enchanteresse du sud tunisien, célèbre pour ses plages dorées, son architecture berbère et ses souks colorés. Un paradis méditerranéen authentique.",
    climat: 'méditerranéen',
    langueLocale: 'Arabe / Français',
    monnaie: 'Dinar Tunisien (TND)',
    actif: true,
  },
  {
    nom: 'Marrakech',
    pays: 'Maroc',
    description: "La ville ocre du Maroc, où les riads somptueux côtoient les souks labyrinthiques et la place Jemaa el-Fna s'anime au coucher du soleil.",
    climat: 'désertique',
    langueLocale: 'Arabe / Français',
    monnaie: 'Dirham Marocain (MAD)',
    actif: true,
  },
  {
    nom: 'Cappadoce',
    pays: 'Turquie',
    description: "Paysage surréaliste de cheminées de fées, grottes troglodytes et vols en montgolfière au lever du soleil. Une expérience hors du commun.",
    climat: 'continental',
    langueLocale: 'Turc',
    monnaie: 'Lire Turque (TRY)',
    actif: true,
  },
  {
    nom: 'Bali',
    pays: 'Indonésie',
    description: "L'île des dieux : temples balinais, rizières en terrasses, plages de sable noir et une spiritualité palpable à chaque coin de rue.",
    climat: 'tropical',
    langueLocale: 'Indonésien / Balinais',
    monnaie: 'Roupie Indonésienne (IDR)',
    actif: true,
  },
  {
    nom: 'Santorini',
    pays: 'Grèce',
    description: "Icône des Cyclades aux maisons blanches et dômes bleus surplombant la caldeira volcanique. Couchers de soleil inoubliables depuis Oia.",
    climat: 'méditerranéen',
    langueLocale: 'Grec',
    monnaie: 'Euro (€)',
    actif: true,
  },
  {
    nom: 'Paris',
    pays: 'France',
    description: "La Ville Lumière : la Tour Eiffel, le Louvre, les cafés parisiens, la gastronomie d'exception et une architecture haussmannienne majestueuse.",
    climat: 'tempéré',
    langueLocale: 'Français',
    monnaie: 'Euro (€)',
    actif: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // Vider les collections existantes
    await Destination.deleteMany({});
    await Voyage.deleteMany({});
    console.log('🗑  Collections vidées');

    // Insérer les destinations
    const createdDests = await Destination.insertMany(DESTINATIONS);
    console.log(`✅ ${createdDests.length} destinations créées`);

    const destMap = {};
    createdDests.forEach(d => { destMap[d.nom] = d._id; });

    // Insérer les voyages
    const VOYAGES = [
      {
        titre: 'Escapade à Djerba — All Inclusive',
        destination: destMap['Djerba'],
        description: "7 jours de farniente sur les plages de Djerba avec hébergement all inclusive dans un hôtel 5 étoiles face à la mer. Découverte de la médina de Houmt Souk et du village potier de Guellala incluse.",
        prix: 1290,
        duree: 7,
        dateDepart: new Date('2025-07-10'),
        dateRetour: new Date('2025-07-17'),
        placesDisponibles: 30,
        typeVoyage: 'balnéaire',
        inclus: ['Hébergement 5★ All Inclusive', 'Vols aller-retour', 'Transferts aéroport', 'Excursion médina', 'Animation enfants'],
        actif: true,
      },
      {
        titre: 'Marrakech — Les Mille et Une Nuits',
        destination: destMap['Marrakech'],
        description: "5 jours d'immersion dans la magie de Marrakech. Séjour dans un riad traditionnel du quartier de la Médina, visites guidées des souks, palais Bahia, Jardins Majorelle et soirée dîner spectacle.",
        prix: 1650,
        duree: 5,
        dateDepart: new Date('2025-09-15'),
        dateRetour: new Date('2025-09-20'),
        placesDisponibles: 20,
        typeVoyage: 'culturel',
        inclus: ['Riad 4★ petit-déjeuner', 'Vols inclus', 'Guide francophone', 'Dîner spectacle', 'Transferts'],
        actif: true,
      },
      {
        titre: 'Cappadoce — Vol en Montgolfière',
        destination: destMap['Cappadoce'],
        description: "8 jours dans les paysages extraordinaires de Cappadoce. Vol en montgolfière au lever du soleil, randonnée dans la Vallée de Göreme, visite des cités souterraines et séjour dans un hôtel grotte.",
        prix: 2100,
        duree: 8,
        dateDepart: new Date('2025-10-05'),
        dateRetour: new Date('2025-10-13'),
        placesDisponibles: 16,
        typeVoyage: 'aventure',
        inclus: ['Hôtel grotte 4★', 'Vol montgolfière', 'Demi-pension', 'Guide', 'Transferts', 'Vols'],
        actif: true,
      },
      {
        titre: 'Bali — Retraite Spirituelle & Plages',
        destination: destMap['Bali'],
        description: "10 jours pour se ressourcer à Bali : cours de yoga au lever du soleil à Ubud, visite des temples de Tanah Lot et Uluwatu, plages de Seminyak et randonnée au Mont Batur.",
        prix: 2850,
        duree: 10,
        dateDepart: new Date('2025-11-20'),
        dateRetour: new Date('2025-11-30'),
        placesDisponibles: 14,
        typeVoyage: 'aventure',
        inclus: ['Villa privée', 'Demi-pension', 'Cours de yoga', 'Excursions', 'Transferts', 'Vols A/R'],
        actif: true,
      },
      {
        titre: 'Santorini — Couchers de Soleil depuis Oia',
        destination: destMap['Santorini'],
        description: "6 jours sur l'île la plus romantique de Méditerranée. Suite avec vue sur la caldeira, croisière coucher de soleil, visite du site archéologique d'Akrotiri et dégustation de vins locaux.",
        prix: 3200,
        duree: 6,
        dateDepart: new Date('2025-06-22'),
        dateRetour: new Date('2025-06-28'),
        placesDisponibles: 10,
        typeVoyage: 'balnéaire',
        inclus: ['Suite vue mer', 'Petit-déjeuner', 'Croisière privée', 'Dégustation vins', 'Transferts'],
        actif: true,
      },
      {
        titre: 'Paris — Lumières de la Ville',
        destination: destMap['Paris'],
        description: "4 jours dans la capitale française : montée à la Tour Eiffel, visite du Louvre, balade à Montmartre, croisière sur la Seine et dîner gastronomique étoilé.",
        prix: 1980,
        duree: 4,
        dateDepart: new Date('2025-12-10'),
        dateRetour: new Date('2025-12-14'),
        placesDisponibles: 25,
        typeVoyage: 'citytrip',
        inclus: ['Hôtel 4★ centre Paris', 'Petit-déjeuner', 'Croisière Seine', 'City pass', 'Vols'],
        actif: true,
      },
    ];

    const createdVoyages = await Voyage.insertMany(VOYAGES);
    console.log(`✅ ${createdVoyages.length} voyages créés`);
    console.log('\n🚀 Base de données initialisée avec succès !');
    console.log('📊 Résumé :');
    console.log(`   • ${createdDests.length} destinations`);
    console.log(`   • ${createdVoyages.length} voyages`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur seed :', err.message);
    process.exit(1);
  }
}

seed();
