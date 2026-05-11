const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getPortfolio, buyShares } = require('../controllers/tradeController');

const router = express.Router();

router.get('/portfolio', authMiddleware, getPortfolio);
router.post('/buy', authMiddleware, buyShares);

module.exports = router;