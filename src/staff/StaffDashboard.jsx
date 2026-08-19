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
import Loading from "../components/Loading";

const tooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  color: "#111827",
};

const StaffDashboard = () => {
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
    return (
      <div className="flex justify-center items-center h-60">
        <Loading />
      </div>
    );
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

  const kpiData = [
    { name: "Contacts", value: summaryStats.contacts },
    { name: "Accounts", value: summaryStats.accounts },
    { name: "Deals", value: summaryStats.totalDeals },
    { name: "Quotes", value: summaryStats.totalQuotes },
  ];

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Staff Dashboard</h1>
        <p className="page-subtitle">Your pipeline, quotes and revenue at a glance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard title="Total SO" value={summaryStats.totalSellOrders} />
        <KpiCard title="Approved SO" value={summaryStats.approvedSellOrders} />
        <KpiCard title="Total Revenue" value={summaryStats.totalSell} />
        <KpiCard title="Deals" value={summaryStats.totalDeals} />
        <KpiCard title="Quotes" value={summaryStats.totalQuotes} />
        <KpiCard title="Accounts" value={summaryStats.accounts} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard title="Monthly Revenue">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#021d54"
                strokeWidth={3}
                dot={{ fill: "#021d54", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Deal Pipeline">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pipelineData}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis dataKey="_id" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#021d54" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Quote Stage Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Tooltip contentStyle={tooltipStyle} />
              <Pie
                data={quoteStageData}
                dataKey="count"
                nameKey="_id"
                outerRadius={110}
                innerRadius={60}
                paddingAngle={4}
              >
                {quoteStageData.map((_, i) => (
                  <Cell key={i} fill={i % 2 === 0 ? "#021d54" : "#93c5fd"} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Core CRM Metrics">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={kpiData}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="#021d54" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

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

        <ChartCard title="Top Deals">
          <div className="divide-y divide-gray-100">
            {topDeals.map((deal) => (
              <div
                key={deal._id}
                className="flex justify-between py-2.5 items-center"
              >
                <span className="font-medium text-heading">{deal.dealName}</span>
                <span className="font-semibold text-brand">
                  {deal.currency === "USD" ? "$" : "Rs."} {deal.amount}
                </span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Recent Quotes">
          <div className="divide-y divide-gray-100">
            {recentQuotes.map((quote) => (
              <div
                key={quote._id}
                className="flex justify-between py-2.5 items-center"
              >
                <span className="font-medium text-heading">{quote.subject}</span>
                <span className="text-bodyText text-xs bg-surface px-2.5 py-1 rounded-full border border-gray-200">
                  {quote.quoteStage}
                </span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default StaffDashboard;

const KpiCard = ({ title, value }) => (
  <div className="kpi-card">
    <p className="text-bodyText text-sm">{title}</p>
    <h2 className="text-2xl font-semibold mt-2 text-brand">{value}</h2>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="card p-5">
    <h3 className="text-base font-semibold mb-4 text-heading">{title}</h3>
    {children}
  </div>
);

const RevenueItem = ({ label, value, highlight }) => (
  <div className="flex justify-between border-b border-gray-100 pb-2">
    <span className="text-bodyText">{label}</span>
    <span
      className={`font-semibold ${highlight ? "text-brand" : "text-heading"}`}
    >
      Rs {Number(value || 0).toLocaleString()}
    </span>
  </div>
);
