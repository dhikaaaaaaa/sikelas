require('dotenv').config();
const mongoose = require('mongoose');

const DEFAULT_PROOF = 'https://res.cloudinary.com/ghbqwu6e/image/upload/v1784719020/sikelas_proofs/u7g5exzkvzar5y87xdcr.png';

async function clearTestData() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Delete all requests from MongoDB
  const result = await db.collection('requests').deleteMany({});
  console.log(`Deleted ${result.deletedCount} test requests from MongoDB.`);

  // Insert clean seed data
  const users = await db.collection('users').find({}).toArray();
  const classes = await db.collection('classes').find({}).toArray();

  const mhs = users.find(u => u.role === 'mahasiswa') || { _id: new mongoose.Types.ObjectId(), name: 'Andhika Saputra', email: 'andhika@gmail.com' };
  const cs101 = classes.find(c => c.name.includes('CS101')) || { _id: new mongoose.Types.ObjectId(), name: 'CS101 — Struktur Data' };
  const cs204 = classes.find(c => c.name.includes('CS204')) || { _id: new mongoose.Types.ObjectId(), name: 'CS204 — Basis Data' };

  const cleanSeedRequests = [
    {
      type: 'izin',
      mahasiswa: mhs._id,
      studentName: mhs.name,
      studentEmail: mhs.email,
      classId: cs101._id,
      className: cs101.name,
      sessionDate: '2026-07-22',
      reason: 'Sakit Demam Tinggi',
      attachmentUrl: DEFAULT_PROOF,
      status: 'pending_admin',
      createdAt: new Date(),
    },
    {
      type: 'revisi',
      mahasiswa: mhs._id,
      studentName: mhs.name,
      studentEmail: mhs.email,
      classId: cs204._id,
      className: cs204.name,
      sessionDate: '2026-07-20',
      currentStatus: 'alpa',
      reason: 'Lupa isi presensi di Portal',
      attachmentUrl: DEFAULT_PROOF,
      status: 'pending_dosen',
      createdAt: new Date(Date.now() - 3600000),
    }
  ];

  await db.collection('requests').insertMany(cleanSeedRequests);
  console.log('Inserted 2 clean seed requests!');

  await mongoose.disconnect();
}

clearTestData().catch(console.error);
