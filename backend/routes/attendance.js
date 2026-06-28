const router = require('express').Router();
const Attendance = require('../models/Attendance');
const { isAuthenticated } = require('../middleware/auth');

// GET /api/attendance/recap — Ambil rekap kehadiran semua mahasiswa
router.get('/recap', isAuthenticated, async (req, res) => {
  try {
    const rows = await Attendance.find().sort({ name: 1 });
    res.json({ rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
