import { NavLink } from 'react-router-dom';

const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

function Sidebar({ onLogout, theme, toggleTheme }) {
  return (
    <div className="sidebar">
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: '1.3rem', 
          fontWeight: 700, 
          color: 'var(--text-1)',
          letterSpacing: '-0.02em'
        }}>
          Expense Tracker
        </h2>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        <NavLink to="/" className="nav-link" end>
          <span>📊</span>
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/expenses" className="nav-link">
          <span>💸</span>
          <span>Expenses</span>
        </NavLink>
        <NavLink to="/income" className="nav-link">
          <span>💰</span>
          <span>Income</span>
        </NavLink>
        <NavLink to="/upcoming" className="nav-link">
          <span>📅</span>
          <span>Upcoming</span>
        </NavLink>
      </nav>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
        <button 
          className="btn btn-secondary" 
          onClick={toggleTheme}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          {theme === "dark" ? "Light" : "Dark"}
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={onLogout}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <LogoutIcon /> Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
