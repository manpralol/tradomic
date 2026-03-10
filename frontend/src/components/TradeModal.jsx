import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { submitTrade, subscribeToTrade } from '../api/index';

const STEP_ICONS = ['🔒', '👤', '⚙️', '⚛️', '✅'];
const STEP_TIMES = ['10:00:00.000', '10:00:00.051', '10:00:00.210', '10:00:01.400', '10:00:02.290'];

export default function TradeModal() {
    const { tradeModalOpen, tradeModalType, closeTradeModal, addTrade, navigate, selectedStock } = useApp();
    const [status, setStatus] = useState('executing');
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
            return;
        }

        const txId = window.__tradomic_active_txid;
        if (!txId) return;

        const unsubscribe = subscribeToTrade(txId, (update) => {
            setSteps(prev => prev.map(s => {
                if (s.step === update.step) return { ...s, done: true, detail: update.detail };
                if (s.step < update.step) return { ...s, done: true };
                return s;
            }));
        }, (completeData) => {
            setSteps(prev => prev.map(s => ({ ...s, done: true })));
            setFinalInfo(completeData);
            setStatus('success');

            // Add to Context Portfolio
            if (selectedStock) {
                // Approximate quantity and price as backend calculates exact. Use mock value derived from TX payload, simplified for frontend:
                const qtyElement = Array.from(document.querySelectorAll('input')).find(c => c.type === 'number');
                const qty = qtyElement ? parseFloat(qtyElement.value) : 12;

                addTrade({
                    txId: txId,
                    symbol: selectedStock.sym,
                    qty: qty,
                    type: tradeModalType.toLowerCase(),
                    price: selectedStock.price,
                    total: qty * selectedStock.price,
                    settlementTime: completeData.settlementTime + 's',
                    txHash: completeData.txHash,
                    timestamp: Date.now()
                });
            }
        });

        return unsubscribe;
    }, [tradeModalOpen, tradeModalType, addTrade, selectedStock]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // No specific cleanup needed here anymore as the main useEffect handles subscription cleanup
        };
    }, []);

    function handleOverlayClick(e) {
        if (e.target === e.currentTarget) closeTradeModal();
    }

    if (!tradeModalOpen) return null;

    const stepLabels = [
        'Funds Locked in Smart Contract',
        'Counterparty Verified',
        'Netting Engine Computed',
        'Atomic Swap Executing',
        'Settlement Complete',
    ];
    const stepDetails = [
        '₹37,350 · Wallet: 0xAM...4f2c',
        'Seller: 0xBR...8a91 · KYC confirmed',
        'Delta: 10 shares net · Gas saved: 78%',
        'Simultaneous: money ↔ shares',
        '10 TCS shares in your portfolio',
    ];

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{status === 'executing' ? 'Atomic Swap Processing...' : 'Trade Settled'}</h3>
                    {status === 'success' && <button className="modal-close" onClick={closeTradeModal}>✕</button>}
                </div>
                <div className="modal-body">
                    {status === 'executing' && (
                        <div className="exec-flow">
                            <div className="modal-title" id="modalTitle">{tradeModalType} TCS — Atomic Swap</div>
                            <div className="modal-sub" id="modalSub">Initiating T+0 settlement · Blockchain tx in progress</div>

                            <div className="swap-steps" id="swapSteps">
                                {steps.map((s, i) => (
                                    <div className={`swap-step${s.done ? ' done' : ''}`} id={`step${s.step}`} key={s.step}>
                                        <div className="step-dot">{STEP_ICONS[i]}</div>
                                        <div className="step-body">
                                            <div className="step-title">{s.label}</div>
                                            <div className="step-detail">{s.detail}</div>
                                            {/* <div className="step-time" id={`step${i + 1}time`}>{s.time}</div> */}
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
                            <div className="success-details">
                                <p><strong>Transaction ID:</strong> {finalInfo.txId}</p>
                                <p><strong>Settlement Time:</strong> {finalInfo.settlementTime}s</p>
                                <p><strong>Blockchain Hash:</strong> {finalInfo.txHash}</p>
                                <p><strong>Shares:</strong> {finalInfo.qty} {finalInfo.symbol}</p>
                                <p><strong>Price:</strong> ₹{finalInfo.price}</p>
                            </div>
                            <button className="btn btn-primary" onClick={() => { closeTradeModal(); navigate('/portfolio'); }}>View Portfolio</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
