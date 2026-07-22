const router = require('express').Router();
const Notification = require('../models/Notification');
const { isAuthenticated } = require('../middleware/auth');

function mapNotification(n) {
  const obj = n.toObject ? n.toObject() : n;
  return { ...obj, id: obj._id };
}

// ─── GET /api/notifications — Ambil semua notifikasi pengguna ───
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const mapped = notifications.map(mapNotification);
    const unreadCount = mapped.filter((n) => !n.isRead).length;

    res.json({ notifications: mapped, unreadCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── PUT /api/notifications/read-all — Tandai semua sebagai dibaca ───
router.put('/read-all', isAuthenticated, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ success: true, message: 'Semua notifikasi ditandai telah dibaca.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── PUT /api/notifications/:id/read — Tandai satu notifikasi dibaca ───
router.put('/:id/read', isAuthenticated, async (req, res) => {
  try {
    const notif = await Notification.findOne({ _id: req.params.id, user: req.user._id });
    if (!notif) {
      return res.status(404).json({ message: 'Notifikasi tidak ditemukan.' });
    }
    notif.isRead = true;
    await notif.save();
    res.json({ notification: mapNotification(notif) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
