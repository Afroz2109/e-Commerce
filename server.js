const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('./models/User');

const path = require('path');
const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));

// mongoose.set('debug', true);
// console.log(process.env.MONGO_URI);
const db = mongoose.connection;

// Root route handling
app.get('/', (req, res) => {
    const { token } = req.cookies;
    if (token) {
        try {
            const tokenData = jwt.verify(token, process.env.JWT_SECRET_KEY);
            if (tokenData.type === 'user') {
                res.sendFile(path.join(__dirname, 'public', 'home.html'));
            } else {
                res.redirect('/signin');
            }
        } catch (error) {
            res.redirect('/signin');
        }
    } else {
        res.redirect('/signin');
    }
});

app.get('/signin', (req, res) => {
    res.render('signin');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/sellerSignin', (req, res) => {
    res.render('sellerSignin');
});

app.post('/signup', async (req, res) => {
    const { name, email, password: plainTextPassword, confirmPassword } = req.body;

    try {
        // Check if passwords match
        if (plainTextPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Validate password
        if (!plainTextPassword || typeof plainTextPassword !== 'string') {
            return res.status(400).json({ message: 'Password must be a non-empty string' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.redirect('/signin'); // Redirect to sign-in page if user exists
        }

        // Encrypt password
        const encryptedPassword = await bcrypt.hash(plainTextPassword, 10);

        // Create new user
        await User.create({
            name,
            email,
            password: encryptedPassword
        });

        res.redirect('/signin');
    } catch (error) {
        console.error('Error during user registration:', error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Handle other errors
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});


app.post('/signin', async (req, res) => {
    const { email, password: plainTextPassword } = req.body;

    try {
        // Check if password is valid
        if (!plainTextPassword || typeof plainTextPassword !== 'string') {
            return res.redirect('/signin?error=Password must be a non-empty string');
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            // Redirect with error message if no user is found
            return res.redirect('/signin?error=No user found');
        }

        // Compare password
        const isMatch = await bcrypt.compare(plainTextPassword, user.password);
        if (!isMatch) {
            // Redirect with error message if password is incorrect
            return res.redirect('/signin?error=Invalid credentials');
        }

        // Create JWT token
        const token = jwt.sign({
            userId: user._id,
            email: email,
            type: 'user'
        }, process.env.JWT_SECRET_KEY, { expiresIn: '2h' });

        // Set token as cookie
        res.cookie('token', token, { maxAge: 2 * 60 * 60 * 1000 });
        res.redirect('/home'); // Redirect to home page on successful login
    } catch (error) {
        console.error('Error during user signin:', error);
        // Redirect with error message for server error
        res.redirect('/signin?error=Internal server error');
    }
});

// Seller login
app.post('/sellerSignin', async (req, res) => {
    const { email, password: plainTextPassword } = req.body;

    try {
        if (!plainTextPassword || typeof plainTextPassword !== 'string') {
            throw new Error('Password must be a non-empty string');
        }

        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }

        const isMatch = await bcrypt.compare(plainTextPassword, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        const token = jwt.sign({
            userId: user._id,
            email: email,
            type: 'seller'
        }, process.env.JWT_SECRET_KEY, { expiresIn: '2h' });

        res.cookie('token', token, { maxAge: 2 * 60 * 60 * 1000 });
        res.redirect('/seller');
    } catch (error) {
        console.error('Error during seller signin:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

app.get('/logout', (req, res) => {
    // Clear session or token
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      } else {
        // Redirect to signin
        res.redirect('/signin');
      }
    });
  });
  

app.use(express.static(path.join(__dirname, 'public')));

// Define the route for your static home.html
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Define the route for seller.html
app.get('/seller', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'seller.html'));
});

const userRouter = require('./routes/user');
app.use('/users', userRouter);

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});


