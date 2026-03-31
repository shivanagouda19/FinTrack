import { useState, useEffect } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000';

export default function VerifyEmail() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = location.state?.email || searchParams.get('email') || sessionStorage.getItem('verifyEmail') || '';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) { setError('Please enter a valid 6-digit OTP'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setVerified(true);
      setMessage(data.message);
      sessionStorage.removeItem('verifyEmail');
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const handleResend = async () => {
    setResending(true); setError(''); setMessage('');
    try {
      const res = await fetch(`${API}/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessage('New OTP sent to your email!');
    } catch (e) { setError(e.message); }
    setResending(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      height: '100%',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--bg)',
      overflow: 'hidden',
      position: 'fixed',
      width: '100%',
      top: 0,
      left: 0
    }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '40px' }}>
        {verified ? (
          <>
            <div className="auth-icon">✅</div>
            <h2 style={{ textAlign: 'center', marginBottom: '12px' }}>Email Verified!</h2>
            <p className="auth-success">{message}</p>
            <button className="btn" onClick={() => navigate('/')} style={{ width: '100%' }}>Go to Login</button>
          </>
        ) : (
          <>
            <div className="auth-icon">📧</div>
            <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Verify Your Email</h2>
            <p className="auth-subtitle" style={{ textAlign: 'center' }}>We sent a 6-digit OTP to <strong>{email}</strong>. Enter it below.</p>
            {error && <div style={{ padding: '12px', borderRadius: '8px', background: '#fee2e2', color: '#dc2626', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}
            {message && <div className="auth-success">{message}</div>}
            <input
              className="otp-input"
              type="text"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              style={{ marginBottom: '16px' }}
            />
            <button className="btn" onClick={handleVerify} disabled={loading} style={{ width: '100%', marginBottom: '12px' }}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button className="auth-link-btn" onClick={handleResend} disabled={resending} style={{ width: '100%' }}>
              {resending ? 'Sending...' : "Didn't receive OTP? Resend"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
