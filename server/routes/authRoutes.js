const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const OTP = require('../models/OTP');

console.log('✅ Auth Routes Loading...');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via email (mock implementation)
const sendOTPEmail = async (email, otp) => {
  // TODO: Implement actual email sending with Nodemailer
  console.log(`OTP for ${email}: ${otp}`);
  return true;
};

// Register User
console.log('✅ Registering POST /register route');
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/)
      .withMessage('Password must contain uppercase letter')
      .matches(/\d/)
      .withMessage('Password must contain a number'),
  ],
  async (req, res) => {
    try {
      // Check if MongoDB is connected
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
          message: 'Database connection not available',
          hint: 'Please check MongoDB Atlas configuration and ensure the database is connected.'
        });
      }

      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password } = req.body;

      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      // Create new user
      user = new User({
        name,
        email,
        password,
      });

      await user.save();

      // Generate token
      const token = generateToken(user._id);

      res.status(201).json({
        message: 'Account created successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Register error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        message: 'Server error during registration',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// Login User
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user and get password field (normally excluded)
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Compare passwords
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate token
      const token = generateToken(user._id);

      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
);

// Request Password Reset (Send OTP)
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Valid email is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;

      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate and save OTP
      const otp = generateOTP();
      const otpRecord = new OTP({
        email,
        otp,
        purpose: 'password-reset',
      });

      await otpRecord.save();

      // Send OTP via email
      await sendOTPEmail(email, otp);

      res.status(200).json({
        message: 'OTP sent to your email',
        expiresIn: 600, // 10 minutes in seconds
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Reset Password with OTP
router.post(
  '/reset-password',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('Valid OTP required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, otp, newPassword } = req.body;

      // Find and verify OTP
      const otpRecord = await OTP.findOne({
        email,
        otp,
        purpose: 'password-reset',
        isUsed: false,
      });

      if (!otpRecord) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }

      // Check if OTP is expired
      if (new Date() > otpRecord.expiresAt) {
        return res.status(400).json({ message: 'OTP has expired' });
      }

      // Update user password
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.password = newPassword;
      await user.save();

      // Mark OTP as used
      otpRecord.isUsed = true;
      await otpRecord.save();

      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Verify OTP
router.post(
  '/verify-otp',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('Valid OTP required'),
  ],
  async (req, res) => {
    try {
      const { email, otp } = req.body;

      const otpRecord = await OTP.findOne({
        email,
        otp,
        isUsed: false,
      });

      if (!otpRecord || new Date() > otpRecord.expiresAt) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }

      res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

console.log('✅ Auth Routes Registered: POST /register, POST /login, POST /forgot-password, POST /reset-password, GET /google');

// Google Auth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const token = generateToken(req.user._id);
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Redirect to login page with token
    res.redirect(`${frontendURL}/login?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }))}`);
  }
);
module.exports = router;
