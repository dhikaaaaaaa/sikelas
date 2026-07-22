const router = require('express').Router();
const passport = require('passport');
const User = require('../models/User');

// POST /api/auth/login — Direct Email Login (Bypass OAuth jika terblokir)
router.post('/login', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email wajib diisi' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'Email Google/Akun ini belum didaftarkan oleh admin. Silakan hubungi Fakultas.' });
    }

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({
        message: 'Login berhasil',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          nim: user.nim,
          nip: user.nip,
          semester: user.semester,
          jurusan: user.jurusan,
        },
      });
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/users — Ambil daftar user terdaftar untuk pilihan Quick Login
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'name email role nim nip jurusan').sort({ role: 1, name: 1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/google — Mulai Google OAuth flow
router.get('/google', (req, res, next) => {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientID || !clientSecret || clientID === 'your_google_client_id_here') {
    return res.redirect((process.env.CLIENT_URL || 'http://localhost:5173') + '/?error=oauth_not_configured');
  }
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })(req, res, next);
});

// GET /api/auth/google/callback — Google mengembalikan data
router.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
      if (err) { return next(err); }
      if (!user) {
        return res.redirect((process.env.CLIENT_URL || 'http://localhost:5173') + '/?error=not_registered');
      }
      req.logIn(user, (err) => {
        if (err) { return next(err); }
        return res.redirect(process.env.CLIENT_URL || 'http://localhost:5173');
      });
    })(req, res, next);
  }
);

// GET /api/auth/me — Ambil data user yang sedang login
router.get('/me', (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
        nim: req.user.nim,
        nip: req.user.nip,
        semester: req.user.semester,
        jurusan: req.user.jurusan,
      },
    });
  }
  return res.status(401).json({ message: 'Belum login' });
});

// PUT /api/auth/profile — Update profile user yang sedang login
router.put('/profile', async (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: 'Belum login' });
  }

  try {
    const { name, nim, nip, semester, jurusan } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    }

    if (name) user.name = name;
    if (nim !== undefined) user.nim = nim;
    if (nip !== undefined) user.nip = nip;
    if (semester !== undefined) user.semester = parseInt(semester) || user.semester;
    if (jurusan !== undefined) user.jurusan = jurusan;

    await user.save();

    res.json({
      message: 'Profil berhasil diperbarui',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        nim: user.nim,
        nip: user.nip,
        semester: user.semester,
        jurusan: user.jurusan,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

