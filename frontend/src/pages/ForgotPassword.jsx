import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email'); return;
    }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessage(data.message);
      setSent(true);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '40px' }}>
        <h2 style={{ marginBottom: '8px' }}>Forgot Password</h2>
        <p className="auth-subtitle">Enter your email and we'll send you a reset link.</p>
        {sent ? (
          <>
            <div className="auth-icon">📧</div>
            <p className="auth-success">{message}</p>
            <button className="btn" onClick={() => navigate('/')}>Back to Login</button>
          </>
        ) : (
          <>
            {error && <div style={{ padding: '12px', borderRadius: '8px', background: '#fee2e2', color: '#dc2626', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}
            <input 
              type="email" 
              placeholder="Your email address" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              style={{ marginBottom: '16px' }}
            />
            <button className="btn" onClick={handleSubmit} disabled={loading} style={{ width: '100%', marginBottom: '12px' }}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button className="auth-link-btn" onClick={() => navigate('/')}>Back to Login</button>
          </>
        )}
      </div>
    </div>
  );
}
