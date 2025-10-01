const express = require("express");
const Task = require("../models/Task");
const { protect, admin } = require("../middleware/authMiddleware");
const router = express.Router();

// Create Task
router.post("/", protect, async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, user: req.user.id });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all tasks (admin only)
router.get("/", protect, admin, async (req, res) => {
  try {
    const tasks = await Task.find().populate("user", "username");
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update task (only owner)
router.put("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.user.toString() !== req.user.id) return res.status(403).json({ message: "Not your task" });
    task.title = req.body.title ?? task.title;
    task.description = req.body.description ?? task.description;
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete
router.delete("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.user.toString() !== req.user.id) return res.status(403).json({ message: "Not your task" });
    await task.deleteOne();
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
