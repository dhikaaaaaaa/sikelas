require('dotenv').config();
const mongoose = require('mongoose');

async function seedNotifications() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const users = await db.collection('users').find().toArray();
  const requests = await db.collection('requests').find().toArray();

  const notifs = [];

  for (const user of users) {
    if (user.role === 'mahasiswa') {
      notifs.push(
        {
          user: user._id,
          title: 'Pengajuan Izin Kelas Disetujui!',
          message: 'Pengajuan Izin Kelas CS101 - Struktur Data Anda telah DISETUJUI oleh Admin & Dosen Pengampu.',
          type: 'approved',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 mnt lalu
        },
        {
          user: user._id,
          title: 'Pengajuan Revisi Kehadiran Ditolak',
          message: 'Pengajuan Revisi Kehadiran Anda untuk kelas CS204 - Basis Data DITOLAK oleh Dosen (Alasan: Tidak Melampirkan Bukti Presensi QR). Anda dapat melakukan Banding.',
          type: 'rejected',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 jam lalu
        },
        {
          user: user._id,
          title: 'Selamat Datang di Portal SIKELAS',
          message: 'Sistem Perizinan Akademik & Kehadiran Online Universitas Paramadina telah aktif. Gunakan fitur Notifikasi untuk memantau status pengajuan Anda.',
          type: 'info',
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 hari lalu
        }
      );
    } else if (user.role === 'admin') {
      notifs.push(
        {
          user: user._id,
          title: 'Pengajuan Izin Kelas Baru',
          message: 'Mahasiswa (andhika presha saputra) mengajukan izin kelas CS204 - Basis Data. Perlu verifikasi Admin/FIR.',
          type: 'info',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 10), // 10 mnt lalu
        },
        {
          user: user._id,
          title: 'Sistem SIKELAS Aktif',
          message: 'Modul Admin/FIR aktif. Verifikasi izin kelas dan penanganan eskalasi banding mahasiswa berjalan normal.',
          type: 'info',
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
        }
      );
    } else if (user.role === 'dosen') {
      notifs.push(
        {
          user: user._id,
          title: 'Pengajuan Revisi Kehadiran Baru',
          message: 'Mahasiswa (Naila Putri) mengajukan revisi kehadiran untuk kelas CS204 - Basis Data. Perlu verifikasi Dosen Pengampu.',
          type: 'info',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 20), // 20 mnt lalu
        },
        {
          user: user._id,
          title: 'Rekap Kehadiran Terbaru',
          message: 'Rekap kehadiran mahasiswa kelas CS101 dan CS204 semester berjalan telah terbarui di portal.',
          type: 'info',
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
        }
      );
    }
  }

  // Clear old notifications & insert seeded ones
  await db.collection('notifications').deleteMany({});
  const result = await db.collection('notifications').insertMany(notifs);
  console.log(`Successfully seeded ${result.insertedCount} notifications across all users!`);

  await mongoose.disconnect();
}

seedNotifications().catch(console.error);
