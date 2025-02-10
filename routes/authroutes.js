const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// User Sign-up Route
router.post('/sign-up', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({success:false, message: "All fields are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({success:false, message: "User already exists" });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            name,
            email,
            password: hashedPassword,
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign({ user: user }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        res.status(201).json({ success:true, message: "User registered successfully", token });

    } catch (error) {
        console.error("Error in sign-up:", error);
        res.status(500).json({success:false, message: "Server error" });
    }
});

// User Sign-in Route
router.post('/sign-in', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({success:false, message: "Email and password are required" });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({success:false, message: "User not found" });
        }

        // Check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({success:false, message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign({ user: user }, process.env.JWT_SECRET, {
            expiresIn: '1d', // Token expiry
        });

        res.status(200).json({success:true, message: "User signed in successfully", token });

    } catch (error) {
        console.error("Error in sign-in:", error);
        res.status(500).json({success:false, message: "Server error" });
    }
});


module.exports = router;
