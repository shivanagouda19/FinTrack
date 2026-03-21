import DigitalClock from '../DigitalClock';
import TotalBalance from '../TotalBalance';
import TotalReceivedCard from '../TotalReceivedCard';
import TotalSpent from '../TotalSpent';
import ExpenseChart from '../ExpenseChart';
import AIInsights from './AIInsights';

function Dashboard({ expenses, totalRecived, token }) {
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  return (
    <div className="app">
      <header className="app-header dashboard-header">
        <h1>Dashboard</h1>
        <p>Financial overview — income, spending & net balance</p>
        <DigitalClock />
      </header>

      <section className="summary-section">
        <p className="section-kicker">Overview</p>
        <div className="summary-grid">
          <TotalSpent expenses={expenses} />
          <TotalReceivedCard totalRecived={totalRecived} />
          <TotalBalance expenses={expenses} totalRecived={totalRecived} />
        </div>
      </section>

      <ExpenseChart expenses={expenses} />

      <AIInsights
        token={token}
        expenses={expenses}
        totalReceived={totalRecived}
        totalSpent={totalSpent}
      />
    </div>
  );
}

export default Dashboard;
