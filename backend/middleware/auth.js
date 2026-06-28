// Middleware: Cek apakah user sudah terautentikasi
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'Anda harus login terlebih dahulu.' });
}

// Middleware: Cek role tertentu
function isRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Anda harus login terlebih dahulu.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Akses ditolak. Hanya role ${roles.join('/')} yang diizinkan.` });
    }
    return next();
  };
}

module.exports = { isAuthenticated, isRole };
