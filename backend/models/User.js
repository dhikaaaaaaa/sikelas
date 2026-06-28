const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allow null for pre-registered users who haven't logged in yet
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['mahasiswa', 'dosen', 'admin'],
      required: true,
      default: 'mahasiswa',
    },
    // Role-specific fields
    nim: { type: String, default: '' }, // Nomor Induk Mahasiswa
    nip: { type: String, default: '' }, // Nomor Induk Pegawai (Dosen)
    semester: { type: Number, default: 1 }, // Semester mahasiswa
    jurusan: { type: String, default: 'Informatika' }, // Program studi/jurusan
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('User', userSchema);
