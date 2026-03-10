const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');
const testPath = require('path').join(__dirname, '../abi/AtomicSwap.json');
require('fs').writeFileSync('path_debug.txt', testPath);
let ABI = [];
try {
  const abiPath = path.join(__dirname, '../abi/AtomicSwap.json');
  const raw = fs.readFileSync(abiPath, 'utf8');
  const parsed = JSON.parse(raw);
  ABI = Array.isArray(parsed) ? parsed : parsed.abi;
  console.log('✅ ABI loaded —', ABI.length, 'functions');
} catch (err) {
  console.warn('⚠️  ABI not loaded — mock mode');
}

let contract = null;
try {
  if (process.env.ALCHEMY_URL && process.env.PRIVATE_KEY &&
    process.env.CONTRACT_ADDRESS && ABI.length > 0) {
    const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI, wallet);
    console.log('✅ Blockchain connected — Sepolia testnet');
  } else {
    console.log('⚠️  Blockchain running in mock mode');
  }
} catch (err) {
  console.warn('⚠️  Blockchain connection failed — mock mode:', err.message);
}

async function executeTrade({ symbol, qty, type, total }) {
  if (contract) {
    try {
      const sellerAddress = process.env.CONTRACT_ADDRESS;
      const ethAmount = ethers.parseEther("0.001"); // fixed tiny amount for demo
      const tx = await contract.initiateSwap(
        sellerAddress,
        symbol,
        qty,
        { value: ethAmount }
      );
      const receipt = await tx.wait();
      console.log('✅ Real tx:', tx.hash);
      return { txHash: tx.hash, blockNumber: receipt.blockNumber, real: true };
    } catch (err) {
      console.warn('⚠️  Contract call failed, mock fallback:', err.message);
    }
  }

  const fakeTx = '0x' + Array.from({ length: 40 }, () =>
    Math.floor(Math.random() * 16).toString(16)).join('');
  console.log('⚠️  Mock tx:', fakeTx);
  return {
    txHash: fakeTx,
    blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
    real: false
  };
}

module.exports = { executeTrade };