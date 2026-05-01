const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ success: false, message: 'Username et mot de passe requis' });

    const admin = await Admin.findOne({ username });
    if (!admin || !(await admin.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });

    const token = signToken(admin._id);
    res.json({ success: true, token, admin: { id: admin._id, username: admin.username } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    res.json({ success: true, data: admin });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
