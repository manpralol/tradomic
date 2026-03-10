const express = require('express');
const router = express.Router();
const tradeStore = require('../services/tradeStore');

// GET /api/trades
router.get('/', (req, res) => {
    const trades = tradeStore.getTrades();
    // Sort newest first
    const sortedTrades = [...trades].sort((a, b) => b.timestamp - a.timestamp);
    res.json(sortedTrades);
});

// GET /api/trades/:txId
router.get('/:txId', (req, res) => {
    const trade = tradeStore.getTradeById(req.params.txId);
    if (!trade) {
        return res.status(404).json({ error: 'Trade not found' });
    }
    res.json(trade);
});

// WebSocket for /trade/:txId is handled in server.js

module.exports = router;
