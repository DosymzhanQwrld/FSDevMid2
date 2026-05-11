const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ticker: { type: String, required: true, uppercase: true, trim: true },
  sharesOwned: { type: Number, required: true, min: 0, default: 0 },
  averagePrice: { type: Number, default: 0 } 
}, { timestamps: true });

portfolioSchema.index({ userId: 1, ticker: 1 }, { unique: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);