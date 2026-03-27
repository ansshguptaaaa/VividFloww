const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  canvasData: { type: Object, default: {} },
  thumbnailUrl: { type: String, default: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=500' },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
