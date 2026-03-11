import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { initiatePayment, verifyPayment } from '../api';

function generateCandles(count, startPrice) {
    let p = startPrice;
    const res = [];
    const now = Date.now();
    for (let i = count; i > 0; i--) {
        const time = Math.floor((now - i * 86400000) / 1000); // 1 day steps
        const open = p + (Math.random() - 0.5) * (startPrice * 0.01);
        const high = open + Math.random() * (startPrice * 0.015);
        const low = open - Math.random() * (startPrice * 0.015);
        const close = low + Math.random() * (high - low);
        res.push({ time, open, high, low, close });
        p = close; // Carry forward trend
    }
    return res;
}

export default function StockDetailPage() {
    const { selectedStock, navigate, user, theme, openTradeModal, canAfford, canSell, executeBuy, executeSell } = useApp();
    const chartContainerRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const seriesRef = useRef(null);

    const [tf, setTf] = useState('1M');
    const [action, setAction] = useState('BUY');
    const [orderType, setOrderType] = useState('MARKET');
    const [qty, setQty] = useState(10);
    const price = selectedStock ? selectedStock.price : 0;
    const [customPrice, setCustomPrice] = useState(price);

    const [upiModalOpen, setUpiModalOpen] = useState(false);
    const [upiStep, setUpiStep] = useState(1);
    const [pan, setPan] = useState('ABCDE1234F');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [validationError, setValidationError] = useState('');
    const [sellError, setSellError] = useState('');
    const [mpin, setMpin] = useState('');

    const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' or 'BANK'
    const [processingMsg, setProcessingMsg] = useState('');
    const [swapSteps, setSwapSteps] = useState([]);
    const [swapComplete, setSwapComplete] = useState(false);
    const [authSubStep, setAuthSubStep] = useState(1);

    // Stable ref for txRef so success screen doesn't re-roll
    const txRef = useRef('TXN' + Math.floor(100000000 + Math.random() * 900000000));
    const successCardRef = useRef(null);

    useEffect(() => {
        if (swapComplete && successCardRef.current) {
            successCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [swapComplete]);

    useEffect(() => {
        if (!selectedStock) return;
        setCustomPrice(selectedStock.price);
    }, [selectedStock]);

    useEffect(() => {
        if (!chartContainerRef.current || !selectedStock) return;
        if (!window.LightweightCharts) {
            console.error('TradingView Lightweight Charts not loaded! Ensure script is added to index.html');
            return;
        }

        // Initialize chart exactly once
        if (!chartInstanceRef.current) {
            const upColor = theme === 'bloomberg' ? '#0ce882' : '#0ce882';
            const downColor = '#ff3d5a';

            chartInstanceRef.current = window.LightweightCharts.createChart(chartContainerRef.current, {
                width: chartContainerRef.current.clientWidth,
                height: 400,
                layout: {
                    background: { type: 'solid', color: 'transparent' },
                    textColor: '#7a9bb5',
                },
                grid: {
                    vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
                    horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
                },
                timeScale: {
                    timeVisible: true,
                    secondsVisible: false,
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                },
            });

            seriesRef.current = chartInstanceRef.current.addCandlestickSeries({
                upColor,
                downColor,
                borderVisible: false,
                wickUpColor: upColor,
                wickDownColor: downColor,
            });

            const handleResize = () => {
                if (chartContainerRef.current && chartInstanceRef.current) {
                    chartInstanceRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
                }
            };
            window.addEventListener('resize', handleResize);
            return () => {
                window.removeEventListener('resize', handleResize);
                chartInstanceRef.current.remove();
                chartInstanceRef.current = null;
            };
        }
    }, [selectedStock, theme]);

    useEffect(() => {
        if (seriesRef.current && selectedStock) {
            const counts = { '1D': 30, '1W': 60, '1M': 100, '3M': 180, '6M': 250, '1Y': 365, '52W': 365 };
            const count = counts[tf] || 100;
            const data = generateCandles(count, selectedStock.price);
            seriesRef.current.setData(data);
            chartInstanceRef.current.timeScale().fitContent();
        }
    }, [tf, selectedStock]);

    if (!selectedStock) {
        return <div style={{ padding: '40px' }}>Loading...</div>;
    }

    const tfs = ['1D', '1W', '1M', '3M', '6M', '1Y', '52W'];
    const total = qty * (orderType === 'LIMIT' ? customPrice : price);
    const isUp = selectedStock.chg >= 0;
    const holding = selectedStock ? user.holdings[selectedStock.sym] : null;
    const availableQty = holding ? holding.qty : 0;

    const tradeType = action === 'BUY' ? 'buy' : 'sell';

    const handleActionClick = () => {
        setValidationError('');
        setSellError('');
        if (action === 'BUY') {
            if (!canAfford(qty, price)) {
                setValidationError(`Insufficient balance. You have ₹${user.balance.toLocaleString('en-IN')} but need ₹${(qty * price).toLocaleString('en-IN')}`);
                return;
            }
        }
        if (action === 'SELL') {
            if (availableQty <= 0) {
                setSellError(`You don't own any ${selectedStock.sym} shares to sell.`);
                return;
            }

            if (qty > availableQty) {
                setSellError(`You only have ${availableQty} shares of ${selectedStock.sym}. You can't sell ${qty}.`);
                return;
            }
        }
        setUpiStep(1);
        setMpin('');
        setOtp('');
        setPassword('');
        setPaymentMethod('UPI');
        setProcessingMsg('');
        setSwapSteps([]);
        setSwapComplete(false);
        setAuthSubStep(1);

        txRef.current = 'TXN' + Math.floor(100000000 + Math.random() * 900000000);
        setUpiModalOpen(true);
    };

    const startProcessing = () => {
        const msgs = [
            'Validating identity...',
            'Contacting your bank...',
            'Authorising transaction...',
            'Initiating atomic swap...',
            'Finalising settlement...'
        ];
        let msgIdx = 0;
        setProcessingMsg(msgs[msgIdx]);

        const msgInterval = setInterval(() => {
            msgIdx = (msgIdx + 1) % msgs.length;
            setProcessingMsg(msgs[msgIdx]);
        }, 800);

        const duration = Math.floor(Math.random() * (7000 - 3000 + 1)) + 3000;

        setTimeout(async () => {
            clearInterval(msgInterval);

            try {
                const initRes = await initiatePayment({
                    symbol: selectedStock.sym,
                    qty,
                    type: action,
                    price: orderType === 'LIMIT' ? customPrice : price
                });
                const verRes = await verifyPayment({
                    txId: initRes.txId,
                    otp: action === 'BUY' ? otp : '482910',
                    pan,
                    password: action === 'BUY' ? password : 'sell'
                });
                if (verRes.success) {
                    if (action === 'BUY') {
                        setUpiStep(6);
                        setTimeout(() => {
                            setUpiStep(7);
                            executeBuy({
                                symbol: selectedStock.sym,
                                qty,
                                price,
                                txId: initRes.txId,
                                txHash: verRes.txHash,
                                settlementTime: '2.31s'
                            });
                            startAtomicSwapFeed(verRes.txHash);
                        }, 1500);
                    } else {
                        executeSell({
                            symbol: selectedStock.sym,
                            qty,
                            price,
                            txId: initRes.txId,
                            txHash: verRes.txHash,
                            settlementTime: '2.31s'
                        });
                        setUpiStep(4);
                        startAtomicSwapFeed(verRes.txHash);
                    }
                } else {
                    alert('Payment failed: ' + verRes.error);
                    setUpiStep(action === 'BUY' ? 4 : 2);
                }
            } catch (err) {
                console.error(err);
                alert('API Error — check if backend is running');
                setUpiStep(action === 'BUY' ? 4 : 2);
            }
        }, duration);
    };

    const startAtomicSwapFeed = (txHash) => {
        const stepsData = [
            { label: 'Funds Locked in Smart Contract', detail: `₹${total.toLocaleString('en-IN')} · Wallet: 0xAM...4f2c` },
            { label: 'Counterparty Verified', detail: 'Seller: 0xBR...8a91 · KYC confirmed' },
            { label: 'Netting Engine Computed', detail: 'Net settlement · Gas optimised' },
            { label: 'Atomic Swap Executing', detail: 'Simultaneous: money ↔ shares' },
            { label: 'Settlement Complete', detail: `${qty} ${selectedStock.sym} shares in your portfolio` },
        ];

        let currentStep = 0;
        setSwapSteps([]);
        setSwapComplete(false);
        txRef.current = txHash;

        const interval = setInterval(() => {
            if (currentStep < stepsData.length) {
                const stepWithTime = {
                    ...stepsData[currentStep],
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                };
                setSwapSteps(prev => [...prev, stepWithTime]);
                currentStep++;
            } else {
                clearInterval(interval);
                setSwapComplete(true);
            }
        }, 600);
    };

    const handleProceed = () => {
        if (action === 'BUY') {
            if (upiStep === 1) { setUpiStep(2); return; }
            if (upiStep === 2) { setUpiStep(3); return; }
            if (upiStep === 3) {
                if (authSubStep === 1) {
                    setAuthSubStep(2);
                    setTimeout(() => setOtp('482910'), 2000);
                    return;
                }
                if (authSubStep === 2) {
                    setAuthSubStep(3);
                    return;
                }
                if (authSubStep === 3 && mpin.length === 6) {
                    setUpiStep(4);
                    return;
                }
                return;
            }
            if (upiStep === 4) {
                setUpiStep(5);
                startProcessing();
                return;
            }
        }

        if (action === 'SELL') {
            if (upiStep === 1) { setUpiStep(2); return; }
            if (upiStep === 2 && mpin.length === 6) {
                setUpiStep(3);
                startProcessing();
                return;
            }
        }
    };

    const handleMpinDigit = (d) => {
        if (mpin.length < 6) setMpin(prev => prev + d);
    };
    const handleMpinBack = () => setMpin(prev => prev.slice(0, -1));

    const isProcessingStep = (action === 'BUY' && (upiStep === 5 || upiStep === 7)) || (action === 'SELL' && (upiStep === 3 || upiStep === 4));

    return (
        <div style={{ padding: '0px 0px 40px' }}>
            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={() => navigate('stocks')}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '0', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-ui, DM Sans, sans-serif)' }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m7 7-7-7 7-7" /></svg>
                    Back to Markets
                </button>
            </div>

            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h1 style={{ fontSize: '28px', margin: 0 }}>{selectedStock.name}</h1>
                    <span className="exch-tag">{selectedStock.exch}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '24px', fontFamily: 'var(--font-mono)' }}>₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    <span className={`chg-badge ${isUp ? 'up' : 'down'}`} style={{ fontSize: '14px', padding: '6px 10px' }}>
                        {isUp ? '+' : ''}{selectedStock.chg}% today
                    </span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                <div style={{ flex: '1 1 70%', minWidth: 0 }}>
                    <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                            {tfs.map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTf(t)}
                                    style={{
                                        background: tf === t ? 'var(--accent)' : 'transparent',
                                        color: tf === t ? 'var(--bg)' : 'var(--text-secondary)',
                                        border: 'none',
                                        padding: '4px 12px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: tf === t ? 700 : 500,
                                        fontSize: '12px'
                                    }}
                                >{t}</button>
                            ))}
                        </div>
                        <div ref={chartContainerRef} style={{ width: '100%', height: '400px' }}></div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '24px', flexWrap: 'wrap' }}>
                        {[
                            ['52 Week High', `₹${(price * 1.15).toFixed(2)}`],
                            ['52 Week Low', `₹${(price * 0.85).toFixed(2)}`],
                            ['Market Cap', selectedStock.cap],
                            ['P/E Ratio', (20 + Math.random() * 15).toFixed(2)],
                            ['Volume', selectedStock.vol],
                            ['Avg Volume', (parseInt(selectedStock.vol.replace(/,/g, '')) * 0.9).toLocaleString('en-IN')]
                        ].map(([label, val]) => (
                            <div key={label} style={{ flex: '1 1 calc(33.333% - 16px)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
                                <div style={{ fontSize: '16px', fontFamily: 'var(--font-mono)' }}>{val}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ flex: '0 0 30%', minWidth: '320px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', position: 'sticky', top: '90px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'var(--bg)', padding: '4px', borderRadius: '8px' }}>
                        <button
                            onClick={() => setAction('BUY')}
                            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', background: action === 'BUY' ? 'var(--green)' : 'transparent', color: action === 'BUY' ? '#fff' : 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer' }}
                        >BUY</button>
                        <button
                            onClick={() => setAction('SELL')}
                            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', background: action === 'SELL' ? 'var(--red)' : 'transparent', color: action === 'SELL' ? '#fff' : 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer' }}
                        >SELL</button>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                        {['MARKET', 'LIMIT'].map(t => (
                            <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                                <input type="radio" checked={orderType === t} onChange={() => setOrderType(t)} style={{ accentColor: 'var(--accent)' }} />
                                {t}
                            </label>
                        ))}
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Quantity</label>
                        <input
                            type="number"
                            value={qty}
                            onChange={e => setQty(Number(e.target.value))}
                            step="0.5" min="0.5"
                            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', padding: '12px', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '16px' }}
                        />
                        {tradeType === 'sell' && (
                            <p style={{ fontFamily: 'DM Sans', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                Available: <span style={{ fontFamily: 'Bricolage Grotesque, monospace', color: availableQty > 0 ? 'var(--green)' : 'var(--red)' }}>
                                    {availableQty} shares
                                </span>
                            </p>
                        )}
                        {sellError && (
                            <p style={{ color: 'var(--red)', fontFamily: 'DM Sans', fontSize: '13px', marginTop: '6px' }}>
                                {sellError}
                            </p>
                        )}
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Price (₹)</label>
                        <input
                            type="number"
                            value={orderType === 'LIMIT' ? customPrice : price}
                            onChange={e => setCustomPrice(Number(e.target.value))}
                            disabled={orderType === 'MARKET'}
                            style={{ width: '100%', background: orderType === 'MARKET' ? 'rgba(0,0,0,0.1)' : 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', padding: '12px', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '16px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingTop: '16px', borderTop: '1px dashed var(--border)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Total Amount</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 700 }}>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                        <div style={{ width: '24px', height: '24px', background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--bg)' }}>✓</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Settlement Wallet</div>
                            <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>0xAM...4f2c</div>
                        </div>
                    </div>

                    <button
                        onClick={handleActionClick}
                        style={{ width: '100%', background: action === 'BUY' ? 'var(--green)' : 'var(--red)', color: '#fff', border: 'none', padding: '16px', borderRadius: '8px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-ui, DM Sans, sans-serif)' }}
                    >
                        <span>{action === 'BUY' ? 'Buy' : 'Sell with UPI'}</span>
                        <span>→</span>
                    </button>

                    {validationError && (
                        <div style={{
                            marginTop: '12px',
                            padding: '12px',
                            background: 'rgba(255,61,90,0.1)',
                            border: '1px solid #ff3d5a',
                            borderRadius: '8px',
                            color: '#ff3d5a',
                            fontSize: '13px',
                            lineHeight: '1.4'
                        }}>
                            ⚠️ {validationError}
                        </div>
                    )}
                </div>
            </div>

            {upiModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
                    zIndex: 1000, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', padding: '20px'
                }}>
                    <div style={{
                        width: '100%', maxWidth: '520px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: '20px', overflow: 'hidden'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>🔒 Secure Payment</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700 }}>{selectedStock.name} • ₹{(total + (action === 'BUY' && upiStep === 4 ? 2.50 : 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            {!isProcessingStep && (
                                <button onClick={() => setUpiModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}>✕</button>
                            )}
                        </div>

                        {action === 'BUY' && upiStep <= 4 && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 40px', background: 'rgba(0,0,0,0.1)' }}>
                                {['Method', 'Identity', 'Auth', 'Confirm'].map((lbl, idx) => {
                                    const stepNum = idx + 1;
                                    const isCompleted = upiStep > stepNum;
                                    const isCurrent = upiStep === stepNum;

                                    return (
                                        <React.Fragment key={lbl}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 1 }}>
                                                {isCompleted ? (
                                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#00e676', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 700, fontSize: 14 }}>✓</div>
                                                ) : isCurrent ? (
                                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>{stepNum}</div>
                                                ) : (
                                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'transparent', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontWeight: 700, fontSize: 14 }}>{stepNum}</div>
                                                )}
                                                <span style={{ fontSize: '11px', color: isCurrent || isCompleted ? 'var(--text)' : 'var(--text-muted)', fontWeight: isCurrent ? 600 : 400 }}>{lbl}</span>
                                            </div>
                                            {idx < 3 && (
                                                <div style={{ flex: 1, height: '2px', background: isCompleted ? '#00e676' : 'var(--border)', margin: '0 -16px 20px', zIndex: 0 }} />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        )}

                        <div style={{ padding: '32px', paddingBottom: '60px', overflowY: 'auto', maxHeight: '80vh' }}>
                            {action === 'BUY' && (
                                <>
                                    {upiStep === 1 && (
                                        <div>
                                            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                                                <div
                                                    onClick={() => setPaymentMethod('UPI')}
                                                    style={{ flex: 1, padding: '20px', border: `2px solid ${paymentMethod === 'UPI' ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '12px', background: paymentMethod === 'UPI' ? 'rgba(12, 232, 130, 0.05)' : 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px' }}
                                                >
                                                    <div style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>📱 UPI</div>
                                                    <div style={{ fontSize: '14px', fontFamily: 'var(--font-mono)' }}>arjunmehta@</div>
                                                    <div style={{ fontSize: '14px', fontFamily: 'var(--font-mono)' }}>okicici</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Instant · Free</div>
                                                </div>
                                                <div
                                                    onClick={() => setPaymentMethod('BANK')}
                                                    style={{ flex: 1, padding: '20px', border: `2px solid ${paymentMethod === 'BANK' ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '12px', background: paymentMethod === 'BANK' ? 'rgba(12, 232, 130, 0.05)' : 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px' }}
                                                >
                                                    <div style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>🏦 Bank Transfer</div>
                                                    <div style={{ fontSize: '14px', fontFamily: 'var(--font-mono)' }}>HDFC Bank</div>
                                                    <div style={{ fontSize: '14px', fontFamily: 'var(--font-mono)' }}>••••4521</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>NEFT/IMPS · Free</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleProceed}
                                                style={{ width: '100%', padding: '16px', background: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}
                                            >
                                                Proceed →
                                            </button>
                                        </div>
                                    )}

                                    {upiStep === 2 && (
                                        <div>
                                            <h3 style={{ marginBottom: '24px', fontSize: '20px' }}>Verify your identity</h3>
                                            <div style={{ marginBottom: '16px' }}>
                                                <input
                                                    type="text"
                                                    value={pan}
                                                    onChange={e => setPan(e.target.value.toUpperCase())}
                                                    style={{ width: '100%', padding: '16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontSize: '18px', letterSpacing: '2px' }}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Your PAN is encrypted and never stored</span>
                                                <span style={{ fontSize: '12px', color: '#00e676', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>✓ Aadhaar Linked</span>
                                            </div>
                                            <button
                                                onClick={handleProceed}
                                                style={{ width: '100%', padding: '16px', background: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}
                                            >
                                                Proceed →
                                            </button>
                                        </div>
                                    )}

                                    {upiStep === 3 && (
                                        <div>
                                            {authSubStep === 1 && (
                                                <div>
                                                    <h3 style={{ marginBottom: '24px', fontSize: '20px' }}>Enter password</h3>
                                                    <div style={{ marginBottom: '32px' }}>
                                                        <input
                                                            type="password"
                                                            value={password}
                                                            onChange={e => setPassword(e.target.value)}
                                                            placeholder="••••••••"
                                                            style={{ width: '100%', padding: '16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '16px' }}
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={handleProceed}
                                                        style={{ width: '100%', padding: '16px', background: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}
                                                    >
                                                        Next →
                                                    </button>
                                                </div>
                                            )}

                                            {authSubStep === 2 && (
                                                <div>
                                                    <h3 style={{ marginBottom: '8px', fontSize: '20px' }}>Enter OTP</h3>
                                                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>OTP sent to +91 98765 43210</p>
                                                    <div style={{ marginBottom: '32px' }}>
                                                        <input
                                                            type="text"
                                                            value={otp}
                                                            onChange={e => setOtp(e.target.value)}
                                                            placeholder="000000"
                                                            maxLength={6}
                                                            style={{ width: '100%', padding: '16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', textAlign: 'center', letterSpacing: '12px', fontSize: '32px', fontFamily: 'var(--font-mono)' }}
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={handleProceed}
                                                        style={{ width: '100%', padding: '16px', background: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}
                                                    >
                                                        Next →
                                                    </button>
                                                </div>
                                            )}

                                            {authSubStep === 3 && (
                                                <div style={{ textAlign: 'center' }}>
                                                    <h3 style={{ marginBottom: '24px', fontSize: '20px' }}>Enter MPIN</h3>
                                                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '32px' }}>
                                                        {Array.from({ length: 6 }).map((_, i) => (
                                                            <div key={i} style={{
                                                                width: '18px', height: '18px', borderRadius: '50%',
                                                                background: i < mpin.length ? 'var(--accent)' : 'transparent',
                                                                border: '2px solid var(--accent)',
                                                                transition: 'background 0.15s'
                                                            }} />
                                                        ))}
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '280px', margin: '0 auto 32px' }}>
                                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                                            <button
                                                                key={n}
                                                                onClick={() => handleMpinDigit(String(n))}
                                                                style={{ width: '64px', height: '64px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '24px', fontWeight: 600, cursor: 'pointer', justifySelf: 'center' }}
                                                            >{n}</button>
                                                        ))}
                                                        <div />
                                                        <button
                                                            onClick={() => handleMpinDigit('0')}
                                                            style={{ width: '64px', height: '64px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '24px', fontWeight: 600, cursor: 'pointer', justifySelf: 'center' }}
                                                        >0</button>
                                                        <button
                                                            onClick={handleMpinBack}
                                                            style={{ width: '64px', height: '64px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '24px', cursor: 'pointer', justifySelf: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        >⌫</button>
                                                    </div>
                                                    <button
                                                        onClick={handleProceed}
                                                        disabled={mpin.length < 6}
                                                        style={{ width: '100%', padding: '16px', background: mpin.length === 6 ? 'var(--accent)' : 'var(--border)', color: mpin.length === 6 ? 'var(--bg)' : 'var(--text-muted)', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '16px', cursor: mpin.length === 6 ? 'pointer' : 'not-allowed' }}
                                                    >
                                                        Proceed →
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {upiStep === 4 && (
                                        <div>
                                            <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                                                <div style={{ marginBottom: '16px' }}>
                                                    <div style={{ fontSize: '14px', color: 'var(--text)' }}>Buying {qty} shares of {selectedStock.sym}</div>
                                                    <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Price per share: ₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                                </div>
                                                <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '16px 0', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                                        <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                                                        <span style={{ fontFamily: 'var(--font-mono)' }}>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                                        <span style={{ color: 'var(--text-muted)' }}>Settlement fee:</span>
                                                        <span style={{ fontFamily: 'var(--font-mono)' }}>₹0.00</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                                        <span style={{ color: 'var(--text-muted)' }}>Blockchain gas:</span>
                                                        <span style={{ fontFamily: 'var(--font-mono)' }}>~₹2.50</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '16px', fontWeight: 700 }}>Total:</span>
                                                    <span style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>₹{(total + 2.50).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
                                                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Paying via: {paymentMethod === 'UPI' ? '📱 arjunmehta@okicici' : '🏦 HDFC Bank ••••4521'}</div>
                                                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Settlement wallet: 0xAM...4f2c</div>
                                            </div>

                                            <button
                                                onClick={handleProceed}
                                                style={{ width: '100%', padding: '16px', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '18px', cursor: 'pointer' }}
                                            >
                                                Pay ₹{(total + 2.50).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </button>
                                        </div>
                                    )}

                                    {upiStep === 5 && (
                                        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                                            <div style={{ margin: '0 auto 32px', width: '64px', height: '64px', border: '4px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                                            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{processingMsg}</h3>
                                        </div>
                                    )}

                                    {upiStep === 6 && (
                                        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                            <div style={{ width: '80px', height: '80px', background: 'var(--green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '40px', color: '#fff', animation: 'scaleIn 0.3s ease-out forwards' }}>✓</div>
                                            <style>{`@keyframes scaleIn { from { transform: scale(0); } to { transform: scale(1); } }`}</style>
                                            <h2 style={{ marginBottom: '16px', fontSize: '24px' }}>Payment Successful</h2>
                                            <p style={{ fontSize: '32px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--green)', marginBottom: '8px' }}>₹{(total + 2.50).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '32px' }}>Ref: {txRef.current}</p>
                                            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Settlement initiating via blockchain...</p>
                                        </div>
                                    )}

                                    {upiStep === 7 && (
                                        <div>
                                            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                                <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>⚡ Atomic Settlement Live</h2>
                                                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Powered by Ethereum Sepolia Testnet</p>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
                                                {['Funds Locked in Smart Contract', 'Counterparty Verified', 'Netting Engine Computed', 'Atomic Swap Executing', 'Settlement Complete'].map((label, idx) => {
                                                    const isActive = swapSteps.length > idx;
                                                    const stepData = swapSteps[idx];
                                                    return (
                                                        <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                                            {isActive ? (
                                                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0, marginTop: '2px' }}>✓</div>
                                                            ) : (
                                                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg)', border: '2px solid var(--border)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0, marginTop: '2px' }}>{idx + 1}</div>
                                                            )}
                                                            <div style={{ flex: 1, opacity: isActive ? 1 : 0.4, transition: 'opacity 0.3s' }}>
                                                                <div style={{ fontSize: '16px', fontWeight: isActive ? 700 : 500, marginBottom: '4px' }}>{label}</div>
                                                                {isActive && (
                                                                    <>
                                                                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{stepData.detail}</div>
                                                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>{stepData.time}</div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {swapComplete && (
                                                <div ref={successCardRef} style={{ background: 'linear-gradient(135deg, rgba(0,200,100,0.1), rgba(0,200,100,0.05))', border: '1px solid rgba(0,200,100,0.4)', borderRadius: '16px', padding: '24px', animation: 'scaleIn 0.3s ease-out forwards', marginTop: '16px', marginBottom: '32px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '16px', fontWeight: 700, color: 'var(--green)' }}>
                                                        <span>✅ Settled in 2.3s</span>
                                                    </div>
                                                    <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', marginBottom: '16px', color: 'var(--text)' }}>
                                                        Transaction: {txRef.current?.slice(0, 8)}... <a href={`https://sepolia.etherscan.io/tx/${txRef.current}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>[View on Etherscan ↗]</a>
                                                    </div>
                                                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                                                        T+0 · Blockchain confirmed · 32 hours saved
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '12px' }}>
                                                        <button
                                                            onClick={() => { setUpiModalOpen(false); navigate('portfolio'); }}
                                                            style={{ flex: 1, padding: '12px', background: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                                                        >View Portfolio</button>
                                                        <button
                                                            onClick={() => { setUpiModalOpen(false); navigate('portfolio'); }}
                                                            style={{ flex: 1, padding: '12px', background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                                                        >View Tradebook</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}

                            {action === 'SELL' && (
                                <>
                                    {upiStep === 1 && (
                                        <div>
                                            <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                                                <div style={{ marginBottom: '16px' }}>
                                                    <div style={{ fontSize: '14px', color: 'var(--text)' }}>Selling {qty} shares of {selectedStock.sym}</div>
                                                    <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Price per share: ₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                                </div>
                                                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '16px', fontWeight: 700 }}>You'll receive:</span>
                                                    <span style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleProceed}
                                                style={{ width: '100%', padding: '16px', background: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}
                                            >
                                                Proceed →
                                            </button>
                                        </div>
                                    )}

                                    {upiStep === 2 && (
                                        <div style={{ textAlign: 'center' }}>
                                            <h3 style={{ marginBottom: '24px', fontSize: '20px' }}>Enter MPIN to confirm</h3>
                                            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '32px' }}>
                                                {Array.from({ length: 6 }).map((_, i) => (
                                                    <div key={i} style={{
                                                        width: '18px', height: '18px', borderRadius: '50%',
                                                        background: i < mpin.length ? 'var(--red)' : 'transparent',
                                                        border: '2px solid var(--red)',
                                                        transition: 'background 0.15s'
                                                    }} />
                                                ))}
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '280px', margin: '0 auto 32px' }}>
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                                    <button
                                                        key={n}
                                                        onClick={() => handleMpinDigit(String(n))}
                                                        style={{ width: '64px', height: '64px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '24px', fontWeight: 600, cursor: 'pointer', justifySelf: 'center' }}
                                                    >{n}</button>
                                                ))}
                                                <div />
                                                <button
                                                    onClick={() => handleMpinDigit('0')}
                                                    style={{ width: '64px', height: '64px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '24px', fontWeight: 600, cursor: 'pointer', justifySelf: 'center' }}
                                                >0</button>
                                                <button
                                                    onClick={handleMpinBack}
                                                    style={{ width: '64px', height: '64px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '24px', cursor: 'pointer', justifySelf: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >⌫</button>
                                            </div>
                                            <button
                                                onClick={handleProceed}
                                                disabled={mpin.length < 6}
                                                style={{ width: '100%', padding: '16px', background: mpin.length === 6 ? 'var(--red)' : 'var(--border)', color: mpin.length === 6 ? '#fff' : 'var(--text-muted)', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '16px', cursor: mpin.length === 6 ? 'pointer' : 'not-allowed' }}
                                            >
                                                Confirm Sale
                                            </button>
                                        </div>
                                    )}

                                    {upiStep === 3 && (
                                        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                                            <div style={{ margin: '0 auto 32px', width: '64px', height: '64px', border: '4px solid var(--border)', borderTopColor: 'var(--red)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                                            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{processingMsg}</h3>
                                        </div>
                                    )}

                                    {upiStep === 4 && (
                                        <div>
                                            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                                <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>⚡ Atomic Settlement Live</h2>
                                                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Powered by Ethereum Sepolia Testnet</p>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
                                                {['Funds Locked in Smart Contract', 'Counterparty Verified', 'Netting Engine Computed', 'Atomic Swap Executing', 'Settlement Complete'].map((label, idx) => {
                                                    const isActive = swapSteps.length > idx;
                                                    const stepData = swapSteps[idx];
                                                    return (
                                                        <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                                            {isActive ? (
                                                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0, marginTop: '2px' }}>✓</div>
                                                            ) : (
                                                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg)', border: '2px solid var(--border)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0, marginTop: '2px' }}>{idx + 1}</div>
                                                            )}
                                                            <div style={{ flex: 1, opacity: isActive ? 1 : 0.4, transition: 'opacity 0.3s' }}>
                                                                <div style={{ fontSize: '16px', fontWeight: isActive ? 700 : 500, marginBottom: '4px' }}>{label}</div>
                                                                {isActive && (
                                                                    <>
                                                                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{stepData.detail}</div>
                                                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>{stepData.time}</div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {swapComplete && (
                                                <div ref={successCardRef} style={{ background: 'linear-gradient(135deg, rgba(0,200,100,0.1), rgba(0,200,100,0.05))', border: '1px solid rgba(0,200,100,0.4)', borderRadius: '16px', padding: '24px', animation: 'scaleIn 0.3s ease-out forwards', marginTop: '16px', marginBottom: '32px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '16px', fontWeight: 700, color: 'var(--green)' }}>
                                                        <span>✅ Settled in 2.3s</span>
                                                    </div>
                                                    <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', marginBottom: '16px', color: 'var(--text)' }}>
                                                        Transaction: {txRef.current?.slice(0, 8)}... <a href={`https://sepolia.etherscan.io/tx/${txRef.current}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>[View on Etherscan ↗]</a>
                                                    </div>
                                                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                                                        T+0 · Blockchain confirmed · 32 hours saved
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '12px' }}>
                                                        <button
                                                            onClick={() => { setUpiModalOpen(false); navigate('portfolio'); }}
                                                            style={{ flex: 1, padding: '12px', background: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                                                        >View Portfolio</button>
                                                        <button
                                                            onClick={() => { setUpiModalOpen(false); navigate('portfolio'); }}
                                                            style={{ flex: 1, padding: '12px', background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                                                        >View Tradebook</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
