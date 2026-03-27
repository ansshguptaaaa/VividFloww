require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const connectDB = require('./config/db');

const app = express();

// ─── Middleware (express.json MUST be first) ──────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(passport.initialize());

// ─── Database ──────────────────────────────────────────────────────
connectDB();

// ─── Routes ────────────────────────────────────────────────────────
const aiRoutes = require('./routes/aiRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/upload',   require('./routes/uploadRoutes'));
app.use('/api/ai',       aiRoutes);          // AI generation endpoint
app.use('/api/feedback', feedbackRoutes);

// ─── Health check ──────────────────────────────────────────────────
app.get('/', (req, res) => res.send('VividFloww API is running...'));

// ─── Global error handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Server] Unhandled error:', err.message);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
