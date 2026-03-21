import { useState } from 'react';

const typeStyles = {
  warning: { color: '#ef4444', bg: '#ef444415', border: '#ef444430' },
  good: { color: '#22c55e', bg: '#22c55e15', border: '#22c55e30' },
  tip: { color: '#3b82f6', bg: '#3b82f615', border: '#3b82f630' }
};

export default function AIInsights({ token, expenses, totalReceived, totalSpent }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);

  async function getInsights() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/ai/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ expenses, totalReceived, totalSpent })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInsights(data.insights);
      setHasLoaded(true);
    } catch (err) {
      setError('Could not generate insights. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      padding: '24px',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      background: 'var(--surface-1)',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: hasLoaded ? '20px' : '0' }}>
        <div>
          <h3 style={{ margin: '0 0 4px', color: 'var(--text-1)', fontSize: '1.05rem', fontWeight: 700 }}>
            🤖 AI Budget Advisor
          </h3>
          <p style={{ margin: 0, color: 'var(--text-2)', fontSize: '0.85rem' }}>
            Get personalized insights based on your spending
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={getInsights}
          disabled={loading || expenses.length === 0}
          style={{ minWidth: '140px' }}
        >
          {loading ? '⏳ Analyzing...' : hasLoaded ? '🔄 Refresh' : '✨ Get Insights'}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: '16px', padding: '12px', borderRadius: 'var(--radius-md)', background: '#ef444415', color: '#ef4444', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {expenses.length === 0 && !loading && (
        <div style={{ marginTop: '16px', color: 'var(--text-2)', fontSize: '0.85rem' }}>
          Add some expenses first to get AI insights!
        </div>
      )}

      {loading && (
        <div style={{ marginTop: '20px', display: 'grid', gap: '12px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{
              height: '56px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface-2)',
              animation: 'pulse 1.5s ease-in-out infinite',
              opacity: 0.7
            }} />
          ))}
        </div>
      )}

      {!loading && insights.length > 0 && (
        <div style={{ display: 'grid', gap: '12px', marginTop: '4px' }}>
          {insights.map((insight, i) => {
            const style = typeStyles[insight.type] || typeStyles.tip;
            return (
              <div key={i} style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                background: style.bg,
                border: `1px solid ${style.border}`,
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{insight.icon}</span>
                <span style={{ color: 'var(--text-1)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  {insight.message}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
