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
        const barHeight = (d.revenue / max) * (height - 40);
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

  const fillPoints = [
    `${padding},${padding + chartHeight}`,
    ...points,
    `${padding + chartWidth},${padding + chartHeight}`,
  ].join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <polygon fill="#BFA15F" fillOpacity="0.12" points={fillPoints} />
      <polyline
        fill="none"
        stroke="#BFA15F"
        strokeWidth="2.5"
        points={points.join(" ")}
      />
      {data.map((d, i) => {
        const x = padding + (i / (data.length - 1 || 1)) * chartWidth;
        const y = padding + chartHeight - (d.revenue / max) * chartHeight;
        return (
          <g key={d.date}>
            <circle cx={x} cy={y} r="4" fill="#FFFFFF" stroke="#BFA15F" strokeWidth="2" />
            <text x={x} y={height - 8} textAnchor="middle" fontSize="9" fill="#6B6B6B" transform={`rotate(-35, ${x}, ${height - 8})`}>
              {d.date.slice(5)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function MiniBadge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "up" | "down" | "gold" | "plum" | "green" }) {
  const toneStyles = {
    neutral: "bg-cream-dark text-stone",
    up: "bg-green-50 text-green-700",
    down: "bg-red-50 text-red-700",
    gold: "bg-gold/10 text-gold",
    plum: "bg-plum/10 text-plum",
    green: "bg-green-100 text-green-700",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${toneStyles[tone]}`}>
      {children}
    </span>
  );
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const statCards = [
    { label: "Total Sales", value: formatCurrency(stats.revenue), sub: `${stats.totalOrders} orders`, tone: "gold" as const },
    { label: "Total Products", value: stats.totalProducts.toString(), sub: `${stats.activeProducts} active`, tone: "plum" as const },
    { label: "Total Customers", value: stats.totalSubscribers.toString(), sub: "Subscribers", tone: "green" as const },
    { label: "Low Stock", value: stats.lowStock.toString(), sub: "Need restock", tone: "down" as const },
    { label: "Pending Orders", value: stats.pendingOrders.toString(), sub: "Awaiting action", tone: "neutral" as const },
    { label: "Journal Posts", value: stats.totalPosts.toString(), sub: "Published", tone: "up" as const },
    { label: "Team Admins", value: stats.totalAdmins.toString(), sub: "Staff", tone: "neutral" as const },
    { label: "Payment Failures", value: "0", sub: "Refunded", tone: "neutral" as const },
  ];

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-display text-ink text-2xl font-medium">Dashboard</h1>
        <p className="text-stone text-sm">Welcome back. Here is what is happening in your store today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-pure border border-border rounded-2xl p-5 shadow-sm"
          >
            <p className="text-stone text-xs tracking-[0.1em] uppercase">{card.label}</p>
            <p className="mt-2 text-ink text-2xl font-semibold font-serif-display">{card.value}</p>
            <div className="mt-3">
              <MiniBadge tone={card.tone}>{card.sub}</MiniBadge>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue by month */}
        <div className="lg:col-span-2 bg-pure border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-ink font-medium">Accommodation Revenue</h2>
            <MiniBadge tone="gold">+4% vs last year</MiniBadge>
          </div>
          <BarChart data={stats.revenueByMonth} />
        </div>

        {/* Order status */}
        <div className="bg-pure border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-ink font-medium mb-4">Order Status</h2>
          <div className="space-y-3">
            {stats.ordersByStatus.map((s) => (
              <div key={s.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${statusColors[s.status].split(" ")[0]}`} />
                  <span className="text-sm text-stone capitalize">{s.status}</span>
                </div>
                <span className="text-ink text-sm font-medium">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue by day */}
        <div className="lg:col-span-2 bg-pure border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-ink font-medium">Profit margin</h2>
            <div className="flex gap-2 text-xs">
              <MiniBadge tone="gold">Earnings</MiniBadge>
            </div>
          </div>
          <LineChart data={stats.ordersByDay} />
        </div>

        {/* Recent orders */}
        <div className="bg-pure border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-ink font-medium mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {stats.recentOrders.map((order) => (
              <div key={order._id} className="flex items-center justify-between border-b border-border last:border-0 pb-2 last:pb-0">
                <div>
                  <p className="text-ink text-sm font-medium">{order.orderNumber}</p>
                  <p className="text-stone text-xs">{order.customer.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-ink text-sm">{formatCurrency(order.total)}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${statusColors[order.status] || "bg-stone/10 text-stone"}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {stats.recentOrders.length === 0 && (
              <p className="text-stone text-sm">No orders yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
