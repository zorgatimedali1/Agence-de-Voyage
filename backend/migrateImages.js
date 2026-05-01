require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Voyage = require('./models/voyage.model');
const Destination = require('./models/destination.model');

const UPLOADS_DIR = path.join(__dirname, 'uploads');

function fileToBase64(filename) {
  const filepath = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(filepath)) return null;
  const buffer = fs.readFileSync(filepath);
  const ext = path.extname(filename).toLowerCase().replace('.', '');
  const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  return `data:${mime};base64,${buffer.toString('base64')}`;
}

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  let updated = 0;
  let skipped = 0;

  // Migrate Voyages
  const voyages = await Voyage.find({ image: { $regex: '^/uploads/' } });
  console.log(`\n📦 Found ${voyages.length} voyages with local images`);

  for (const voyage of voyages) {
    const filename = voyage.image.replace('/uploads/', '');
    const base64 = fileToBase64(filename);
    if (base64) {
      await Voyage.findByIdAndUpdate(voyage._id, { image: base64 });
      console.log(`  ✓ Voyage: ${voyage.titre} — ${filename}`);
      updated++;
    } else {
      console.log(`  ✗ File not found: ${filename} (voyage: ${voyage.titre})`);
      skipped++;
    }
  }

  // Migrate Destinations
  const destinations = await Destination.find({ image: { $regex: '^/uploads/' } });
  console.log(`\n🌍 Found ${destinations.length} destinations with local images`);

  for (const dest of destinations) {
    const filename = dest.image.replace('/uploads/', '');
    const base64 = fileToBase64(filename);
    if (base64) {
      await Destination.findByIdAndUpdate(dest._id, { image: base64 });
      console.log(`  ✓ Destination: ${dest.nom} — ${filename}`);
      updated++;
    } else {
      console.log(`  ✗ File not found: ${filename} (destination: ${dest.nom})`);
      skipped++;
    }
  }

  console.log(`\n🎉 Migration complete — ${updated} updated, ${skipped} skipped`);
  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
