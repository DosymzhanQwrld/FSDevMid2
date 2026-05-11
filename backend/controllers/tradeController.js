const mongoose = require('mongoose');
const Portfolio = require('../models/Portfolio');
const Stock = require('../models/Stock');
const User = require('../models/User');

async function getPortfolio(req, res) {
  const userId = req.user.id;
  const user = await User.findById(userId).lean();
  const holdings = await Portfolio.find({ userId }).lean();
  const tickers = holdings.map((item) => item.ticker);
  const stocks = await Stock.find({ ticker: { $in: tickers } }).lean();
  
  const prices = stocks.reduce((map, stock) => {
    map[stock.ticker] = stock.price;
    return map;
  }, {});

  const enrichedHoldings = holdings.map((item) => ({
    ticker: item.ticker,
    sharesOwned: item.sharesOwned,
    averagePrice: item.averagePrice || 0,
    currentPrice: prices[item.ticker] ?? 0
  }));

  return res.status(200).json({
    walletBalance: user.walletBalance,
    holdings: enrichedHoldings
  });
}

async function buyShares(req, res) {
  const userId = req.user.id;
  const { ticker, quantity } = req.body;

  if (!ticker || !quantity || quantity <= 0 || !Number.isInteger(quantity)) {
    return res.status(400).json({ message: 'Invalid data' });
  }

  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const stock = await Stock.findOne({ ticker: ticker.toUpperCase() }).session(session);
      if (!stock) throw new Error('Stock not found');

      const user = await User.findById(userId).session(session);
      const cost = stock.price * quantity;

      if (user.walletBalance < cost) throw new Error('Insufficient funds');

      user.walletBalance -= cost;
      await user.save({ session });

      const existingPos = await Portfolio.findOne({ userId, ticker: stock.ticker }).session(session);

      if (existingPos) {
        const totalShares = existingPos.sharesOwned + quantity;
        const newAverage = ((existingPos.sharesOwned * existingPos.averagePrice) + (quantity * stock.price)) / totalShares;
        
        existingPos.sharesOwned = totalShares;
        existingPos.averagePrice = newAverage;
        await existingPos.save({ session });
        result = existingPos;
      } else {
        const newPos = await Portfolio.create([{
          userId,
          ticker: stock.ticker,
          sharesOwned: quantity,
          averagePrice: stock.price
        }], { session });
        result = newPos[0];
      }
    });

    return res.status(200).json({
      walletBalance: (await User.findById(userId)).walletBalance,
      ticker: result.ticker,
      sharesOwned: result.sharesOwned,
      averagePrice: result.averagePrice
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
}

module.exports = { getPortfolio, buyShares };