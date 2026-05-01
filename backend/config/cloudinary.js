const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const makeUpload = (folder) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = /jpeg|jpg|png|webp/;
      const ok = allowed.test(file.mimetype) && allowed.test(file.originalname.toLowerCase());
      ok ? cb(null, true) : cb(new Error('Seules les images JPEG, PNG et WebP sont acceptées'));
    },
  });

  return (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      next();
    });
  };
};

// Delete image from Cloudinary by URL
const deleteImage = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('cloudinary')) return;
  try {
    const parts = imageUrl.split('/');
    const filename = parts[parts.length - 1].split('.')[0];
    const folder = parts[parts.length - 2];
    await cloudinary.uploader.destroy(`${folder}/${filename}`);
  } catch (e) {
    console.warn('Cloudinary delete failed:', e.message);
  }
};

module.exports = { makeUpload, deleteImage, cloudinary };
