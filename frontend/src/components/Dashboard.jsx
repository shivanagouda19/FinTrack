import DigitalClock from '../DigitalClock';
import TotalBalance from '../TotalBalance';
import TotalReceivedCard from '../TotalReceivedCard';
import TotalSpent from '../TotalSpent';
import ExpenseChart from '../ExpenseChart';

function Dashboard({ expenses, totalRecived }) {
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
    </div>
  );
}

export default Dashboard;
