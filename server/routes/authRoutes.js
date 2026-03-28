const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const nodemailer = require('nodemailer');
const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail', // Standard integration for a @gmail.com address
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  tls: { rejectUnauthorized: false }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'mock_client_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock_client_secret',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      // First check if a user with that email already exists
      let user = await User.findOne({ email });

      if (user) {
        // If the user exists but doesn't have a googleId, update it (link accounts)
        if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }
      } else {
        // If the user does NOT exist, create a new record
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: email
        });
      }
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false, prompt: 'select_account' }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/', session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id, name: req.user.name }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
  }
);

// --- OTP Routes ---

router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  console.log('Attempting to send email to:', email);
  console.log('Nodemailer User:', process.env.EMAIL_USER);

  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to database first
    await Otp.create({ email, otp });
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'VividFloww Verification Code',
      text: `Your verification code is: ${otp}. It will expire in 5 minutes.`
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
      console.error('sendMail Error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const record = await Otp.findOne({ email, otp });
    if (!record) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    
    // Delete OTP after successful verification
    await Otp.deleteOne({ _id: record._id });
    
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name: email.split('@')[0], email });
    }
    
    const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
