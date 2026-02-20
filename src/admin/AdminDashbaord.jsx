import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#ef4444", "#dc2626", "#b91c1c", "#7f1d1d"];

const AdminDashboard = () => {
  const token = sessionStorage.getItem("token");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}dashboard/admin`,
          {
            headers: { authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch dashboard");

        const result = await res.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  if (loading)
    return (
      <div className="bg-black min-h-screen flex items-center justify-center text-red-500">
        Loading Dashboard...
      </div>
    );

  if (error)
    return (
      <div className="bg-black min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );

  const {
    summaryStats,
    revenueTrend,
    dealStages,
    revenueByStaff,
    quoteStatus,
  } = data;

  return (
    <div className="bg-black min-h-screen p-8 text-white">
      <div className="max-w-screen-2xl mx-auto">
        {/* ================= HEADER ================= */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-red-500">
            Admin Control Panel
          </h1>
          <p className="text-gray-400 mt-2">
            Complete business performance overview
          </p>
        </div>

        {/* ================= EXECUTIVE SNAPSHOT ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6 mb-12">
          <ExecutiveCard
            title="Total Revenue"
            value={`Rs ${summaryStats.totalRevenue.toLocaleString()}`}
            description="Revenue from closed deals"
          />
          <ExecutiveCard
            title="Total Deals"
            value={summaryStats.totalDeals}
            description="Active + Closed deals"
          />
          <ExecutiveCard
            title="Total Quotes"
            value={summaryStats.totalQuotes}
            description="All generated quotations"
          />
          <ExecutiveCard
            title="Total Users"
            value={summaryStats.totalUsers}
            description="Sales & Admin users"
          />
          <ExecutiveCard
            title="Growth Rate"
            value={`${summaryStats.growthRate}%`}
            description="Compared to previous period"
            highlight
          />
        </div>

        {/* ================= OPERATIONS ================= */}
        <SectionTitle title="Pipeline & Operational Health" />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <ChartCard title="Deal Stage Distribution">
            {dealStages?.length ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={dealStages}>
                  <CartesianGrid stroke="#222" />
                  <XAxis dataKey="stage" stroke="#aaa" />
                  <YAxis stroke="#aaa" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <NoData />
            )}
          </ChartCard>

          <ChartCard title="Quote Status Overview">
            {quoteStatus?.length ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Tooltip />
                  <Pie
                    data={quoteStatus}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={110}
                  >
                    {quoteStatus.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <NoData />
            )}
          </ChartCard>
        </div>

        {/* ================= REVENUE INTELLIGENCE ================= */}
        <SectionTitle title="Revenue & Growth Intelligence" />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-14">
          <ChartCard title="Revenue Trend (Monthly)">
            {revenueTrend?.length ? (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={revenueTrend}>
                  <CartesianGrid stroke="#222" />
                  <XAxis dataKey="month" stroke="#aaa" />
                  <YAxis stroke="#aaa" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#ef4444"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <NoData />
            )}
          </ChartCard>

          <ChartCard title="Revenue Growth Area">
            {revenueTrend?.length ? (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={revenueTrend}>
                  <CartesianGrid stroke="#222" />
                  <XAxis dataKey="month" stroke="#aaa" />
                  <YAxis stroke="#aaa" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#ef4444"
                    fill="#7f1d1d"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <NoData />
            )}
          </ChartCard>
        </div>

        {/* ================= SALES PERFORMANCE ================= */}
        <SectionTitle title="Sales Team Performance" />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-14">
          <ChartCard title="Revenue by Staff">
            {revenueByStaff?.length ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={revenueByStaff}>
                  <CartesianGrid stroke="#222" />
                  <XAxis dataKey="name" stroke="#aaa" />
                  <YAxis stroke="#aaa" />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#dc2626" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <NoData />
            )}
          </ChartCard>

          <PerformanceTable data={revenueByStaff} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

/* ================= COMPONENTS ================= */

const ExecutiveCard = ({ title, value, description, highlight }) => (
  <div
    className={`bg-[#111] border rounded-2xl p-6 transition
    ${highlight ? "border-red-500" : "border-white/10"}`}
  >
    <p className="text-gray-400 text-sm">{title}</p>
    <h2 className="text-2xl font-bold mt-2 text-red-500">{value}</h2>
    <p className="text-gray-500 text-xs mt-2">{description}</p>
  </div>
);

const SectionTitle = ({ title }) => (
  <h2 className="text-xl font-semibold mb-6 text-white border-b border-white/10 pb-2">
    {title}
  </h2>
);

const PerformanceTable = ({ data }) => {
  if (!data?.length) return <NoData />;

  const sorted = [...data].sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
      <div className="space-y-3">
        {sorted.map((item, index) => (
          <div
            key={index}
            className={`flex justify-between p-3 rounded-lg
              ${
                index === 0
                  ? "bg-red-500/10 border border-red-500/40"
                  : "bg-black/30"
              }`}
          >
            <span>{item.name}</span>
            <span className="text-red-400 font-semibold">
              Rs {item.revenue.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const KpiCard = ({ title, value }) => (
  <div className="bg-[#111] border border-white/10 rounded-2xl p-6 hover:border-red-500 transition">
    <p className="text-gray-400 text-sm">{title}</p>
    <h2 className="text-2xl font-bold mt-2 text-red-500">{value}</h2>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-[#111] border border-white/10 rounded-2xl p-6 hover:border-red-500 transition">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    {children}
  </div>
);

const NoData = () => (
  <div className="h-[300px] flex items-center justify-center text-gray-500">
    No Data Available
  </div>
);
