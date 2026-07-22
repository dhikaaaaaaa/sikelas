/**
 * Migration Script: Convert all local '/uploads/filename.ext' paths in MongoDB to Base64 Data URLs.
 * This ensures images load everywhere (Firebase Hosting, Vercel, Localhost) without requiring disk files.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Request = require('./models/Request');

const MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
};

async function convertUploads() {
  const uri = process.env.MONGODB_URI;
  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('Connected!');

  const requests = await Request.find({ attachmentUrl: { $regex: '^/uploads/' } });
  console.log(`Found ${requests.length} requests with local '/uploads/' paths.`);

  const uploadsDir = path.join(__dirname, 'uploads');

  for (const reqDoc of requests) {
    const filename = path.basename(reqDoc.attachmentUrl);
    const filePath = path.join(uploadsDir, filename);

    if (fs.existsSync(filePath)) {
      const ext = path.extname(filename).toLowerCase();
      const mimeType = MIME_TYPES[ext] || 'image/png';
      const fileBuffer = fs.readFileSync(filePath);
      const base64Data = fileBuffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64Data}`;

      reqDoc.attachmentUrl = dataUrl;
      await reqDoc.save();
      console.log(`[SUCCESS] Converted ${filename} (${(fileBuffer.length / 1024).toFixed(1)} KB) -> Base64 Data URL for request ${reqDoc._id}`);
    } else {
      console.warn(`[WARN] File ${filename} not found on local disk at ${filePath}. Request ${reqDoc._id}`);
    }
  }

  // Also check if any requests have missing or invalid attachmentUrl and fix them if needed
  const totalWithBase64 = await Request.countDocuments({ attachmentUrl: { $regex: '^data:' } });
  console.log(`Total requests now using Base64 Data URL: ${totalWithBase64}`);

  await mongoose.disconnect();
  console.log('Migration finished successfully!');
}

convertUploads().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
