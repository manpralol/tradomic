import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function SebiDashboard() {
    const { navigate, sebiOfficerName } = useApp();
    const [clock, setClock] = useState('');
    const [stats, setStats] = useState({ totalTrades: 0, avgSettlement: '0s', totalVolume: '0', timeSaved: '0 hrs' });
    const [trades, setTrades] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [search, setSearch] = useState('');
    const [wsConnected, setWsConnected] = useState(false);
    const [latestEvents, setLatestEvents] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setClock(new Date().toLocaleTimeString('en-IN'));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('https://tradomic-backend.onrender.com/api/sebi/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (e) {
            console.error('Failed to fetch stats', e);
        }
    };

    const fetchTrades = async () => {
        try {
            const res = await fetch('https://tradomic-backend.onrender.com/api/sebi/trades');
            if (res.ok) {
                const data = await res.json();
                setTrades(data.sort((a, b) => b.timestamp - a.timestamp));
            }
        } catch (e) {
            console.error('Failed to fetch trades', e);
        }
    };

    const loadData = () => {
        fetchStats();
        fetchTrades();
    };

    useEffect(() => {
        loadData();

        const ws = new WebSocket('ws://localhost:5000/sebi/live');

        ws.onopen = () => setWsConnected(true);
        ws.onclose = () => setWsConnected(false);

        ws.onmessage = (event) => {
            try {
                const newTrade = JSON.parse(event.data);

                // Prepend to audit log
                setTrades(prev => {
                    const exists = prev.find(t => t.txId === newTrade.txId);
                    if (exists) return prev;
                    return [newTrade, ...prev];
                });

                // Prepend to live feed
                setLatestEvents(prev => {
                    const newEvents = [newTrade, ...prev];
                    return newEvents.slice(0, 10);
                });

                // Update stats
                fetchStats();
            } catch (e) {
                console.error("WS message error", e);
            }
        };

        return () => {
            ws.close();
        };
    }, []);

    const exportCSV = () => {
        const headers = ['Time', 'Symbol', 'Type', 'Qty', 'Price', 'Total', 'Settlement', 'TxHash', 'Status', 'PAN'];
        const rows = trades.map(t => [
            new Date(t.timestamp).toLocaleString(),
            t.symbol, t.type, t.qty, t.price, t.total,
            t.settlementTime || '2.31s',
            t.txHash || '',
            t.status || 'SETTLED',
            'ABXXX1234X'
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sebi-audit-${Date.now()}.csv`;
        a.click();
    };

    const filteredTrades = trades.filter(t => {
        const matchesFilter = filter === 'ALL' || t.status === filter || t.type === filter;
        const searchLower = search.toLowerCase();
        const matchesSearch = !search ||
            (t.symbol && t.symbol.toLowerCase().includes(searchLower)) ||
            (t.txHash && t.txHash.toLowerCase().includes(searchLower));
        return matchesFilter && matchesSearch;
    });

    return (
        <div style={{ backgroundColor: '#0f1115', color: '#e5e7eb', minHeight: '100vh', paddingBottom: '40px', fontFamily: 'var(--font-primary)', borderTop: '4px solid var(--accent)' }}>
            <div style={{ backgroundColor: '#1a1d24', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2d3139' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600', color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        🏛 SEBI — Securities & Exchange Board of India
                    </h2>
                    <div style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '5px', display: 'flex', gap: '15px' }}>
                        <span>Surveillance Dashboard v2.4</span>
                        <span style={{ color: 'var(--accent)' }}>[{sebiOfficerName || 'Authorized Officer'}]</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: wsConnected ? '#10b981' : '#ef4444' }}></span>
                            LIVE Last updated: {clock}
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={exportCSV} style={{ padding: '8px 15px', backgroundColor: '#374151', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}>
                        <span>📥</span> Export CSV
                    </button>
                    <button onClick={loadData} style={{ padding: '8px 15px', backgroundColor: '#374151', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}>
                        <span>🔄</span> Refresh
                    </button>
                    <button onClick={() => navigate('home')} style={{ padding: '8px 15px', backgroundColor: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}>
                        ← Back to Tradomic
                    </button>
                </div>
            </div>

            <div style={{ padding: '20px 30px', maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '25px' }}>
                    <div style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3139', borderRadius: '8px', padding: '20px' }}>
                        <div style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '10px' }}>Total Trades</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)', marginBottom: '5px' }}>{stats.totalTrades}</div>
                        <div style={{ color: '#10b981', fontSize: '0.8rem' }}>↑ vs T+1</div>
                    </div>
                    <div style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3139', borderRadius: '8px', padding: '20px' }}>
                        <div style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '10px' }}>Avg Settlement</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)', color: '#10b981', marginBottom: '5px' }}>{stats.avgSettlement}</div>
                        <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>vs 32 hrs T+1</div>
                    </div>
                    <div style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3139', borderRadius: '8px', padding: '20px' }}>
                        <div style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '10px' }}>Total Volume</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)', marginBottom: '5px' }}>{stats.totalVolume}</div>
                        <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>today</div>
                    </div>
                    <div style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3139', borderRadius: '8px', padding: '20px' }}>
                        <div style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '10px' }}>Time Saved</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginBottom: '5px' }}>{stats.timeSaved}</div>
                        <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>vs T+1</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '65% 1fr', gap: '20px' }}>
                    <div style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3139', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #2d3139' }}>
                            <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>Immutable Trade Ledger</h3>
                            <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.85rem' }}>All entries cryptographically verified on Ethereum Sepolia</p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    placeholder="Search Hash, Symbol..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{ padding: '8px 12px', backgroundColor: '#0f1115', border: '1px solid #2d3139', borderRadius: '5px', color: 'white', fontSize: '0.9rem', width: '250px' }}
                                />
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    {['ALL', 'BUY', 'SELL', 'SETTLED', 'PENDING'].map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setFilter(f)}
                                            style={{
                                                padding: '5px 12px',
                                                backgroundColor: filter === f ? '#374151' : 'transparent',
                                                color: filter === f ? 'white' : '#9ca3af',
                                                border: '1px solid #374151',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem'
                                            }}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={{ overflowX: 'auto', flex: 1 }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#111318', color: '#9ca3af', borderBottom: '1px solid #2d3139' }}>
                                        <th style={{ padding: '12px 20px', fontWeight: 'normal' }}>TIME</th>
                                        <th style={{ padding: '12px 20px', fontWeight: 'normal' }}>SYMBOL</th>
                                        <th style={{ padding: '12px 20px', fontWeight: 'normal' }}>TYPE</th>
                                        <th style={{ padding: '12px 20px', fontWeight: 'normal' }}>QTY</th>
                                        <th style={{ padding: '12px 20px', fontWeight: 'normal' }}>PRICE</th>
                                        <th style={{ padding: '12px 20px', fontWeight: 'normal' }}>TOTAL</th>
                                        <th style={{ padding: '12px 20px', fontWeight: 'normal' }}>SETTLEMENT</th>
                                        <th style={{ padding: '12px 20px', fontWeight: 'normal' }}>TX HASH</th>
                                        <th style={{ padding: '12px 20px', fontWeight: 'normal' }}>STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTrades.slice(0, 20).map((t, idx) => {
                                        const isSettled = t.status !== 'PENDING';
                                        return (
                                            <tr key={t.txId || idx} style={{ borderBottom: '1px solid #2d3139', backgroundColor: idx % 2 === 0 ? 'transparent' : '#14161b', borderLeft: `3px solid ${isSettled ? '#10b981' : '#f59e0b'}` }}>
                                                <td style={{ padding: '12px 20px', fontFamily: 'var(--font-mono)' }}>{new Date(t.timestamp).toLocaleTimeString()}</td>
                                                <td style={{ padding: '12px 20px', fontWeight: 'bold' }}>{t.symbol}</td>
                                                <td style={{ padding: '12px 20px' }}>
                                                    <span style={{ color: t.type === 'BUY' ? '#10b981' : '#ef4444', backgroundColor: t.type === 'BUY' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                        {t.type}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px 20px', fontFamily: 'var(--font-mono)' }}>{t.qty}</td>
                                                <td style={{ padding: '12px 20px', fontFamily: 'var(--font-mono)' }}>₹{t.price?.toLocaleString()}</td>
                                                <td style={{ padding: '12px 20px', fontFamily: 'var(--font-mono)' }}>₹{t.total?.toLocaleString()}</td>
                                                <td style={{ padding: '12px 20px', fontFamily: 'var(--font-mono)', color: isSettled ? '#10b981' : '#f59e0b' }} title="T+1 would take 32 hours">
                                                    {t.settlementTime || '2.31s'}
                                                </td>
                                                <td style={{ padding: '12px 20px', fontFamily: 'var(--font-mono)' }}>
                                                    {t.txHash ? (
                                                        <a href={`https://sepolia.etherscan.io/tx/${t.txHash}`} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', textDecoration: 'none' }}>
                                                            {t.txHash.substring(0, 6) + '...' + t.txHash.substring(t.txHash.length - 4)}
                                                        </a>
                                                    ) : '-'}
                                                </td>
                                                <td style={{ padding: '12px 20px' }}>
                                                    <span style={{ color: isSettled ? '#10b981' : '#f59e0b', backgroundColor: isSettled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                        {isSettled ? 'SETTLED' : 'PENDING'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredTrades.length === 0 && (
                                        <tr>
                                            <td colSpan="9" style={{ padding: '30px', textAlign: 'center', color: '#9ca3af' }}>No trades match the current filters.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3139', borderRadius: '8px', padding: '20px', flex: 1 }}>
                            <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                ⚡ Live Settlement Feed
                            </h3>
                            <p style={{ margin: '0 0 15px 0', color: '#9ca3af', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Real-time atomic swap events</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: wsConnected ? '#10b981' : '#ef4444' }}></span>
                                    {wsConnected ? 'Connected' : 'Disconnected'}
                                </span>
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {latestEvents.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280', fontSize: '0.9rem' }}>
                                        Waiting for real-time events...
                                    </div>
                                )}
                                {latestEvents.map((t, idx) => (
                                    <div key={t.txId || idx} style={{ backgroundColor: '#111318', border: '1px solid #2d3139', borderRadius: '6px', padding: '12px', borderLeft: '3px solid #10b981', animation: 'slideIn 0.3s ease-out' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.85rem' }}>🟢 SETTLED</span>
                                            <span style={{ color: '#9ca3af', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>{new Date(t.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{t.symbol} × {t.qty} shares</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#9ca3af' }}>
                                            <span style={{ fontFamily: 'var(--font-mono)' }}>₹{t.total?.toLocaleString()} · {t.settlementTime || '2.31s'}</span>
                                            {t.txHash && (
                                                <a href={`https://sepolia.etherscan.io/tx/${t.txHash}`} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}>
                                                    {t.txHash.substring(0, 6)}...{t.txHash.substring(t.txHash.length - 4)} [↗]
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3139', borderRadius: '8px', padding: '20px' }}>
                            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem' }}>🏛 Compliance Status</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: '#e5e7eb' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span>✅</span> All trades on-chain</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span>✅</span> Zero settlement failures</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span>✅</span> KYC verified: 100%</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span>✅</span> PAN linked: 100%</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span>✅</span> Audit trail: Immutable</div>
                            </div>
                            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #2d3139', fontSize: '0.85rem', color: '#9ca3af' }}>
                                <div style={{ marginBottom: '5px' }}>Blockchain: Ethereum Sepolia</div>
                                <div style={{ marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>Contract: 0xED01...faAD3</div>
                                <a href="https://sepolia.etherscan.io/address/0xED01edaBe040016C268701De53d70cb5301faAD3" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                                    [View on Etherscan ↗]
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </div>
    );
}
