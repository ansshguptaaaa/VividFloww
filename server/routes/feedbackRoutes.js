const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Feedback = require('../models/Feedback');

// POST /api/feedback/submit
router.post('/submit', async (req, res) => {
  console.log('Feedback Route Hit!');
  const { name, email, subject, rating, message } = req.body;

  try {
    // 1. Save to MongoDB
    const feedback = new Feedback({ name, email, subject, rating, message });
    await feedback.save();
    console.log('DB Saved: New feedback from', email);

    // 2. Setup Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // 3. Email Notification to Admin
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Sending to self
      subject: 'New ⭐ Rating Received from VividFloww',
      text: `
        New Feedback Received:
        ----------------------
        Name: ${name}
        Email: ${email}
        Subject: ${subject}
        Rating: ${rating}/5 stars
        
        Message:
        ${message}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #6d28d9;">New Feedback Received</h2>
          <hr />
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p style="font-size: 1.2em;"><strong>Rating:</strong> <span style="color: #f59e0b;">${'⭐'.repeat(rating)}</span> (${rating}/5)</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 10px;">
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          </div>
          <p style="font-size: 0.8em; color: #666; margin-top: 20px;">VividFloww Feedback System</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Email Sent: Feedback notification sent to admin.');

    res.status(201).json({ message: 'Thank you for your feedback!' });
  } catch (error) {
    console.error('Feedback Submission Error:', error);
    res.status(500).json({ error: 'Failed to submit feedback. Please try again.' });
  }
});

module.exports = router;
