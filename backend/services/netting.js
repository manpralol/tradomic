// Holds pending orders per symbol before settlement
const orderPool = {};

function submitOrder({ symbol, qty, type }) {
    if (!orderPool[symbol]) {
        orderPool[symbol] = { buys: 0, sells: 0 };
    }

    if (type.toLowerCase() === 'buy') {
        orderPool[symbol].buys += qty;
    } else if (type.toLowerCase() === 'sell') {
        orderPool[symbol].sells += qty;
    }

    return orderPool[symbol];
}

function computeNet(symbol) {
    if (!orderPool[symbol]) {
        return { totalBuy: 0, totalSell: 0, netQty: 0, grossQty: 0, savedQty: 0, savingsPct: 0 };
    }

    const totalBuy = orderPool[symbol].buys;
    const totalSell = orderPool[symbol].sells;

    const netQty = Math.abs(totalBuy - totalSell);
    const grossQty = totalBuy + totalSell;
    const savedQty = grossQty - netQty;
    const savingsPct = grossQty > 0 ? ((savedQty / grossQty) * 100).toFixed(2) : 0;

    return {
        totalBuy,
        totalSell,
        netQty,
        grossQty,
        savedQty,
        savingsPct: parseFloat(savingsPct)
    };
}

function clearPool(symbol) {
    if (orderPool[symbol]) {
        orderPool[symbol] = { buys: 0, sells: 0 };
    }
}

function getGlobalNettingStats() {
    let grossOrders = 0;
    let netOrders = 0;

    for (const symbol in orderPool) {
        const stats = computeNet(symbol);
        grossOrders += stats.grossQty;
        netOrders += stats.netQty;
    }

    const savingsPct = grossOrders > 0 ? (((grossOrders - netOrders) / grossOrders) * 100).toFixed(2) : 0;

    return {
        grossOrders,
        netOrders,
        savingsPct: parseFloat(savingsPct)
    };
}

module.exports = { submitOrder, computeNet, clearPool, getGlobalNettingStats };
