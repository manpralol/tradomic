import React, { useState, useEffect, useRef } from 'react';

export default function WhyUsPage() {
    const [raceRunning, setRaceRunning] = useState(false);
    const [modernPct, setModernPct] = useState(0);
    const [legacyPct, setLegacyPct] = useState(0);
    const [modernTime, setModernTime] = useState('0s');
    const [legacyTime, setLegacyTime] = useState('0s');
    const [modernStatus, setModernStatus] = useState('Waiting...');
    const [legacyStatus, setLegacyStatus] = useState('Waiting...');
    const [legacyProjected, setLegacyProjected] = useState('');
    const [btnLabel, setBtnLabel] = useState('▶ Buy Stock');
    const [btnDisabled, setBtnDisabled] = useState(false);

    const raceIntervalRef = useRef(null);
    const crawlIntervalRef = useRef(null);

    useEffect(() => {
        return () => {
            clearInterval(raceIntervalRef.current);
            clearInterval(crawlIntervalRef.current);
        };
    }, []);

    function startLegacyCrawl(startPct) {
        let pct = startPct;
        let secs = 23;
        crawlIntervalRef.current = setInterval(() => {
            pct = Math.min(8, pct + 0.005);
            secs++;
            setLegacyPct(pct);
            setLegacyTime(secs + 's elapsed');
        }, 1000);
    }

    function startRace() {
        if (raceRunning) return;
        setRaceRunning(true);
        setBtnDisabled(true);
        setBtnLabel('Settlement in progress...');
        setModernPct(0);
        setLegacyPct(0);
        setModernTime('0s');
        setLegacyTime('0s');
        setModernStatus('Initiating atomic swap...');
        setLegacyStatus('Processing...');
        setLegacyProjected('');

        clearInterval(raceIntervalRef.current);
        clearInterval(crawlIntervalRef.current);

        let mPct = 0;
        let lPct = 0;
        let modernDone = false;
        let elapsed = 0;

        const statuses = [
            [0, 'Order received by broker...'],
            [0.5, 'Routing to NSE clearing...'],
            [1.5, 'Awaiting counterparty confirmation...'],
            [2.5, 'Funds held by NSCCL...'],
            [4, 'Overnight batch processing...'],
        ];

        raceIntervalRef.current = setInterval(() => {
            elapsed += 100;

            if (!modernDone) {
                mPct = Math.min(100, mPct + 4.35);
                setModernPct(mPct);
                setModernTime((elapsed / 1000).toFixed(1) + 's');

                if (mPct >= 100) {
                    modernDone = true;
                    setModernStatus('✓ Settled on-chain!');
                    setModernTime('2.3s');
                    setLegacyProjected('Projected completion: ~32 hrs from now');
                    setBtnDisabled(false);
                    setBtnLabel('↺ Buy Again');
                    setRaceRunning(false);
                    clearInterval(raceIntervalRef.current);
                    startLegacyCrawl(lPct);
                    return;
                }
            }

            lPct = Math.min(6, lPct + 0.09);
            setLegacyPct(lPct);

            for (let i = statuses.length - 1; i >= 0; i--) {
                if (lPct >= statuses[i][0]) {
                    setLegacyStatus(statuses[i][1]);
                    break;
                }
            }
        }, 100);
    }

    return (
        <div className="whyus-page">
            <div className="whyus-hero fade-up">
                <div className="whyus-title">Why <span>Tradomic</span>?</div>
                <div className="whyus-sub">
                    Traditional settlement traps your capital for 24 hours. We settle it in seconds — using atomic swaps on blockchain. Here's the proof.
                </div>
            </div>

            {/* T+1 vs T+0 Comparison */}
            <div className="comparison-arena fade-up delay-1">
                <div className="comparison-side legacy">
                    <div className="comp-badge legacy">LEGACY</div>
                    <div className="comp-title">T+1 Settlement</div>
                    <div className="timeline-steps">
                        <div className="t-step danger">
                            <div className="t-step-num">1</div>
                            <div className="t-step-content">
                                <div className="t-step-title">Trade Executed</div>
                                <div className="t-step-time">Day 0 · 10:00 AM</div>
                            </div>
                        </div>
                        <div className="t-step">
                            <div className="t-step-num">2</div>
                            <div className="t-step-content">
                                <div className="t-step-title">Broker sends order to exchange</div>
                                <div className="t-step-time">+minutes</div>
                            </div>
                        </div>
                        <div className="t-step">
                            <div className="t-step-num">3</div>
                            <div className="t-step-content">
                                <div className="t-step-title">Clearing Corporation involved (NSCCL)</div>
                                <div className="t-step-time">+hours · intermediary fees apply</div>
                            </div>
                        </div>
                        <div className="t-step">
                            <div className="t-step-num">4</div>
                            <div className="t-step-content">
                                <div className="t-step-title">Capital frozen, shares in limbo</div>
                                <div className="t-step-time">Overnight · your money locked</div>
                            </div>
                        </div>
                        <div className="t-step danger">
                            <div className="t-step-num">5</div>
                            <div className="t-step-content">
                                <div className="t-step-title">Settlement Complete</div>
                                <div className="t-step-time">Day 1 · 6:00 PM</div>
                            </div>
                        </div>
                    </div>
                    <div style={{ marginTop: '16px', padding: '12px', background: 'var(--red-dim)', borderRadius: '8px', border: '1px solid rgba(255,61,90,0.2)' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--red)' }}>⚠ Total Time: ~32 hours</div>
                    </div>
                </div>

                <div className="comp-vs">
                    <div className="vs-circle">VS</div>
                </div>

                <div className="comparison-side modern">
                    <div className="comp-badge modern">TRADOMIC</div>
                    <div className="comp-title">T+0 Atomic Settlement</div>
                    <div className="timeline-steps">
                        {[
                            { title: 'Trade Executed', time: 'T · 10:00:00 AM' },
                            { title: 'Smart Netting Engine computes delta', time: '+50ms' },
                            { title: 'Atomic Swap initiated on-chain', time: '+200ms · no intermediary' },
                            { title: 'Both parties verified simultaneously', time: '+1s · either both settle or neither' },
                            { title: 'Settlement Complete ✓', time: 'T + 2.3 seconds' },
                        ].map((s, i) => (
                            <div className="t-step success" key={i}>
                                <div className="t-step-num">{i + 1}</div>
                                <div className="t-step-content">
                                    <div className="t-step-title">{s.title}</div>
                                    <div className="t-step-time">{s.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: '16px', padding: '12px', background: 'var(--green-dim)', borderRadius: '8px', border: '1px solid rgba(0,230,118,0.2)' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--green)' }}>✓ Total Time: ~2.3 seconds</div>
                    </div>
                </div>
            </div>

            {/* Interactive Race Demo */}
            <div className="demo-arena fade-up delay-2">
                <div className="demo-title">See It Live — Trade Race</div>
                <div className="demo-sub">Click the button. Watch T+1 vs T+0 settle in real time.</div>
                <div className="demo-race">
                    <div className="race-lane">
                        <div className="race-lane-label">T+1 · TRADITIONAL</div>
                        <div className="race-bar-track">
                            <div className="race-bar-fill legacy" style={{ width: legacyPct + '%' }} />
                        </div>
                        <div className="race-time legacy">{legacyTime}</div>
                        <div className="race-status">{legacyStatus}</div>
                        <div style={{ marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                            {legacyProjected}
                        </div>
                    </div>
                    <div className="race-lane" style={{ borderColor: 'var(--border-bright)' }}>
                        <div className="race-lane-label" style={{ color: 'var(--accent)' }}>T+0 · TRADOMIC</div>
                        <div className="race-bar-track">
                            <div className="race-bar-fill modern" style={{ width: modernPct + '%' }} />
                        </div>
                        <div className="race-time modern">{modernTime}</div>
                        <div className="race-status">{modernStatus}</div>
                    </div>
                </div>
                <button
                    className="demo-btn"
                    id="demoBtn"
                    onClick={startRace}
                    disabled={btnDisabled}
                >{btnLabel}</button>
            </div>

            {/* Cost Breakdown */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '28px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '20px' }}>
                    Cost Breakdown — Same ₹1L Trade
                </div>
                <div className="cost-grid">
                    {[
                        { label: 'Broker Commission', old: '₹500', new: '₹50', save: 'Save ₹450 per trade' },
                        { label: 'Clearing Charges', old: '₹200', new: '₹0', save: 'No intermediary, no fee' },
                        { label: 'Opportunity Cost (24hr)', old: '₹1,100', new: '₹0', save: 'Capital freed instantly' },
                    ].map((c, i) => (
                        <div className="cost-card" key={i}>
                            <div className="cost-card-label">{c.label}</div>
                            <div className="cost-compare">
                                <span className="cost-old">{c.old}</span>
                                <span>→</span>
                                <span className="cost-new">{c.new}</span>
                            </div>
                            <div className="cost-save">{c.save}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Feature Cards */}
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '28px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '20px' }}>
                What Makes Us Different
            </div>
            <div className="features-grid">
                {[
                    { icon: '⚛️', title: 'Atomic Swaps', desc: 'Either both the share transfer and payment happen simultaneously — or neither does. Zero counterparty risk.' },
                    { icon: '🔢', title: 'Smart Netting Engine', desc: 'If 1000 shares are sold and 800 bought, only 200 move on-chain. Drastically lower gas and settlement cost.' },
                    { icon: '🔷', title: 'Fractional Ownership', desc: 'Buy 0.5 shares of Reliance. Blockchain enables true fractional ownership — democratising the market.' },
                    { icon: '💸', title: 'Instant Dividends', desc: 'Dividend declared → smart contract executes → your account credited. Same day, every time.' },
                    { icon: '🛡️', title: 'SEBI Compliance Layer', desc: 'Every trade is logged immutably on-chain. SEBI officials get a real-time audit dashboard with zero manipulation risk.' },
                    { icon: '📡', title: 'Live Settlement Feed', desc: 'Watch your trade settle in real time — counterparty acceptance, fund lock, share transfer — all visible on-chain.' },
                ].map((f, i) => (
                    <div className="feature-card" key={i}>
                        <div className="feature-icon">{f.icon}</div>
                        <div className="feature-title">{f.title}</div>
                        <div className="feature-desc">{f.desc}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
