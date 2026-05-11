const Stock = require('../models/Stock');
const wsServer = require('../wsServer');

async function createStock(req, res) {
  const { ticker, price } = req.body;
  const owner = req.user.id;

  if (!ticker) return res.status(400).json({ message: 'Ticker is required' });

  const normalizedTicker = ticker.trim().toUpperCase();

  const existingOwnerStock = await Stock.findOne({ owner });
  if (existingOwnerStock) return res.status(400).json({ message: 'User already owns a ticker' });

  const existingTicker = await Stock.findOne({ ticker: normalizedTicker });
  if (existingTicker) return res.status(400).json({ message: 'Ticker already exists' });

  const stock = new Stock({ ticker: normalizedTicker, owner, price: Number(price) || 0 });
  await stock.save();

  return res.status(201).json({ stock });
}

async function updatePrice(req, res) {
  const { ticker } = req.params;
  const { price } = req.body;
  const userId = req.user.id;

  if (price === undefined) return res.status(400).json({ message: 'Price is required' });

  const stock = await Stock.findOne({ ticker: ticker.trim().toUpperCase() });
  if (!stock) return res.status(404).json({ message: 'Stock not found' });

  if (stock.owner.toString() !== userId) return res.status(403).json({ message: 'Forbidden' });

  stock.price = Number(price);
  await stock.save();

  wsServer.broadcastTickerUpdate({ ticker: stock.ticker, price: stock.price });

  return res.status(200).json({ stock });
}

async function listStocks(req, res) {
  const stocks = await Stock.find().select('ticker price owner').lean();
  return res.status(200).json({ stocks });
}

async function getMyStock(req, res) {
  const stock = await Stock.findOne({ owner: req.user.id }).select('ticker price owner').lean();
  return res.status(200).json({ stock });
}

module.exports = { createStock, updatePrice, listStocks, getMyStock };