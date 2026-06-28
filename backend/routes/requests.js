const router = require('express').Router();
const Request = require('../models/Request');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const { isAuthenticated, isRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// POST /api/permissions — Mahasiswa ajukan izin kelas
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

      const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : '';

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
      });

      const response = request.toObject();
      response.id = response._id;
      res.status(201).json({ request: response });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

// POST /api/attendance-revisions — Mahasiswa ajukan revisi kehadiran
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

      const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : '';

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
      });

      const revResponse = request.toObject();
      revResponse.id = revResponse._id;
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

// GET /api/permissions/mine — Mahasiswa lihat pengajuan sendiri
router.get('/permissions/mine', isAuthenticated, isRole('mahasiswa'), async (req, res) => {
  try {
    const requests = await Request.find({ mahasiswa: req.user._id }).sort({ createdAt: -1 });
    res.json({ requests: requests.map(mapRequest) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/requests/all — Dosen/Admin lihat semua pengajuan
router.get('/requests/all', isAuthenticated, isRole('dosen', 'admin'), async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json({ requests: requests.map(mapRequest) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/requests/:id/decision — Dosen approve/reject
router.post('/requests/:id/decision', isAuthenticated, isRole('dosen'), async (req, res) => {
  try {
    const { decision } = req.body;
    const status = decision === 'approve' ? 'approved' : 'rejected';

    const request = await Request.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!request) {
      return res.status(404).json({ message: 'Pengajuan tidak ditemukan.' });
    }

    // Jika disetujui, update rekap kehadiran
    if (status === 'approved') {
      await updateAttendance(request);
    }

    res.json({ request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/requests/:id/admin-decision — Admin keputusan final (banding)
router.post('/requests/:id/admin-decision', isAuthenticated, isRole('admin'), async (req, res) => {
  try {
    const { decision } = req.body;
    const status = decision === 'approve' ? 'approved' : 'rejected';

    const request = await Request.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!request) {
      return res.status(404).json({ message: 'Pengajuan tidak ditemukan.' });
    }

    // Jika disetujui, update rekap kehadiran
    if (status === 'approved') {
      await updateAttendance(request);
    }

    res.json({ request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/requests/:id/escalate — Mahasiswa eskalasi ke admin
router.post('/requests/:id/escalate', isAuthenticated, isRole('mahasiswa'), async (req, res) => {
  try {
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status: 'escalated' },
      { new: true },
    );

    if (!request) {
      return res.status(404).json({ message: 'Pengajuan tidak ditemukan.' });
    }

    res.json({ request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Helper: Update rekap kehadiran setelah pengajuan disetujui
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
