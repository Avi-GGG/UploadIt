const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.get('/register', (req, res) => {
    if (req.user) {
        // If already registered in, redirect to home
        return res.redirect('/home');
    }
    res.render('register', { errors: [], formData: {} });
});

router.post(
    '/register',
    body('email')
        .trim()
        .isEmail()
        .withMessage('Invalid email format')
        .isLength({ min: 13 })
        .withMessage('Email must be at least 13 characters'),
    body('password')
        .trim()
        .isLength({ min: 5 })
        .withMessage('Password must be at least 5 characters'),
    body('username')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters'),
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // Pass errors and form data back to the template
            return res.status(400).render('register', {
                errors: errors.array(),
                formData: req.body, // Retain user input to repopulate the form
            });
        }

        try {
            const { email, password, username } = req.body;
            const user = await userModel.findOne({ username });
            if (user) {
                return res.status(400).render('register', {
                    errors: [{ msg: 'Username is already taken', param: 'username' }],
                    formData: req.body,
                });
            }
            const hashPassword = await bcrypt.hash(password, 10);

            await userModel.create({
                email,
                username,
                password: hashPassword,
            });
            
            
            res.redirect('/users/login');
        } catch (err) {
            // Handle potential database or server errors
            return res.status(500).render('register', {
                errors: [{ msg: 'An unexpected error occurred. Please try again.' }],
                formData: req.body,
            });
        }
    }
);


router.get('/login', (req, res) => {
    if (req.user) {
        // If already logged in, redirect to home
        return res.redirect('/home');
    }
    res.render('login', { errors: [], formData: {} });
});

router.post(
    '/login',
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('password').trim().isLength({ min: 5 }).withMessage('Password must be at least 5 characters'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render('login', {
                errors: errors.array(),
                formData: req.body, // Retain submitted form data
            });
        }

        const { username, password} = req.body;
        
        try {
            const user = await userModel.findOne({ username });
            if (!user) {
                return res.status(400).render('login', {
                    errors: [{ msg: 'Username or Password is incorrect', param: 'username' }],
                    formData: req.body,
                });
            }
            
            
            const isMatch = await bcrypt.compare(password, user.password);
            
            
            if (!isMatch) {
                return res.status(400).render('login', {
                    errors: [{ msg: 'Username or Password is incorrect', param: 'password' }],
                    formData: req.body,
                });
            }

            const token = jwt.sign(
                {
                    userId: user._id,
                    email: user.email,
                    username: user.username,
                },
                process.env.JWT_SECRET
            );

            res.cookie('token', token);
            res.redirect('/home');
        } catch (err) {
            return res.status(500).render('login', {
                errors: [{ msg: 'Server error. Please try again later.' }],
                formData: req.body,
            });
        }
    }
);


router.get('/logout', (req, res) => {
    res.clearCookie("token");
    // req.session.destroy() // Set the user in the session
    res.redirect('/users/login');
})

module.exports = router;