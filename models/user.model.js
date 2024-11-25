const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        minlength: [3, 'Username must be atleast 3 characters long']
        
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        minlength: [13, 'Username must be atleast 13 characters long']
        
    },
    password: {
        type: String,
        required: true,
        trim: true,
        
        minlength: [5, 'Username must be atleast 5 characters long']
        
    },
    profilepic: {
        type: String,
        default: 'default.jpg'
    },
    realname:{
        type: String,
        trim: true
    }
})

module.exports = mongoose.model('User', userSchema);