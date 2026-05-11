const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  walletBalance: { type: Number, required: true, default: 10000 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);