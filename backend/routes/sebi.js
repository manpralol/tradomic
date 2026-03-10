const express = require('express');
const router = express.Router();
const tradeStore = require('../services/tradeStore');

// POST /api/sebi/login
router.post('/login', (req, res) => {
    const { officerId, passphrase, otp } = req.body;

    if (officerId === 'SEBI/MUM/2024/0042' && passphrase === 'tradomic@sebi' && otp === '946201') {
        return res.json({
            success: true,
            token: 'sebi-session-token',
            officer: {
                name: 'Rajesh Kumar',
                role: 'Senior Surveillance Officer',
                region: 'Mumbai'
            }
        });
    }

    res.status(401).json({ success: false, error: 'Invalid credentials' });
});

// GET /api/sebi/trades
router.get('/trades', (req, res) => {
    const trades = tradeStore.getTrades();

    // Format for audit log as requested
    const auditLog = trades.map(t => {
        return {
            txId: t.txId,
            txHash: t.txHash || 'N/A',
            symbol: t.symbol,
            qty: t.qty,
            type: t.type,
            price: t.price,
            total: t.total,
            status: t.status,
            settlementTime: t.settlementTime || 'N/A',
            timestamp: t.timestamp,
            buyerWallet: t.buyer ? t.buyer.wallet : 'N/A',
            sellerWallet: t.seller ? t.seller.wallet : 'N/A',
            pan: t.pan ? t.pan.replace(/^(.{2}).*(.{2})$/, '$1XXX1234$2') : 'ABXXX1234X', // Masking as requested
            paymentRef: t.paymentRef || 'N/A'
        };
    });

    // Sort newest first
    auditLog.sort((a, b) => b.timestamp - a.timestamp);
    res.json(auditLog);
});

// GET /api/sebi/stats
router.get('/stats', (req, res) => {
    const trades = tradeStore.getTrades();
    const settledTrades = trades.filter(t => t.status === 'settled');

    const totalVolume = trades.reduce((sum, t) => sum + (t.total || 0), 0);

    let avgSettlementTime = 0;
    let fastestSettlement = null;

    if (settledTrades.length > 0) {
        const totalTime = settledTrades.reduce((sum, t) => sum + (t.settlementTime || 0), 0);
        avgSettlementTime = (totalTime / settledTrades.length).toFixed(2);

        fastestSettlement = Math.min(...settledTrades.map(t => t.settlementTime || 999)).toFixed(2);
    }

    // Time saved: Trades * 32 as requested (using hours notation)
    const timeSavedVsTraditional = `${trades.length * 32} hours`;

    // Top traded symbols
    const symbolCounts = {};
    trades.forEach(t => {
        symbolCounts[t.symbol] = (symbolCounts[t.symbol] || 0) + 1;
    });

    const topSymbolsArr = Object.entries(symbolCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([symbol, count]) => ({ symbol, count }));

    const topSymbolsObj = {};
    topSymbolsArr.forEach(item => {
        topSymbolsObj[item.symbol] = item.count;
    });

    res.json({
        totalTrades: trades.length,
        settledTrades: settledTrades.length,
        totalVolume: `₹${totalVolume.toLocaleString()}`,
        avgSettlement: avgSettlementTime + 's',
        fastestSettlement: fastestSettlement !== null ? fastestSettlement + 's' : 'N/A',
        timeSaved: timeSavedVsTraditional,
        topSymbols: topSymbolsObj
    });
});

module.exports = router;
