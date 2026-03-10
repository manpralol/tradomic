const fs = require('fs');
const path = require('path');

const tradesFilePath = path.join(__dirname, '..', 'trades.json');

// In-memory array — persists for demo session
let trades = [];
let sebiSubscribers = [];

// Load trades.json on startup if it exists
if (fs.existsSync(tradesFilePath)) {
    try {
        const data = fs.readFileSync(tradesFilePath, 'utf8');
        trades = JSON.parse(data);
    } catch (err) {
        console.error('Error reading trades.json:', err);
    }
}

function saveToDisk() {
    try {
        fs.writeFileSync(tradesFilePath, JSON.stringify(trades, null, 2), 'utf8');
    } catch (err) {
        console.error('Error writing trades.json:', err);
    }
}

function notifySebiSubscribers(trade) {
    sebiSubscribers.forEach(callback => callback(trade));
}

function subscribeSebi(callback) {
    sebiSubscribers.push(callback);
}

function addTrade(trade) {
    if (!trade.timestamp) trade.timestamp = Date.now();
    trades.push(trade);
    saveToDisk();
    notifySebiSubscribers(trade);
}

function addTrades(newTrades) {
    newTrades.forEach(trade => {
        if (!trade.timestamp) trade.timestamp = Date.now();
        trades.push(trade);
    });
    saveToDisk();
}

function getTrades() {
    return trades;
}

function getTradeById(txId) {
    return trades.find(t => t.txId === txId);
}

function updateTrade(txId, updates) {
    const tradeIndex = trades.findIndex(t => t.txId === txId);
    if (tradeIndex !== -1) {
        trades[tradeIndex] = { ...trades[tradeIndex], ...updates };
        saveToDisk();
        notifySebiSubscribers(trades[tradeIndex]);
        return trades[tradeIndex];
    }
    return null;
}

module.exports = {
    addTrade,
    addTrades,
    getTrades,
    getTradeById,
    updateTrade,
    subscribeSebi
};
