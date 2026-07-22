const router = require('express').Router();
const Request = require('../models/Request');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { isAuthenticated, isRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

const DEFAULT_SAMPLE_PROOF = 'https://res.cloudinary.com/ghbqwu6e/image/upload/v1784720561/sikelas/default_proof.png';

// Helper to upload file buffer to Cloudinary
async function uploadToCloudinary(file, folder = 'sikelas_proofs') {
  if (!file) return DEFAULT_SAMPLE_PROOF;
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: `sikelas/${folder}`, resource_type: 'auto' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(file.buffer);
  });
}

// ─── POST /api/permissions — Mahasiswa ajukan izin kelas ───
// Alur: Mahasiswa → Admin/FIR (pending_admin) → Dosen (pending_dosen) → Selesai
router.post(
  '/permissions',
  isAuthenticated,
  isRole('mahasiswa'),
  upload.single('attachment'),
  async (req, res) => {
    try {
      const { classId, sessionDate, reason } = req.body;
      const classData = await Class.findById(classId);
      if (!classData) {
        return res.status(404).json({ message: 'Kelas tidak ditemukan.' });
      }

      const attachmentUrl = req.file
        ? await uploadToCloudinary(req.file, 'permissions')
        : DEFAULT_SAMPLE_PROOF;

      const request = await Request.create({
        type: 'izin',
        mahasiswa: req.user._id,
        studentName: req.user.name,
        studentEmail: req.user.email,
        classId: classData._id,
        className: classData.name,
        sessionDate,
        reason,
        attachmentUrl,
        status: 'pending_admin', // Izin masuk ke Admin/FIR dulu
      });

      const response = request.toObject();
      response.id = response._id;

      // Notifikasi ke Admin/FIR bahwa ada izin baru
      await notifyAdmins({
        title: 'Pengajuan Izin Kelas Baru',
        message: `${req.user.name} mengajukan izin untuk kelas ${classData.name} (tanggal ${sessionDate}).`,
        requestId: request._id,
      });

      res.status(201).json({ request: response });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

// ─── POST /api/attendance-revisions — Mahasiswa ajukan revisi kehadiran ───
// Alur: Mahasiswa → Dosen (pending_dosen) → Admin/FIR (pending_admin) → Selesai
router.post(
  '/attendance-revisions',
  isAuthenticated,
  isRole('mahasiswa'),
  upload.single('attachment'),
  async (req, res) => {
    try {
      const { classId, sessionDate, currentStatus, reason } = req.body;
      const classData = await Class.findById(classId);
      if (!classData) {
        return res.status(404).json({ message: 'Kelas tidak ditemukan.' });
      }

      const attachmentUrl = req.file
        ? await uploadToCloudinary(req.file, 'revisions')
        : DEFAULT_SAMPLE_PROOF;

      const request = await Request.create({
        type: 'revisi',
        mahasiswa: req.user._id,
        studentName: req.user.name,
        studentEmail: req.user.email,
        classId: classData._id,
        className: classData.name,
        sessionDate,
        currentStatus: currentStatus || 'alpa',
        reason,
        attachmentUrl,
        status: 'pending_dosen', // Revisi masuk ke Dosen dulu
      });

      const revResponse = request.toObject();
      revResponse.id = revResponse._id;

      // Notifikasi ke Dosen bahwa ada revisi kehadiran baru
      await notifyLecturer({
        classId: classData._id,
        title: 'Pengajuan Revisi Kehadiran Baru',
        message: `${req.user.name} mengajukan revisi kehadiran untuk kelas ${classData.name} (tanggal ${sessionDate}).`,
        requestId: request._id,
      });

      res.status(201).json({ request: revResponse });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

// Helper: Map request document ke format frontend (id bukan _id)
function mapRequest(r) {
  const obj = r.toObject ? r.toObject() : r;
  return { ...obj, id: obj._id };
}

// ─── GET /api/permissions/mine — Mahasiswa lihat pengajuan sendiri ───
router.get('/permissions/mine', isAuthenticated, isRole('mahasiswa'), async (req, res) => {
  try {
    const requests = await Request.find({ mahasiswa: req.user._id }).sort({ createdAt: -1 });
    res.json({ requests: requests.map(mapRequest) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/requests/all — Dosen/Admin lihat pengajuan sesuai peran ───
router.get('/requests/all', isAuthenticated, isRole('dosen', 'admin'), async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'dosen') {
      // Dosen melihat:
      // 1. Izin yang sudah di-approve admin (pending_dosen) + izin yang sudah dosen proses
      // 2. Revisi langsung dari mahasiswa (pending_dosen) + revisi yang sudah dosen proses
      // Semua harus dari kelas yang diampu
      const myClasses = await Class.find({ lecturerEmail: req.user.email });
      const myClassIds = myClasses.map(c => c._id);
      query = { classId: { $in: myClassIds } };
    }
    // Admin melihat semua request (tanpa filter kelas)

    const requests = await Request.find(query).sort({ createdAt: -1 });
    res.json({ requests: requests.map(mapRequest) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Helper: Kirim notifikasi ke semua Admin
async function notifyAdmins({ title, message, requestId }) {
  try {
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        requestId,
        title,
        message,
        type: 'info',
      });
    }
  } catch (err) {
    console.error('Error notifying admins:', err.message);
  }
}

// Helper: Kirim notifikasi ke Dosen Pengampu Kelas
async function notifyLecturer({ classId, title, message, requestId }) {
  try {
    const classData = await Class.findById(classId);
    if (!classData || !classData.lecturerEmail) return;
    const lecturer = await User.findOne({ email: classData.lecturerEmail, role: 'dosen' });
    if (lecturer) {
      await Notification.create({
        user: lecturer._id,
        requestId,
        title,
        message,
        type: 'info',
      });
    }
  } catch (err) {
    console.error('Error notifying lecturer:', err.message);
  }
}

// Helper: Buat Notifikasi untuk Mahasiswa saat status pengajuan berubah
async function createNotificationForRequest(request, newStatus, actorName) {
  try {
    let title = '';
    let message = '';
    let type = 'info';

    const reqTypeName = request.type === 'izin' ? 'Izin Kelas' : 'Revisi Kehadiran';

    if (newStatus.includes('rejected')) {
      type = 'rejected';
      title = `Pengajuan ${reqTypeName} Ditolak`;
      message = `Pengajuan ${reqTypeName} Anda untuk kelas ${request.className} (tanggal ${request.sessionDate}) telah DITOLAK oleh ${actorName}.`;
    } else if (newStatus === 'approved') {
      type = 'approved';
      title = `Pengajuan ${reqTypeName} Disetujui!`;
      message = `Pengajuan ${reqTypeName} Anda untuk kelas ${request.className} (tanggal ${request.sessionDate}) telah DISETUJUI. Rekap kehadiran Anda telah diperbarui.`;
    } else if (newStatus === 'pending_dosen') {
      type = 'info';
      title = `Pengajuan ${reqTypeName} Lanjut ke Dosen`;
      message = `Pengajuan ${reqTypeName} Anda untuk kelas ${request.className} telah disetujui Admin/FIR dan diteruskan ke Dosen Pengampu.`;
    } else if (newStatus === 'pending_admin') {
      type = 'info';
      title = `Pengajuan ${reqTypeName} Lanjut ke Admin/FIR`;
      message = `Pengajuan ${reqTypeName} Anda untuk kelas ${request.className} telah disetujui Dosen dan diteruskan ke Admin/FIR.`;
    }

    if (title && message) {
      await Notification.create({
        user: request.mahasiswa,
        requestId: request._id,
        title,
        message,
        type,
      });
    }
  } catch (err) {
    console.error('Error creating notification:', err.message);
  }
}

// ─── POST /api/requests/:id/decision — Dosen approve/reject ───
router.post('/requests/:id/decision', isAuthenticated, isRole('dosen'), async (req, res) => {
  try {
    const { decision } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Pengajuan tidak ditemukan.' });
    }

    let newStatus;

    if (request.type === 'izin') {
      // Izin: Dosen adalah tahap akhir (setelah admin approve)
      newStatus = decision === 'approve' ? 'approved' : 'rejected';
    } else if (request.type === 'revisi') {
      // Revisi: Dosen approve → lanjut ke Admin/FIR, Dosen reject → rejected_by_dosen
      newStatus = decision === 'approve' ? 'pending_admin' : 'rejected_by_dosen';
    }

    request.status = newStatus;
    await request.save();

    // Buat notifikasi untuk mahasiswa
    await createNotificationForRequest(request, newStatus, `Dosen (${req.user.name})`);

    // Jika revisi disetujui Dosen dan lanjut ke Admin, kirim notifikasi ke Admin/FIR
    if (newStatus === 'pending_admin') {
      await notifyAdmins({
        title: 'Revisi Kehadiran Perlu Persetujuan Admin',
        message: `Dosen (${req.user.name}) menyetujui revisi kehadiran ${request.studentName} (${request.className}). Perlu persetujuan final Admin/FIR.`,
        requestId: request._id,
      });
    }

    // Jika status final approved (izin disetujui dosen), update kehadiran
    if (newStatus === 'approved') {
      await updateAttendance(request);
    }

    res.json({ request: mapRequest(request) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/requests/:id/admin-decision — Admin/FIR keputusan ───
router.post('/requests/:id/admin-decision', isAuthenticated, isRole('admin'), async (req, res) => {
  try {
    const { decision } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Pengajuan tidak ditemukan.' });
    }

    let newStatus;

    if (request.status === 'escalated') {
      // Banding/eskalasi: keputusan final admin
      newStatus = decision === 'approve' ? 'approved' : 'rejected';
    } else if (request.type === 'izin' && request.status === 'pending_admin') {
      // Izin tahap 1: Admin approve → lanjut ke Dosen, Admin reject → rejected_by_admin
      newStatus = decision === 'approve' ? 'pending_dosen' : 'rejected_by_admin';
    } else if (request.type === 'revisi' && request.status === 'pending_admin') {
      // Revisi tahap 2: Admin adalah tahap akhir
      newStatus = decision === 'approve' ? 'approved' : 'rejected';
    } else {
      return res.status(400).json({ message: 'Pengajuan ini tidak bisa diproses oleh admin saat ini.' });
    }

    request.status = newStatus;
    await request.save();

    // Buat notifikasi untuk mahasiswa
    await createNotificationForRequest(request, newStatus, 'Admin/FIR');

    // Jika izin disetujui Admin dan lanjut ke Dosen, kirim notifikasi ke Dosen Pengampu
    if (newStatus === 'pending_dosen') {
      await notifyLecturer({
        classId: request.classId,
        title: 'Izin Kelas Perlu Verifikasi Dosen',
        message: `Admin/FIR menyetujui izin kelas ${request.studentName} (${request.className}). Perlu verifikasi akhir Dosen.`,
        requestId: request._id,
      });
    }

    // Jika status final approved, update kehadiran
    if (newStatus === 'approved') {
      await updateAttendance(request);
    }

    res.json({ request: mapRequest(request) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/requests/:id/escalate — Mahasiswa eskalasi ke admin ───
router.post('/requests/:id/escalate', isAuthenticated, isRole('mahasiswa'), async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Pengajuan tidak ditemukan.' });
    }

    // Bisa banding dari rejected (dosen tolak izin) atau rejected_by_dosen (dosen tolak revisi)
    if (!['rejected', 'rejected_by_dosen'].includes(request.status)) {
      return res.status(400).json({ message: 'Hanya pengajuan yang ditolak yang bisa diajukan banding.' });
    }

    request.status = 'escalated';
    await request.save();

    // Notifikasi ke Admin/FIR bahwa ada pengajuan banding baru
    await notifyAdmins({
      title: 'Pengajuan Banding Baru',
      message: `${req.user.name} mengajukan banding untuk kelas ${request.className}. Perlu peninjauan Admin/FIR.`,
      requestId: request._id,
    });

    res.json({ request: mapRequest(request) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Helper: Update rekap kehadiran setelah pengajuan disetujui ───
async function updateAttendance(request) {
  try {
    const User = require('../models/User');
    const student = await User.findById(request.mahasiswa);
    if (!student || !student.nim) return;

    const attendance = await Attendance.findOne({ nim: student.nim });
    if (!attendance) return;

    if (request.type === 'izin') {
      // Izin: alpa -1, izin +1
      if (attendance.alpa > 0) {
        attendance.alpa -= 1;
      }
      attendance.izin += 1;
    } else if (request.type === 'revisi') {
      // Revisi: alpa -1, hadir +1
      if (attendance.alpa > 0) {
        attendance.alpa -= 1;
        attendance.hadir += 1;
      }
    }

    await attendance.save();
  } catch (err) {
    console.error('Error updating attendance:', err.message);
  }
}

module.exports = router;
