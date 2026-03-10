import React from 'react';
import useHeroCounter from '../hooks/useHeroCounter';
import { useApp } from '../context/AppContext';
import { HERO_HOLDINGS } from '../data/mockData';
import WatchlistGrid from './WatchlistGrid';
import useLivePrices from '../hooks/useLivePrices';
import { STOCKS } from '../data/mockData';

export default function HeroSection() {
    const { user, navigate, openTradeModal, setSelectedStock } = useApp();
    const liveStocks = useLivePrices(STOCKS);

    function formatBalance(n) {
        return '₹' + n.toLocaleString('en-IN');
    }

    return (
        <>
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
                            Every trade you make settles in 2.31 seconds.<br />
                            Not 32 hours. Not tomorrow. <strong style={{ color: 'var(--text)' }}>Right now.</strong>
                        </p>

                        <div style={{ display: 'flex', gap: '32px', marginBottom: '32px' }}>
                            <div>
                                <div style={{ fontFamily: "'Bricolage Grotesque', monospace", fontSize: '32px', fontWeight: 800, color: 'var(--green)' }}>2.31s</div>
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

                        <button
                            onClick={() => navigate('stocks')}
                            style={{ padding: '14px 32px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}
                        >
                            Browse Stocks →
                        </button>
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
                                        // Assume STOCKS array has the data, fallback to basic names if not matched exactly
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
