import { useState, useEffect } from 'react';

const API = 'http://localhost:5000';

export default function Investments() {
  const [tab, setTab] = useState('portfolio');
  const [holdings, setHoldings] = useState([]);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchHoldings = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/angel/holdings`, { headers });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setHoldings(Array.isArray(data) ? data : []);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const fetchTrades = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/angel/trades`, { headers });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTrades(Array.isArray(data) ? data : []);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => {
    if (tab === 'portfolio') fetchHoldings();
    else fetchTrades();
  }, [tab]);

  const importTrades = async () => {
    setImporting(true); setImportMsg('');
    try {
      const res = await fetch(`${API}/angel/import-trades`, { method: 'POST', headers });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setImportMsg(`✅ Imported ${data.imported} trade(s) to your records!`);
    } catch (e) { setImportMsg(`❌ ${e.message}`); }
    setImporting(false);
  };

  const totalInvested = holdings.reduce((s, h) => s + parseFloat(h.quantity || 0) * parseFloat(h.averageprice || 0), 0);
  const totalCurrent = holdings.reduce((s, h) => s + parseFloat(h.quantity || 0) * parseFloat(h.ltp || 0), 0);
  const totalPnL = totalCurrent - totalInvested;

  return (
    <div className="investments-page">
      <h2 className="page-title">📈 Investments</h2>
      <p className="page-subtitle">Angel One portfolio via SmartAPI</p>

      {tab === 'portfolio' && holdings.length > 0 && (
        <div className="inv-summary">
          <div className="inv-card">
            <span>Invested</span>
            <strong>₹{totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong>
          </div>
          <div className="inv-card">
            <span>Current Value</span>
            <strong>₹{totalCurrent.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong>
          </div>
          <div className={`inv-card ${totalPnL >= 0 ? 'gain' : 'loss'}`}>
            <span>Total P&L</span>
            <strong>{totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong>
          </div>
        </div>
      )}

      <div className="inv-tabs">
        <button className={tab === 'portfolio' ? 'active' : ''} onClick={() => setTab('portfolio')}>Portfolio</button>
        <button className={tab === 'trades' ? 'active' : ''} onClick={() => setTab('trades')}>Today's Trades</button>
      </div>

      {tab === 'trades' && (
        <div className="inv-import-row">
          <button className="import-btn" onClick={importTrades} disabled={importing}>
            {importing ? 'Importing...' : '⬇ Import Trades to Records'}
          </button>
          {importMsg && <span className="import-msg">{importMsg}</span>}
        </div>
      )}

      {error && <div className="inv-error">⚠️ {error}</div>}
      {loading && <div className="inv-loading">Loading...</div>}

      {tab === 'portfolio' && !loading && (
        <div className="inv-table-wrap">
          {holdings.length === 0 ? (
            <p className="inv-empty">No holdings found.</p>
          ) : (
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Stock</th><th>Qty</th><th>Avg Price</th><th>LTP</th><th>Current Value</th><th>P&L</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h, i) => {
                  const invested = parseFloat(h.quantity) * parseFloat(h.averageprice);
                  const current = parseFloat(h.quantity) * parseFloat(h.ltp);
                  const pnl = current - invested;
                  return (
                    <tr key={i}>
                      <td><strong>{h.tradingsymbol}</strong><br /><small>{h.exchange}</small></td>
                      <td>{h.quantity}</td>
                      <td>₹{parseFloat(h.averageprice).toFixed(2)}</td>
                      <td>₹{parseFloat(h.ltp).toFixed(2)}</td>
                      <td>₹{current.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td className={pnl >= 0 ? 'gain' : 'loss'}>
                        {pnl >= 0 ? '+' : ''}₹{pnl.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'trades' && !loading && (
        <div className="inv-table-wrap">
          {trades.length === 0 ? (
            <p className="inv-empty">No trades today.</p>
          ) : (
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Stock</th><th>Type</th><th>Qty</th><th>Price</th><th>Value</th><th>Time</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t, i) => (
                  <tr key={i}>
                    <td><strong>{t.tradingsymbol}</strong><br /><small>{t.exchange}</small></td>
                    <td><span className={`badge ${t.transactiontype === 'BUY' ? 'badge-buy' : 'badge-sell'}`}>{t.transactiontype}</span></td>
                    <td>{t.quantity}</td>
                    <td>₹{parseFloat(t.tradeprice).toFixed(2)}</td>
                    <td>₹{(parseFloat(t.quantity) * parseFloat(t.tradeprice)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    <td>{t.updatetime || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
