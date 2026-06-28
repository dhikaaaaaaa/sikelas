const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    nim: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    hadir: { type: Number, default: 0 },
    izin: { type: Number, default: 0 },
    sakit: { type: Number, default: 0 },
    alpa: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Attendance', attendanceSchema);
