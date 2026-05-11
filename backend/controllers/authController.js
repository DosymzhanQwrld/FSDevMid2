const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const TOKEN_EXPIRATION = '7d';

function signToken(user) {
  return jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRATION
  });
}

async function register(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const normalizedUsername = username.trim().toLowerCase();

  const existingUser = await User.findOne({ username: normalizedUsername });
  if (existingUser) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = new User({ username: normalizedUsername, password: hashedPassword });
  await user.save();

  const token = signToken(user);
  return res.status(201).json({ token, username: user.username, walletBalance: user.walletBalance });
}

async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const user = await User.findOne({ username: username.trim().toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signToken(user);
  return res.status(200).json({ token, username: user.username, walletBalance: user.walletBalance });
}

module.exports = {
  register,
  login
};