import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function CalendarPage({ token, onUnauthorized }) {
  const [payments, setPayments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPayments, setSelectedPayments] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/upcoming', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) { onUnauthorized(); return []; }
        return res.json();
      })
      .then(data => Array.isArray(data) && setPayments(data));
  }, [token, onUnauthorized]);

  function isSameDay(d1, d2) {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  function onDateClick(date) {
    setSelectedDate(date);
    const found = payments.filter(p => isSameDay(new Date(p.dueDate), date));
    setSelectedPayments(found);
  }

  function tileContent({ date, view }) {
    if (view !== 'month') return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayPayments = payments.filter(p => isSameDay(new Date(p.dueDate), date));
    if (dayPayments.length === 0) return null;

    const hasOverdue = dayPayments.some(p => {
      const due = new Date(p.dueDate);
      due.setHours(0, 0, 0, 0);
      return p.status === 'Pending' && due < today;
    });
    const hasPending = dayPayments.some(p => p.status === 'Pending');

    const dotColor = hasOverdue ? '#ef4444' : hasPending ? '#f97316' : '#22c55e';

    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2px' }}>
        <div style={{
          width: '6px', height: '6px',
          borderRadius: '50%',
          background: dotColor
        }} />
      </div>
    );
  }

  function tileClassName({ date, view }) {
    if (view !== 'month') return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayPayments = payments.filter(p =>
      isSameDay(new Date(p.dueDate), date) && p.status === 'Pending'
    );
    if (dayPayments.length === 0) return null;
    const due = new Date(date);
    due.setHours(0, 0, 0, 0);
    return due < today ? 'overdue-day' : 'pending-day';
  }

  const typeColor = { Bill: '#3b82f6', Debt: '#a855f7' };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-1)', margin: '0 0 6px' }}>
        Calendar
      </h1>
      <p style={{ color: 'var(--text-2)', marginBottom: '24px' }}>
        View upcoming payments by date
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Calendar */}
        <div className="card" style={{ padding: '20px' }}>
          <style>{`
            .react-calendar {
              width: 100%;
              background: transparent;
              border: none;
              font-family: inherit;
              color: var(--text-1);
            }
            .react-calendar__navigation button {
              color: var(--text-1);
              background: transparent;
              border: none;
              font-size: 1rem;
              font-weight: 600;
              cursor: pointer;
              padding: 8px;
              border-radius: var(--radius-md);
              min-width: 44px;
            }
            .react-calendar__navigation button:hover,
            .react-calendar__navigation button:focus {
              background: var(--surface-2) !important;
              color: var(--text-1) !important;
            }
            .react-calendar__navigation button:disabled {
              background: transparent !important;
            }
            .react-calendar__month-view__weekdays {
              color: var(--text-2);
              font-size: 0.8rem;
              text-transform: uppercase;
            }
            .react-calendar__month-view__weekdays abbr {
              text-decoration: none;
            }
            .react-calendar__tile {
              background: transparent !important;
              border: none;
              color: var(--text-1);
              padding: 10px 4px;
              border-radius: var(--radius-md);
              cursor: pointer;
              font-size: 0.88rem;
            }
            .react-calendar__tile:hover {
              background: var(--surface-2) !important;
              color: var(--text-1) !important;
            }
            .react-calendar__tile:focus {
              background: var(--surface-2) !important;
              color: var(--text-1) !important;
              outline: none;
            }
            .react-calendar__tile--active {
              background: var(--accent) !important;
              color: white !important;
              font-weight: 700;
            }
            .react-calendar__tile--active:hover {
              background: var(--accent) !important;
              color: white !important;
            }
            .react-calendar__tile--now {
              background: var(--surface-2) !important;
              font-weight: 700;
              color: var(--text-1) !important;
            }
            .react-calendar__tile--now:hover {
              background: var(--surface-2) !important;
              color: var(--text-1) !important;
            }
            .react-calendar__tile--now.react-calendar__tile--active {
              background: var(--accent) !important;
              color: white !important;
            }
            .overdue-day {
              background: #ef444415 !important;
              color: var(--text-1) !important;
            }
            .overdue-day:hover {
              background: #ef444425 !important;
              color: var(--text-1) !important;
            }
            .pending-day {
              background: #f9731615 !important;
              color: var(--text-1) !important;
            }
            .pending-day:hover {
              background: #f9731625 !important;
              color: var(--text-1) !important;
            }
            .react-calendar__tile--active,
            .react-calendar__tile--active:hover,
            .react-calendar__tile--active:focus,
            .react-calendar__tile--active.overdue-day,
            .react-calendar__tile--active.pending-day,
            .react-calendar__tile--active.react-calendar__tile--now {
              background: var(--accent) !important;
              color: white !important;
              font-weight: 700;
            }
            .react-calendar__tile--hasActive,
            .react-calendar__tile--hasActive:hover {
              background: var(--accent) !important;
              color: white !important;
            }
          `}</style>
          <Calendar
            onChange={onDateClick}
            value={selectedDate}
            tileContent={tileContent}
            tileClassName={tileClassName}
          />

          {/* Legend */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            {[['#ef4444', 'Overdue'], ['#f97316', 'Pending'], ['#22c55e', 'Paid']].map(([color, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected day payments */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px', color: 'var(--text-1)', fontSize: '1rem', fontWeight: 700 }}>
            {selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </h3>

          {selectedPayments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-2)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📭</div>
              <p style={{ fontSize: '0.9rem' }}>No payments on this day</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {selectedPayments.map(p => {
                const isOverdue = p.status === 'Pending' && new Date(p.dueDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
                const statusLabel = isOverdue ? 'Overdue' : p.status;
                const statusColor = isOverdue ? '#ef4444' : p.status === 'Paid' ? '#22c55e' : '#f97316';
                const borderColor = p.status === 'Paid' ? '#22c55e' : isOverdue ? '#ef4444' : '#f97316';
                
                return (
                  <div key={p._id} style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--surface-2)',
                    borderLeft: `3px solid ${borderColor}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{p.name}</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>₹{p.amount}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '999px', background: typeColor[p.type] + '22', color: typeColor[p.type], border: `1px solid ${typeColor[p.type]}55` }}>{p.type}</span>
                      <span style={{ 
                        fontSize: '0.75rem', padding: '2px 8px', borderRadius: '999px', 
                        background: statusColor + '22', 
                        color: statusColor, 
                        border: `1px solid ${statusColor}55` 
                      }}>
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
