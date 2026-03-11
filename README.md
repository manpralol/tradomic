# Tradomic

Tradomic is a T+0 stock settlement system built on blockchain atomic swaps, targeting Indian equity markets (NSE/BSE). Traditional settlement in India operates on a T+1 cycle — money and shares exchange hands the next business day, locking approximately ₹700 Crore in idle capital daily. Tradomic settles trades in 2.3 seconds.

---

## How it works

When a user initiates a trade, the following happens:

1. A trade record is created on the backend with a unique transaction ID.
2. A WebSocket connection opens between the client and the server, streaming each settlement step in real time.
3. The backend calls the Atomic Swap smart contract deployed on Ethereum Sepolia. The buyer's funds are locked in the contract as escrow — inaccessible to any party until the swap executes.
4. The contract verifies the counterparty and confirms KYC linkage via PAN.
5. The netting engine aggregates concurrent orders for the same symbol, computing a net delta before settlement. This reduces the number of on-chain transactions and cuts gas costs by up to 80%.
6. The atomic swap executes — funds and shares are exchanged simultaneously in a single contract call. Either both sides settle or neither does. There is no partial execution.
7. The trade is recorded as settled with an Ethereum transaction hash, verifiable on Etherscan.

Total time: 2.3 seconds.

---

## Tech stack

**Frontend**
- React (Create React App)
- LightweightCharts v3.8.0 for candlestick charting
- WebSocket client for real-time settlement feed
- Fonts: Unbounded, Syne, DM Sans, Bricolage Grotesque

**Backend**
- Node.js + Express
- WebSocket server (ws library) for live trade and SEBI feeds
- ethers.js v6 for smart contract interaction
- Alchemy as RPC provider (Ethereum Sepolia testnet)

**Blockchain**
- Solidity smart contracts deployed on Ethereum Sepolia testnet
- Three contracts: AtomicSwap, NettingEngine, DividendDistributor
- AtomicSwap contract address: `0xED01edaBe040016C268701De53d70cb5301faAD3`

---

## Features

**Trader portal**
- Buy and sell stocks with real-time price simulation
- 4-layer transaction validation: PAN verification, OTP (2FA), MPIN, smart contract escrow check
- Payment via UPI or bank account
- Live atomic swap feed showing each settlement step as it happens
- Portfolio dashboard with holdings, P&L, and average buy price
- Tradebook with transaction history and Etherscan links for every settled trade
- Balance and holdings update immediately after settlement

**SEBI regulatory dashboard**
- Separate login portal for SEBI officers
- Immutable audit log of all trades, sortable and filterable
- Real-time trade feed via WebSocket — new trades appear without page refresh
- Every trade linked to its on-chain transaction hash
- CSV export of full audit log
- Compliance panel showing KYC status, PAN linkage, and blockchain verification

**Netting engine**
- Aggregates buy and sell orders for the same symbol before settlement
- Computes net position delta
- Reduces number of on-chain settlements, lowering gas costs

---

## Smart contracts

| Contract | Address |
|---|---|
| AtomicSwap | `0xED01edaBe040016C268701De53d70cb5301faAD3` |
| NettingEngine | `0x3e6962286472E07A2217Dd5a3c643B650cCa1adD` |
| DividendDistributor | `0xDe647f3FbbD6769b84F8D71E2BCAd5bF39fC54f4` |

Network: Ethereum Sepolia testnet

---

## Running locally

**Prerequisites:** Node.js, npm

**Backend**
```bash
cd backend
npm install
node server.js
```
Runs on `http://localhost:5000`

**Frontend**
```bash
cd frontend
npm install
npm start
```
Runs on `http://localhost:3000`

**Environment variables** — create `backend/.env`:
```
ALCHEMY_URL=your_alchemy_sepolia_url
PRIVATE_KEY=your_wallet_private_key
CONTRACT_ADDRESS=0xED01edaBe040016C268701De53d70cb5301faAD3
PORT=5000
```

---

## Demo credentials

| Field | Value |
|---|---|
| OTP | 482910 |
| PAN | ABCDE1234F |
| MPIN | any 6 digits |
| SEBI Officer ID | SEBI/MUM/2024/0042 |
| SEBI Passphrase | tradomic@sebi |
| SEBI OTP | 946201 |

---

## Project structure

```
tradomic/
├── frontend/
│   ├── public/
│   └── src/
│       ├── App.jsx
│       ├── context/AppContext.jsx
│       ├── components/
│       │   ├── LoginScreen.jsx
│       │   ├── HomePage.jsx
│       │   ├── StockDetailPage.jsx
│       │   ├── PortfolioPage.jsx
│       │   └── SebiDashboard.jsx
│       └── api/index.js
└── backend/
    ├── server.js
    ├── routes/
    │   ├── payment.js
    │   ├── trade.js
    │   ├── sebi.js
    │   └── stats.js
    ├── services/
    │   ├── tradeStore.js
    │   ├── netting.js
    │   └── blockchain.js
    └── abi/
        └── AtomicSwap.json
```

---

## Deployment

Frontend is a static React build, deployable on Vercel, Netlify, or Render Static Sites. Backend requires a persistent Node.js host with WebSocket support — Render Web Service works on the free tier. Vercel and Netlify do not support WebSockets and will break the live settlement feed.

---

Built for HORIZON 1.0, March 2026.
