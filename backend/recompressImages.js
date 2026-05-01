require('dotenv').config();
const mongoose = require('mongoose');
const sharp = require('sharp');

const Voyage = require('./models/voyage.model');
const Destination = require('./models/destination.model');

async function compressBase64(base64DataUri) {
  // Extract raw base64 from data URI
  const base64 = base64DataUri.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');

  const compressed = await sharp(buffer)
    .resize({ width: 800, withoutEnlargement: true })
    .jpeg({ quality: 75, progressive: true })
    .toBuffer();

  const before = Math.round(buffer.length / 1024);
  const after = Math.round(compressed.length / 1024);
  return { data: `data:image/jpeg;base64,${compressed.toString('base64')}`, before, after };
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  let totalSaved = 0;

  // Recompress voyage images
  const voyages = await Voyage.find({ image: { $regex: '^data:image' } });
  console.log(`📦 ${voyages.length} voyages with base64 images`);
  for (const v of voyages) {
    try {
      const { data, before, after } = await compressBase64(v.image);
      await Voyage.findByIdAndUpdate(v._id, { image: data });
      totalSaved += (before - after);
      console.log(`  ✓ ${v.titre}: ${before}KB → ${after}KB (saved ${before - after}KB)`);
    } catch (e) {
      console.log(`  ✗ ${v.titre}: ${e.message}`);
    }
  }

  // Recompress destination images
  const destinations = await Destination.find({ image: { $regex: '^data:image' } });
  console.log(`\n🌍 ${destinations.length} destinations with base64 images`);
  for (const d of destinations) {
    try {
      const { data, before, after } = await compressBase64(d.image);
      await Destination.findByIdAndUpdate(d._id, { image: data });
      totalSaved += (before - after);
      console.log(`  ✓ ${d.nom}: ${before}KB → ${after}KB (saved ${before - after}KB)`);
    } catch (e) {
      console.log(`  ✗ ${d.nom}: ${e.message}`);
    }
  }

  console.log(`\n🎉 Done — total saved: ~${Math.round(totalSaved / 1024)}MB`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
