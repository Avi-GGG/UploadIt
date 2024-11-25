const express = require('express');
const router = express.Router();
const upload = require('../config/multerconfig');
const cloudinary = require('../config/cloudinary.config');  // Import Cloudinary SDK
const File = require('../models/file.model');
const {ensureAuthenticated} = require('./index.routes')
const fs = require('fs');
const path = require('path');

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
}

// Handle file upload
router.post('/upload-file', ensureAuthenticated, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }


  try {
    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'drive', // Optional: You can specify a folder in your Cloudinary account
      public_id: req.file.filename.split('.')[0],  // Set a public ID for the file
      resource_type: 'auto',  // Automatically detect file type (image, video, etc.)
    });
        
    // Save file details in DB
    const newFile = new File({
      filename: req.file.originalname,
      fileUrl: result.secure_url,  // Cloudinary URL
      fileSize: result.bytes,
      publicId: result.public_id,  // Cloudinary public ID
      userId: req.user.userId,
    
    });
    
    
    await newFile.save();
    
    const formattedSize = formatFileSize(result.bytes);
    // Optionally, delete the file locally after uploading to Cloudinary
    const fs = require('fs');
    fs.unlinkSync(req.file.path);  // Delete the file from local storage

    res.json({
      success: true,
      message: 'File uploaded successfully',
      formattedSize,
      redirectUrl: '/home' // The URL to redirect to after upload
    });
      // Redirect after successful upload

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to upload file' });
  }
});

// Route to handle file deletion
// Route to handle file deletion from Cloudinary
router.post('/delete-file/:fileId', ensureAuthenticated, (req, res) => {
  const fileId = req.params.fileId;

  File.findById(fileId)
    .then(file => {
      if (!file) {
        return res.status(404).send("File not found");
      }

      // Log file details for debugging
      console.log("Deleting file with public ID:", file.publicId);

      // Delete file from Cloudinary
      cloudinary.uploader.destroy(file.publicId, async (error, result) => {
        if (error) {
          console.error("Error deleting from Cloudinary:", error);
          return res.status(500).send("Error deleting the file from Cloudinary");
        }

        console.log("File deleted from Cloudinary:", result);

        // After deleting from Cloudinary, remove the file record from the database
        try {
          const deletedFile = await File.deleteOne({ _id: fileId });  // Use deleteOne() instead of remove()
          
          if (deletedFile.deletedCount === 0) {
            return res.status(500).send("Error deleting file record from database");
          }

          res.redirect('/home'); // Redirect after successful deletion
        } catch (err) {
          res.status(500).send("Error deleting file record from database");
        }
      });
    })
    .catch(err => {
      console.error("Error finding file:", err);
      res.status(500).send("Server error");
    });
});

module.exports = router;



