const express = require('express');
const router = express.Router();
const File = require('../models/file.model');
const {ensureAuthenticated} = require('./index.routes')

// Fetch files for the logged-in user
router.get('/files', ensureAuthenticated, async (req, res) => {
  try {
    const userFiles = await File.find({ userId: req.user.userId });
    res.status(200).json({ files: userFiles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch files' });
  }
});

module.exports = router;
