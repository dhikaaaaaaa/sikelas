/**
 * Fix broken SVG Data URLs in MongoDB with a valid SVG
 */
require('dotenv').config();
const mongoose = require('mongoose');

const VALID_DATA_URL = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgNjAwIDQwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2Y4ZmFmYyIvPjxyZWN0IHg9IjMwIiB5PSIzMCIgd2lkdGg9IjU0MCIgaGVpZ2h0PSIzNDAiIHJ4PSIxNiIgZmlsbD0icmdiKDI1NSwyNTUsMjU1KSIgc3Ryb2tlPSIjZTJlOGYwIiBzdHJva2Utd2lkdGg9IjIiLz48Y2lyY2xlIGN4PSIzMDAiIGN5PSIxMzAiIHI9IjUwIiBmaWxsPSIjZGJlYWZlIi8+PHBhdGggZD0iTTI4MCAxMTUgTDMwMCA5NSBMMzIwIDExNSBMMzEyIDExNSBMMzEyIDE0MCBMMjg4IDE0MCBMMjg4IDExNSBaIiBmaWxsPSIjM2I4MmY2Ii8+PHJlY3QgeD0iMjgwIiB5PSIxNDgiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0IiByeD0iMiIgZmlsbD0iIzkzYzVmZCIvPjxyZWN0IHg9IjE2MCIgeT0iMjAwIiB3aWR0aD0iMjgwIiBoZWlnaHQ9IjEyIiByeD0iNCIgZmlsbD0iI2UyZThmMCIvPjxyZWN0IHg9IjE5MCIgeT0iMjI0IiB3aWR0aD0iMjIwIiBoZWlnaHQ9IjEwIiByeD0iNCIgZmlsbD0iI2YxZjVmOSIvPjxyZWN0IHg9IjIxMCIgeT0iMjQ2IiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjEwIiByeD0iNCIgZmlsbD0iI2YxZjVmOSIvPjx0ZXh0IHg9IjMwMCIgeT0iMzAwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMxZTI5M2IiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkJ1a3RpIExhbXBpcmFuIFRlcnZlcmlmaWthc2k8L3RleHQ+PHRleHQgeD0iMzAwIiB5PSIzMjUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEzIiBmaWxsPSIjNjQ3NDhiIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TSUtFTEFTIEFrYWRlbWlrIFBhcmFtYWRpbmE8L3RleHQ+PGNpcmNsZSBjeD0iMzAwIiBjeT0iMzY1IiByPSIxMiIgZmlsbD0iIzIyYzU1ZSIvPjxwYXRoIGQ9Ik0yOTQgMzY1IEwyOTggMzY5IEwzMDYgMzYxIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIuNSIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+';

async function fixSvgInDb() {
  await mongoose.connect(process.env.MONGODB_URI);
  const collection = mongoose.connection.db.collection('requests');

  // Find all requests with SVG or /uploads/ attachments to fix
  const broken = await collection.find({
    $or: [
      { attachmentUrl: { $regex: 'data:image/svg' } },
      { attachmentUrl: { $regex: '^/uploads/' } }
    ]
  }).toArray();
  console.log(`Found ${broken.length} requests with SVG attachments to fix.`);

  for (const doc of broken) {
    await collection.updateOne({ _id: doc._id }, { $set: { attachmentUrl: VALID_DATA_URL } });
    console.log(`Fixed SVG for request ${doc._id}`);
  }

  // Verify all attachments
  const all = await collection.find().toArray();
  console.log('\nFinal verification:');
  for (const doc of all) {
    const att = doc.attachmentUrl || '(none)';
    const preview = att.length > 50 ? att.slice(0, 50) + '...' : att;
    console.log(`  ${doc._id} | ${doc.type} | ${doc.status} | attachment: ${preview}`);
  }

  await mongoose.disconnect();
  console.log('\nAll SVG attachments fixed!');
}

fixSvgInDb().catch(console.error);
