/**
 * One-time migration: Convert old 'pending' status to new flow-based statuses.
 * - izin with 'pending' → 'pending_admin' (izin masuk ke admin dulu)
 * - revisi with 'pending' → 'pending_dosen' (revisi masuk ke dosen dulu)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Request = require('./models/Request');

async function migrate() {
  const uri = process.env.MONGODB_URI;
  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('Connected!');

  // List all requests
  const allRequests = await Request.find();
  console.log(`Total requests in database: ${allRequests.length}`);
  allRequests.forEach(r => {
    console.log(`  - ${r._id} | type=${r.type} | status=${r.status} | student=${r.studentName}`);
  });

  // Migrate izin with 'pending' to 'pending_admin'
  const izinResult = await Request.updateMany(
    { type: 'izin', status: 'pending' },
    { $set: { status: 'pending_admin' } }
  );
  console.log(`\nMigrated ${izinResult.modifiedCount} izin requests: pending → pending_admin`);

  // Migrate revisi with 'pending' to 'pending_dosen'
  const revisiResult = await Request.updateMany(
    { type: 'revisi', status: 'pending' },
    { $set: { status: 'pending_dosen' } }
  );
  console.log(`Migrated ${revisiResult.modifiedCount} revisi requests: pending → pending_dosen`);

  // Verify
  const after = await Request.find();
  console.log(`\nAfter migration:`);
  after.forEach(r => {
    console.log(`  - ${r._id} | type=${r.type} | status=${r.status} | student=${r.studentName}`);
  });

  await mongoose.disconnect();
  console.log('\nDone! Database disconnected.');
}

migrate().catch(err => {
  console.error('Migration error:', err.message);
  process.exit(1);
});
