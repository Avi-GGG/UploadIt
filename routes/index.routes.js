const express = require('express');
const router = express.Router();
const userModel = require('../models/user.model');
const upload = require('../config/multerconfig')
const jwt = require('jsonwebtoken')
const File = require('../models/file.model')
const Iconify = require('@iconify/iconify');

function getFileIcon(fileName) {
    const fileExtension = fileName.split('.').pop().toLowerCase();
    
    const icons = {
    pdf: 'vscode-icons:file-type-pdf2',          // PDF file
    ppt: 'vscode-icons:file-type-powerpoint',   // PowerPoint file
    pptx: 'vscode-icons:file-type-powerpoint',
    png: 'bi:filetype-png',   // PowerPoint file
    docx: 'vscode-icons:file-type-word',        // Word document
    txt: 'bi:filetype-txt',     // Text file
    xlsx: 'vscode-icons:file-type-excel',     // Text file
    xls: 'vscode-icons:file-type-excel',     // Text file
    excel: 'vscode-icons:file-type-excel',      // Excel file
    jpg: 'fa6-solid:file-image',        // Image file (can be extended for .jpeg, .png)
    jpeg: 'fa6-solid:file-image',        // Image file (can be extended for .jpeg, .png)
    zip: 'fa6-solid:file-zipper',      // ZIP file
    mp3: 'fa6-solid:file-audio',        // Audio file
    mp4: 'fa6-solid:file-video',        // Video file
    default: 'vscode-icons:default-file'           // Default icon for any other file type
  };
    
    // Return the icon class for the file extension or default icon
    return icons[fileExtension] || icons.default;
  }


// Middleware to ensure user is logged in

function ensureAuthenticated(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/users/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach decoded token data (e.g., `id`) to the request
        next();
    } catch (err) {
        console.error('JWT verification failed:', err);
        res.redirect('/users/login');
    }
}

router.get('/profile', ensureAuthenticated, async (req, res) => {
    try {
        // Retrieve user by username from the session data
        const foundUser = await userModel.findOne({ username: req.user.username });

        // Render the profile page with the user data
        res.render('profile', { user: foundUser });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).send("Internal Server Error");
    }
});

const formatSize = (size) => {
    if (size < 1024) return size + ' B';
    else if (size < 1048576) return (size / 1024).toFixed(1) + ' KB';
    else if (size < 1073741824) return (size / 1048576).toFixed(1) + ' MB';
    else return (size / 1073741824).toFixed(1) + ' GB';
};
// Protect the home route
router.get('/home', ensureAuthenticated, async (req, res) => {
    const files = await File.find({ userId: req.user.userId }); // Fetch files for logged-in user
    // Render 'files.ejs' with the files
    const filesWithIcons = files.map(file => {
        let iconColor = 'white'; // Default color

        // Change color based on file type
        if (file.filename.endsWith('.jpg')||file.filename.endsWith('.jpeg')) {
            iconColor = 'skyblue';
        } else if (file.filename.endsWith('.mp3')) {
            iconColor = 'pink';
        }else if (file.filename.endsWith('.mp4')) {
            iconColor = '#228c9b';
        }else if (file.filename.endsWith('.zip')) {
            iconColor = '#eace7f';
        }
        return {
          ...file.toObject(),
          iconClass: getFileIcon(file.filename),
          iconColor,
          formattedSize: formatSize(file.fileSize),
        };
      });

    res.render('home', { user: req.user, files: filesWithIcons});
});

router.post('/update-profile', ensureAuthenticated, upload.single('profilepic'), async (req, res) => {
    try {
        const { realname, email } = req.body;

        // Default to the current profile picture if no new one was uploaded
        let updatedProfilePic = req.user.profilepic;

        if (req.file && req.file.filename) {
            updatedProfilePic = req.file.filename; // Use the new profile picture if uploaded
        }

        // Update the user profile in the database
        const updatedUser = await userModel.findOneAndUpdate(
            { username: req.user.username },
            { realname, email, profilepic: updatedProfilePic },
            { new: true }
        );

        // Update the session with the latest user data
        const token = jwt.sign({
            userId: updatedUser._id,
            email: updatedUser.email,
            username: updatedUser.username,
            profilepic: updatedUser.profilepic, // Update the profilepic in the session as well
            realname: updatedUser.realname
        }, process.env.JWT_SECRET);
        
        res.cookie("token", token);  

        res.redirect('/profile'); // Redirect to the updated profile page
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = {router, ensureAuthenticated};