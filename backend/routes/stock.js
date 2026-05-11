const express = require('express');
const authMiddleware = require('../middleware/auth');
const { createStock, updatePrice, listStocks, getMyStock } = require('../controllers/stockController');

const router = express.Router();

router.get('/', listStocks);
router.get('/mine', authMiddleware, getMyStock);
router.post('/', authMiddleware, createStock);
router.put('/:ticker', authMiddleware, updatePrice);

module.exports = router;