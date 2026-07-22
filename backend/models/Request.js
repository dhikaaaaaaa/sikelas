const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['izin', 'revisi'],
      required: true,
    },
    mahasiswa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    studentEmail: {
      type: String,
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    className: {
      type: String,
      required: true,
    },
    sessionDate: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    // Revisi-specific: status kehadiran saat ini yang ingin direvisi
    currentStatus: {
      type: String,
      enum: ['alpa', 'izin', 'sakit', ''],
      default: '',
    },
    attachmentUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending_admin', 'pending_dosen', 'approved', 'rejected', 'rejected_by_admin', 'rejected_by_dosen', 'escalated'],
      default: 'pending_admin',
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Request', requestSchema);
