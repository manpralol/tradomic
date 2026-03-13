import React, { useState, useEffect } from 'react';
import useHeroCounter from '../hooks/useHeroCounter';
import { useApp } from '../context/AppContext';
import { HERO_HOLDINGS } from '../data/mockData';
import WatchlistGrid from './WatchlistGrid';
import useLivePrices from '../hooks/useLivePrices';
import { STOCKS } from '../data/mockData';

const CONTRACT = '0xED01edaBe040016C268701De53d70cb5301faAD3';

const REAL_TXS = [
    { hash: '0xa7a50b3c3b...', stock: 'TCS', type: 'BUY', time: '14 hrs ago', block: 10433562 },
    { hash: '0x5697c08984...', stock: 'INFY', type: 'SELL', time: '14 hrs ago', block: 10433547 },
    { hash: '0x856a515193...', stock: 'RELI', type: 'BUY', time: '2 days ago', block: 10424758 },
    { hash: '0xd8a0d599c1...', stock: 'HDFC', type: 'BUY', time: '2 days ago', block: 10424553 },
    { hash: '0x62fbd258d3...', stock: 'WIPRO', type: 'SELL', time: '2 days ago', block: 10424543 },
];

export default function HeroSection() {
    const { user, navigate, openTradeModal, setSelectedStock } = useApp();
    const liveStocks = useLivePrices(STOCKS);
    const [tickerIdx, setTickerIdx] = useState(0);
    const [txCount, setTxCount] = useState(18);

    useEffect(() => {
        const interval = setInterval(() => {
            setTickerIdx(i => (i + 1) % REAL_TXS.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    // Slowly increment tx count to show live activity
    useEffect(() => {
        const t = setTimeout(() => setTxCount(c => c + 1), 45000);
        return () => clearTimeout(t);
    }, [txCount]);

    function formatBalance(n) {
        return '₹' + n.toLocaleString('en-IN');
    }

    const tx = REAL_TXS[tickerIdx];

    return (
        <>
            {/* Blockchain Live Banner */}
            <div style={{
                background: 'rgba(29,158,117,0.06)',
                borderBottom: '1px solid rgba(29,158,117,0.2)',
                padding: '8px 24px',
                display: 'flex', alignItems: 'center', gap: '16px',
                fontSize: '12px', flexWrap: 'wrap'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                        width: 7, height: 7, borderRadius: '50%', background: '#1D9E75',
                        display: 'inline-block',
                        animation: 'livepulse 1.5s infinite'
                    }} />
                    <span style={{ color: '#1D9E75', fontWeight: 700, fontFamily: 'monospace' }}>BLOCKCHAIN LIVE</span>
                </div>
                <span style={{ color: 'var(--text-muted)' }}>Sepolia Testnet ·</span>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    Contract:&nbsp;
                    <a
                        href={`https://sepolia.etherscan.io/address/${CONTRACT}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ color: '#1D9E75', textDecoration: 'none' }}
                    >
                        {CONTRACT.substring(0, 10)}...{CONTRACT.slice(-6)} ↗
                    </a>
                </span>
                <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    Latest:&nbsp;
                    <span style={{
                        color: tx.type === 'BUY' ? '#1D9E75' : '#E24B4A',
                        fontWeight: 600
                    }}>{tx.type} {tx.stock}</span>
                    &nbsp;·&nbsp;
                    <a
                        href={`https://sepolia.etherscan.io/address/${CONTRACT}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ color: '#1D9E75', textDecoration: 'none', fontFamily: 'monospace' }}
                    >
                        {tx.hash} ↗
                    </a>
                    &nbsp;· Block {tx.block}
                    &nbsp;· {txCount} total txns
                </span>
            </div>

            <style>{`
                @keyframes livepulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
            `}</style>

            <div className="hero">
                <div className="hero-left fade-up">
                    <div>
                        <p style={{ fontFamily: "'Unbounded', sans-serif", fontSize: '11px', letterSpacing: '4px', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '16px' }}>
                            Good morning, {user.name.split(' ')[0]}
                        </p>
                        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '48px', fontWeight: 700, lineHeight: 1.2, marginBottom: '16px' }}>
                            Markets are open.<br />
                            <span style={{ color: 'var(--accent)' }}>What's your move?</span>
                        </h1>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '16px', color: 'var(--text-muted)', marginBottom: '32px', lineHeight: 1.6 }}>
                            Every trade you make settles near-instantly.<br />
                            Not 32 hours. Not tomorrow. <strong style={{ color: 'var(--text)' }}>Right now.</strong>
                        </p>

                        <div style={{ display: 'flex', gap: '32px', marginBottom: '24px' }}>
                            <div>
                                <div style={{ fontFamily: "'Bricolage Grotesque', monospace", fontSize: '32px', fontWeight: 800, color: 'var(--green)' }}>instant</div>
                                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--text-muted)' }}>Avg settlement</div>
                            </div>
                            <div>
                                <div style={{ fontFamily: "'Bricolage Grotesque', monospace", fontSize: '32px', fontWeight: 800 }}>0.01%</div>
                                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--text-muted)' }}>Transaction fee</div>
                            </div>
                            <div>
                                <div style={{ fontFamily: "'Bricolage Grotesque', monospace", fontSize: '32px', fontWeight: 800, color: 'var(--accent)' }}>T+0</div>
                                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--text-muted)' }}>Settlement grade</div>
                            </div>
                        </div>

                        {/* Verified contract badge */}
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.25)',
                            borderRadius: 8, padding: '8px 14px', marginBottom: 24, fontSize: 12
                        }}>
                            <span style={{ color: '#1D9E75' }}>✓</span>
                            <span style={{ color: 'var(--text-muted)' }}>Smart contract verified on</span>
                            <a
                                href={`https://sepolia.etherscan.io/address/${CONTRACT}`}
                                target="_blank" rel="noopener noreferrer"
                                style={{ color: '#1D9E75', fontWeight: 600, textDecoration: 'none' }}
                            >
                                Etherscan ↗
                            </a>
                            <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: 11 }}>
                                {txCount} transactions
                            </span>
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                onClick={() => navigate('stocks')}
                                style={{ padding: '14px 32px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}
                            >
                                Browse Stocks →
                            </button>
                            <a
                                href={`https://sepolia.etherscan.io/address/${CONTRACT}`}
                                target="_blank" rel="noopener noreferrer"
                                style={{
                                    padding: '14px 24px', border: '1px solid rgba(29,158,117,0.4)',
                                    color: '#1D9E75', borderRadius: 8, fontSize: 14, fontWeight: 600,
                                    textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6
                                }}
                            >
                                View on Etherscan ↗
                            </a>
                        </div>
                    </div>
                </div>

                <div className="hero-right fade-up delay-2">
                    {/* Portfolio Snapshot */}
                    <div className="portfolio-card">
                        <div className="portfolio-card-header">
                            <span className="portfolio-card-title">My Portfolio</span>
                            <div className="portfolio-live-badge">
                                <div className="live-dot" />
                                LIVE
                            </div>
                        </div>
                        <div className="portfolio-total">{formatBalance(user.balance)}</div>
                        <div className="portfolio-pnl">
                            <div className="pnl-badge">+₹1,23,450 today</div>
                            <div className="pnl-label">+0.53% · NSE+BSE</div>
                        </div>
                        <div className="holdings-list">
                            {HERO_HOLDINGS.map((h, i) => (
                                <div
                                    className="holding-row"
                                    key={i}
                                    style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    onClick={() => {
                                        const stockData = STOCKS.find(s => s.sym === h.name.split(' ')[0]) || {
                                            sym: h.name.split(' ')[0] || 'STK',
                                            name: h.name,
                                            price: h.val ? parseFloat(h.val.replace(/[₹,]/g, '')) : 100,
                                            chg: h.chg,
                                            exch: 'NSE',
                                            cap: '₹20L Cr',
                                            vol: '12,45,678'
                                        };
                                        setSelectedStock({
                                            sym: stockData.sym,
                                            name: stockData.name,
                                            price: stockData.price,
                                            chg: stockData.chg,
                                            exch: stockData.exch || 'NSE',
                                            cap: stockData.cap || '₹20L Cr',
                                            vol: stockData.vol || '12,45,678'
                                        });
                                        navigate('stockdetail');
                                    }}
                                >
                                    <div className="holding-left">
                                        <div className="holding-icon">{h.icon}</div>
                                        <div>
                                            <div className="holding-name">{h.name}</div>
                                            <div className="holding-qty">{h.qty}</div>
                                        </div>
                                    </div>
                                    <div className="holding-right">
                                        <div className="holding-val">{h.val}</div>
                                        <div className={`holding-chg ${h.chgClass}`}>{h.chg}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Trade */}
                    <div className="quick-trade-card fade-up delay-3">
                        <div className="quick-trade-header">Quick Trade</div>
                        <div className="quick-trade-row">
                            <input className="qt-input" placeholder="Stock symbol (e.g. TCS)" style={{ maxWidth: '140px' }} />
                            <input className="qt-input" placeholder="Qty" style={{ maxWidth: '80px', textAlign: 'center' }} />
                            <button className="btn-buy" onClick={() => openTradeModal('BUY')}>BUY</button>
                            <button className="btn-sell" onClick={() => openTradeModal('SELL')}>SELL</button>
                        </div>
                    </div>
                </div>
            </div>

            <WatchlistGrid liveStocks={liveStocks} />
        </>
    );
}
