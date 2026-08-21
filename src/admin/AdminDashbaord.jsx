import { useEffect, useState } from "react";
import { Legend } from "recharts";
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
import Loading from "../components/Loading";

const COLORS = ["#021d54", "#1e4a8a", "#3b6fb6", "#93c5fd"];

const tooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  color: "#111827",
  boxShadow: "0 8px 24px rgba(2, 29, 84, 0.08)",
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("deals");
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
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loading />
      </div>
    );

  if (error)
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-red-600">
        {error}
      </div>
    );

  const {
    summaryStats,
    revenueTrend,
    dealAnalytics,
    accountAnalytics,
    contactAnalytics,
    userAnalytics,
    relationshipOverview,
    USD_RATE,
    quoteStatus,
  } = data || {};

  const { dealsByAmount, dealsByStageAmount, dealStages } = dealAnalytics || {};
  const { accountsByIndustry, accountsByType, dealsPerAccount, topAccountsByRevenue } =
    accountAnalytics || {};
  const { contactsPerAccount } = contactAnalytics || {};
  const { userPerformance } = userAnalytics || {};

  const money = (value) =>
    `PKR ${Math.round(Number(value || 0)).toLocaleString()}`;

  const downloadExcel = async ({ excelFile }) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}dashboard/${excelFile}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `crm-report-${excelFile}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">
            Primary currency PKR · Live USD rate: {USD_RATE || "-"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <ExecutiveCard
          title="Closed-won revenue"
          value={money(summaryStats?.totalRevenue)}
          description="Won deals, converted to PKR"
        />
        <ExecutiveCard
          title="Pipeline"
          value={money(summaryStats?.pipelineValue)}
          description="Open deal value"
        />
        <ExecutiveCard
          title="This month"
          value={money(summaryStats?.thisMonthRevenue)}
          description={`Growth ${summaryStats?.growthRate || 0}% vs last month`}
          highlight
        />
        <ExecutiveCard
          title="Win rate"
          value={`${summaryStats?.winRate || 0}%`}
          description={`${summaryStats?.totalDeals || 0} deals · avg ${money(summaryStats?.avgDealSize)}`}
        />
        <ExecutiveCard
          title="Team"
          value={summaryStats?.totalUsers || 0}
          description={`${summaryStats?.totalAccounts || 0} accounts · ${summaryStats?.totalContacts || 0} contacts`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <ExecutiveCard
          title="Quotes"
          value={summaryStats?.totalQuotes || 0}
          description={`${summaryStats?.confirmedQuotes || 0} confirmed`}
        />
        <ExecutiveCard
          title="Sell orders"
          value={summaryStats?.totalOrders || 0}
          description={`${summaryStats?.approvedOrders || 0} approved`}
        />
        <ExecutiveCard
          title="Delivered / billed"
          value={summaryStats?.deliveredOrders || 0}
          description="Delivered, finance or invoiced"
        />
        <ExecutiveCard
          title="Expected revenue"
          value={money(summaryStats?.expectedRevenue)}
          description="Weighted pipeline"
        />
        <ExecutiveCard
          title="Accounts without contacts"
          value={
            (summaryStats?.totalAccounts || 0) -
            (relationshipOverview?.accountsWithContacts || 0)
          }
          description={`${relationshipOverview?.accountsWithDeals || 0} accounts with deals`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <HealthCard
          title="Sales Health"
          value={
            !summaryStats?.totalRevenue
              ? "High Risk"
              : summaryStats.winRate < 20
              ? "Needs Attention"
              : "Healthy"
          }
        />
        <HealthCard
          title="Accounts With Contacts"
          value={relationshipOverview?.accountsWithContacts || 0}
        />
        <HealthCard
          title="Active Sales Users"
          value={userPerformance?.length || 0}
        />
      </div>

      <div className="card p-4 flex flex-wrap gap-3">
        <button
          onClick={() => downloadExcel({ excelFile: "pipeline" })}
          className="btn-secondary"
        >
          Download Pipeline
        </button>
        <button
          onClick={() => downloadExcel({ excelFile: "master" })}
          className="btn-secondary"
        >
          Download Master File
        </button>
        <button
          onClick={() => downloadExcel({ excelFile: "revenue" })}
          className="btn-secondary"
        >
          Download Revenue
        </button>
        <button
          onClick={() => downloadExcel({ excelFile: "user" })}
          className="btn-secondary"
        >
          Download Users
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: "deals", label: "Deals" },
          { key: "revenue", label: "Revenue" },
          { key: "quotes", label: "Quotes" },
          { key: "accounts", label: "Accounts" },
          { key: "contacts", label: "Contacts" },
          { key: "users", label: "Users" },
        ].map((btn) => (
          <button
            key={btn.key}
            onClick={() => setActiveTab(btn.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === btn.key
                ? "bg-brand text-white shadow-sm"
                : "bg-card border border-gray-200 text-bodyText hover:border-brand/30 hover:text-brand"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "revenue" && (
          <RevenueSection
            revenueTrend={revenueTrend}
            userPerformance={userPerformance}
          />
        )}

        {activeTab === "deals" && (
          <DealsSection
            dealsByAmount={dealsByAmount}
            dealsByStageAmount={dealsByStageAmount}
            dealStages={dealStages}
          />
        )}

        {activeTab === "quotes" && (
          <QuotesSection quoteStatus={quoteStatus} />
        )}

        {activeTab === "accounts" && (
          <AccountsSection
            accountsByIndustry={accountsByIndustry}
            accountsByType={accountsByType}
            dealsPerAccount={dealsPerAccount}
            topAccountsByRevenue={topAccountsByRevenue}
          />
        )}

        {activeTab === "contacts" && (
          <ContactsSection contactsPerAccount={contactsPerAccount} />
        )}

        {activeTab === "users" && (
          <UsersSection userPerformance={userPerformance} />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

const ExecutiveCard = ({ title, value, description, highlight }) => (
  <div
    className={`kpi-card ${highlight ? "ring-1 ring-brand/20" : ""}`}
  >
    <p className="text-bodyText text-sm">{title}</p>
    <h2 className="text-2xl font-semibold mt-2 text-brand">{value}</h2>
    <p className="text-bodyText text-xs mt-2">{description}</p>
  </div>
);

const SectionTitle = ({ title }) => (
  <h2 className="text-lg font-semibold mb-4 text-heading border-b border-gray-100 pb-2">
    {title}
  </h2>
);

const ChartCard = ({ title, children }) => (
  <div className="card p-5">
    <h3 className="text-base font-semibold mb-4 text-heading">{title}</h3>
    {children}
  </div>
);

const NoData = () => (
  <div className="h-[300px] flex items-center justify-center text-bodyText">
    No data available
  </div>
);

const RevenueSection = ({ revenueTrend, userPerformance }) => (
  <div className="space-y-6">
    <SectionTitle title="Revenue Intelligence" />

    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <ChartCard title="Revenue Trend (Last 6 Months)">
        {revenueTrend?.length ? (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={revenueTrend}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#021d54"
                fill="#93c5fd"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <NoData />
        )}
      </ChartCard>

      <ChartCard title="Revenue by Sales User">
        {userPerformance?.length ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={userPerformance}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="totalRevenue" fill="#021d54" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <NoData />
        )}
      </ChartCard>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className="bg-card border border-gray-200 rounded-lg p-3 shadow-elevate">
        <p className="text-brand font-semibold mb-1">{data.dealName}</p>
        <p className="text-bodyText text-sm">
          Account:{" "}
          <span className="text-heading">{data.account?.accountName}</span>
        </p>
        <p className="text-bodyText text-sm">
          Amount:{" "}
          <span className="text-heading">
            PKR {data.amount.toLocaleString()}
          </span>
        </p>
      </div>
    );
  }

  return null;
};

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className="bg-card border border-gray-200 rounded-lg p-3 shadow-elevate">
        <p className="text-brand font-semibold mb-1">{data._id}</p>
        <p className="text-bodyText text-sm">
          Total Amount:
          <span className="text-heading ml-1">
            PKR {data.totalAmount.toLocaleString()}
          </span>
        </p>
        <p className="text-bodyText text-sm">
          Deal Count:
          <span className="text-heading ml-1">{data.dealCount}</span>
        </p>
      </div>
    );
  }

  return null;
};

const DealsSection = ({ dealsByAmount, dealsByStageAmount, dealStages }) => (
  <div className="space-y-6">
    <SectionTitle title="Deal Performance Intelligence" />

    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <ChartCard title="Top Deals by Value">
        {dealsByAmount?.length ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={dealsByAmount}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis
                dataKey="dealName"
                stroke="#9ca3af"
                tick={{ fill: "#4b5563", fontSize: 12 }}
                interval={0}
                angle={-20}
                textAnchor="end"
              />
              <YAxis stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#021d54"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <NoData />
        )}
      </ChartCard>

      <ChartCard title="Deal Value Distribution">
        {dealsByStageAmount?.length ? (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Tooltip content={<CustomPieTooltip />} />
              <Pie
                data={dealsByStageAmount}
                dataKey="totalAmount"
                nameKey="_id"
                outerRadius={110}
              >
                {dealsByStageAmount.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <NoData />
        )}
      </ChartCard>
    </div>

    <ChartCard title="Deal Stage Funnel">
      {dealStages?.length ? (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={dealStages}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
            <XAxis dataKey="stage" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="count" fill="#021d54" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <NoData />
      )}
    </ChartCard>
  </div>
);

const QuotesSection = ({ quoteStatus }) => (
  <div>
    <SectionTitle title="Quote Analytics" />

    <ChartCard title="Quote Status Breakdown">
      {quoteStatus?.length ? (
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Tooltip contentStyle={tooltipStyle} />
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
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <NoData />
      )}
    </ChartCard>
  </div>
);

const AccountsSection = ({
  accountsByIndustry = [],
  accountsByType = [],
  dealsPerAccount = [],
  topAccountsByRevenue = [],
}) => (
  <div className="space-y-6">
    <SectionTitle title="Account Intelligence" />

    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <ChartCard title="Accounts by Industry">
        {accountsByIndustry?.length ? (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Tooltip contentStyle={tooltipStyle} />
              <Pie
                data={accountsByIndustry}
                dataKey="count"
                nameKey="_id"
                outerRadius={110}
              >
                {accountsByIndustry.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <NoData />
        )}
      </ChartCard>

      <ChartCard title="Accounts by Type">
        {accountsByType?.length ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={accountsByType}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis dataKey="_id" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#021d54" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <NoData />
        )}
      </ChartCard>
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <ChartCard title="Deals per Account">
        {dealsPerAccount?.length ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={dealsPerAccount}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis dataKey="accountName" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="dealCount" fill="#021d54" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <NoData />
        )}
      </ChartCard>

      <ChartCard title="Top Accounts by Won Revenue">
        {topAccountsByRevenue?.length ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={topAccountsByRevenue}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis dataKey="accountName" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="totalRevenue" fill="#3b6fb6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <NoData />
        )}
      </ChartCard>
    </div>
  </div>
);

const ContactsSection = ({ contactsPerAccount = [] }) => (
  <div>
    <SectionTitle title="Contact Distribution by Account" />

    <ChartCard title="Contacts per Account">
      {contactsPerAccount?.length ? (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={contactsPerAccount}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
            <XAxis dataKey="accountName" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="contactCount" fill="#021d54" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <NoData />
      )}
    </ChartCard>
  </div>
);

const UsersSection = ({ userPerformance = [] }) => (
  <div className="space-y-6">
    <SectionTitle title="Sales user performance" />
    <ChartCard title="Won revenue by user">
      {userPerformance?.length ? (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={userPerformance}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="totalRevenue" fill="#021d54" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <NoData />
      )}
    </ChartCard>
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-bodyText border-b border-gray-100">
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Won revenue</th>
            <th className="px-4 py-3">Pipeline</th>
            <th className="px-4 py-3">Deals</th>
            <th className="px-4 py-3">Won</th>
          </tr>
        </thead>
        <tbody>
          {(userPerformance || []).map((row) => (
            <tr key={row._id || row.email} className="border-b border-gray-50">
              <td className="px-4 py-3">
                <div className="font-medium text-heading">{row.name}</div>
                <div className="text-xs text-bodyText">{row.email}</div>
              </td>
              <td className="px-4 py-3">
                PKR {Math.round(row.totalRevenue || 0).toLocaleString()}
              </td>
              <td className="px-4 py-3">
                PKR {Math.round(row.pipelineValue || 0).toLocaleString()}
              </td>
              <td className="px-4 py-3">{row.totalDeals || 0}</td>
              <td className="px-4 py-3">{row.wonDeals || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const HealthCard = ({ title, value }) => (
  <div className="kpi-card">
    <p className="text-xs text-bodyText uppercase tracking-wide">{title}</p>
    <p className="text-xl font-semibold text-heading mt-2">{value}</p>
  </div>
);
