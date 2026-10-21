import { useCallback, useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Target,
  DollarSign,
  Award,
  FileText,
  Briefcase,
  Layers,
} from "lucide-react";
import Loading from "../components/Loading";

const formatMoney = (val) =>
  `PKR ${Math.round(Number(val || 0)).toLocaleString()}`;

const formatCompactMoney = (val) => {
  const n = Number(val || 0);
  if (n >= 1_000_000) return `PKR ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `PKR ${(n / 1_000).toFixed(0)}k`;
  return `PKR ${n}`;
};

const STAGE_COLORS = {
  Qualification: "#3b82f6",
  "Needs Analysis": "#0ea5e9",
  "Value Proposition": "#6366f1",
  "Identify Decision Makers": "#8b5cf6",
  "Proposal/Price Quote": "#a855f7",
  "Negotiation/Review": "#d946ef",
  "Closed Won": "#10b981",
  "Closed Lost": "#ef4444",
  "Closed Lost to Competition": "#f43f5e",
};

const QUOTE_STAGE_COLORS = {
  Confirmed: "#10b981",
  Delivered: "#2563eb",
  "Proposal/Price Quote": "#8b5cf6",
  Draft: "#64748b",
  "In Review": "#f59e0b",
  Rejected: "#ef4444",
};


const StaffDashboard = () => {
  const token = sessionStorage.getItem("token");
  const [dashboard, setDashboard] = useState(null);
  const [pipelineMetric, setPipelineMetric] = useState("totalValue"); // 'totalValue' | 'count'

  const fetchData = useCallback(async () => {
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
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!dashboard) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loading />
      </div>
    );
  }

  const {
    summaryStats = {},
    monthlyRevenue = [],
    pipelineData = [],
    quoteStageData = [],
    topDeals = [],
    recentQuotes = [],
  } = dashboard;

  const totalSell = Number(summaryStats.totalSell || 0);
  const targetedRevenue = Number(summaryStats.targetedRevenue || 0);
  const remainingTarget = Math.max(0, targetedRevenue - totalSell);
  const attainment =
    targetedRevenue > 0
      ? Math.min(100, Math.round((totalSell / targetedRevenue) * 100))
      : null;

  const closedWon = Number(summaryStats.closedWonDeals || 0);
  const closedLost = Number(summaryStats.closedLostDeals || 0);
  const openDeals = Number(summaryStats.openDeals || 0);
  const totalClosed = closedWon + closedLost;
  const winRate =
    totalClosed > 0 ? Math.round((closedWon / totalClosed) * 100) : 0;

  const totalQuotes = Number(summaryStats.totalQuotes || 0);
  const confirmedQuotes = Number(summaryStats.confirmedQuotes || 0);
  const quoteConversion =
    totalQuotes > 0 ? Math.round((confirmedQuotes / totalQuotes) * 100) : 0;

  // Deal Health Pie Data
  const dealHealthData = [
    { name: "Closed Won", value: closedWon, color: "#10b981" },
    { name: "In Pipeline", value: openDeals, color: "#021d54" },
    { name: "Closed Lost", value: closedLost, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  // Quote Stages with colors
  const quotesPieData = quoteStageData.map((s, idx) => ({
    name: s._id || "Other",
    count: s.count || 0,
    totalRevenue: s.totalRevenue || 0,
    color:
      QUOTE_STAGE_COLORS[s._id] ||
      ["#021d54", "#2563eb", "#38bdf8", "#818cf8", "#c084fc"][idx % 5],
  }));

  return (
    <div className="p-6 text-heading space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-brand tracking-tight">
            Sales Performance Dashboard
          </h1>
          <p className="text-sm text-bodyText mt-1">
            Real-time pipeline intelligence, revenue realization, and opportunity analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-surface border border-gray-200 text-xs font-medium text-bodyText">
            Period: <span className="font-semibold text-heading">Year to Date</span>
          </div>
        </div>
      </div>

      {/* TARGET & REVENUE HERO CARD */}
      {targetedRevenue > 0 && (
        <div className="bg-gradient-to-r from-brand to-[#0a358c] text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center gap-2 text-white/80 text-xs uppercase tracking-wider font-semibold">
                <Target size={16} />
                <span>Monthly Target Realization</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">
                {formatMoney(totalSell)}
              </h2>
              <p className="text-xs text-white/80">
                Target: {formatMoney(targetedRevenue)} · Remaining to Goal:{" "}
                <span className="font-semibold text-white">
                  {formatMoney(remainingTarget)}
                </span>
              </p>
              {/* Progress Bar */}
              <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, attainment || 0)}%` }}
                />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 space-y-1">
              <p className="text-xs text-white/70">Attainment Rate</p>
              <p className="text-2xl font-bold text-emerald-300">
                {attainment !== null ? `${attainment}%` : "No Target"}
              </p>
              <p className="text-[11px] text-white/60">
                {attainment >= 100
                  ? "🎉 Quota achieved!"
                  : `${100 - (attainment || 0)}% to reach target`}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 space-y-1">
              <p className="text-xs text-white/70">Weighted Pipeline Projection</p>
              <p className="text-2xl font-bold text-white">
                {formatCompactMoney(summaryStats.weightedExpectedRevenue)}
              </p>
              <p className="text-[11px] text-white/60">
                Probability-adjusted deal volume
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CORE KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiMetricCard
          icon={<DollarSign size={18} className="text-brand" />}
          title="Won Revenue"
          value={formatCompactMoney(totalSell)}
          subtext={`${summaryStats.approvedSellOrders || 0} Approved Sales Orders`}
          highlight
        />
        <KpiMetricCard
          icon={<Briefcase size={18} className="text-blue-600" />}
          title="Active Pipeline"
          value={formatCompactMoney(summaryStats.pipelineValue)}
          subtext={`${openDeals} open deals in motion`}
        />
        <KpiMetricCard
          icon={<Award size={18} className="text-emerald-600" />}
          title="Deal Win Rate"
          value={`${winRate}%`}
          subtext={`${closedWon} Won / ${totalClosed} Decided`}
        />
        <KpiMetricCard
          icon={<TrendingUp size={18} className="text-violet-600" />}
          title="Avg Deal Size"
          value={formatCompactMoney(summaryStats.avgDealSize)}
          subtext="Based on closed deals"
        />
        <KpiMetricCard
          icon={<FileText size={18} className="text-amber-600" />}
          title="Quote Conversion"
          value={`${quoteConversion}%`}
          subtext={`${confirmedQuotes} of ${totalQuotes} Confirmed`}
        />
        <KpiMetricCard
          icon={<Layers size={18} className="text-teal-600" />}
          title="Accounts & POCs"
          value={summaryStats.accounts || 0}
          subtext={`${summaryStats.contacts || 0} assigned contacts`}
        />
      </div>

      {/* ROW 1: REVENUE TREND & PIPELINE VALUE BY STAGE */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* MONTHLY REVENUE AREA CHART */}
        <div className="bg-card border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-heading">
                Monthly Realized Revenue
              </h3>
              <p className="text-xs text-bodyText mt-0.5">
                Confirmed sales order trajectory across months
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-bodyText">YTD Realized</span>
              <p className="text-sm font-bold text-brand">{formatCompactMoney(totalSell)}</p>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#021d54" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#021d54" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickFormatter={(val) => formatCompactMoney(val)}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xl text-xs">
                          <p className="font-semibold text-heading mb-1">{label}</p>
                          <p className="text-brand font-bold text-sm">
                            {formatMoney(payload[0].value)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#021d54"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                  dot={{ r: 3, fill: "#021d54" }}
                  activeDot={{ r: 6, fill: "#021d54", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIPELINE BY STAGE (MONETARY VALUE & COUNT) */}
        <div className="bg-card border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-heading">
                Pipeline Capital by Stage
              </h3>
              <p className="text-xs text-bodyText mt-0.5">
                Exact monetary value and volume locked at each stage
              </p>
            </div>
            {/* View Mode Toggle */}
            <div className="flex items-center bg-surface border border-gray-200 rounded-lg p-0.5 self-start">
              <button
                type="button"
                onClick={() => setPipelineMetric("totalValue")}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition ${
                  pipelineMetric === "totalValue"
                    ? "bg-brand text-white shadow-sm"
                    : "text-bodyText hover:text-heading"
                }`}
              >
                Value (PKR)
              </button>
              <button
                type="button"
                onClick={() => setPipelineMetric("count")}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition ${
                  pipelineMetric === "count"
                    ? "bg-brand text-white shadow-sm"
                    : "text-bodyText hover:text-heading"
                }`}
              >
                Deals Count
              </button>
            </div>
          </div>

          <div className="h-72">
            {pipelineData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-bodyText text-xs">
                No active pipeline deals found
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={pipelineData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickFormatter={(val) =>
                      pipelineMetric === "totalValue" ? formatCompactMoney(val) : val
                    }
                  />
                  <YAxis
                    type="category"
                    dataKey="_id"
                    stroke="#475569"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                    width={110}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xl text-xs space-y-1.5 min-w-[12rem]">
                            <p className="font-bold text-heading border-b border-gray-100 pb-1">
                              {data._id}
                            </p>
                            <div className="flex justify-between">
                              <span className="text-bodyText">Stage Total:</span>
                              <span className="font-semibold text-brand">
                                {formatMoney(data.totalValue)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-bodyText">Weighted Expected:</span>
                              <span className="font-semibold text-emerald-600">
                                {formatMoney(data.weightedRevenue)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-bodyText">Opportunities:</span>
                              <span className="font-semibold text-heading">
                                {data.count} deals
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey={pipelineMetric}
                    radius={[0, 6, 6, 0]}
                    barSize={20}
                  >
                    {pipelineData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STAGE_COLORS[entry._id] || "#021d54"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ROW 2: DEAL WIN/LOSS HEALTH & QUOTE STATUS DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* DEAL HEALTH DONUT */}
        <div className="bg-card border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-heading">
              Pipeline Health & Win Ratio
            </h3>
            <p className="text-xs text-bodyText mt-0.5">
              Closed Won vs Lost vs Open Pipeline Opportunities
            </p>
          </div>

          <div className="h-60 relative flex items-center justify-center my-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0];
                      const pct = Math.round(
                        (item.value / (summaryStats.totalDeals || 1)) * 100
                      );
                      return (
                        <div className="bg-white border border-gray-200 rounded-xl p-2.5 shadow-xl text-xs">
                          <p className="font-bold text-heading">{item.name}</p>
                          <p className="font-semibold text-brand mt-0.5">
                            {item.value} deals ({pct}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Pie
                  data={dealHealthData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                >
                  {dealHealthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-heading">
                {winRate}%
              </span>
              <span className="text-[10px] text-bodyText uppercase tracking-wider font-semibold">
                Win Rate
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 text-center">
            <div>
              <p className="text-xs text-bodyText">Won</p>
              <p className="text-sm font-bold text-emerald-600">{closedWon}</p>
            </div>
            <div>
              <p className="text-xs text-bodyText">Open</p>
              <p className="text-sm font-bold text-brand">{openDeals}</p>
            </div>
            <div>
              <p className="text-xs text-bodyText">Lost</p>
              <p className="text-sm font-bold text-red-500">{closedLost}</p>
            </div>
          </div>
        </div>

        {/* QUOTE STATUS DISTRIBUTION */}
        <div className="bg-card border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-heading">
              Quote Book Distribution
            </h3>
            <p className="text-xs text-bodyText mt-0.5">
              Quotations segmented by stage & total quoted revenue
            </p>
          </div>

          <div className="h-60 relative flex items-center justify-center my-3">
            {quotesPieData.length === 0 ? (
              <div className="text-bodyText text-xs">No quotes created yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xl text-xs space-y-1">
                            <p className="font-bold text-heading">{item.name}</p>
                            <p className="text-bodyText">
                              Count:{" "}
                              <span className="font-semibold text-heading">
                                {item.count} quotes
                              </span>
                            </p>
                            <p className="text-bodyText">
                              Quoted Value:{" "}
                              <span className="font-semibold text-brand">
                                {formatMoney(item.totalRevenue)}
                              </span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={quotesPieData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {quotesPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-heading">
                {totalQuotes}
              </span>
              <span className="text-[10px] text-bodyText uppercase tracking-wider font-semibold">
                Total Quotes
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-gray-100 text-xs">
            {quotesPieData.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-bodyText text-[11px]">
                  {item.name}: <strong className="text-heading">{item.count}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* REVENUE REALIZATION SUMMARY */}
        <div className="bg-card border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-heading">
              Financial Realization
            </h3>
            <p className="text-xs text-bodyText mt-0.5">
              Breakdown of sold revenue, expected pipeline, and targets
            </p>
          </div>

          <div className="space-y-4 my-auto">
            <FinancialRow
              label="Realized Sold Revenue"
              value={formatMoney(totalSell)}
              badge={`${summaryStats.approvedSellOrders || 0} Orders`}
              highlight
            />
            <FinancialRow
              label="Weighted Expected Pipeline"
              value={formatMoney(summaryStats.weightedExpectedRevenue)}
              badge={`${openDeals} Active Deals`}
            />
            <FinancialRow
              label="Gross Active Pipeline"
              value={formatMoney(summaryStats.pipelineValue)}
            />
            <FinancialRow
              label="Monthly Sales Target"
              value={formatMoney(targetedRevenue)}
            />
            <FinancialRow
              label="Shortfall to Target"
              value={formatMoney(remainingTarget)}
              subdued={remainingTarget === 0}
            />
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-gray-200 text-xs text-bodyText">
            💡 <strong>Insight:</strong> Closing 2 deals in negotiation will cover 70% of the remaining monthly target.
          </div>
        </div>
      </div>

      {/* ROW 3: TOP OPPORTUNITIES & RECENT QUOTES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TOP DEALS */}
        <div className="bg-card border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-heading">
                High-Value Opportunities
              </h3>
              <p className="text-xs text-bodyText mt-0.5">
                Largest potential deals currently assigned to you
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand/10 text-brand">
              Top 5 Deals
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {topDeals.length === 0 ? (
              <p className="text-center py-8 text-bodyText text-xs">
                No active deals available
              </p>
            ) : (
              topDeals.map((deal) => (
                <div
                  key={deal._id}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-surface/50 rounded-lg px-2 transition"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-heading truncate">
                      {deal.dealName}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-bodyText">
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 font-medium text-[11px]">
                        {deal.stage}
                      </span>
                      {deal.closingDate && (
                        <span>
                          Closes: {new Date(deal.closingDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm text-brand">
                      {deal.currency === "USD" ? "$" : "PKR"}{" "}
                      {Number(deal.amount || 0).toLocaleString()}
                    </p>
                    {deal.probability !== undefined && (
                      <span className="text-[11px] text-emerald-600 font-medium">
                        {deal.probability}% win probability
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RECENT QUOTES */}
        <div className="bg-card border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-heading">
                Recent Quotations
              </h3>
              <p className="text-xs text-bodyText mt-0.5">
                Latest customer quotations submitted
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface border border-gray-200 text-bodyText">
              Recent 5
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {recentQuotes.length === 0 ? (
              <p className="text-center py-8 text-bodyText text-xs">
                No recent quotes found
              </p>
            ) : (
              recentQuotes.map((q) => (
                <div
                  key={q._id}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-surface/50 rounded-lg px-2 transition"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-heading truncate">
                        {q.subject}
                      </p>
                      {q.quoteNumber && (
                        <span className="font-mono text-[11px] text-bodyText bg-surface px-1.5 py-0.5 rounded border border-gray-200">
                          #{q.quoteNumber}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-bodyText">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          q.quoteStage === "Confirmed"
                            ? "bg-emerald-50 text-emerald-700"
                            : q.quoteStage === "Delivered"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-gray-100 text-bodyText"
                        }`}
                      >
                        {q.quoteStage}
                      </span>
                      <span>
                        {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : "-"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm text-heading">
                      {q.currency || "PKR"} {Number(q.grandTotal || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;

/* ================= HELPER SUB-COMPONENTS ================= */

const KpiMetricCard = ({ icon, title, value, subtext, highlight }) => (
  <div
    className={`p-4 rounded-2xl border transition-all duration-200 ${
      highlight
        ? "bg-gradient-to-br from-brand/5 via-card to-card border-brand/30 shadow-sm"
        : "bg-card border-gray-200 hover:border-gray-300"
    }`}
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-semibold text-bodyText uppercase tracking-wider">
        {title}
      </span>
      <div className="p-1.5 rounded-lg bg-surface border border-gray-100">{icon}</div>
    </div>
    <div className="text-2xl font-bold text-heading tracking-tight">{value}</div>
    {subtext && (
      <p className="text-[11px] text-bodyText mt-1 truncate">{subtext}</p>
    )}
  </div>
);

const FinancialRow = ({ label, value, badge, highlight, subdued }) => (
  <div className="flex items-center justify-between py-1 border-b border-gray-100 last:border-b-0 text-xs">
    <div className="space-y-0.5">
      <span className={subdued ? "text-bodyText" : "text-heading font-medium"}>
        {label}
      </span>
      {badge && (
        <span className="block text-[10px] text-bodyText font-normal">
          {badge}
        </span>
      )}
    </div>
    <span
      className={`font-bold ${
        highlight
          ? "text-brand text-sm"
          : subdued
          ? "text-emerald-600"
          : "text-heading"
      }`}
    >
      {value}
    </span>
  </div>
);
