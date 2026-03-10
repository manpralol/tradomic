import React from 'react';
import useLivePrices from '../hooks/useLivePrices';
import { TICKER_STOCKS } from '../data/mockData';

function fmtPrice(p) {
    return '₹' + p.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function TickerTape() {
    const liveStocks = useLivePrices(TICKER_STOCKS);

    const items = [...liveStocks, ...liveStocks];

    return (
        <div className="ticker-wrapper">
            <div className="ticker-label">LIVE</div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
                <div className="ticker-scroll">
                    {items.map((s, i) => {
                        const up = s.chg >= 0;
                        return (
                            <div className="ticker-item" key={i}>
                                <span className="t-name">{s.sym}</span>
                                <span className="t-price">{fmtPrice(s.price)}</span>
                                <span className={`t-change ${up ? 'up' : 'down'}`}>{up ? '+' : ''}{s.chg}%</span>
                                <span className="t-exch">{s.exch}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
