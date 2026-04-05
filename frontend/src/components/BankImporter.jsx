import { useState } from 'react';
import API from '../config';

export default function BankImporter({ token, onImportExpenses, onImportIncome, onClose }) {
  const [statement, setStatement] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState([]);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState('debit');

  async function parseStatement() {
    if (!statement.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/ai/import`, {
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
        setError('No transactions found. Try pasting more details.');
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

    const debits = toImport.filter(t => t.type === 'debit');
    const credits = toImport.filter(t => t.type === 'credit');

    setLoading(true);
    try {
      const [expenseResults, incomeResults] = await Promise.all([
        Promise.all(debits.map(t =>
          fetch(`${API}/expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ title: t.title, amount: t.amount, category: t.category || 'Other' })
          }).then(r => r.json())
        )),
        Promise.all(credits.map(t =>
          fetch(`${API}/income`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ title: t.title, amount: t.amount, source: t.source || 'Other' })
          }).then(r => r.json())
        ))
      ]);

      if (expenseResults.length > 0) onImportExpenses(expenseResults);
      if (incomeResults.length > 0) onImportIncome(incomeResults);
      onClose();
    } catch {
      setError('Could not import. Please try again.');
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

  const SOURCE_COLORS = {
    Salary: '#22c55e', Freelance: '#3b82f6', Business: '#a855f7',
    Investment: '#f59e0b', Gift: '#ec4899', Other: '#6b7280'
  };

  const debits = parsed.filter(t => t.type === 'debit');
  const credits = parsed.filter(t => t.type === 'credit');
  const currentList = activeTab === 'debit' ? debits : credits;

  const selectedDebits = parsed.filter((t, i) => t.type === 'debit' && selected.includes(i));
  const selectedCredits = parsed.filter((t, i) => t.type === 'credit' && selected.includes(i));

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
              {step === 1 ? 'Paste your bank SMS or statement text' : `Found ${debits.length} expenses + ${credits.length} income entries`}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-2)', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <>
            <div style={{ marginBottom: '8px', color: 'var(--text-2)', fontSize: '0.82rem' }}>
              💡 Paste bank SMS, mini statement, or any transaction text. Debits go to Expenses, Credits go to Income automatically!
            </div>
            <textarea
              value={statement}
              onChange={e => setStatement(e.target.value)}
              placeholder={`Example:\nUPI/DR/123456/SWIGGY/450 - expense\nUPI/CR/789012/SALARY/50000 - income\nATM WDL 2000 - expense\nNEFT/CR/FREELANCE/15000 - income`}
              style={{
                width: '100%', minHeight: '200px', padding: '12px',
                borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                background: 'var(--surface-2)', color: 'var(--text-1)',
                fontSize: '0.85rem', resize: 'vertical', fontFamily: 'monospace',
                boxSizing: 'border-box'
              }}
            />
            {error && <div style={{ marginTop: '8px', color: '#ef4444', fontSize: '0.85rem' }}>{error}</div>}
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
              <button
                className="btn btn-primary" style={{ flex: 2 }}
                onClick={parseStatement}
                disabled={loading || !statement.trim()}
              >
                {loading ? '⏳ Analyzing...' : '🤖 Parse with AI'}
              </button>
            </div>
          </>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                onClick={() => setActiveTab('debit')}
                style={{
                  flex: 1, padding: '8px', borderRadius: 'var(--radius-md)',
                  border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                  background: activeTab === 'debit' ? '#ef444420' : 'var(--surface-2)',
                  color: activeTab === 'debit' ? '#ef4444' : 'var(--text-2)',
                  borderBottom: activeTab === 'debit' ? '2px solid #ef4444' : '2px solid transparent'
                }}
              >
                💸 Expenses ({debits.length})
              </button>
              <button
                onClick={() => setActiveTab('credit')}
                style={{
                  flex: 1, padding: '8px', borderRadius: 'var(--radius-md)',
                  border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                  background: activeTab === 'credit' ? '#22c55e20' : 'var(--surface-2)',
                  color: activeTab === 'credit' ? '#22c55e' : 'var(--text-2)',
                  borderBottom: activeTab === 'credit' ? '2px solid #22c55e' : '2px solid transparent'
                }}
              >
                💰 Income ({credits.length})
              </button>
            </div>

            {/* Select/Deselect */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <button
                onClick={() => {
                  const currentIndices = parsed.map((t, i) => t.type === (activeTab === 'debit' ? 'debit' : 'credit') ? i : -1).filter(i => i !== -1);
                  setSelected(prev => [...new Set([...prev, ...currentIndices])]);
                }}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}
              >
                Select All
              </button>
              <button
                onClick={() => {
                  const currentIndices = parsed.map((t, i) => t.type === (activeTab === 'debit' ? 'debit' : 'credit') ? i : -1).filter(i => i !== -1);
                  setSelected(prev => prev.filter(i => !currentIndices.includes(i)));
                }}
                style={{ background: 'none', border: 'none', color: 'var(--text-2)', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Deselect All
              </button>
            </div>

            {/* Transaction list */}
            <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
              {currentList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-2)' }}>
                  No {activeTab === 'debit' ? 'expense' : 'income'} transactions found
                </div>
              ) : currentList.map((t) => {
                const globalIndex = parsed.indexOf(t);
                const isSelected = selected.includes(globalIndex);
                const color = activeTab === 'debit'
                  ? (CATEGORY_COLORS[t.category] || '#6b7280')
                  : (SOURCE_COLORS[t.source] || '#6b7280');
                const badge = activeTab === 'debit' ? t.category : t.source;

                return (
                  <div
                    key={globalIndex}
                    onClick={() => toggleSelect(globalIndex)}
                    style={{
                      padding: '12px 16px', borderRadius: 'var(--radius-md)',
                      border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                      background: isSelected ? '#00897b15' : 'var(--surface-2)',
                      cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '4px',
                        border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                        background: isSelected ? 'var(--accent)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        {isSelected && <span style={{ color: 'white', fontSize: '0.7rem', fontWeight: 700 }}>✓</span>}
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-1)', fontWeight: 600, fontSize: '0.9rem' }}>{t.title}</div>
                        <span style={{
                          fontSize: '0.72rem', padding: '1px 7px', borderRadius: '999px',
                          background: color + '22', color, border: `1px solid ${color}44`
                        }}>{badge}</span>
                      </div>
                    </div>
                    <span style={{
                      fontWeight: 700, fontSize: '0.95rem',
                      color: activeTab === 'debit' ? '#ef4444' : '#22c55e'
                    }}>
                      {activeTab === 'debit' ? '-' : '+'}₹{t.amount}
                    </span>
                  </div>
                );
              })}
            </div>

            {error && <div style={{ marginBottom: '12px', color: '#ef4444', fontSize: '0.85rem' }}>{error}</div>}

            {/* Summary */}
            <div style={{
              padding: '12px 16px', borderRadius: 'var(--radius-md)',
              background: 'var(--surface-2)', marginBottom: '16px',
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px'
            }}>
              <div>
                <span style={{ color: 'var(--text-2)', fontSize: '0.8rem' }}>Selected Expenses</span>
                <div style={{ color: '#ef4444', fontWeight: 700 }}>-₹{selectedDebits.reduce((s, t) => s + t.amount, 0).toLocaleString('en-IN')}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: 'var(--text-2)', fontSize: '0.8rem' }}>Selected Income</span>
                <div style={{ color: '#22c55e', fontWeight: 700 }}>+₹{selectedCredits.reduce((s, t) => s + t.amount, 0).toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setStep(1); setParsed([]); setSelected([]); setError(''); }}>
                ← Back
              </button>
              <button
                className="btn btn-primary" style={{ flex: 2 }}
                onClick={importSelected}
                disabled={loading || selected.length === 0}
              >
                {loading ? '⏳ Importing...' : `⬇ Import ${selected.length} Transactions`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
