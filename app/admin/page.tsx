import { getDashboardStats } from "@/lib/admin/stats";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function BarChart({ data }: { data: { month: string; revenue: number }[] }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  const width = 600;
  const height = 200;
  const barWidth = width / data.length - 24;
  const gap = 24;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {data.map((d, i) => {
        const barHeight = (d.revenue / max) * (height - 32);
        const x = i * (barWidth + gap) + gap / 2;
        const y = height - barHeight - 24;
        return (
          <g key={d.month}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={4}
              fill="#BFA15F"
              fillOpacity={0.85}
            />
            <text x={x + barWidth / 2} y={height - 4} textAnchor="middle" fontSize="10" fill="#6B6B6B">
              {d.month}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function LineChart({ data }: { data: { date: string; revenue: number }[] }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  const width = 600;
  const height = 200;
  const padding = 32;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1 || 1)) * chartWidth;
    const y = padding + chartHeight - (d.revenue / max) * chartHeight;
    return `${x},${y}`;
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <polyline
        fill="none"
        stroke="#7A3B9A"
        strokeWidth="2"
        points={points.join(" ")}
      />
      {data.map((d, i) => {
        const x = padding + (i / (data.length - 1 || 1)) * chartWidth;
        const y = padding + chartHeight - (d.revenue / max) * chartHeight;
        return (
          <g key={d.date}>
            <circle cx={x} cy={y} r="4" fill="#7A3B9A" />
            <text x={x} y={height - 8} textAnchor="middle" fontSize="9" fill="#6B6B6B" transform={`rotate(-30, ${x}, ${height - 8})`}>
              {d.date.slice(5)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    { label: "Revenue", value: formatCurrency(stats.revenue), change: "Total sales" },
    { label: "Orders", value: stats.totalOrders.toString(), change: `${stats.pendingOrders} pending` },
    { label: "Products", value: stats.totalProducts.toString(), change: `${stats.activeProducts} active` },
    { label: "Low Stock", value: stats.lowStock.toString(), change: "Need attention" },
    { label: "Subscribers", value: stats.totalSubscribers.toString(), change: "Email list" },
    { label: "Journal Posts", value: stats.totalPosts.toString(), change: "Published" },
    { label: "Admins", value: stats.totalAdmins.toString(), change: "Team members" },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif-display text-ink text-3xl font-medium">Dashboard</h1>
        <p className="mt-1 text-stone text-sm">Overview of your store, content, and audience.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-pure border border-border rounded-2xl p-6 shadow-sm"
          >
            <p className="text-stone text-xs tracking-[0.15em] uppercase">{card.label}</p>
            <p className="mt-2 font-serif-display text-ink text-2xl font-medium">{card.value}</p>
            <p className="mt-1 text-stone-light text-xs">{card.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-pure border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-ink font-medium mb-4">Last 7 Days Revenue</h2>
          <LineChart data={stats.ordersByDay} />
        </div>
        <div className="bg-pure border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-ink font-medium mb-4">Revenue by Month</h2>
          <BarChart data={stats.revenueByMonth} />
        </div>
      </div>
    </div>
  );
}
