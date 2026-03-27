const express = require('express');
const Project = require('../models/Project');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

const sanitizeCanvasData = (canvasData) => {
  if (!canvasData || !Array.isArray(canvasData.elements)) return canvasData;
  canvasData.elements = canvasData.elements.map(el => {
    if (el.content && typeof el.content === 'string' && el.content.includes('via.placeholder.com')) {
      el.content = 'https://placeholder.co/150';
    }
    if (el.type === 'image' && el.content === 'https://via.placeholder.com/150') {
      el.content = 'https://placeholder.co/150';
    }
    return el;
  });
  return canvasData;
};

router.route('/')
  .post(protect, async (req, res) => {
    const { name, description } = req.body;
    try {
      const project = await Project.create({
        name,
        description,
        userId: req.user.id
      });
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  })
  .get(protect, async (req, res) => {
    try {
      const projects = await Project.find({ userId: req.user.id }).sort({ createdAt: -1 });
      res.json(projects);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

router.get('/public/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.canvasData) {
      project.canvasData = sanitizeCanvasData(project.canvasData);
    }
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.route('/:id')
  .get(protect, async (req, res) => {
    try {
      const project = await Project.findById(req.params.id);
      if (!project) return res.status(404).json({ message: 'Project not found' });
      // Ensure the project belongs to the requesting user
      if (project.userId.toString() !== req.user.id) {
         return res.status(401).json({ message: 'Not authorized to access this project' });
      }
      if (project.canvasData) {
        project.canvasData = sanitizeCanvasData(project.canvasData);
      }
      res.json(project);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  })
  .put(protect, async (req, res) => {
    try {
      const { canvasData, name, description, thumbnailUrl } = req.body;
      const project = await Project.findById(req.params.id);
      if (!project) return res.status(404).json({ message: 'Project not found' });
      // Ensure authorization
      if (project.userId.toString() !== req.user.id) {
         return res.status(401).json({ message: 'Not authorized to update this project' });
      }

      project.name = name || project.name;
      project.description = description || project.description;
      if (thumbnailUrl) project.thumbnailUrl = thumbnailUrl;
      if (canvasData) project.canvasData = canvasData;

      const updatedProject = await project.save();
      res.json(updatedProject);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  })
  .patch(protect, async (req, res) => {
    try {
      const { name, description, thumbnailUrl } = req.body;
      const project = await Project.findById(req.params.id);
      if (!project) return res.status(404).json({ message: 'Project not found' });
      
      if (project.userId.toString() !== req.user.id) {
         return res.status(401).json({ message: 'Not authorized to update this project' });
      }

      if (name) project.name = name;
      if (description !== undefined) project.description = description;
      if (thumbnailUrl) project.thumbnailUrl = thumbnailUrl;

      const updatedProject = await project.save();
      res.json(updatedProject);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  })
  .delete(protect, async (req, res) => {
    try {
      const project = await Project.findById(req.params.id);
      if (!project) return res.status(404).json({ message: 'Project not found' });
      
      if (project.userId.toString() !== req.user.id) {
         return res.status(401).json({ message: 'Not authorized to delete this project' });
      }

      await project.deleteOne();
      res.json({ message: 'Project removed' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

module.exports = router;
