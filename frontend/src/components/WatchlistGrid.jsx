import React, { useMemo } from 'react';
import { STOCKS, WATCHLIST } from '../data/mockData';
import useLivePrices from '../hooks/useLivePrices';
import { useApp } from '../context/AppContext';

function generateSparkline(up) {
    const pts = [];
    let y = 16 + (Math.random() * 8 - 4);
    for (let x = 0; x <= 80; x += 8) {
        y += (Math.random() - (up ? 0.42 : 0.58)) * 6;
        y = Math.max(4, Math.min(28, y));
        pts.push(`${x},${y}`);
    }
    return pts.join(' ');
}

function fmtPrice(p) {
    return '₹' + p.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function WatchlistGrid({ liveStocks }) {
    const { navigate, setSelectedStock } = useApp();

    const watchStocks = (liveStocks || STOCKS).filter(s => WATCHLIST.includes(s.sym));

    // Generate sparkline points once on mount — never regenerated
    const sparklines = useMemo(() => {
        return watchStocks.map(s => generateSparkline(s.chg >= 0));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="watchlist-section fade-up delay-4">
            <div className="section-header">
                <div className="section-title">Watchlist</div>
                <div className="section-sub font-mono" style={{ fontSize: '11px' }}>NSE &amp; BSE · Live prices</div>
            </div>
            <div className="watchlist-grid" id="watchlistGrid">
                {watchStocks.map((s, idx) => {
                    const up = s.chg >= 0;
                    return (
                        <div
                            className="watch-card"
                            key={s.sym}
                            style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            onClick={() => {
                                setSelectedStock({
                                    sym: s.sym,
                                    name: s.name || s.sym,
                                    price: s.price,
                                    chg: s.chg,
                                    exch: s.exch || 'NSE',
                                    cap: s.cap || '₹20L Cr',
                                    vol: s.vol || '12,45,678'
                                });
                                navigate('stockdetail');
                            }}
                        >
                            <div className="watch-exch">{s.exch}</div>
                            <div className="watch-name">{s.sym}</div>
                            <svg className="sparkline" viewBox="0 0 80 32" preserveAspectRatio="none">
                                <polyline
                                    fill="none"
                                    stroke={up ? 'var(--green)' : 'var(--red)'}
                                    strokeWidth="1.5"
                                    points={sparklines[idx] || ''}
                                />
                            </svg>
                            <div className="watch-price">{fmtPrice(s.price)}</div>
                            <div className={`watch-change ${up ? 'up' : 'down'}`}>{up ? '+' : ''}{s.chg}%</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
