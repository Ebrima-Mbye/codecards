const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      const err = new Error("username, email and password are required");
      err.statusCode = 400;
      return next(err);
    }
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      const err = new Error("Username or email already in use");
      err.statusCode = 409;
      return next(err);
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email, passwordHash });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.status(201).json({
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      const err = new Error("email and password are required");
      err.statusCode = 400;
      return next(err);
    }
    const user = await User.findOne({ email });
    if (!user) {
      const err = new Error("Invalid credentials");
      err.statusCode = 401;
      return next(err);
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      const err = new Error("Invalid credentials");
      err.statusCode = 401;
      return next(err);
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
