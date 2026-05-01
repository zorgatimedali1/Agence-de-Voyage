require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/admin.model');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const exists = await Admin.findOne({ username: 'admin' });
  if (exists) {
    console.log('✅ Admin already exists');
  } else {
    await Admin.create({ username: 'admin', password: 'admin123' });
    console.log('✅ Admin created — username: admin / password: admin123');
  }
  await mongoose.disconnect();
  process.exit(0);
})();
