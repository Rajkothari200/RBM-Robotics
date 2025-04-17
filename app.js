const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/dbms', { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});

const User = mongoose.model('User', UserSchema);

app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.json({ success: false, message: 'All fields are required' });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: 'Email already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.json({ success: false, message: 'Email and password are required' });
        }
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            res.json({ success: true, message: 'Login successful' });
        } else {
            res.json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Feedback submission route
const FeedbackSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String
});

const Feedback = mongoose.model('Feedback', FeedbackSchema);

app.post('/submit-feedback', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        const newFeedback = new Feedback({ name, email, message });
        await newFeedback.save();
        res.json({ success: true, message: 'Feedback submitted successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error submitting feedback.' });
    }
});

//Cart Schema
// Import nodemailer at the top if not already
const nodemailer = require('nodemailer');

// Cart Schema
const CartSchema = new mongoose.Schema({
    username: String,
    email: String,
    items: [String],
    total: String
});

const Cart = mongoose.model('Cart', CartSchema);

// Email and Cart Saving Route
app.post('/send-email', async (req, res) => {
    const { email, message, cartItems, total } = req.body;

    if (!email || !message || !cartItems || !total) {
        return res.status(400).json({ success: false, message: "Missing fields" });
    }

    try {
        // ✅ Fetch username using email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // ✅ Save to DB with username
        const newCart = new Cart({
            username: user.username,
            email,
            items: cartItems,
            total
        });
        await newCart.save();

        // Email setup
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "rajpkothari2000@gmail.com",
                pass: "tcsnljwflmhzevmg"
            }
        });

        const mailOptions = {
            from: "rajpkothari2000@gmail.com",
            to: email,
            subject: "Your Order Confirmation - RBM Robotics",
            text: message
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "Email sent and cart saved successfully!" });

    } catch (error) {
        console.error("Error in /send-email route:", error);
        res.status(500).json({ success: false, message: "Server error in sending email or saving cart" });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));