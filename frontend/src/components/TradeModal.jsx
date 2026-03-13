import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { submitTrade, subscribeToTrade } from '../api/index';

const STEP_ICONS = ['🔒', '👤', '⚙️', '⚛️', '✅'];
const CONTRACT_ADDRESS = '0xED01edaBe040016C268701De53d70cb5301faAD3';

export default function TradeModal() {
    const { tradeModalOpen, tradeModalType, closeTradeModal, addTrade, navigate, selectedStock } = useApp();
    const [status, setStatus] = useState('executing');
    const [settlementMs, setSettlementMs] = useState(0);
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);

    const [steps, setSteps] = useState([
        { step: 1, label: 'Funds Locked in Smart Contract', detail: 'Waiting...', done: false },
        { step: 2, label: 'Counterparty Verified', detail: 'Waiting...', done: false },
        { step: 3, label: 'Netting Engine Computed', detail: 'Waiting...', done: false },
        { step: 4, label: 'Atomic Swap Executing', detail: 'Waiting...', done: false },
        { step: 5, label: 'Settlement Complete', detail: 'Waiting...', done: false },
    ]);
    const [finalInfo, setFinalInfo] = useState(null);

    useEffect(() => {
        if (!tradeModalOpen) {
            setSteps(prev => prev.map(p => ({ ...p, done: false, detail: 'Waiting...' })));
            setStatus('executing');
            setFinalInfo(null);
            setSettlementMs(0);
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        // Start settlement timer
        startTimeRef.current = Date.now();
        timerRef.current = setInterval(() => {
            setSettlementMs(Date.now() - startTimeRef.current);
        }, 50);

        const txId = window.__tradomic_active_txid;
        if (!txId) return;

        const unsubscribe = subscribeToTrade(txId, (update) => {
            setSteps(prev => prev.map(s => {
                if (s.step === update.step) return { ...s, done: true, detail: update.detail };
                if (s.step < update.step) return { ...s, done: true };
                return s;
            }));
        }, (completeData) => {
            clearInterval(timerRef.current);
            const elapsed = ((Date.now() - startTimeRef.current) / 1000).toFixed(2);
            setSteps(prev => prev.map(s => ({ ...s, done: true })));
            setFinalInfo({ ...completeData, elapsedSeconds: elapsed });
            setStatus('success');

            if (selectedStock) {
                const qtyElement = Array.from(document.querySelectorAll('input')).find(c => c.type === 'number');
                const qty = qtyElement ? parseFloat(qtyElement.value) : 12;
                addTrade({
                    txId: txId,
                    symbol: selectedStock.sym,
                    qty: qty,
                    type: tradeModalType.toLowerCase(),
                    price: selectedStock.price,
                    total: qty * selectedStock.price,
                    settlementTime: elapsed + 's',
                    txHash: completeData.txHash,
                    timestamp: Date.now()
                });
            }
        });

        return () => {
            unsubscribe();
            clearInterval(timerRef.current);
        };
    }, [tradeModalOpen, tradeModalType, addTrade, selectedStock]);

    if (!tradeModalOpen) return null;

    const etherscanTx = finalInfo?.txHash
        ? `https://sepolia.etherscan.io/tx/${finalInfo.txHash}`
        : `https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`;

    const shortHash = finalInfo?.txHash
        ? finalInfo.txHash.substring(0, 10) + '...' + finalInfo.txHash.slice(-6)
        : CONTRACT_ADDRESS.substring(0, 10) + '...' + CONTRACT_ADDRESS.slice(-6);

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{status === 'executing' ? 'Atomic Swap Processing...' : 'Trade Settled ✅'}</h3>
                    {status === 'success' && <button className="modal-close" onClick={closeTradeModal}>✕</button>}
                </div>

                {/* Blockchain proof banner — always visible */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.3)',
                    borderRadius: '8px', padding: '8px 14px', margin: '0 0 12px 0', fontSize: '12px'
                }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1D9E75', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                    <span style={{ color: '#1D9E75', fontWeight: 600 }}>LIVE ON BLOCKCHAIN</span>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Sepolia Testnet</span>
                    <a
                        href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ marginLeft: 'auto', color: '#1D9E75', fontFamily: 'monospace', fontSize: '11px', textDecoration: 'none' }}
                    >
                        {CONTRACT_ADDRESS.substring(0, 8)}...{CONTRACT_ADDRESS.slice(-4)} ↗
                    </a>
                </div>

                <div className="modal-body">
                    {status === 'executing' && (
                        <div className="exec-flow">
                            <div className="modal-title" id="modalTitle">{tradeModalType} {selectedStock?.sym || 'TCS'} — Atomic Swap</div>
                            <div className="modal-sub" id="modalSub">
                                Initiating T+0 settlement · Blockchain tx in progress
                                <span style={{ marginLeft: 12, fontFamily: 'monospace', color: '#1D9E75', fontWeight: 700 }}>
                                    {(settlementMs / 1000).toFixed(2)}s
                                </span>
                            </div>

                            <div className="swap-steps" id="swapSteps">
                                {steps.map((s, i) => (
                                    <div className={`swap-step${s.done ? ' done' : ''}`} id={`step${s.step}`} key={s.step}>
                                        <div className="step-dot">{STEP_ICONS[i]}</div>
                                        <div className="step-body">
                                            <div className="step-title">{s.label}</div>
                                            <div className="step-detail">{s.detail}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {status === 'success' && finalInfo && (
                        <div className="success-card">
                            <div className="success-icon">✅</div>
                            <div className="success-message">Trade Settled!</div>

                            {/* T+0 highlight */}
                            <div style={{
                                display: 'flex', justifyContent: 'center', gap: '32px',
                                background: 'rgba(29,158,117,0.08)', borderRadius: '12px',
                                padding: '16px', margin: '12px 0', border: '1px solid rgba(29,158,117,0.2)'
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: 4 }}>YOUR SETTLEMENT</div>
                                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#1D9E75', fontFamily: 'monospace' }}>
                                        {finalInfo.elapsedSeconds}s
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#1D9E75', fontWeight: 600 }}>T+0 ✓</div>
                                </div>
                                <div style={{ width: 1, background: 'rgba(29,158,117,0.2)' }} />
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: 4 }}>TRADITIONAL</div>
                                    <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--red)', fontFamily: 'monospace' }}>
                                        48hr
                                    </div>
                                    <div style={{ fontSize: '10px', color: 'var(--red)', fontWeight: 600 }}>T+2 ✗</div>
                                </div>
                            </div>

                            <div className="success-details">
                                <p><strong>Transaction ID:</strong> {finalInfo.txId}</p>
                                <p><strong>Settlement Time:</strong> {finalInfo.elapsedSeconds}s</p>
                                <p><strong>Shares:</strong> {finalInfo.qty} {finalInfo.symbol}</p>
                                <p><strong>Price:</strong> ₹{finalInfo.price}</p>

                                {/* Blockchain hash — clickable Etherscan link */}
                                <p style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <strong>Blockchain Proof:</strong>
                                    <a
                                        href={etherscanTx}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            color: '#1D9E75', fontFamily: 'monospace', fontSize: '12px',
                                            textDecoration: 'none', background: 'rgba(29,158,117,0.1)',
                                            padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(29,158,117,0.3)'
                                        }}
                                    >
                                        {shortHash} ↗ Etherscan
                                    </a>
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => { closeTradeModal(); navigate('/portfolio'); }}
                                >
                                    View Portfolio
                                </button>
                                <a
                                    href={etherscanTx}
                                    target="_blank" rel="noopener noreferrer"
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 6,
                                        padding: '10px 20px', borderRadius: 8, fontSize: 14,
                                        border: '1px solid rgba(29,158,117,0.4)', color: '#1D9E75',
                                        textDecoration: 'none', fontWeight: 600
                                    }}
                                >
                                    Verify on Etherscan ↗
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
