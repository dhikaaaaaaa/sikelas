const mongoose = require('mongoose');

mongoose.connect('mongodb://admin:admin123@ac-zrskb2g-shard-00-00.lo0bk4t.mongodb.net:27017,ac-zrskb2g-shard-00-01.lo0bk4t.mongodb.net:27017,ac-zrskb2g-shard-00-02.lo0bk4t.mongodb.net:27017/sikelas_db?ssl=true&authSource=admin&replicaSet=atlas-er82w1-shard-0&retryWrites=true&w=majority').then(async () => {
  const db = mongoose.connection.db;
  const col = db.collection('requests');

  // Migrate izin pending -> pending_admin
  const r1 = await col.updateMany(
    { type: 'izin', status: 'pending' },
    { $set: { status: 'pending_admin' } }
  );
  console.log('Izin pending -> pending_admin:', r1.modifiedCount);

  // Migrate revisi pending -> pending_dosen
  const r2 = await col.updateMany(
    { type: 'revisi', status: 'pending' },
    { $set: { status: 'pending_dosen' } }
  );
  console.log('Revisi pending -> pending_dosen:', r2.modifiedCount);

  console.log('Migration complete!');
  process.exit(0);
}).catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
