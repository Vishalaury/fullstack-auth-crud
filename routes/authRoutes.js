const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

const generateToken = (user) => {
  return jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Username & password required" });
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ message: "Username already taken" });
    const user = await User.create({ username, password, role });
    res.status(201).json({ token: generateToken(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Username & password required" });
    const user = await User.findOne({ username });
    if (user && await user.matchPassword(password)) {
      res.json({ token: generateToken(user) });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// optional quick test route to verify require() works
router.get("/test", (req, res) => res.send("Auth route OK"));

module.exports = router;
