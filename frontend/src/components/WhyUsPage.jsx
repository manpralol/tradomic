import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

const CONTRACT = '0xED01edaBe040016C268701De53d70cb5301faAD3';

const FEATURES = [
    {
        icon: '⚡',
        title: 'T+0 Atomic Settlement',
        desc: 'Trades settle in under 3 seconds using atomic swaps on Ethereum. No counterparty risk. No failed settlements.',
        stat: 'near-instant', statLabel: 'avg settlement',
        color: '#1D9E75'
    },
    {
        icon: '🔗',
        title: 'Smart Netting Engine',
        desc: 'Our on-chain netting engine computes net obligations across all trades, reducing capital locked by up to 78%.',
        stat: '78%', statLabel: 'capital saved',
        color: '#185FA5'
    },
    {
        icon: '💸',
        title: 'Auto Dividend Distribution',
        desc: 'Dividends are distributed directly to shareholder wallets via smart contracts — no delays, no intermediaries.',
        stat: 'T+0', statLabel: 'dividend payout',
        color: '#BA7517'
    },
    {
        icon: '🧾',
        title: 'Tax Deducted at Source',
        desc: 'TDS is automatically computed and deducted on every transaction, fully SEBI compliant and audit-ready.',
        stat: '100%', statLabel: 'SEBI compliant',
        color: '#993556'
    },
    {
        icon: '🏛️',
        title: 'SEBI Oversight Dashboard',
        desc: 'Regulators get a real-time audit dashboard with full transaction visibility, KYC data, and export tools.',
        stat: 'Live', statLabel: 'audit trail',
        color: '#534AB7'
    },
    {
        icon: '🔒',
        title: 'Fractional Share Trading',
        desc: 'Buy as little as 0.5 shares of any stock. Blockchain ownership is precise to 18 decimal places.',
        stat: '0.5x', statLabel: 'min shares',
        color: '#3B6D11'
    },
];

const COMPARISON = [
    { label: 'Settlement Time', traditional: 'T+2 (48 hours)', tradomic: 'T+0 (2.31 seconds)', win: true },
    { label: 'Capital Locked', traditional: '₹700 Cr/day frozen', tradomic: 'Released instantly', win: true },
    { label: 'Failed Trades', traditional: '0.3% failure rate', tradomic: '0% — atomic swaps', win: true },
    { label: 'Dividend Payout', traditional: '15-30 days delay', tradomic: 'Same day on-chain', win: true },
    { label: 'Audit Trail', traditional: 'Manual reconciliation', tradomic: 'Immutable blockchain', win: true },
    { label: 'Counterparty Risk', traditional: 'High exposure', tradomic: 'Zero — smart contract', win: true },
];

export default function WhyUsPage() {
    const { navigate } = useApp();
    const [counter, setCounter] = useState(0);
    const [visible, setVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    useEffect(() => {
        if (!visible) return;
        let n = 0;
        const t = setInterval(() => {
            n += 7;
            if (n >= 700) { setCounter(700); clearInterval(t); }
            else setCounter(n);
        }, 20);
        return () => clearInterval(t);
    }, [visible]);

    return (
        <div style={{ padding: '0 0 60px' }}>

            {/* Hero */}
            <div style={{ textAlign: 'center', padding: '60px 20px 48px', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 11, letterSpacing: '4px', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 16 }}>
                    Why Tradomic
                </p>
                <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 48, fontWeight: 700, lineHeight: 1.2, marginBottom: 16 }}>
                    India's stock market locks<br />
                    <span style={{ color: 'var(--accent)' }} ref={ref}>₹{counter} Crore</span> every day.
                </h1>
                <p style={{ fontSize: 18, color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto 32px', lineHeight: 1.7 }}>
                    T+2 settlement means your money is frozen for 48 hours after every trade. We fix that with blockchain.
                </p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.25)', borderRadius: 8, padding: '10px 16px', fontSize: 13 }}>
                    <span style={{ color: '#1D9E75' }}>✓</span>
                    <span style={{ color: 'var(--text-muted)' }}>Live on Ethereum Sepolia ·</span>
                    <a href={`https://sepolia.etherscan.io/address/${CONTRACT}`} target="_blank" rel="noopener noreferrer" style={{ color: '#1D9E75', textDecoration: 'none', fontFamily: 'monospace', fontSize: 12 }}>
                        {CONTRACT.slice(0, 10)}...{CONTRACT.slice(-6)} ↗
                    </a>
                </div>
            </div>

            {/* T+0 vs T+2 Comparison Table */}
            <div style={{ padding: '48px 0', borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 700, marginBottom: 32, textAlign: 'center' }}>
                    Traditional vs Tradomic
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 20px', background: 'var(--bg-secondary)', fontWeight: 700, fontSize: 13, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>Feature</div>
                    <div style={{ padding: '14px 20px', background: 'rgba(255,61,90,0.06)', fontWeight: 700, fontSize: 13, borderBottom: '1px solid var(--border)', color: '#E24B4A', textAlign: 'center' }}>Traditional T+2</div>
                    <div style={{ padding: '14px 20px', background: 'rgba(29,158,117,0.06)', fontWeight: 700, fontSize: 13, borderBottom: '1px solid var(--border)', color: '#1D9E75', textAlign: 'center' }}>Tradomic T+0 ✓</div>
                    {COMPARISON.map((row, i) => (
                        <React.Fragment key={row.label}>
                            <div style={{ padding: '14px 20px', background: 'var(--bg-secondary)', fontSize: 14, borderBottom: i < COMPARISON.length - 1 ? '1px solid var(--border)' : 'none', color: 'var(--text-muted)' }}>{row.label}</div>
                            <div style={{ padding: '14px 20px', background: 'rgba(255,61,90,0.03)', fontSize: 14, borderBottom: i < COMPARISON.length - 1 ? '1px solid var(--border)' : 'none', color: '#E24B4A', textAlign: 'center' }}>{row.traditional}</div>
                            <div style={{ padding: '14px 20px', background: 'rgba(29,158,117,0.03)', fontSize: 14, borderBottom: i < COMPARISON.length - 1 ? '1px solid var(--border)' : 'none', color: '#1D9E75', fontWeight: 600, textAlign: 'center' }}>{row.tradomic}</div>
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Features Grid */}
            <div style={{ padding: '48px 0' }}>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 700, marginBottom: 32, textAlign: 'center' }}>Everything built on blockchain</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                    {FEATURES.map((f) => (
                        <div key={f.title} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, position: 'relative', overflow: 'hidden' }}>
                            <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16 }}>{f.desc}</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                                <span style={{ fontFamily: 'monospace', fontSize: 24, fontWeight: 800, color: f.color }}>{f.stat}</span>
                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f.statLabel}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--bg-secondary)', borderRadius: 16, border: '1px solid var(--border)' }}>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 700, marginBottom: 16 }}>Ready to trade at T+0?</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 16 }}>Your money, settled instantly. Every time.</p>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                    <button onClick={() => navigate('stocks')} style={{ padding: '14px 32px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
                        Start Trading →
                    </button>
                    <a href={`https://sepolia.etherscan.io/address/${CONTRACT}`} target="_blank" rel="noopener noreferrer"
                        style={{ padding: '14px 24px', border: '1px solid rgba(29,158,117,0.4)', color: '#1D9E75', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        View Smart Contract ↗
                    </a>
                </div>
            </div>
        </div>
    );
}
