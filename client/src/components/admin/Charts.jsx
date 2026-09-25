import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AdminEmptyState } from './AdminPrimitives.jsx';

const AXIS = { stroke: '#475569', fontSize: 11 };
const GRID = '#1e293b';

export const PALETTE = ['#14b8a0', '#38bdf8', '#a78bfa', '#f59e0b', '#f472b6', '#94a3b8'];

const tooltipStyle = {
  contentStyle: {
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: 10,
    fontSize: 12,
    color: '#e2e8f0',
  },
  labelStyle: { color: '#94a3b8', marginBottom: 4 },
  cursor: { fill: 'rgba(148,163,184,0.06)' },
};

const hasData = (data, key) => data?.some((row) => Number(row[key]) > 0);

const shortDate = (value) => {
  if (typeof value !== 'string') return value;
  const parts = value.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
  if (parts.length === 2) return `${parts[1]}/${parts[0].slice(2)}`;
  return value;
};

export function VisitorTrendChart({ data = [], height = 280 }) {
  if (!hasData(data, 'views')) {
    return (
      <AdminEmptyState
        title="No visits recorded in this range"
        description="The chart fills in as people visit the site. Nothing here is simulated."
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <defs>
          <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#14b8a0" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#14b8a0" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tickFormatter={shortDate} tickLine={false} axisLine={false} {...AXIS} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} {...AXIS} />
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
        <Area
          type="monotone"
          dataKey="views"
          name="Page views"
          stroke="#14b8a0"
          strokeWidth={2}
          fill="url(#viewsGradient)"
        />
        <Area
          type="monotone"
          dataKey="visitors"
          name="Unique visitors"
          stroke="#38bdf8"
          strokeWidth={2}
          fill="url(#visitorsGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function HorizontalBarChart({ data = [], height = 260, color = '#14b8a0', emptyMessage }) {
  if (!data.length) {
    return <AdminEmptyState title="No data yet" description={emptyMessage} />;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} {...AXIS} />
        <YAxis
          type="category"
          dataKey="name"
          width={130}
          tickLine={false}
          axisLine={false}
          {...AXIS}
          tickFormatter={(value) => (String(value).length > 20 ? `${String(value).slice(0, 19)}…` : value)}
        />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey="count" name="Events" fill={color} radius={[0, 4, 4, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DonutChart({ data = [], height = 240, emptyMessage }) {
  if (!data.length) {
    return <AdminEmptyState title="No data yet" description={emptyMessage} />;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="name"
          innerRadius="55%"
          outerRadius="80%"
          paddingAngle={2}
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={PALETTE[index % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
