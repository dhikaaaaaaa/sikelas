const router = require('express').Router();
const User = require('../models/User');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const { isAuthenticated, isRole } = require('../middleware/auth');

// GET /api/admin/users — List semua pengguna
router.get('/users', isAuthenticated, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    // Map ke format yang diharapkan frontend (id bukan _id)
    const mapped = users.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      nim: u.nim,
      nip: u.nip,
      avatar: u.avatar,
    }));
    res.json({ users: mapped });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/users — Pre-register pengguna baru
router.post('/users', isAuthenticated, isRole('admin'), async (req, res) => {
  try {
    const { email, name, role, nim, nip } = req.body;

    // Cek duplikat email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Email sudah terdaftar di sistem.' });
    }

    const user = await User.create({
      email: email.toLowerCase(),
      name,
      role,
      nim: nim || '',
      nip: nip || '',
    });

    // Jika mahasiswa, buat record attendance awal
    if (role === 'mahasiswa' && nim) {
      await Attendance.create({
        nim,
        name,
        hadir: 14,
        izin: 0,
        sakit: 0,
        alpa: 0,
      });
    }

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        nim: user.nim,
        nip: user.nip,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/users/:id — Ubah role pengguna
router.patch('/users/:id', isAuthenticated, isRole('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        nim: user.nim,
        nip: user.nip,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/classes — List semua kelas
router.get('/classes', isAuthenticated, async (req, res) => {
  try {
    const classes = await Class.find().sort({ createdAt: -1 });
    // Map ke format frontend (id bukan _id)
    const mapped = classes.map((c) => ({
      id: c._id,
      name: c.name,
      lecturer: c.lecturer,
      lecturerEmail: c.lecturerEmail,
      students: c.students,
    }));
    res.json({ classes: mapped });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/classes — Buat kelas baru
router.post('/classes', isAuthenticated, isRole('admin'), async (req, res) => {
  try {
    const { name, lecturer, lecturerEmail, students } = req.body;
    const classObj = await Class.create({
      name,
      lecturer,
      lecturerEmail: lecturerEmail.toLowerCase(),
      students: Number(students) || 30,
    });

    res.status(201).json({
      class: {
        id: classObj._id,
        name: classObj.name,
        lecturer: classObj.lecturer,
        lecturerEmail: classObj.lecturerEmail,
        students: classObj.students,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
