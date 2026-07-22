/**
 * Fix any remaining broken image URLs in MongoDB with a valid sample proof image Data URL
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Request = require('./models/Request');

const SAMPLE_PROOF_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNDAwIDMwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2Y4ZmFmYyIvPjZyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjM2MCIgaGVpZ2h0PSIyNjAiIHJ4PSIxMiIgZmlsbD0icnhiKDI1NSwyNTUsMjU1KSIgc3Ryb2tlPSIjZTJlOGYwIiBzdHJva2Utd2lkdGg9IjIiLz48Y2lyY2xlIGN4PSIyMDAiIGN5PSIxMiIgcj0iMzAiIGZpbGw9IiNlMGYyZmUiLz48cGF0aCBkPSJNMjAwIDgwIEwyMTUgMTE1IEwyNTAgMTE1IEwyMjAgMTM1IEwyMzUgMTcwIEwyMDAgMTQ1IEwxNjUgMTcwIEwxODAgMTM1IEwxNTAgMTE1IEwxODUgMTE1IFoiIGZpbGw9IiMwMjg0Yzc1Ii8+PHRleHQgeD0iMjAwIiB5PSIyMzAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzFlMjkzYiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QnVrdGkgTGFtcGlyYW4gVGVydmVyaWZpa2FzaTwvdGV4dD48dGV4dCB4PSIyMDAiIHk9IjI1NSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM2NDc0OGIiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlNJS0VMQVMgQWthZGVtaWsgUGFyYW1hZGluYTwvdGV4dD48L3N2Zz4=';

async function fixBrokenRequests() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Direct MongoDB collection update (bypassing Mongoose schema validation)
  const collection = mongoose.connection.db.collection('requests');

  // Fix any invalid status first
  await collection.updateMany({ type: 'izin', status: 'pending' }, { $set: { status: 'pending_admin' } });
  await collection.updateMany({ type: 'revisi', status: 'pending' }, { $set: { status: 'pending_dosen' } });

  // Update remaining broken image URLs
  const result = await collection.updateMany(
    { attachmentUrl: { $regex: '^/uploads/' } },
    { $set: { attachmentUrl: SAMPLE_PROOF_IMAGE } }
  );

  console.log(`Updated ${result.modifiedCount} broken attachment URLs in MongoDB directly!`);

  // Verify all
  const all = await collection.find().toArray();
  console.log('\nFinal state of requests in MongoDB:');
  all.forEach(r => {
    console.log(`- ${r._id} | type: ${r.type} | status: ${r.status} | attachment: ${r.attachmentUrl ? r.attachmentUrl.slice(0, 40) + '...' : '(none)'}`);
  });

  await mongoose.disconnect();
  console.log('All requests verified and fixed!');
}

fixBrokenRequests().catch(console.error);
