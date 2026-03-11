const BASE = 'http://localhost:5000';
const WS_BASE = 'ws://localhost:5000';

export async function submitTrade({ symbol, qty, type }) {
    return new Promise(resolve =>
        setTimeout(() => resolve({ txId: 'mock-tx-' + Date.now() }), 300)
    );
}

export async function initiatePayment({ symbol, qty, type, price }) {
    const res = await fetch(`${BASE}/api/payment/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, qty, type, price })
    });
    return res.json();
}

export async function verifyPayment({ txId, otp, pan, password }) {
    const res = await fetch(`${BASE}/api/payment/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txId, otp, pan, password })
    });
    return res.json();
}

export function subscribeToTrade(txId, onStep, onComplete) {
    const ws = new WebSocket(`${WS_BASE}/trade/${txId}`);

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.settled) {
            if (onComplete) onComplete(data);
        } else {
            onStep(data);
        }
    };

    return () => ws.close();
}