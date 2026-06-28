const router = require('express').Router();
const passport = require('passport');

// GET /api/auth/google — Mulai Google OAuth flow
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  }),
);

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

// POST /api/auth/logout — Logout user
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Gagal logout' });
    }
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ message: 'Logout berhasil' });
    });
  });
});

module.exports = router;
