import TotalRecived from '../TotalRecived';

function IncomePage({ token, onUnauthorized, setTotalRecived }) {
  return (
    <div className="app">
      <header className="app-header dashboard-header">
        <h1>Income</h1>
        <p>Track your income and earnings</p>
      </header>

      <section className="dashboard-section">
        <div className="card panel-income">
          <TotalRecived
            token={token}
            onUnauthorized={onUnauthorized}
            setTotalRecived={setTotalRecived}
          />
        </div>
      </section>
    </div>
  );
}

export default IncomePage;
