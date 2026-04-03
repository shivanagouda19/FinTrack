import { useState } from 'react';
import { Bot } from 'lucide-react';
const typeStyles = {
  warning: { color: '#ef4444', bg: '#ef444415', border: '#ef444430' },
  good: { color: '#22c55e', bg: '#22c55e15', border: '#22c55e30' },
  tip: { color: '#3b82f6', bg: '#3b82f615', border: '#3b82f630' }
};

export default function AIInsights({ token, expenses, totalReceived, totalSpent }) {
  const [insights, setInsights] = useState([]);
  const [rawInsight, setRawInsight] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);

  async function handleRefresh() {
    console.log('Refresh button clicked!');
    setIsLoading(true);
    setError('');

    const endpoint = '/api/ai/insights';
    console.log('Fetching from:', '/api/ai/insights');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ expenses, totalReceived, totalSpent })
      });

      const data = await response.json();
      console.log('Final Data Received:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch insights');
      }

      const text = data.insight || '';

      try {
        const parsedData = JSON.parse(text.replace(/```json|```/g, '').trim());
        const parsedInsights = Array.isArray(parsedData?.insights)
          ? parsedData.insights
          : Array.isArray(parsedData?.insight)
            ? parsedData.insight
            : typeof parsedData?.insight === 'string'
              ? [parsedData.insight]
              : Array.isArray(parsedData)
                ? parsedData
                : [];

        if (parsedInsights.length > 0) {
          setInsights(parsedInsights);
          setRawInsight('');
        } else {
          setInsights([]);
          setRawInsight(text);
        }
      } catch {
        setInsights([]);
        setRawInsight(text);
      }

      setHasLoaded(true);
    } catch (err) {
      console.error('Frontend Fetch Error:', err);
      setError('Could not generate insights. Please try again.');
    } finally {
      setIsLoading(false);
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
          <h3
  style={{
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: "0 0 8px",
    color: "var(--text-1)",
    fontSize: "1.15rem",
    fontWeight: 700,
    letterSpacing: "0.3px",
    lineHeight: 1.2
  }}
>
  <Bot size={24} style={{ color: "var(--accent-1)" }} />
  AI Budget Advisor
</h3>
          <p style={{ margin: 0, color: 'var(--text-2)', fontSize: '0.85rem' }}>
            Get personalized insights based on your spending
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleRefresh}
          disabled={isLoading || expenses.length === 0}
          style={{ minWidth: '140px' }}
        >
          {isLoading ? '⏳ Analyzing...' : hasLoaded ? '🔄 Refresh' : '✨ Get Insights'}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: '16px', padding: '12px', borderRadius: 'var(--radius-md)', background: '#ef444415', color: '#ef4444', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {expenses.length === 0 && !isLoading && (
        <div style={{ marginTop: '16px', color: 'var(--text-2)', fontSize: '0.85rem' }}>
          Add some expenses first to get AI insights!
        </div>
      )}

      {isLoading && (
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

      {!isLoading && (insights.length > 0 || rawInsight) && (
        <div style={{ marginTop: '16px' }}>
          <div style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            background: typeStyles.tip.bg,
            border: `1px solid ${typeStyles.tip.border}`,
            color: 'var(--text-1)'
          }}>
            <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '0.9rem' }}>
              Budget Report
            </p>

            {insights.length > 0 && (
              <div style={{ display: 'grid', gap: '10px' }}>
                {insights.map((item, index) => (
                  <div key={index} style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface-1)'
                  }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {insights.length === 0 && rawInsight && (
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                {rawInsight}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
