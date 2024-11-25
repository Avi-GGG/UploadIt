const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const connectToDb = require('./config/db');
connectToDb();
const cookieParser = require('cookie-parser')
const {router} = require('./routes/index.routes')
const path = require('path');
const fileRouter = require('./routes/file.routes'); // Adjust the path as needed
const uploadRouter = require('./routes/upload.routes');


// Session middleware setup

const userRouter = require('./routes/user.routes');
app.set('view engine', 'ejs');
// app.set('views', path.resolve(__dirname, '../views'));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public'))); //necessary to use this to access (req.body)

app.use('/', router);
app.use('/', uploadRouter);
app.use('/', fileRouter); // Mount the file routes
app.use('/users', userRouter);

app.get('/', (req, res) => {
    res.render('index');
})

app.listen(process.env.PORT || 4000, ()=> {
    console.log('Server is running on port 4000');
})