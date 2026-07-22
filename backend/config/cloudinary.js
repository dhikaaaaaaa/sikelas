const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'ghbqwu6e',
  api_key: process.env.CLOUDINARY_API_KEY || '873674863734952',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'pXkeorNdPjaW4D4TC1bk5vUfrTQ',
  secure: true,
});

module.exports = cloudinary;
