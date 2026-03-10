import React, { useState } from 'react';
import { HOLDINGS, BANKS, DIVIDENDS } from '../data/mockData';
import { useApp } from '../context/AppContext';

export default function PortfolioPage() {
    const { user, openTradeModal, tradeHistory, navigate, setSelectedStock } = useApp();
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('holdings');

    function handleCopy() {
        navigator.clipboard.writeText('arjunmehta@tradomic').catch(() => { });
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    const currentPrices = {
        'RELIANCE': 2991,
        'INFY': 1514,
        'MAZDA': 500,
        'TCS': 2988,
        'HDFCBANK': 1623,
        'WIPRO': 500,
        'ICICIBANK': 1247,
        'ADANIENT': 2890,
        'BAJFINANCE': 7101,
        'TATAMOTORS': 1000,
    };

    const holdingsList = Object.entries(user.holdings || {}).map(([sym, data]) => {
        const current = currentPrices[sym] || data.avgPrice;
        const pnl = (current - data.avgPrice) * data.qty;
        const pnlPercent = ((current - data.avgPrice) / data.avgPrice) * 100;
        return { sym, ...data, current, pnl, pnlPercent };
    });

    const totalHoldingsValue = holdingsList.reduce((acc, h) => acc + (h.current * h.qty), 0);
    const totalInvested = holdingsList.reduce((acc, h) => acc + (h.avgPrice * h.qty), 0);
    const totalPnl = totalHoldingsValue - totalInvested;
    const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="portfolio-page">
            <div className="section-header" style={{ marginBottom: '24px' }}>
                <div>
                    <div className="section-title" style={{ fontSize: '22px', fontFamily: 'var(--font-display)', fontWeight: 800 }}>My Portfolio</div>
                    <div className="section-sub">{user.name} · Tradomic Account</div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="portfolio-summary-grid">
                <div className="summary-card">
                    <div className="summary-card-label">Total Value</div>
                    <div className="summary-card-val">₹2.34Cr</div>
                    <div className="summary-card-sub up">+₹1,23,450 today</div>
                </div>
                <div className="summary-card">
                    <div className="summary-card-label">Invested</div>
                    <div className="summary-card-val">₹1.98Cr</div>
                    <div className="summary-card-sub">Across 14 stocks</div>
                </div>
                <div className="summary-card">
                    <div className="summary-card-label">Total P&amp;L</div>
                    <div className="summary-card-val text-green">+₹36.4L</div>
                    <div className="summary-card-sub up">+18.4% overall</div>
                </div>
                <div className="summary-card">
                    <div className="summary-card-label">Today's P&amp;L</div>
                    <div className="summary-card-val text-green">+₹1.23L</div>
                    <div className="summary-card-sub up">+0.53%</div>
                </div>
            </div>

            <div className="portfolio-grid">
                {/* Tabs & Content */}
                <div className="holdings-table-card">
                    <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
                        <button
                            onClick={() => setActiveTab('holdings')}
                            style={{ background: 'none', border: 'none', padding: '0 0 12px 0', borderBottom: activeTab === 'holdings' ? '2px solid var(--accent)' : '2px solid transparent', color: activeTab === 'holdings' ? 'var(--text)' : 'var(--text-muted)', fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}
                        >Holdings</button>
                        <button
                            onClick={() => setActiveTab('tradebook')}
                            style={{ background: 'none', border: 'none', padding: '0 0 12px 0', borderBottom: activeTab === 'tradebook' ? '2px solid var(--accent)' : '2px solid transparent', color: activeTab === 'tradebook' ? 'var(--text)' : 'var(--text-muted)', fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}
                        >Tradebook</button>
                    </div>

                    {activeTab === 'holdings' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <div>
                                    <p style={{ fontFamily: 'Unbounded, sans-serif', fontSize: '11px', letterSpacing: '4px', color: 'var(--accent)', textTransform: 'uppercase' }}>MY HOLDINGS</p>
                                    <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>Owned Stocks</h2>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontFamily: 'Bricolage Grotesque, monospace', fontSize: '32px', fontWeight: 800 }}>
                                        {formatCurrency(totalHoldingsValue)}
                                    </div>
                                    <div style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)' }}>Total holdings value</div>
                                </div>
                            </div>

                            {holdingsList.length > 0 && (
                                <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <div>
                                        <div style={{ fontFamily: 'DM Sans', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Invested</div>
                                        <div style={{ fontFamily: 'Bricolage Grotesque, monospace', fontSize: '16px', fontWeight: 600 }}>{formatCurrency(totalInvested)}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontFamily: 'DM Sans', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Current Value</div>
                                        <div style={{ fontFamily: 'Bricolage Grotesque, monospace', fontSize: '16px', fontWeight: 600 }}>{formatCurrency(totalHoldingsValue)}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontFamily: 'DM Sans', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total P&L</div>
                                        <div style={{ fontFamily: 'Bricolage Grotesque, monospace', fontSize: '16px', fontWeight: 600, color: totalPnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
                                            {totalPnl >= 0 ? '+' : ''}{formatCurrency(totalPnl)} ({totalPnl >= 0 ? '+' : ''}{totalPnlPercent.toFixed(2)}%)
                                        </div>
                                    </div>
                                </div>
                            )}

                            {holdingsList.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                                    <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 600 }}>No holdings yet</p>
                                    <p style={{ fontFamily: 'DM Sans', fontSize: '14px', marginTop: '8px' }}>Buy your first stock to see it here</p>
                                    <button onClick={() => navigate('stocks')} style={{ marginTop: '24px', padding: '12px 32px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', fontFamily: 'DM Sans', fontWeight: 700, cursor: 'pointer' }}>
                                        Browse Stocks →
                                    </button>
                                </div>
                            ) : (
                                <table className="stocks-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ textAlign: 'left', paddingBottom: '12px', color: 'var(--text-muted)', fontFamily: 'DM Sans', fontSize: '12px', fontWeight: 500 }}>STOCK</th>
                                            <th style={{ textAlign: 'right', paddingBottom: '12px', color: 'var(--text-muted)', fontFamily: 'DM Sans', fontSize: '12px', fontWeight: 500 }}>QTY</th>
                                            <th style={{ textAlign: 'right', paddingBottom: '12px', color: 'var(--text-muted)', fontFamily: 'DM Sans', fontSize: '12px', fontWeight: 500 }}>AVG PRICE</th>
                                            <th style={{ textAlign: 'right', paddingBottom: '12px', color: 'var(--text-muted)', fontFamily: 'DM Sans', fontSize: '12px', fontWeight: 500 }}>CURRENT</th>
                                            <th style={{ textAlign: 'right', paddingBottom: '12px', color: 'var(--text-muted)', fontFamily: 'DM Sans', fontSize: '12px', fontWeight: 500 }}>P&L</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {holdingsList.map((h) => (
                                            <tr
                                                key={h.sym}
                                                onClick={() => {
                                                    setSelectedStock({ sym: h.sym, name: h.sym, exch: 'NSE', price: h.current, chg: 0, cap: '-', vol: '-' });
                                                    navigate('stockdetail');
                                                }}
                                                style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <td style={{ padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div className="stock-icon-sm">
                                                            {h.sym.substring(0, 3)}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '16px' }}>{h.sym}</div>
                                                            <div style={{ fontSize: '10px', background: 'var(--bg)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px', border: '1px solid var(--border)' }}>NSE</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'right', padding: '16px 0', borderBottom: '1px solid var(--border)', fontFamily: 'Bricolage Grotesque, monospace' }}>
                                                    {h.qty} shares
                                                </td>
                                                <td style={{ textAlign: 'right', padding: '16px 0', borderBottom: '1px solid var(--border)', fontFamily: 'Bricolage Grotesque, monospace', color: 'var(--text-muted)' }}>
                                                    {formatCurrency(h.avgPrice)}
                                                </td>
                                                <td style={{ textAlign: 'right', padding: '16px 0', borderBottom: '1px solid var(--border)', fontFamily: 'Bricolage Grotesque, monospace' }}>
                                                    {formatCurrency(h.current)}
                                                </td>
                                                <td style={{ textAlign: 'right', padding: '16px 0', borderBottom: '1px solid var(--border)', fontFamily: 'Bricolage Grotesque, monospace', color: h.pnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
                                                    {h.pnl >= 0 ? '+' : ''}{formatCurrency(h.pnl)} ({h.pnl >= 0 ? '+' : ''}{h.pnlPercent.toFixed(2)}%)
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {activeTab === 'tradebook' && (
                        <div>
                            <div className="section-header" style={{ marginBottom: '16px' }}>
                                <div className="section-title" style={{ fontSize: '15px' }}>Tradebook</div>
                                <div className="section-sub font-mono" style={{ fontSize: '10px' }}>{tradeHistory.length} orders executed</div>
                            </div>
                            {tradeHistory.length === 0 ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No trades yet — make your first trade
                                </div>
                            ) : (
                                <table className="stocks-table">
                                    <thead>
                                        <tr>
                                            <th>TIME</th>
                                            <th>STOCK</th>
                                            <th>TYPE</th>
                                            <th>QTY</th>
                                            <th>PRICE</th>
                                            <th>TOTAL</th>
                                            <th>SETTLEMENT</th>
                                            <th>TX HASH</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tradeHistory.map((t, i) => {
                                            const timeStr = new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                                            return (
                                                <tr key={t.txId || i}>
                                                    <td className="font-mono text-muted">{timeStr}</td>
                                                    <td>
                                                        <div className="stock-name-cell">
                                                            <div className="stock-icon-sm">{t.symbol.substring(0, 3)}</div>
                                                            <div>
                                                                <div className="stock-sym">{t.symbol}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td><span className={`chg-badge ${t.type.toLowerCase() === 'buy' ? 'up' : 'down'}`}>{t.type.toUpperCase()}</span></td>
                                                    <td className="font-mono">{t.qty}</td>
                                                    <td className="font-mono">₹{t.price.toLocaleString()}</td>
                                                    <td className="font-mono">₹{t.total.toLocaleString()}</td>
                                                    <td className="font-mono text-green">{t.settlementTime || '2.31s'}</td>
                                                    <td className="font-mono">
                                                        {t.txHash ?
                                                            <a href={`https://sepolia.etherscan.io/tx/${t.txHash}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                                                                {t.txHash.substring(0, 8)}...
                                                            </a>
                                                            : '-'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>

                {/* Accounts Column */}
                <div className="accounts-card">
                    {/* My Accounts */}
                    <div className="acc-sub-card">
                        <div className="acc-sub-title">My Accounts</div>
                        {BANKS.map((b, i) => (
                            <div className="bank-row" key={b.logo}>
                                <div className="bank-left">
                                    <div className="bank-logo">{b.logo}</div>
                                    <div>
                                        <div className="bank-name">{b.name}</div>
                                        <div className="bank-acc">{b.acc}</div>
                                    </div>
                                </div>
                                <div className="bank-bal">{b.bal}</div>
                            </div>
                        ))}
                        <div className="upi-id-display">
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>UPI</span>
                            <span className="upi-handle">arjunmehta@tradomic</span>
                            <button className="upi-copy-btn" onClick={handleCopy}>
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>

                    {/* Blockchain Dividends */}
                    <div className="acc-sub-card">
                        <div className="acc-sub-title">Blockchain Dividends</div>
                        {DIVIDENDS.map((d, i) => (
                            <div className="bank-row" key={d.logo + i}>
                                <div className="bank-left">
                                    <div className="bank-logo" style={{ fontSize: '7px' }}>{d.logo}</div>
                                    <div>
                                        <div className="bank-name">{d.name}</div>
                                        <div className="bank-acc">{d.detail}</div>
                                    </div>
                                </div>
                                <div className={`bank-bal ${d.amtClass}`}>{d.amount}</div>
                            </div>
                        ))}
                    </div>

                    {/* Smart Netting Engine */}
                    <div className="acc-sub-card">
                        <div className="acc-sub-title">Smart Netting Engine</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>
                            Today: <span className="font-mono text-accent">1,248 buy</span> + <span className="font-mono text-red">980 sell</span> orders processed.<br />
                            Net delta settled: <span className="font-mono text-green">268 shares</span> instead of 2,228.
                        </div>
                        <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '10px 14px', border: '1px solid var(--border)' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px' }}>COST SAVED TODAY</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 700, color: 'var(--green)' }}>₹4,82,300</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
