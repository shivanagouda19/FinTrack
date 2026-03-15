import { useState, useEffect } from "react";

export default function TotalRecived({
  token,
  onUnauthorized,
  setTotalRecived
}) {
  const [input, setInput] = useState("");

  // load received amount from backend on refresh
  useEffect(() => {
    fetch("http://localhost:5000/received", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(async (res) => {
        const data = await res.json();

        if (res.status === 401) {
          onUnauthorized();
          return { totalReceived: 0 };
        }

        return data;
      })
      .then((data) => setTotalRecived(data.totalReceived || 0));
  }, [token, onUnauthorized, setTotalRecived]);

  // save to backend
  async function addAmount() {
    if (!input) return;

    const res = await fetch("http://localhost:5000/received", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ amount: Number(input) })
    });

    if (res.status === 401) {
      onUnauthorized();
      return;
    }

    const data = await res.json();
    if (!res.ok) return;
    setTotalRecived(data.totalReceived);
    setInput("");
  }

  function handleReceivedKeyDown(event) {
    if (event.key === "Enter") {
      addAmount();
    }
  }

  return (
    <div className="income-section">
      <h3 className="section-title">Amount Received</h3>

      <div className="income-form">
        <input
          type="number"
          placeholder="Enter Amount Received"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleReceivedKeyDown}
        />

        <button className="btn btn-primary" onClick={addAmount}>
          Add Received Amount
        </button>
      </div>
    </div>
  );
}
