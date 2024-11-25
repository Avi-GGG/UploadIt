const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  fileUrl: { type: String, required: true }, // Cloudinary URL
  fileSize: { type: Number, required: true },
  publicId: { type: String, required: true }, // Cloudinary public ID
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('File', fileSchema);
