const multer = require('multer');
const path = require('path');

// Set storage engine for temporary local file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads'); // This is just a temporary directory for the upload
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Use a timestamp for unique filenames
  }
});

// Init upload
const upload = multer({
  storage: storage,
   // Max file size 5MBgi
}).single('file');

module.exports = upload;
