import { useState, useEffect } from "react";

const CATEGORIES = [
  { label: "Food", color: "#f97316" },
  { label: "Travel", color: "#3b82f6" },
  { label: "Shopping", color: "#a855f7" },
  { label: "Bills", color: "#ef4444" },
  { label: "Health", color: "#22c55e" },
  { label: "Other", color: "#6b7280" },
];

function CategoryBadge({ category }) {
  const cat = CATEGORIES.find(c => c.label === category) || CATEGORIES[CATEGORIES.length - 1];
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: "999px",
      fontSize: "0.72rem",
      fontWeight: 600,
      letterSpacing: "0.03em",
      backgroundColor: cat.color + "22",
      color: cat.color,
      border: `1px solid ${cat.color}55`,
    }}>
      {cat.label}
    </span>
  );
}

export default function Expense({ token, onUnauthorized, expenses, setExpenses }) {

  const [newTitle, setNewTitle] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState("Food");

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("Food");

  // load expenses from backend
  useEffect(() => {
    fetch("http://localhost:5000/expenses", {
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
      .then((data) => setExpenses(data));
  }, [token, onUnauthorized]);

  // add expense to backend
  async function addNewExpense() {
    if (!newTitle.trim() || !newAmount) return;

    const expense = {
      title: newTitle,
      amount: Number(newAmount),
      category: newCategory,
    };

    const res = await fetch("http://localhost:5000/expenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(expense)
    });

    if (res.status === 401) {
      onUnauthorized();
      return;
    }

    const saved = await res.json();
    if (!res.ok) return;
    setExpenses(prev => [...prev, saved]);

    setNewTitle("");
    setNewAmount("");
    setNewCategory("Food");
  }

  function handleAddExpenseKeyDown(event) {
    if (event.key === "Enter") {
      addNewExpense();
    }
  }

  // delete from backend
  async function deleteExpense(id) {
    const res = await fetch(`http://localhost:5000/expenses/${id}`, {
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

    setExpenses(prev => prev.filter(exp => exp._id !== id));
  }

  function startEdit(exp) {
    setEditingId(exp._id);
    setEditTitle(exp.title);
    setEditAmount(exp.amount);
    setEditCategory(exp.category || "Other");
  }

  async function saveEdit(id) {
    const updated = {
      title: editTitle,
      amount: Number(editAmount),
      category: editCategory,
    };

    const res = await fetch(`http://localhost:5000/expenses/${id}`, {
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

    setExpenses(prev =>
      prev.map(exp =>
        exp._id === id
          ? { ...exp, ...updated }
          : exp
      )
    );

    setEditingId(null);
  }

  return (
    <div className="expense-section">
      <h3 className="section-title">Add New Expense</h3>

      <div className="expense-form">
        <input
          placeholder="Expense name"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={handleAddExpenseKeyDown}
        />

        <input
          placeholder="Amount"
          type="number"
          value={newAmount}
          onChange={e => setNewAmount(e.target.value)}
          onKeyDown={handleAddExpenseKeyDown}
        />

        <select
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
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
          {CATEGORIES.map(cat => (
            <option key={cat.label} value={cat.label}>{cat.label}</option>
          ))}
        </select>

        <button className="btn btn-primary" onClick={addNewExpense}>Add Expense</button>
      </div>

      <ul className="expense-list">
        {expenses.map(exp => (
          <li key={exp._id} className="expense-item">
            {editingId === exp._id ? (
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
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
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
                    {CATEGORIES.map(cat => (
                      <option key={cat.label} value={cat.label}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="item-actions">
                  <button className="btn btn-primary" onClick={() => saveEdit(exp._id)}>Save</button>
                </div>
              </>
            ) : (
              <>
                <div className="item-main">
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span className="item-title">{exp.title}</span>
                    <CategoryBadge category={exp.category || "Other"} />
                  </div>
                  <span className="item-amount">₹{exp.amount}</span>
                </div>
                <div className="item-actions">
                  <button className="btn btn-secondary" onClick={() => startEdit(exp)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => deleteExpense(exp._id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}