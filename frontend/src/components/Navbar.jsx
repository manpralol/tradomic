import React from 'react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
    const { navigate, toggleTheme, theme, currentPage, user, openSebiModal, isLoggedIn, userType, logout } = useApp();

    function formatBalance(n) {
        return '₹' + n.toLocaleString('en-IN');
    }

    return (
        <nav>
            <a className="nav-logo" href="#" onClick={e => { e.preventDefault(); navigate('home'); }}>
                <div className="logo-mark">T⚡</div>
                <span className="logo-text">Trado<span>mic</span></span>
            </a>
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
                    <li><a href="#" className="sebi-link" onClick={e => { e.preventDefault(); openSebiModal(); }}>SEBI Official ↗</a></li>
                )}
            </ul>

            <div className="theme-toggle" style={{ marginLeft: '20px' }}>
                <button
                    className={`theme-btn${theme === 'bloomberg' ? ' active' : ''}`}
                    id="btn-bloomberg"
                    onClick={() => theme !== 'bloomberg' && toggleTheme()}
                >Focus</button>
                <button
                    className={`theme-btn${theme === 'zerodha' ? ' active' : ''}`}
                    id="btn-zerodha"
                    onClick={() => theme !== 'zerodha' && toggleTheme()}
                >Comfort</button>
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
