import { useState, useEffect } from "react";

const SOURCES = [
  { label: "Salary", color: "#22c55e" },
  { label: "Freelance", color: "#3b82f6" },
  { label: "Business", color: "#a855f7" },
  { label: "Investment", color: "#f59e0b" },
  { label: "Gift", color: "#ec4899" },
  { label: "Other", color: "#6b7280" },
];

function SourceBadge({ source }) {
  const src = SOURCES.find(s => s.label === source) || SOURCES[SOURCES.length - 1];
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: "999px",
      fontSize: "0.72rem",
      fontWeight: 600,
      letterSpacing: "0.03em",
      backgroundColor: src.color + "22",
      color: src.color,
      border: `1px solid ${src.color}55`,
    }}>
      {src.label}
    </span>
  );
}

export default function TotalRecived({ token, onUnauthorized, setTotalRecived, incomeList, setIncomeList }) {
  const [newTitle, setNewTitle] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newSource, setNewSource] = useState("Salary");

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editSource, setEditSource] = useState("Salary");

  // Load income list from backend
  useEffect(() => {
    fetch("http://localhost:5000/income", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(async (res) => {
        const data = await res.json();

        if (res.status === 401) {
          onUnauthorized();
          return [];
        }

        return Array.isArray(data) ? data : [];
      })
      .then((data) => {
        setIncomeList(data);
        const total = data.reduce((sum, inc) => sum + inc.amount, 0);
        setTotalRecived(total);
      });
  }, [token, onUnauthorized, setIncomeList, setTotalRecived]);

  // Add new income
  async function addNewIncome() {
    if (!newTitle.trim() || !newAmount) return;

    const income = {
      title: newTitle,
      amount: Number(newAmount),
      source: newSource,
    };

    const res = await fetch("http://localhost:5000/income", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(income)
    });

    if (res.status === 401) {
      onUnauthorized();
      return;
    }

    const saved = await res.json();
    if (!res.ok) return;
    
    const updated = [...incomeList, saved];
    setIncomeList(updated);
    setTotalRecived(updated.reduce((sum, inc) => sum + inc.amount, 0));

    setNewTitle("");
    setNewAmount("");
    setNewSource("Salary");
  }

  function handleAddIncomeKeyDown(event) {
    if (event.key === "Enter") {
      addNewIncome();
    }
  }

  // Delete income
  async function deleteIncome(id) {
    const res = await fetch(`http://localhost:5000/income/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.status === 401) {
      onUnauthorized();
      return;
    }

    if (!res.ok) return;

    const updated = incomeList.filter(inc => inc._id !== id);
    setIncomeList(updated);
    setTotalRecived(updated.reduce((sum, inc) => sum + inc.amount, 0));
  }

  function startEdit(inc) {
    setEditingId(inc._id);
    setEditTitle(inc.title);
    setEditAmount(inc.amount);
    setEditSource(inc.source || "Other");
  }

  async function saveEdit(id) {
    const updated = {
      title: editTitle,
      amount: Number(editAmount),
      source: editSource,
    };

    const res = await fetch(`http://localhost:5000/income/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updated)
    });

    if (res.status === 401) {
      onUnauthorized();
      return;
    }

    const updatedList = incomeList.map(inc =>
      inc._id === id
        ? { ...inc, ...updated }
        : inc
    );
    setIncomeList(updatedList);
    setTotalRecived(updatedList.reduce((sum, inc) => sum + inc.amount, 0));

    setEditingId(null);
  }

  return (
    <div className="income-section">
      <h3 className="section-title">Add New Income</h3>

      <div className="expense-form">
        <input
          placeholder="Income source"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={handleAddIncomeKeyDown}
        />

        <input
          placeholder="Amount"
          type="number"
          value={newAmount}
          onChange={e => setNewAmount(e.target.value)}
          onKeyDown={handleAddIncomeKeyDown}
        />

        <select
          value={newSource}
          onChange={e => setNewSource(e.target.value)}
          style={{
            padding: "0.6rem 0.75rem",
            borderRadius: "0.6rem",
            border: "1px solid var(--border, #2a3a4a)",
            background: "var(--input-bg, #1a2a3a)",
            color: "var(--text, #e2e8f0)",
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
          {SOURCES.map(src => (
            <option key={src.label} value={src.label}>{src.label}</option>
          ))}
        </select>

        <button className="btn btn-primary" onClick={addNewIncome}>Add Income</button>
      </div>

      <ul className="expense-list">
        {incomeList.length === 0 && (
          <li style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-2)',
            fontSize: '0.95rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '2.5rem' }}>💰</span>
            <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>No income recorded</span>
            <span style={{ fontSize: '0.85rem' }}>Add your first income above</span>
          </li>
        )}
        {incomeList.map(inc => (
          <li key={inc._id} className="expense-item">
            {editingId === inc._id ? (
              <>
                <div className="edit-fields">
                  <input
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                  />
                  <input
                    type="number"
                    value={editAmount}
                    onChange={e => setEditAmount(e.target.value)}
                  />
                  <select
                    value={editSource}
                    onChange={e => setEditSource(e.target.value)}
                    style={{
                      padding: "0.5rem 0.75rem",
                      borderRadius: "0.6rem",
                      border: "1px solid var(--border, #2a3a4a)",
                      background: "var(--input-bg, #1a2a3a)",
                      color: "var(--text, #e2e8f0)",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                    }}
                  >
                    {SOURCES.map(src => (
                      <option key={src.label} value={src.label}>{src.label}</option>
                    ))}
                  </select>
                </div>
                <div className="item-actions">
                  <button className="btn btn-primary" onClick={() => saveEdit(inc._id)}>Save</button>
                </div>
              </>
            ) : (
              <>
                <div className="item-main">
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span className="item-title">{inc.title}</span>
                    <SourceBadge source={inc.source || "Other"} />
                  </div>
                  <span className="item-amount">₹{inc.amount}</span>
                </div>
                <div className="item-actions">
                  <button className="btn btn-secondary" onClick={() => startEdit(inc)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => deleteIncome(inc._id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
