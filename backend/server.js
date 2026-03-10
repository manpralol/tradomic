require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

// Services
const tradeStore = require('./services/tradeStore');
const { generateSeedTrades } = require('./data/seedTrades');
require('./services/blockchain');
// Routes
const paymentRoutes = require('./routes/payment');
const tradeRoutes = require('./routes/trade');
const sebiRoutes = require('./routes/sebi');
const statsRoutes = require('./routes/stats');

const app = express();
const server = http.createServer(app);

// WebSocket server attached to the same HTTP server
const wss = new WebSocket.Server({ server });

// --- Middleware ---
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'], // Accepting common React frontend ports
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

// Health check
app.get('/', (req, res) => res.json({ status: 'Tradomic API running', version: '1.0.0' }));

// --- REST Routes ---
app.use('/api/payment', paymentRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/sebi', sebiRoutes);
app.use('/api/stats', statsRoutes);

// -----------------------------------------------------------------------
// WebSocket Handling
// -----------------------------------------------------------------------

const sebiClients = new Set();

// Subscribe to trade store — any new/updated trade is pushed to SEBI clients
tradeStore.subscribeSebi((trade) => {
    if (sebiClients.size === 0) return;
    const msg = JSON.stringify({ type: 'SEBI_LIVE_UPDATE', trade });
    sebiClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(msg);
        }
    });
});

wss.on('connection', (ws, req) => {
    const url = req.url;
    console.log(`[WS] New connection: ${url}`);

    // ── SEBI Live Feed ──────────────────────────────────────────────────
    if (url === '/sebi/live') {
        console.log('[WS] SEBI Dashboard Client Connected');
        sebiClients.add(ws);

        // Send a welcome ping
        ws.send(JSON.stringify({ type: 'CONNECTED', message: 'SEBI Live Feed Connected' }));

        ws.on('close', () => {
            sebiClients.delete(ws);
            console.log('[WS] SEBI Client Disconnected');
        });
        ws.on('error', (err) => console.error('[WS] SEBI error:', err.message));
        return;
    }

    // ── Trade Settlement Feed ───────────────────────────────────────────
    if (url.startsWith('/trade/')) {
        const txId = url.split('/')[2];
        console.log(`[WS] Client connected for Trade: ${txId}`);

        const trade = tradeStore.getTradeById(txId);
        if (!trade) {
            ws.send(JSON.stringify({ error: 'Trade not found' }));
            return ws.close();
        }

        // Compute netting display values for this trade
        const { computeNet } = require('./services/netting');
        const netStats = computeNet(trade.symbol);
        const netQty = netStats.netQty || Math.max(1, Math.floor(trade.qty * 0.2));
        const savingsPct = netStats.savingsPct || 80;

        // 5-step atomic swap sequence
        // ms = absolute time from connection start when the step fires
        const steps = [
            {
                step: 1,
                label: 'Funds Locked in Smart Contract',
                detail: `₹${trade.total.toLocaleString()} · Wallet: 0xAM...4f2c`,
                ms: 0
            },
            {
                step: 2,
                label: 'Counterparty Verified',
                detail: 'Seller: 0xBR...8a91 · KYC confirmed',
                ms: 600
            },
            {
                step: 3,
                label: 'Netting Engine Computed',
                detail: `Delta: ${netQty} shares · Gas saved: ${savingsPct}%`,
                ms: 1100
            },
            {
                step: 4,
                label: 'Atomic Swap Executing',
                detail: 'Simultaneous: money ↔ shares',
                ms: 1700
            },
            {
                step: 5,
                label: 'Settlement Complete',
                detail: `${trade.qty} ${trade.symbol} shares in your portfolio`,
                ms: 2300
            }
        ];

        // Emit each step at the correct absolute time from connection start
        let prevMs = 0;
        steps.forEach((stepData, index) => {
            const delay = stepData.ms - prevMs; // relative delay between steps
            prevMs = stepData.ms;

            setTimeout(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(stepData));
                }

                // After the last step, emit the final settled message
                if (index === steps.length - 1) {
                    setTimeout(() => {
                        if (ws.readyState !== WebSocket.OPEN) return;

                        const settlementTime = 2.31;
                        // Re-use txHash already set by payment/verify, or generate one
                        const currentTrade = tradeStore.getTradeById(txId);
                        const txHash = (currentTrade && currentTrade.txHash)
                            ? currentTrade.txHash
                            : '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

                        tradeStore.updateTrade(txId, {
                            status: 'settled',
                            settlementTime,
                            txHash,
                            steps
                        });

                        ws.send(JSON.stringify({ settled: true, txHash, settlementTime }));
                        console.log(`[Trade] ${txId} settled in ${settlementTime}s`);
                    }, 200); // small buffer after last step
                }
            }, stepData.ms); // schedule relative to connection start (absolute ms)
        });

        ws.on('close', () => console.log(`[WS] Trade client disconnected: ${txId}`));
        ws.on('error', (err) => console.error(`[WS] Trade error (${txId}):`, err.message));
        return;
    }

    // Unknown path
    ws.send(JSON.stringify({ error: 'Unknown WebSocket endpoint' }));
    ws.close();
});

// -----------------------------------------------------------------------
// Startup
// -----------------------------------------------------------------------

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════╗');
    console.log(`║   Tradomic Backend running on port ${PORT}  ║`);
    console.log('║   WebSocket ready                      ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('');

    const existingTrades = tradeStore.getTrades();
    console.log(`✅ Loaded ${existingTrades.length} trades from disk`);

    // Only seed if we have fewer than 10 trades (avoids duplicate seeding across restarts)
    if (existingTrades.length < 10) {
        const seeds = generateSeedTrades(50);
        tradeStore.addTrades(seeds);
        console.log(`🌱 Seeded ${seeds.length} historical trades`);
    } else {
        console.log(`⏩ Skipping seed — trades already loaded`);
    }

    console.log('');
    console.log('API endpoints:');
    console.log(`  POST http://localhost:${PORT}/api/payment/initiate`);
    console.log(`  POST http://localhost:${PORT}/api/payment/verify`);
    console.log(`  GET  http://localhost:${PORT}/api/trades`);
    console.log(`  POST http://localhost:${PORT}/api/sebi/login`);
    console.log(`  GET  http://localhost:${PORT}/api/sebi/trades`);
    console.log(`  GET  http://localhost:${PORT}/api/sebi/stats`);
    console.log(`  GET  http://localhost:${PORT}/api/stats`);
    console.log(`  WS   ws://localhost:${PORT}/trade/:txId`);
    console.log(`  WS   ws://localhost:${PORT}/sebi/live`);
    console.log('');
});
