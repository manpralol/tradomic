import { useState, useEffect, useRef } from 'react';

export default function useLivePrices(initialStocks, wsUrl) {
    const [stocks, setStocks] = useState(() => initialStocks.map(s => ({ ...s })));
    const wsRef = useRef(null);

    useEffect(() => {
        if (wsUrl) {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;
            ws.onmessage = (e) => {
                try {
                    const data = JSON.parse(e.data);
                    setStocks(prev => prev.map(s => {
                        const update = data.find(d => d.sym === s.sym);
                        return update ? { ...s, price: update.price, chg: update.chg } : s;
                    }));
                } catch (_) { }
            };
            return () => ws.close();
        } else {
            const id = setInterval(() => {
                setStocks(prev => prev.map(s => {
                    const delta = (Math.random() - 0.49) * 2;
                    return { ...s, price: Math.max(1, s.price + delta) };
                }));
            }, 1800);
            return () => clearInterval(id);
        }
    }, [wsUrl]);

    return stocks;
}
