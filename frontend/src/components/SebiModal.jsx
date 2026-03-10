import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function SebiModal() {
    const { sebiModalOpen, closeSebiModal, navigate, setSebiOfficerName, setIsLoggedIn, setUserType } = useApp();
    const [officerId, setOfficerId] = useState('');
    const [passphrase, setPassphrase] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    function handleOverlayClick(e) {
        if (e.target === e.currentTarget) closeSebiModal();
    }

    async function handleLogin() {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:5000/api/sebi/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ officerId, passphrase, otp })
            });
            const data = await res.json();
            if (res.ok) {
                setSebiOfficerName(data.officerName || 'SEBI Officer');
                setIsLoggedIn(true);
                setUserType('sebi');
                closeSebiModal();
                navigate('sebi');
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Failed to connect to the server');
        } finally {
            setLoading(false);
        }
    }

    if (!sebiModalOpen) return null;

    return (
        <div className="modal-overlay open" id="sebiModal" onClick={handleOverlayClick}>
            <div className="sebi-modal-box">
                <button className="modal-close" onClick={closeSebiModal}>✕</button>
                <div className="sebi-badge">🏛 SEBI OFFICIAL PORTAL</div>
                <div className="sebi-title">Regulator Login</div>
                <div className="sebi-sub">Access the immutable trade audit dashboard. All settlements verified on-chain.</div>
                {error && <div style={{ color: '#ef4444', marginBottom: '15px', fontSize: '0.9rem', padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px' }}>{error}</div>}
                <div className="form-group">
                    <label className="form-label">SEBI Officer ID</label>
                    <input className="form-input" placeholder="e.g. SEBI/MUM/2024/0042" value={officerId} onChange={e => setOfficerId(e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="form-label">Secure Passphrase</label>
                    <input className="form-input" type="password" placeholder="••••••••••••" value={passphrase} onChange={e => setPassphrase(e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="form-label">OTP (sent to registered mobile)</label>
                    <input className="form-input" placeholder="6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} />
                </div>
                <button className="btn-full" onClick={handleLogin} disabled={loading}>{loading ? 'Authenticating...' : 'Access Audit Dashboard →'}</button>
            </div>
        </div>
    );
}
