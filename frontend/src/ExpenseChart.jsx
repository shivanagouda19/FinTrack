import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

const CATEGORY_COLORS = {
  Food: '#f97316',
  Travel: '#3b82f6',
  Shopping: '#a855f7',
  Bills: '#ef4444',
  Health: '#22c55e',
  Other: '#6b7280'
};

function ExpenseChart({ expenses }) {
  if (!expenses || expenses.length === 0) {
    return (
      <div style={{
        padding: '24px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        background: 'var(--surface-1)',
        textAlign: 'center',
        color: 'var(--text-2)'
      }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-1)' }}>
          Spending by Category
        </h3>
        <p style={{ margin: '40px 0', fontSize: '0.92rem' }}>Add expenses to see the chart</p>
      </div>
    );
  }

  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = expense.category || 'Other';
    acc[category] = (acc[category] || 0) + (expense.amount || 0);
    return acc;
  }, {});

  const data = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));

  return (
    <div style={{
      padding: '24px',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      background: 'var(--surface-1)',
    }}>
      <h3 style={{ margin: '0 0 20px', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-1)' }}>
        Spending by Category
      </h3>

      {/* Fixed height div instead of ResponsiveContainer — fixes invisible chart bug */}
      <div style={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center' }}>
        <PieChart width={500} height={300}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={110}
            dataKey="value"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || CATEGORY_COLORS.Other} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border-hi)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-1)'
            }}
            formatter={(value) => `₹${value}`}
          />
          <Legend wrapperStyle={{ color: 'var(--text-2)' }} />
        </PieChart>
      </div>
    </div>
  );
}

export default ExpenseChart;