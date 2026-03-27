import { useState } from 'react';

export default function BankImporter({ token, onImport, onClose }) {
  const [statement, setStatement] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState([]);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  async function parseStatement() {
    if (!statement.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/ai/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ statement })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.transactions.length === 0) {
        setError('No expenses found in the statement. Try pasting more transaction details.');
        setLoading(false);
        return;
      }
      setParsed(data.transactions);
      setSelected(data.transactions.map((_, i) => i));
      setStep(2);
    } catch (err) {
      setError('Could not parse statement. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function importSelected() {
    const toImport = parsed.filter((_, i) => selected.includes(i));
    if (toImport.length === 0) return;
    setLoading(true);
    try {
      const results = await Promise.all(
        toImport.map(t =>
          fetch('http://localhost:5000/expenses', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ title: t.title, amount: t.amount, category: t.category })
          }).then(r => r.json())
        )
      );
      onImport(results);
      onClose();
    } catch {
      setError('Could not import expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(i) {
    setSelected(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    );
  }

  const CATEGORY_COLORS = {
    Food: '#f97316', Travel: '#3b82f6', Shopping: '#a855f7',
    Bills: '#ef4444', Health: '#22c55e', Other: '#6b7280'
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 999, padding: '20px'
    }}>
      <div style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px',
        width: '100%',
        maxWidth: '580px',
        maxHeight: '85vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: '0 0 4px', color: 'var(--text-1)', fontSize: '1.2rem', fontWeight: 700 }}>
              📄 Import Bank Statement
            </h2>
            <p style={{ margin: 0, color: 'var(--text-2)', fontSize: '0.85rem' }}>
              {step === 1 ? 'Paste your bank SMS or statement text' : `Found ${parsed.length} transactions — select which to import`}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-2)', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        {/* Step 1 — Paste statement */}
        {step === 1 && (
          <>
            <div style={{ marginBottom: '8px', color: 'var(--text-2)', fontSize: '0.82rem' }}>
              💡 Tip: Paste multiple SMS messages, mini statement text, or any bank transaction text
            </div>
            <textarea
              value={statement}
              onChange={e => setStatement(e.target.value)}
              placeholder={`Example:\nUPI/DR/123456/SWIGGY/HDFC/450\nUPI/DR/789012/AMAZON/ICICI/1299\nATM WDL 2000 SBI BANK\nNEFT/CR/SALARY - skip this\nUPI/DR/345678/PETROL PUMP/500`}
              style={{
                width: '100%',
                minHeight: '200px',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--surface-2)',
                color: 'var(--text-1)',
                fontSize: '0.85rem',
                resize: 'vertical',
                fontFamily: 'monospace',
                boxSizing: 'border-box'
              }}
            />
            {error && (
              <div style={{ marginTop: '8px', color: '#ef4444', fontSize: '0.85rem' }}>{error}</div>
            )}
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
              <button
                className="btn btn-primary"
                style={{ flex: 2 }}
                onClick={parseStatement}
                disabled={loading || !statement.trim()}
              >
                {loading ? '⏳ Analyzing...' : '🤖 Parse with AI'}
              </button>
            </div>
          </>
        )}

        {/* Step 2 — Review transactions */}
        {step === 2 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <button
                onClick={() => setSelected(parsed.map((_, i) => i))}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}
              >
                Select All
              </button>
              <button
                onClick={() => setSelected([])}
                style={{ background: 'none', border: 'none', color: 'var(--text-2)', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Deselect All
              </button>
            </div>

            <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
              {parsed.map((t, i) => {
                const color = CATEGORY_COLORS[t.category] || '#6b7280';
                const isSelected = selected.includes(i);
                return (
                  <div
                    key={i}
                    onClick={() => toggleSelect(i)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                      background: isSelected ? '#00897b15' : 'var(--surface-2)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '4px',
                        border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                        background: isSelected ? 'var(--accent)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {isSelected && <span style={{ color: 'white', fontSize: '0.7rem', fontWeight: 700 }}>✓</span>}
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-1)', fontWeight: 600, fontSize: '0.9rem' }}>{t.title}</div>
                        <span style={{
                          fontSize: '0.72rem', padding: '1px 7px', borderRadius: '999px',
                          background: color + '22', color, border: `1px solid ${color}44`
                        }}>
                          {t.category}
                        </span>
                      </div>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--text-1)', fontSize: '0.95rem' }}>₹{t.amount}</span>
                  </div>
                );
              })}
            </div>

            {error && (
              <div style={{ marginBottom: '12px', color: '#ef4444', fontSize: '0.85rem' }}>{error}</div>
            )}

            <div style={{
              padding: '12px 16px', borderRadius: 'var(--radius-md)',
              background: 'var(--surface-2)', marginBottom: '16px',
              display: 'flex', justifyContent: 'space-between'
            }}>
              <span style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>
                {selected.length} of {parsed.length} selected
              </span>
              <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>
                Total: ₹{parsed.filter((_, i) => selected.includes(i)).reduce((s, t) => s + t.amount, 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setStep(1); setParsed([]); setSelected([]); setError(''); }}>
                ← Back
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 2 }}
                onClick={importSelected}
                disabled={loading || selected.length === 0}
              >
                {loading ? '⏳ Importing...' : `⬇ Import ${selected.length} Expenses`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
