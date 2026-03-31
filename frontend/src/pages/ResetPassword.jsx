import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const handleSubmit = async () => {
    const errs = {};
    if (!form.newPassword || form.newPassword.length < 6) errs.newPassword = 'Password must be at least 6 characters';
    if (form.newPassword !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true); setErrors({});
    try {
      const res = await fetch(`${API}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessage(data.message);
      setDone(true);
    } catch (e) { setErrors({ general: e.message }); }
    setLoading(false);
  };

  if (!token) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '40px', textAlign: 'center' }}>
        <h2>Invalid Link</h2>
        <p style={{ color: 'var(--text-2)', marginBottom: '24px' }}>This reset link is invalid.</p>
        <button className="btn" onClick={() => navigate('/')}>Back to Login</button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '40px' }}>
        {done ? (
          <>
            <div className="auth-icon">✅</div>
            <h2 style={{ marginBottom: '12px', textAlign: 'center' }}>Password Reset!</h2>
            <p className="auth-success">{message}</p>
            <button className="btn" onClick={() => navigate('/')} style={{ width: '100%' }}>Go to Login</button>
          </>
        ) : (
          <>
            <h2 style={{ marginBottom: '8px' }}>Reset Password</h2>
            <p className="auth-subtitle">Enter your new password below.</p>
            {errors.general && <div style={{ padding: '12px', borderRadius: '8px', background: '#fee2e2', color: '#dc2626', marginBottom: '16px', fontSize: '0.9rem' }}>{errors.general}</div>}
            <div style={{ marginBottom: '12px' }}>
              <input 
                type="password" 
                placeholder="New password" 
                value={form.newPassword} 
                onChange={e => setForm({...form, newPassword: e.target.value})}
              />
              {errors.newPassword && <span className="field-error">{errors.newPassword}</span>}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <input 
                type="password" 
                placeholder="Confirm new password" 
                value={form.confirmPassword} 
                onChange={e => setForm({...form, confirmPassword: e.target.value})}
              />
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>
            <button className="btn" onClick={handleSubmit} disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
