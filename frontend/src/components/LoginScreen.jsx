import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

export default function LoginScreen() {
    const { loginAsTrader, openSebiModal } = useApp();
    const [counter, setCounter] = useState(0);

    useEffect(() => {
        let start = 0;
        const target = 700;
        const duration = 2000;
        const increment = target / (duration / 16); // 60fps

        const tick = () => {
            start += increment;
            if (start >= target) {
                setCounter(target);
            } else {
                setCounter(Math.floor(start));
                requestAnimationFrame(tick);
            }
        };
        requestAnimationFrame(tick);
    }, []);

    return (
        <div style={{
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            overflowX: 'hidden'
        }}>
            {/* Hero Section */}
            <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
                {/* Left Side */}
                <div style={{
                    flex: '0 0 55%',
                    padding: '10vh 8vw',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    position: 'relative'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: '40px',
                        left: '8vw',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <div style={{ fontSize: '24px' }}>T⚡</div>
                        <div style={{
                            fontFamily: "'Unbounded', sans-serif",
                            fontWeight: 800,
                            fontSize: '24px',
                            letterSpacing: '-1px'
                        }}>
                            Trado<span style={{ color: 'var(--accent)' }}>mic</span>
                        </div>
                    </div>

                    <div style={{
                        fontFamily: "'Syne', sans-serif",
                        fontWeight: 700,
                        fontSize: '52px',
                        lineHeight: '1.1',
                        color: 'white',
                        marginBottom: '20px'
                    }}>
                        India locks<br />
                        <span style={{ fontFamily: "'Bricolage Grotesque', monospace", fontSize: '72px', fontWeight: 800, color: 'var(--accent)' }}>₹{counter} Crore</span><br />
                        daily.
                    </div>

                    <div style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '16px',
                        color: 'var(--text-muted)',
                        marginBottom: '40px',
                        lineHeight: '1.5'
                    }}>
                        To T+1 settlement delays.

                        <div style={{ marginTop: '24px' }}>
                            <span style={{ fontFamily: "'DM Sans', sans-serif", color: 'var(--text-muted)', fontSize: '16px' }}>
                                We settle in{' '}
                            </span>
                            <span style={{ fontFamily: "'Bricolage Grotesque', monospace", color: 'var(--accent)', fontSize: '36px', fontWeight: 800 }}>
                                2.31 seconds.
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        {['Ethereum Sepolia', 'T+0 Settlement', 'SEBI Compliant'].map(badge => (
                            <div key={badge} style={{
                                padding: '8px 16px',
                                border: '1px solid var(--accent)',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                color: 'var(--accent)',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                fontFamily: "'DM Sans', sans-serif"
                            }}>
                                {badge}
                            </div>
                        ))}
                    </div>

                    <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '32px', lineHeight: 1.4 }}>
                        Choose better. Choose faster.<br />Choose <span style={{ color: 'var(--accent)' }}>Tradomic.</span>
                    </p>
                </div>

                {/* Right Side */}
                <div style={{
                    flex: '0 0 45%',
                    backgroundColor: 'var(--bg-secondary)',
                    borderLeft: '1px solid var(--border)',
                    paddingTop: '10vh',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <div style={{
                        position: 'sticky',
                        top: '40px',
                        width: '100%',
                        maxWidth: '420px',
                        padding: '0 40px'
                    }}>
                        <div style={{
                            width: '100%',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid var(--border)',
                            borderRadius: '24px',
                            padding: '40px',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <h2 style={{
                                fontFamily: "'Syne', sans-serif",
                                fontWeight: 700,
                                fontSize: '24px',
                                margin: '0 0 8px 0',
                                color: 'white'
                            }}>Welcome to Tradomic</h2>
                            <p style={{
                                fontFamily: "'DM Sans', sans-serif",
                                margin: '0 0 30px 0',
                                color: 'var(--text-secondary)',
                                fontSize: '14px'
                            }}>Select your portal to continue</p>

                            <button
                                onClick={loginAsTrader}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    backgroundColor: 'var(--accent)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    cursor: 'pointer',
                                    marginBottom: '16px',
                                    transition: 'transform 0.2s',
                                    fontFamily: "'DM Sans', sans-serif"
                                }}
                                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
                                    <span>👤</span> Continue as Trader
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '13px', opacity: 0.9 }}>
                                    <span>Arjun Mehta · <span style={{ fontFamily: "'Bricolage Grotesque', monospace" }}>₹2,34,56,789</span></span>
                                    <span>Demo Account</span>
                                </div>
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' }}>
                                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--text-muted)' }}>or</span>
                                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                            </div>

                            <button
                                onClick={openSebiModal}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    backgroundColor: 'transparent',
                                    color: 'white',
                                    border: '1px solid var(--accent)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    cursor: 'pointer',
                                    marginBottom: '30px',
                                    transition: 'background 0.2s',
                                    fontFamily: "'DM Sans', sans-serif"
                                }}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)'}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
                                    <span>🏛</span> SEBI Official Login
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    <span>Regulatory surveillance portal</span>
                                    <span style={{ color: 'var(--accent)' }}>Restricted access</span>
                                </div>
                            </button>

                            <div style={{
                                textAlign: 'center',
                                fontSize: '12px',
                                color: 'var(--text-secondary)',
                                fontFamily: "'DM Sans', sans-serif",
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                            }}>
                                <span>🔒</span> Secured by Ethereum blockchain
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div id="about" style={{ padding: '0 10vw', paddingBottom: '80px' }}>
                <div style={{ textAlign: 'center', padding: '80px 0 40px', borderTop: '1px solid var(--border)' }}>
                    <p style={{ fontFamily: "'Unbounded', sans-serif", fontSize: '11px', letterSpacing: '4px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>About Tradomic</p>
                    <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '48px', fontWeight: 700, marginTop: '16px' }}>
                        How we settle in <span style={{ color: 'var(--accent)', fontFamily: "'Bricolage Grotesque', monospace" }}>2.31 seconds</span>
                    </h2>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", color: 'var(--text-muted)', fontSize: '16px', marginTop: '12px', maxWidth: '600px', margin: '12px auto 0' }}>
                        While traditional brokers wait until tomorrow, our atomic swap engine settles every trade instantly — on-chain, immutable, verifiable.
                    </p>
                </div>

                {/* Atomic Swap Flow Diagram */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '80px' }}>
                    {[
                        { icon: '🔒', label: 'Lock Funds', time: '0.0s' },
                        { icon: '✓', label: 'Verify Both', time: '0.6s' },
                        { icon: '⚡', label: 'Atomic Swap', time: '1.7s' },
                        { icon: '✅', label: 'Settled', time: '2.31s' }
                    ].map((step, idx, arr) => (
                        <React.Fragment key={idx}>
                            <div style={{ flex: 1, textAlign: 'center' }}>
                                <div style={{
                                    border: '1px solid var(--accent)',
                                    borderRadius: '12px',
                                    padding: '24px 16px',
                                    background: 'rgba(59, 130, 246, 0.05)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px'
                                }}>
                                    <div style={{ fontSize: '32px' }}>{step.icon}</div>
                                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: '18px', color: 'white' }}>{step.label}</div>
                                </div>
                                <div style={{ fontFamily: "'Bricolage Grotesque', monospace", fontSize: '18px', color: 'var(--text-secondary)', marginTop: '16px' }}>
                                    {step.time}
                                </div>
                            </div>
                            {idx < arr.length - 1 && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '24px', alignSelf: 'center', marginTop: '-30px' }}>
                                    →
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Features Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '80px' }}>
                    {[
                        { icon: '⚡', title: 'T+0 Settlement', desc: <> <span style={{ fontFamily: "'Bricolage Grotesque', monospace" }}>2.31s</span> vs <span style={{ fontFamily: "'Bricolage Grotesque', monospace" }}>32</span> hours</> },
                        { icon: '🔒', title: '4-Layer Validation', desc: 'PAN + OTP + MPIN + Smart Contract' },
                        { icon: '🧮', title: 'Smart Netting', desc: <>Reduces settlements by up to <span style={{ fontFamily: "'Bricolage Grotesque', monospace" }}>80%</span></> },
                        { icon: '🏛', title: 'SEBI Compliance', desc: 'Real-time immutable audit log on Ethereum blockchain' },
                        { icon: '📊', title: 'Fractional Shares', desc: <>Own <span style={{ fontFamily: "'Bricolage Grotesque', monospace" }}>0.5</span> shares of any stock</> },
                        { icon: '💰', title: '50x Cheaper', desc: <><span style={{ fontFamily: "'Bricolage Grotesque', monospace" }}>0.01%</span> fee vs <span style={{ fontFamily: "'Bricolage Grotesque', monospace" }}>0.5%</span> broker commission</> }
                    ].map((f, i) => (
                        <div key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '32px' }}>
                            <div style={{ fontSize: '32px', marginBottom: '20px' }}>{f.icon}</div>
                            <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: '20px', margin: '0 0 12px 0', color: 'white' }}>{f.title}</h3>
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '16px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Comparison Table */}
                <div style={{ marginBottom: '80px', overflowX: 'auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', minWidth: '600px' }}>
                        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '20px', padding: '16px 24px', color: 'var(--text-secondary)' }}>Traditional Broker</div>
                        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '20px', padding: '16px 24px', color: 'var(--accent)' }}>Tradomic</div>

                        <div style={{ background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', padding: '32px 32px', border: '1px solid rgba(239, 68, 68, 0.1)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '16px' }}><span style={{ fontFamily: "'Bricolage Grotesque', monospace" }}>0.5%</span> commission</div>
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '16px' }}>T+<span style={{ fontFamily: "'Bricolage Grotesque', monospace" }}>1</span> settlement (<span style={{ fontFamily: "'Bricolage Grotesque', monospace" }}>32</span> hours)</div>
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '16px' }}>Manual KYC</div>
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '16px' }}>Opaque audit trail</div>
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '16px' }}>Clearing house required</div>
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '16px' }}>₹<span style={{ fontFamily: "'Bricolage Grotesque', monospace" }}>700</span>Cr locked daily</div>
                        </div>
                        <div style={{ background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px', padding: '32px 32px', border: '1px solid rgba(16, 185, 129, 0.1)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '16px' }}><span style={{ fontFamily: "'Bricolage Grotesque', monospace" }}>0.01%</span> fee (<span style={{ fontFamily: "'Bricolage Grotesque', monospace" }}>50</span>x cheaper)</div>
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '16px' }}>T+<span style={{ fontFamily: "'Bricolage Grotesque', monospace" }}>0</span> (<span style={{ fontFamily: "'Bricolage Grotesque', monospace" }}>2.31</span> seconds)</div>
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '16px' }}>On-chain verification</div>
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '16px' }}>Immutable blockchain ledger</div>
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '16px' }}>Smart contract enforces atomicity</div>
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '16px' }}>Zero idle capital</div>
                        </div>
                    </div>
                </div>

                {/* Monetization */}
                <div style={{ marginBottom: '80px' }}>
                    <h3 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: '14px', letterSpacing: '2px', color: 'var(--text-secondary)', marginBottom: '32px', textTransform: 'uppercase' }}>How Tradomic Makes Money</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0' }}>
                        {/* 01 */}
                        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', padding: '32px 0', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ fontFamily: "'Bricolage Grotesque', monospace", fontSize: '64px', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>01</div>
                            <div>
                                <h4 style={{ fontFamily: "'Syne', sans-serif", fontSize: '24px', margin: '0 0 12px 0', color: 'white' }}>Transaction Fees</h4>
                                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '18px', color: 'var(--text-muted)', margin: 0 }}>
                                    <span style={{ fontFamily: "'Bricolage Grotesque', monospace" }}>0.01%</span> per trade · ₹<span style={{ fontFamily: "'Bricolage Grotesque', monospace" }}>50,000</span>Cr daily volume · ₹<span style={{ fontFamily: "'Bricolage Grotesque', monospace" }}>5</span>Cr/day potential
                                </p>
                            </div>
                        </div>
                        {/* 02 */}
                        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', padding: '32px 0', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ fontFamily: "'Bricolage Grotesque', monospace", fontSize: '64px', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>02</div>
                            <div>
                                <h4 style={{ fontFamily: "'Syne', sans-serif", fontSize: '24px', margin: '0 0 12px 0', color: 'white' }}>Institutional API</h4>
                                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '18px', color: 'var(--text-muted)', margin: 0 }}>
                                    ₹<span style={{ fontFamily: "'Bricolage Grotesque', monospace" }}>10</span>L/month · Hedge funds + prop trading firms
                                </p>
                            </div>
                        </div>
                        {/* 03 */}
                        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', padding: '32px 0', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ fontFamily: "'Bricolage Grotesque', monospace", fontSize: '64px', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>03</div>
                            <div>
                                <h4 style={{ fontFamily: "'Syne', sans-serif", fontSize: '24px', margin: '0 0 12px 0', color: 'white' }}>SEBI Compliance-as-a-Service</h4>
                                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '18px', color: 'var(--text-muted)', margin: 0 }}>
                                    Real-time regulatory audit access
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '40px', fontFamily: "'DM Sans', sans-serif", color: 'var(--text-muted)', fontSize: '18px' }}>
                        Break-even: <span style={{ fontFamily: "'Bricolage Grotesque', monospace" }}>500</span> trades/day = <span style={{ fontFamily: "'Bricolage Grotesque', monospace" }}>0.05%</span> market share
                    </div>
                </div>

                {/* Final CTA */}
                <div style={{ textAlign: 'center', padding: '80px 20px', borderTop: '1px solid var(--border)' }}>
                    <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '40px', fontWeight: 700, marginBottom: '16px', color: 'white' }}>
                        Ready to experience T+<span style={{ fontFamily: "'Bricolage Grotesque', monospace" }}>0</span>?
                    </h2>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", color: 'var(--text-muted)', marginBottom: '32px', fontSize: '18px' }}>
                        Join Arjun Mehta and thousands of traders settling in <span style={{ fontFamily: "'Bricolage Grotesque', monospace", color: 'var(--accent)' }}>2.31</span> seconds.
                    </p>
                    <button
                        onClick={loginAsTrader}
                        style={{ padding: '16px 48px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", fontSize: '18px', fontWeight: 700, cursor: 'pointer', transition: 'transform 0.2s', display: 'inline-block' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        Start Trading →
                    </button>
                </div>

            </div>
        </div>
    );
}
