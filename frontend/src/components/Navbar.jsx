import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const CONTRACT = '0xED01edaBe040016C268701De53d70cb5301faAD3';

export default function Navbar() {
    const { navigate, toggleTheme, theme, currentPage, user, openSebiModal, isLoggedIn, userType, logout } = useApp();
    const [blockNum, setBlockNum] = useState(10433562);
    const [ping, setPing] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setBlockNum(b => b + 1);
            setPing(true);
            setTimeout(() => setPing(false), 400);
        }, 12000);
        return () => clearInterval(interval);
    }, []);

    function formatBalance(n) {
        return '₹' + n.toLocaleString('en-IN');
    }

    return (
        <nav>
            <a className="nav-logo" href="#" onClick={e => { e.preventDefault(); navigate('home'); }}>
                <div className="logo-mark">T⚡</div>
                <span className="logo-text">Trado<span>mic</span></span>
            </a>

            {/* Blockchain status pill */}
            <div
                onClick={() => window.open(`https://sepolia.etherscan.io/address/${CONTRACT}`, '_blank')}
                style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.25)',
                    borderRadius: 20, padding: '4px 10px', cursor: 'pointer',
                    marginLeft: 16, fontSize: 11, userSelect: 'none'
                }}
                title="View contract on Etherscan"
            >
                <span style={{
                    width: 6, height: 6, borderRadius: '50%', background: '#1D9E75',
                    display: 'inline-block', transition: 'opacity 0.2s',
                    opacity: ping ? 0.2 : 1
                }} />
                <span style={{ color: '#1D9E75', fontWeight: 600 }}>Sepolia</span>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{blockNum.toLocaleString()}</span>
            </div>

            <div className="nav-spacer" />
            <ul className="nav-links">
                <li><a href="#" id="nav-home" className={currentPage === 'home' ? 'active' : ''} onClick={e => { e.preventDefault(); navigate('home'); }}>Home</a></li>
                <li><a href="#" id="nav-stocks" className={currentPage === 'stocks' ? 'active' : ''} onClick={e => { e.preventDefault(); navigate('stocks'); }}>Stocks</a></li>
                <li><a href="#" id="nav-portfolio" className={currentPage === 'portfolio' ? 'active' : ''} onClick={e => { e.preventDefault(); navigate('portfolio'); }}>Portfolio</a></li>
                <div className="nav-divider" />
                {isLoggedIn && userType === 'trader' ? (
                    <>
                        <li><a href="#" className="sebi-link" onClick={e => { e.preventDefault(); alert('Account settings coming soon'); }}>Account Settings</a></li>
                        <li><a href="#" className="sebi-link" onClick={e => { e.preventDefault(); logout(); }}>Logout</a></li>
                    </>
                ) : (
                    <li><a href="#" className="sebi-link" onClick={e => { e.preventDefault(); openSebiModal(); }}>SEBI Portal ↗</a></li>
                )}
            </ul>

            <div className="theme-toggle" style={{ marginLeft: '20px' }}>
                <button className={`theme-btn${theme === 'bloomberg' ? ' active' : ''}`} id="btn-bloomberg" onClick={() => theme !== 'bloomberg' && toggleTheme()}>Focus</button>
                <button className={`theme-btn${theme === 'zerodha' ? ' active' : ''}`} id="btn-zerodha" onClick={() => theme !== 'zerodha' && toggleTheme()}>Comfort</button>
            </div>

            <div className="nav-user" onClick={() => navigate('portfolio')} style={{ marginLeft: '12px' }}>
                <div className="user-avatar">{user.avatar}</div>
                <div className="user-info">
                    <div className="user-name">{user.name}</div>
                    <div className="user-balance">{formatBalance(user.balance)}</div>
                </div>
            </div>
        </nav>
    );
}
