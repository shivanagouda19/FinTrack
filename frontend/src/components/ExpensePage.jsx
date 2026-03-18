import Expense from '../Expense';

function ExpensePage({ token, onUnauthorized, expenses, setExpenses }) {
  return (
    <div className="app">
      <header className="app-header dashboard-header">
        <h1>Expenses</h1>
        <p>Track and manage your expenses</p>
      </header>

      <section className="dashboard-section">
        <div className="card panel-expense">
          <Expense
            token={token}
            onUnauthorized={onUnauthorized}
            expenses={expenses}
            setExpenses={setExpenses}
          />
        </div>
      </section>
    </div>
  );
}

export default ExpensePage;
