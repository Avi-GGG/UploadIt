const mongoose = require('mongoose');

function connecToDb(){
    mongoose.connect(process.env.MONGO_URI).then(() => {
        console.log('Connected to DB');
        
    })
}

module.exports = connecToDb;