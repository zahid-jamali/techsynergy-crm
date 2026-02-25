import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useParams } from "react-router-dom";

const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"];

export default function AdminUserPerformance() {
  const userId = JSON.parse(sessionStorage.getItem("user"))._id;
  //   console.log(userId);
  const token = sessionStorage.getItem("token");

  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}dashboard/user/${userId}`,
        {
          headers: { authorization: `Bearer ${token}` },
        }
      );
      const json = await res.json();
      setData(json);
    };

    fetchData();
  }, [userId, token]);

  if (!data) return null;

  const { user, stats, dealStages, quoteStatuses, revenueTrend } = data;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          {user.name} Performance
        </h1>
        <p className="text-gray-400 text-sm">
          {user.email} • {user.designation}
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-3 gap-6">
        <KPI
          label="Total Revenue"
          value={`PKR ${stats.totalRevenue.toLocaleString()}`}
        />
        <KPI
          label="Pipeline"
          value={`PKR ${stats.activePipeline.toLocaleString()}`}
        />
        <KPI label="Conversion Rate" value={`${stats.conversionRate}%`} />
        <KPI label="Total Deals" value={stats.totalDeals} />
        <KPI label="Quotes" value={stats.totalQuotes} />
        <KPI label="Sell Orders" value={stats.totalSellOrders} />
      </div>

      {/* Revenue Trend */}
      <ChartCard title="Monthly Revenue">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueTrend}>
            <XAxis dataKey="month" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip />
            <Bar dataKey="revenue" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Deal Stages */}
      <ChartCard title="Deal Stage Distribution">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={dealStages}
              dataKey="count"
              nameKey="stage"
              outerRadius={100}
            >
              {dealStages.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Quote Status */}
      <ChartCard title="Quote Status">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={quoteStatuses}
              dataKey="count"
              nameKey="stage"
              outerRadius={100}
            >
              {quoteStatuses.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

const KPI = ({ label, value }) => (
  <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
    <p className="text-gray-400 text-sm">{label}</p>
    <p className="text-xl font-semibold text-white mt-2">{value}</p>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
    <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
    {children}
  </div>
);
