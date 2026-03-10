import React, { useState } from 'react';
import { STOCKS } from '../data/mockData';
import useLivePrices from '../hooks/useLivePrices';
import { useApp } from '../context/AppContext';

function fmtPrice(p) {
    return '₹' + p.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function StocksPage() {
    const { setSelectedStock, navigate } = useApp();
    const liveStocks = useLivePrices(STOCKS);

    const [search, setSearch] = useState('');
    const [mode, setMode] = useState('intraday');
    const [exch, setExch] = useState('all');

    const filtered = liveStocks.filter(s => {
        const matchExch = exch === 'all' || s.exch === exch;
        const q = search.toLowerCase();
        const matchSearch = s.sym.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
        return matchExch && matchSearch;
    });

    return (
        <div className="stocks-page">
            <div className="section-header" style={{ marginBottom: '24px' }}>
                <div>
                    <div className="section-title" style={{ fontSize: '22px', fontFamily: 'var(--font-display)', fontWeight: 800 }}>Market</div>
                    <div className="section-sub">All listed securities · Real-time</div>
                </div>
            </div>

            <div className="stocks-toolbar">
                <input
                    className="stocks-search"
                    placeholder="Search symbol or company..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <div className="toggle-group">
                    <button
                        className={`toggle-btn${mode === 'intraday' ? ' active' : ''}`}
                        onClick={() => setMode('intraday')}
                    >Intraday</button>
                    <button
                        className={`toggle-btn${mode === 'delivery' ? ' active' : ''}`}
                        onClick={() => setMode('delivery')}
                    >Delivery</button>
                </div>
                <button className={`filter-pill${exch === 'all' ? ' active' : ''}`} onClick={() => setExch('all')}>All</button>
                <button className={`filter-pill${exch === 'NSE' ? ' active' : ''}`} onClick={() => setExch('NSE')}>NSE</button>
                <button className={`filter-pill${exch === 'BSE' ? ' active' : ''}`} onClick={() => setExch('BSE')}>BSE</button>
            </div>

            <table className="stocks-table" id="stocksTable">
                <thead>
                    <tr>
                        <th>STOCK</th>
                        <th>PRICE</th>
                        <th>CHANGE</th>
                        <th>VOLUME</th>
                        <th>MKT CAP</th>
                        <th>EXCH</th>
                        <th>ACTION</th>
                    </tr>
                </thead>
                <tbody id="stocksTableBody">
                    {filtered.map(s => {
                        const up = s.chg >= 0;
                        return (
                            <tr key={s.sym} onClick={() => { setSelectedStock(s); navigate('stockdetail'); }}>
                                <td>
                                    <div className="stock-name-cell">
                                        <div className="stock-icon-sm">{s.sym.substring(0, 3)}</div>
                                        <div>
                                            <div className="stock-sym">{s.sym}</div>
                                            <div className="stock-full-name">{s.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="stock-price-cell">{fmtPrice(s.price)}</td>
                                <td><span className={`chg-badge ${up ? 'up' : 'down'}`}>{up ? '+' : ''}{s.chg}%</span></td>
                                <td className="font-mono" style={{ fontSize: '12px' }}>{s.vol}</td>
                                <td className="font-mono" style={{ fontSize: '12px' }}>{s.cap}</td>
                                <td><span className="exch-tag">{s.exch}</span></td>
                                <td>
                                    <button
                                        className="trade-btn buy"
                                        onClick={e => { e.stopPropagation(); setSelectedStock(s); navigate('stockdetail'); }}
                                    >BUY</button>
                                    &nbsp;
                                    <button
                                        className="trade-btn sell"
                                        onClick={e => { e.stopPropagation(); setSelectedStock(s); navigate('stockdetail'); }}
                                    >SELL</button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
