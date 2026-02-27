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

const COLORS = ["#ef4444", "#dc2626", "#b91c1c", "#7f1d1d"];

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
    dealAnalytics,
    accountAnalytics,
    contactAnalytics,
    userAnalytics,
    relationshipOverview,
    USD_RATE,
  } = data;
  const { quoteStatus } = data;

  const { dealsByAmount, dealsByStageAmount, dealStages } = dealAnalytics || {};
  const { accountsByIndustry, accountsByType, dealsPerAccount } =
    accountAnalytics || {};
  const { contactsPerAccount } = contactAnalytics || {};
  const { userPerformance } = userAnalytics || {};

  return (
    <div className="bg-black min-h-screen p-8 text-white">
      <div className="max-w-screen-2xl mx-auto">
        {/* ================= HEADER ================= */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-red-500">
            Admin Control Panel
          </h1>
          <p className="text-gray-400 text-sm">
            Primary Currency: PKR | Live USD Rate: {USD_RATE || "-"}
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
            title="Pipeline Revenue"
            value={summaryStats.pipelineValue.toLocaleString()}
            description="Revenue in pipeline"
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

        {/* ================= BUSINESS HEALTH ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <HealthCard
            title="Sales Health"
            value={
              summaryStats.totalRevenue === 0
                ? "High Risk"
                : summaryStats.winRate < 20
                ? "Needs Attention"
                : "Healthy"
            }
          />
          <HealthCard
            title="Accounts Without Contacts"
            value={
              summaryStats.totalAccounts -
              relationshipOverview.accountsWithContacts
            }
          />
          <HealthCard
            title="Active Sales Users"
            value={userPerformance?.length || 0}
          />
        </div>

        {/* ================= DASHBOARD FILTER BUTTONS ================= */}
        <div className="flex flex-wrap gap-3 mb-10">
          {[
            { key: "deals", label: "Deals" },
            { key: "revenue", label: "Revenue" },
            { key: "quotes", label: "Quotes" },
            { key: "accounts", label: "Accounts" },
            { key: "contacts", label: "Contacts" },
          ].map((btn) => (
            <button
              key={btn.key}
              onClick={() => setActiveTab(btn.key)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all
        ${
          activeTab === btn.key
            ? "bg-red-600 text-white shadow-lg"
            : "bg-[#111] border border-white/10 hover:border-red-500 text-gray-400"
        }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* ================= DYNAMIC SECTION ================= */}
        <div className="mt-6">
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
            />
          )}

          {activeTab === "contacts" && (
            <ContactsSection contactsPerAccount={contactsPerAccount} />
          )}
        </div>

        {/* ============================================================== */}

        {/* <ChartCard title="Top Deals by Amount">
          {dealsByAmount?.length ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={dealsByAmount}>
                <CartesianGrid stroke="#222" />
                <XAxis dataKey="dealName" stroke="#aaa" hide />
                <YAxis stroke="#aaa" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#111] border border-red-500 p-3 rounded">
                          <p className="font-semibold text-white">
                            {d.dealName}
                          </p>
                          <p className="text-sm text-gray-400">
                            Stage: {d.stage}
                          </p>
                          <p className="text-red-400 font-semibold">
                            Amount: Rs {d.amount.toLocaleString()}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="amount" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </ChartCard>

        <ChartCard title="Total Deal Amount by Stage">
          {dealsByStageAmount?.length ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={dealsByStageAmount}>
                <CartesianGrid stroke="#222" />
                <XAxis dataKey="_id" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#111] border border-red-500 p-3 rounded">
                          <p className="font-semibold text-white">{d._id}</p>
                          <p className="text-gray-400 text-sm">
                            Deals: {d.dealCount}
                          </p>
                          <p className="text-red-400 font-semibold">
                            Total: Rs {d.totalAmount.toLocaleString()}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="totalAmount" fill="#dc2626" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </ChartCard> */}

        {/* <div className="grid grid-cols-1 md:grid-cols-2">
          <ChartCard title="Top Deals by Amount">
            {dealsByAmount?.length ? (
              <div style={{ width: "100%", aspectRatio: 1.618, maxWidth: 700 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dealsByAmount}>
                    <CartesianGrid stroke="#222" />

                    <XAxis
                      dataKey="dealName"
                      stroke="#aaa"
                      tick={{ fill: "#aaa", fontSize: 12 }}
                      hide
                    />

                    <YAxis
                      stroke="#aaa"
                      tick={{ fill: "#aaa", fontSize: 12 }}
                    />

                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload?.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-[#111] border border-red-500 p-3 rounded shadow-xl">
                              <p className="font-semibold text-white">
                                {d.dealName}
                              </p>
                              <p className="text-sm text-gray-400">
                                Stage: {d.stage}
                              </p>
                              <p className="text-red-400 font-semibold">
                                Amount: Rs {d.amount.toLocaleString()}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />

                    <Legend />

                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#ef4444"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 8 }}
                      name="Deal Amount"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <NoData />
            )}
          </ChartCard>

          <ChartCard title="Deal Value Distribution by Stage">
            {dealsByStageAmount?.length ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload?.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-[#111] border border-red-500 p-3 rounded shadow-xl">
                            <p className="font-semibold text-white">{d._id}</p>
                            <p className="text-gray-400 text-sm">
                              Deals: {d.dealCount}
                            </p>
                            <p className="text-red-400 font-semibold">
                              Total: Rs {d.totalAmount.toLocaleString()}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={dealsByStageAmount}
                    dataKey="totalAmount"
                    nameKey="_id"
                    outerRadius={110}
                  >
                    {dealsByStageAmount.map((_, index) => (
                      <Cell
                        key={index}
                        fill={
                          [
                            "#ef4444",
                            "#dc2626",
                            "#b91c1c",
                            "#7f1d1d",
                            "#991b1b",
                          ][index % 5]
                        }
                      />
                    ))}
                    <Legend />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <NoData />
            )}
          </ChartCard>
        </div> */}

        {/* ================= OPERATIONS ================= */}
        {/* <SectionTitle title="Pipeline & Operational Health" />

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
        </div> */}

        {/* ================= REVENUE INTELLIGENCE ================= */}
        {/* <SectionTitle title="Revenue & Growth Intelligence" />

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
        </div> */}

        {/* ================= SALES PERFORMANCE ================= */}
        {/* <SectionTitle title="Sales Team Performance" />

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
        </div> */}
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

const RevenueSection = ({ revenueTrend, userPerformance }) => (
  <div className="space-y-10">
    <SectionTitle title="Revenue Intelligence" />

    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {/* Revenue Trend */}
      <ChartCard title="Revenue Trend (Last 6 Months)">
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

      {/* User Performance */}
      <ChartCard title="Revenue by Sales User">
        {userPerformance?.length ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={userPerformance}>
              <CartesianGrid stroke="#222" />
              <XAxis dataKey="name" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Bar dataKey="totalRevenue" fill="#dc2626" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <NoData />
        )}
      </ChartCard>
    </div>
  </div>
);

const DealsSection = ({ dealsByAmount, dealsByStageAmount, dealStages }) => (
  <div className="space-y-10">
    <SectionTitle title="Deal Performance Intelligence" />

    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {/* Top Deals */}
      <ChartCard title="Top Deals by Value">
        {dealsByAmount?.length ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={dealsByAmount}>
              <CartesianGrid stroke="#222" />
              <XAxis
                dataKey="dealName"
                stroke="#aaa"
                tick={{ fill: "#aaa", fontSize: 12 }}
                interval={0}
                angle={-20}
                textAnchor="end"
              />
              <YAxis stroke="#aaa" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#ef4444", fontWeight: 600 }}
                formatter={(value) => [
                  `PKR ${value.toLocaleString()}`,
                  "Amount",
                ]}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#ef4444"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <NoData />
        )}
      </ChartCard>

      {/* Value by Stage */}
      <ChartCard title="Deal Value Distribution">
        {dealsByStageAmount?.length ? (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Tooltip />
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

    {/* Stage Funnel */}
    <ChartCard title="Deal Stage Funnel">
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
  </div>
);

const QuotesSection = ({ quoteStatus }) => (
  <div>
    <SectionTitle title="Quote Analytics" />

    <ChartCard title="Quote Status Breakdown">
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
);

const AccountsSection = ({
  accountsByIndustry,
  accountsByType,
  dealsPerAccount,
}) => (
  <div className="space-y-10">
    <SectionTitle title="Account Intelligence" />

    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <ChartCard title="Accounts by Industry">
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Tooltip />
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
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Deals per Account">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={dealsPerAccount}>
            <CartesianGrid stroke="#222" />
            <XAxis dataKey="accountName" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip />
            <Bar dataKey="dealCount" fill="#dc2626" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  </div>
);

const ContactsSection = ({ contactsPerAccount }) => (
  <div>
    <SectionTitle title="Contact Distribution by Account" />

    <ChartCard title="Contacts per Account">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={contactsPerAccount}>
          <CartesianGrid stroke="#222" />
          <XAxis dataKey="accountName" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip />
          <Bar dataKey="contactCount" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  </div>
);

const HealthCard = ({ title, value }) => (
  <div className="bg-[#0f172a] border border-white/10 p-5 rounded-2xl">
    <p className="text-xs text-gray-400">{title}</p>
    <p className="text-xl font-bold text-red-500 mt-2">{value}</p>
  </div>
);
