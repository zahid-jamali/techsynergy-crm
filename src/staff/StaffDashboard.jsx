import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AdminDashboard = () => {
  const token = sessionStorage.getItem("token");

  const [dashboard, setDashboard] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}dashboard/staff`,
        {
          headers: { authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setDashboard(data);
    } catch (err) {
      console.error("Dashboard fetch error", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!dashboard) {
    return <div className="text-white p-10">Loading...</div>;
  }

  const {
    summaryStats,
    monthlyRevenue,
    pipelineData,
    quoteStageData,
    topDeals,
    recentQuotes,
  } = dashboard;

  const remainingTarget =
    (summaryStats.targetedRevenue || 0) - summaryStats.totalSell;

  const sellStatusData = [
    { name: "Approved", value: summaryStats.approvedQuotes },
    { name: "Confirmed", value: summaryStats.confirmedQuotes },
  ];

  const kpiData = [
    { name: "Contacts", value: summaryStats.contacts },
    { name: "Accounts", value: summaryStats.accounts },
    { name: "Deals", value: summaryStats.totalDeals },
    { name: "Quotes", value: summaryStats.totalQuotes },
  ];

  return (
    <div className="bg-black min-h-screen p-8 text-white">
      <h1 className="text-3xl font-bold mb-8">Staff Dashboard</h1>

      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-6 mb-10">
        <KpiCard title="Contacts" value={summaryStats.contacts} />
        <KpiCard title="Accounts" value={summaryStats.accounts} />
        <KpiCard title="Deals" value={summaryStats.totalDeals} />
        <KpiCard title="Quotes" value={summaryStats.totalQuotes} />
        <KpiCard title="Win Rate %" value={summaryStats.winRate} />
        <KpiCard title="Conversion %" value={summaryStats.conversionRate} />
      </div>

      {/* ================= CHARTS ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Monthly Revenue */}
        <ChartCard title="Monthly Revenue">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenue}>
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
        </ChartCard>

        {/* Pipeline */}
        <ChartCard title="Deal Pipeline">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pipelineData}>
              <CartesianGrid stroke="#222" />
              <XAxis dataKey="_id" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Bar dataKey="count" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Quote Stage */}
        <ChartCard title="Quote Stage Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Tooltip />
              <Pie
                data={quoteStageData}
                dataKey="count"
                nameKey="_id"
                outerRadius={110}
              >
                {quoteStageData.map((_, i) => (
                  <Cell key={i} fill={i % 2 === 0 ? "#ef4444" : "#444"} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Core Metrics */}
        <ChartCard title="Core CRM Metrics">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={kpiData}>
              <CartesianGrid stroke="#222" />
              <XAxis dataKey="name" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Bar dataKey="value" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Revenue Overview */}
        <ChartCard title="Revenue Overview">
          <div className="space-y-4 text-sm">
            <RevenueItem label="Total Sell" value={summaryStats.totalSell} />
            <RevenueItem
              label="Weighted Expected Revenue"
              value={summaryStats.weightedExpectedRevenue}
            />
            <RevenueItem
              label="Remaining Target"
              value={remainingTarget}
              highlight
            />
          </div>
        </ChartCard>

        {/* Top Deals */}
        <ChartCard title="Top Deals">
          {topDeals.map((deal) => (
            <div
              key={deal._id}
              className="flex justify-between py-2 border-b border-white/10"
            >
              <span>{deal.dealName}</span>
              <span className="text-red-500">Rs {deal.amount}</span>
            </div>
          ))}
        </ChartCard>

        {/* Recent Quotes */}
        <ChartCard title="Recent Quotes">
          {recentQuotes.map((quote) => (
            <div
              key={quote._id}
              className="flex justify-between py-2 border-b border-white/10"
            >
              <span>{quote.subject}</span>
              <span className="text-gray-400">{quote.quoteStage}</span>
            </div>
          ))}
        </ChartCard>
      </div>
    </div>
  );
};

export default AdminDashboard;

/* ================= COMPONENTS ================= */

const KpiCard = ({ title, value }) => (
  <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
    <p className="text-gray-400 text-sm">{title}</p>
    <h2 className="text-2xl font-bold mt-2 text-red-500">{value}</h2>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    {children}
  </div>
);

const RevenueItem = ({ label, value, highlight }) => (
  <div className="flex justify-between border-b border-white/10 pb-2">
    <span className="text-gray-400">{label}</span>
    <span
      className={`font-semibold ${highlight ? "text-red-500" : "text-white"}`}
    >
      Rs {Number(value || 0).toLocaleString()}
    </span>
  </div>
);
