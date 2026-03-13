import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { STOCKS } from '../data/mockData';
import useLivePrices from '../hooks/useLivePrices';

const CONTRACT = '0xED01edaBe040016C268701De53d70cb5301faAD3';

export default function StocksPage() {
    const { navigate, setSelectedStock } = useApp();
    const liveStocks = useLivePrices(STOCKS);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('ALL');
    const [sort, setSort] = useState('default');

    const filtered = liveStocks
        .filter(s => {
            const matchSearch = s.sym.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase());
            const matchFilter = filter === 'ALL' || s.exch === filter || (filter === 'UP' && s.chg > 0) || (filter === 'DOWN' && s.chg < 0);
            return matchSearch && matchFilter;
        })
        .sort((a, b) => {
            if (sort === 'price-asc') return a.price - b.price;
            if (sort === 'price-desc') return b.price - a.price;
            if (sort === 'chg-desc') return b.chg - a.chg;
            if (sort === 'chg-asc') return a.chg - b.chg;
            return 0;
        });

    const gainers = liveStocks.filter(s => s.chg > 0).sort((a, b) => b.chg - a.chg).slice(0, 3);
    const losers = liveStocks.filter(s => s.chg < 0).sort((a, b) => a.chg - b.chg).slice(0, 3);

    function handleSelect(stock) {
        setSelectedStock(stock);
        navigate('stockdetail');
    }

    return (
        <div style={{ paddingBottom: 60 }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <p style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 11, letterSpacing: '4px', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 8 }}>Markets</p>
                    <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 700, marginBottom: 4 }}>Live Stocks</h1>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Every trade settles in &lt;3s · Powered by atomic swaps</p>
                </div>
                <a
                    href={`https://sepolia.etherscan.io/address/${CONTRACT}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.25)', borderRadius: 8, padding: '8px 14px', fontSize: 12, color: '#1D9E75', textDecoration: 'none', fontWeight: 600 }}
                >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1D9E75', display: 'inline-block' }} />
                    Contract Live ↗
                </a>
            </div>

            {/* Top Movers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
                    <div style={{ fontSize: 12, color: '#1D9E75', fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Gainers</div>
                    {gainers.map(s => (
                        <div key={s.sym} onClick={() => handleSelect(s)} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>{s.sym}</span>
                            <span style={{ color: '#1D9E75', fontFamily: 'monospace', fontSize: 13 }}>+{s.chg}%</span>
                        </div>
                    ))}
                </div>
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
                    <div style={{ fontSize: 12, color: '#E24B4A', fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Losers</div>
                    {losers.map(s => (
                        <div key={s.sym} onClick={() => handleSelect(s)} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>{s.sym}</span>
                            <span style={{ color: '#E24B4A', fontFamily: 'monospace', fontSize: 13 }}>{s.chg}%</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search stocks..."
                    style={{ padding: '9px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 14, minWidth: 200 }}
                />
                {['ALL', 'NSE', 'BSE', 'UP', 'DOWN'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                        padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        background: filter === f ? 'var(--accent)' : 'var(--bg-secondary)',
                        color: filter === f ? '#fff' : 'var(--text-muted)',
                        border: filter === f ? 'none' : '1px solid var(--border)'
                    }}>{f}</button>
                ))}
                <select value={sort} onChange={e => setSort(e.target.value)} style={{ marginLeft: 'auto', padding: '8px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13 }}>
                    <option value="default">Sort: Default</option>
                    <option value="price-desc">Price: High → Low</option>
                    <option value="price-asc">Price: Low → High</option>
                    <option value="chg-desc">Gainers First</option>
                    <option value="chg-asc">Losers First</option>
                </select>
            </div>

            {/* Stocks Table */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            {['Stock', 'Exchange', 'Price', 'Change', 'Volume', 'Market Cap', 'Settlement'].map(h => (
                                <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Stock' ? 'left' : 'right', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((s, i) => (
                            <tr
                                key={s.sym}
                                onClick={() => handleSelect(s)}
                                style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <td style={{ padding: '14px 16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--accent)' }}>
                                            {s.sym.slice(0, 3)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 14 }}>{s.sym}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>{s.exch}</span>
                                </td>
                                <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, fontSize: 15 }}>
                                    ₹{s.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>
                                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                    <span style={{ color: s.chg >= 0 ? '#1D9E75' : '#E24B4A', fontFamily: 'monospace', fontWeight: 600, fontSize: 13 }}>
                                        {s.chg >= 0 ? '+' : ''}{s.chg}%
                                    </span>
                                </td>
                                <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: 'monospace', fontSize: 13, color: 'var(--text-muted)' }}>{s.vol}</td>
                                <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: 'monospace', fontSize: 13, color: 'var(--text-muted)' }}>{s.cap}</td>
                                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: 'rgba(29,158,117,0.1)', color: '#1D9E75', fontWeight: 700 }}>T+0 ⚡</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
