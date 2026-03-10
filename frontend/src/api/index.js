export async function submitTrade({ symbol, qty, type }) {
    // Stubbed — will become: POST http://localhost:5000/api/trade
    return new Promise(resolve =>
        setTimeout(() => resolve({ txId: 'mock-tx-' + Date.now() }), 300)
    );
}

export async function initiatePayment({ symbol, qty, type, price }) {
    const res = await fetch('http://https://tradomic-backend.onrender.com/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, qty, type, price })
    });
    return res.json();
}

export async function verifyPayment({ txId, otp, pan, password }) {
    const res = await fetch('http://https://tradomic-backend.onrender.com/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txId, otp, pan, password })
    });
    return res.json();
}

export function subscribeToTrade(txId, onStep, onComplete) {
    // REAL WebSocket ws://localhost:5000/trade/:txId
    const ws = new WebSocket(`ws://https://tradomic-backend.onrender.com/trade/${txId}`);

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
