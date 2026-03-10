const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const tradeStore = require('../services/tradeStore');
const netting = require('../services/netting');
const blockchain = require('../services/blockchain');

// POST /api/payment/initiate
router.post('/initiate', (req, res) => {
    const { symbol, qty, type, price } = req.body;

    if (!symbol || !qty || !type || !price) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const total = qty * price;
    const txId = uuidv4();

    const trade = {
        txId,
        symbol,
        qty: Number(qty),
        type,
        price: Number(price),
        total,
        status: 'pending',
        steps: [],
        settlementTime: null,
        txHash: null,
        timestamp: Date.now(),
        buyer: { name: 'Arjun Mehta', wallet: '0xAM...4f2c', upiId: 'arjunmehta@okicici' },
        pan: 'ABCDE1234F',
        paymentRef: 'TXN' + Math.floor(100000000 + Math.random() * 900000000)
    };

    tradeStore.addTrade(trade);

    res.json({
        txId,
        amount: total,
        upiId: trade.buyer.upiId,
        pan: trade.pan,
        paymentRef: trade.paymentRef,
        otpPhone: '+91 98765 43210'
    });
});

// POST /api/payment/verify
router.post('/verify', async (req, res) => {
    const { txId, otp, pan, password } = req.body;

    if (otp !== '482910' || pan !== 'ABCDE1234F' || !password) {
        return res.json({ success: false, error: 'Invalid credentials or OTP' });
    }

    const trade = tradeStore.getTradeById(txId);
    if (!trade) {
        return res.status(404).json({ success: false, error: 'Trade not found' });
    }

    // Update trade status
    tradeStore.updateTrade(txId, { status: 'executing' });

    // Call netting engine
    netting.submitOrder({ symbol: trade.symbol, qty: trade.qty, type: trade.type });
    const netStats = netting.computeNet(trade.symbol);
    console.log(`[Netting] Symbol: ${trade.symbol} | Gross: ${netStats.grossQty} | Net: ${netStats.netQty} | Savings: ${netStats.savingsPct}%`);

    // Call simulated blockchain execute
    const txResult = await blockchain.executeTrade({
        symbol: trade.symbol,
        qty: trade.qty,
        type: trade.type,
        total: trade.total
    });

    // Update Trade with Hash
    tradeStore.updateTrade(txId, { txHash: txResult.txHash });

    res.json({ success: true, txId, txHash: txResult.txHash });
});

module.exports = router;
