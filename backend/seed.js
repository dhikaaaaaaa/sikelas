/**
 * Database Seeder — SIKELAS
 * 
 * Jalankan: npm run seed
 * Ini akan mengisi MongoDB dengan data demo (users, classes, attendance, requests)
 * yang sama persis dengan data localStorage di frontend.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Class = require('./models/Class');
const Request = require('./models/Request');
const Attendance = require('./models/Attendance');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sikelas_db';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Hapus data lama
    await User.deleteMany({});
    await Class.deleteMany({});
    await Request.deleteMany({});
    await Attendance.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // === 1. Buat Users ===
    const users = await User.insertMany([
      {
        name: 'Naila Putri',
        email: 'mahasiswa@gmail.com',
        role: 'mahasiswa',
        nim: '2310512034',
      },
      {
        name: 'Dr. Bagus Santoso',
        email: 'dosen@gmail.com',
        role: 'dosen',
        nip: '198203012010121001',
      },
      {
        name: 'Rangga Putra',
        email: 'rangga@kampus.ac.id',
        role: 'mahasiswa',
        nim: '2310512041',
      },
      {
        name: 'Dimas Aulia',
        email: 'dimas@kampus.ac.id',
        role: 'mahasiswa',
        nim: '2310512057',
      },
      {
        name: 'Admin Akademik',
        email: 'admin@gmail.com',
        role: 'admin',
      },
    ]);
    console.log(`👤 Created ${users.length} users`);

    // Map user by email for references
    const userMap = {};
    users.forEach((u) => (userMap[u.email] = u));

    // === 2. Buat Classes ===
    const classes = await Class.insertMany([
      {
        name: 'CS101 — Struktur Data',
        lecturer: 'Dr. Bagus Santoso',
        lecturerEmail: 'dosen@gmail.com',
        students: 32,
      },
      {
        name: 'CS204 — Basis Data',
        lecturer: 'Dr. Bagus Santoso',
        lecturerEmail: 'dosen@gmail.com',
        students: 28,
      },
    ]);
    console.log(`📚 Created ${classes.length} classes`);

    // Map class by name prefix
    const classMap = {};
    classes.forEach((c) => (classMap[c.name] = c));

    // === 3. Buat Requests (Pengajuan Demo) ===
    const requests = await Request.insertMany([
      {
        type: 'izin',
        mahasiswa: userMap['mahasiswa@gmail.com']._id,
        studentName: 'Naila Putri',
        studentEmail: 'mahasiswa@gmail.com',
        classId: classMap['CS101 — Struktur Data']._id,
        className: 'CS101 — Struktur Data',
        sessionDate: '2026-07-02',
        reason: 'Mengikuti lomba debat tingkat nasional yang diwakilkan oleh kampus.',
        attachmentUrl: '',
        status: 'pending',
      },
      {
        type: 'revisi',
        mahasiswa: userMap['mahasiswa@gmail.com']._id,
        studentName: 'Naila Putri',
        studentEmail: 'mahasiswa@gmail.com',
        classId: classMap['CS204 — Basis Data']._id,
        className: 'CS204 — Basis Data',
        sessionDate: '2026-06-20',
        reason: 'Sistem mencatat alpa, padahal sudah presensi QR tapi sinyal lambat.',
        attachmentUrl: '',
        status: 'approved',
      },
      {
        type: 'izin',
        mahasiswa: userMap['rangga@kampus.ac.id']._id,
        studentName: 'Rangga Putra',
        studentEmail: 'rangga@kampus.ac.id',
        classId: classMap['CS204 — Basis Data']._id,
        className: 'CS204 — Basis Data',
        sessionDate: '2026-06-18',
        reason: 'Sakit demam, surat dokter terlampir.',
        attachmentUrl: '',
        status: 'rejected',
      },
      {
        type: 'revisi',
        mahasiswa: userMap['dimas@kampus.ac.id']._id,
        studentName: 'Dimas Aulia',
        studentEmail: 'dimas@kampus.ac.id',
        classId: classMap['CS101 — Struktur Data']._id,
        className: 'CS101 — Struktur Data',
        sessionDate: '2026-06-15',
        reason: 'Mahasiswa keberatan dengan keputusan dosen, mengajukan eskalasi.',
        attachmentUrl: '',
        status: 'escalated',
      },
    ]);
    console.log(`📝 Created ${requests.length} requests`);

    // === 4. Buat Attendance Records ===
    const attendanceRecords = await Attendance.insertMany([
      { nim: '2310512034', name: 'Naila Putri', hadir: 12, izin: 1, sakit: 0, alpa: 2 },
      { nim: '2310512041', name: 'Rangga Putra', hadir: 10, izin: 1, sakit: 2, alpa: 2 },
      { nim: '2310512057', name: 'Dimas Aulia', hadir: 14, izin: 0, sakit: 0, alpa: 1 },
    ]);
    console.log(`📊 Created ${attendanceRecords.length} attendance records`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Demo Login Accounts:');
    console.log('   Mahasiswa: mahasiswa@gmail.com');
    console.log('   Dosen:     dosen@gmail.com');
    console.log('   Admin:     admin@gmail.com');
    console.log('\n💡 Pastikan Google OAuth sudah dikonfigurasi di .env');
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
    process.exit(0);
  }
}

seed();
