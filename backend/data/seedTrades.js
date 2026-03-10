const { v4: uuidv4 } = require('uuid');

const symbols = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'WIPRO', 'ICICIBANK', 'TATAMOTORS'];
const basePrices = {
    'RELIANCE': 2950.00,
    'TCS': 4150.00,
    'HDFCBANK': 1430.00,
    'INFY': 1680.00,
    'WIPRO': 520.00,
    'ICICIBANK': 1080.00,
    'TATAMOTORS': 950.00
};

function generateSeedTrades(count = 50) {
    const historicalTrades = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        const price = basePrices[symbol] + (Math.random() * 20 - 10); // +/- 10 from base
        const qty = Math.floor(Math.random() * 100) + 1;
        const type = Math.random() > 0.5 ? 'buy' : 'sell';
        const total = qty * price;
        const settlementTime = (1.8 + Math.random() * 1.4).toFixed(2); // 1.8s to 3.2s
        const timestamp = now - Math.floor(Math.random() * 86400000); // Spread across the last 24h

        historicalTrades.push({
            txId: 'TXN' + Math.floor(Math.random() * 1000000000).toString(),
            symbol,
            qty,
            type,
            price: parseFloat(price.toFixed(2)),
            total: parseFloat(total.toFixed(2)),
            status: 'settled',
            steps: [], // Mocking steps isn't strictly necessary for historical data but keeps shape consistent
            settlementTime: parseFloat(settlementTime),
            txHash: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
            timestamp,
            buyer: {
                name: 'Fake Buyer ' + i,
                wallet: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
                upiId: `buyer${i}@okicici`
            },
            seller: {
                name: 'Fake Seller ' + i,
                wallet: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
            },
            pan: 'ABCDE' + Math.floor(1000 + Math.random() * 9000) + 'F',
            paymentRef: 'REF' + Math.floor(Math.random() * 1000000000).toString(),
        });
    }

    // Sort by timestamp descending so newer trades are first
    return historicalTrades.sort((a, b) => b.timestamp - a.timestamp);
}

module.exports = { generateSeedTrades };
