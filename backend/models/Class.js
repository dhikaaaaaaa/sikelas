const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    lecturer: {
      type: String,
      required: true,
    },
    lecturerEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    students: {
      type: Number,
      default: 30,
    },
    studentNims: {
      type: [String],
      default: [],
    },
    semester: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Class', classSchema);
