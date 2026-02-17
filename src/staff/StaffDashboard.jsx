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
  // ==============================
  // Dummy Data (Replace Later)
  // ==============================

  const summaryStats = {
    contacts: 148,
    accounts: 72,
    dealsPipeline: 34,
    quotations: 19,
    sellApproved: 12,
    sellNotApproved: 7,
    totalSell: 1850000,
    expectedRevenue: 950000,
    targetedRevenue: 2500000,
  };

  const remainingTarget = summaryStats.targetedRevenue - summaryStats.totalSell;

  const monthlyRevenue = [
    { month: "Jan", revenue: 120000 },
    { month: "Feb", revenue: 210000 },
    { month: "Mar", revenue: 180000 },
    { month: "Apr", revenue: 300000 },
    { month: "May", revenue: 250000 },
    { month: "Jun", revenue: 350000 },
  ];

  const pipelineData = [
    { stage: "Prospecting", count: 10 },
    { stage: "Qualified", count: 8 },
    { stage: "Proposal", count: 9 },
    { stage: "Negotiation", count: 7 },
  ];

  const sellStatusData = [
    { name: "Approved", value: summaryStats.sellApproved },
    { name: "Not Approved", value: summaryStats.sellNotApproved },
  ];

  const kpiData = [
    { name: "Contacts", value: summaryStats.contacts },
    { name: "Accounts", value: summaryStats.accounts },
    { name: "Deals", value: summaryStats.dealsPipeline },
    { name: "Quotations", value: summaryStats.quotations },
  ];

  // ==============================
  // UI
  // ==============================

  return (
    <div className="bg-black min-h-screen p-8 text-white">
      <h1 className="text-3xl font-bold mb-8 tracking-wide">Admin Dashboard</h1>

      {/* ================= KPI Cards ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
        <KpiCard title="Total Contacts" value={summaryStats.contacts} />
        <KpiCard title="Total Accounts" value={summaryStats.accounts} />
        <KpiCard title="Deals in Pipeline" value={summaryStats.dealsPipeline} />
        <KpiCard title="Total Quotations" value={summaryStats.quotations} />
        <KpiCard
          title="Total Sell Orders"
          value={summaryStats.sellApproved + summaryStats.sellNotApproved}
        />
      </div>

      {/* ================= Charts Grid ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Revenue Line Chart */}
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

        {/* Deals Pipeline Bar Chart */}
        <ChartCard title="Deals Pipeline Stages">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pipelineData}>
              <CartesianGrid stroke="#222" />
              <XAxis dataKey="stage" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Bar dataKey="count" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Sell Order Status Pie */}
        <ChartCard title="Sell Orders Status">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Tooltip />
              <Pie
                data={sellStatusData}
                dataKey="value"
                nameKey="name"
                outerRadius={110}
              >
                <Cell fill="#ef4444" />
                <Cell fill="#444" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* KPI Bar Chart */}
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
              label="Expected Revenue"
              value={summaryStats.expectedRevenue}
            />
            <RevenueItem
              label="Targeted Revenue"
              value={summaryStats.targetedRevenue}
            />
            <RevenueItem
              label="Remaining Target"
              value={remainingTarget}
              highlight
            />
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default AdminDashboard;

// =====================================
// Reusable Components
// =====================================

const KpiCard = ({ title, value }) => (
  <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-lg hover:border-red-500/40 transition">
    <p className="text-gray-400 text-sm">{title}</p>
    <h2 className="text-2xl font-bold mt-2 text-red-500">{value}</h2>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl">
    <h3 className="text-lg font-semibold mb-4 text-white">{title}</h3>
    {children}
  </div>
);

const RevenueItem = ({ label, value, highlight }) => (
  <div className="flex justify-between border-b border-white/10 pb-2">
    <span className="text-gray-400">{label}</span>
    <span
      className={`font-semibold ${highlight ? "text-red-500" : "text-white"}`}
    >
      Rs {value.toLocaleString()}
    </span>
  </div>
);
