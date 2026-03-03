import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
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
  BarChart,
  Bar,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import Loading from "../components/Loading";

const COLORS = ["#ef4444", "#dc2626", "#b91c1c", "#7f1d1d"];

export default function AdminSingleUserPerformance({
  View,
  setShowModal,
  setSelectedAccount,
  setSelectedContact,
  setSelectedDeal,
  setViewQuote,
  setEditQuote,
  setStagePipeline,
  setViewOrder,
  setShowApproveSO,
}) {
  const [activeTab, setActiveTab] = useState("deals");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const { userId } = useParams();
  const token = sessionStorage.getItem("token");

  /* ================= FETCH ================= */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}dashboard/user/${userId}`,
          { headers: { authorization: `bearer ${token}` } }
        );
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  /* ================= SAFE DEFAULTS ================= */

  const user = data?.user || {};
  const stats = data?.stats || {};
  const tables = data?.tables || {};

  const filteredDeals = tables?.activeDeals || [];
  const filteredQuotes = tables?.activeQuotes || [];
  const confirmedQuotes = tables?.activeSellOrders || [];

  /* ================= CHART DATA ================= */

  const dealsByAmount = useMemo(
    () =>
      filteredDeals.map((d) => ({
        dealName: d.dealName,
        amount: d.amount || 0,
      })),
    [filteredDeals]
  );

  const dealsByStage = useMemo(() => {
    const stageMap = {};
    filteredDeals.forEach((d) => {
      stageMap[d.stage] = (stageMap[d.stage] || 0) + (d.amount || 0);
    });

    return Object.keys(stageMap).map((stage) => ({
      name: stage,
      value: stageMap[stage],
    }));
  }, [filteredDeals]);

  const revenueTrend = useMemo(() => {
    const monthMap = {};
    filteredDeals
      .filter((d) => d.stage === "Closed Won")
      .forEach((d) => {
        const month = new Date(d.createdAt).toLocaleString("default", {
          month: "short",
        });
        monthMap[month] = (monthMap[month] || 0) + (d.amount || 0);
      });

    return Object.keys(monthMap).map((m) => ({
      month: m,
      revenue: monthMap[m],
    }));
  }, [filteredDeals]);

  const quotesData = useMemo(() => {
    const map = {};
    filteredQuotes.forEach((q) => {
      map[q.quoteStage] = (map[q.quoteStage] || 0) + 1;
    });

    return Object.keys(map).map((stage) => ({
      name: stage,
      value: map[stage],
    }));
  }, [filteredQuotes]);

  if (loading)
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );

  /* ================= UI ================= */

  return (
    <div className="bg-black min-h-screen p-8 text-white">
      <div className="max-w-screen-2xl mx-auto space-y-12">
        {/* ================= USER STATUS ================= */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-8 flex flex-col lg:flex-row justify-between gap-8">
          <div>
            <h1 className="text-3xl font-bold text-red-500 capitalize">
              {user.name}
            </h1>
            <p className="text-gray-400 mt-1">
              {user.isActive ? "Active User" : "Inactive User"}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {user.email} • {user.phone}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatusCard label="Total Deals" value={stats.totalDeals} />
            <StatusCard
              label="Revenue"
              value={`PKR ${stats.totalRevenue?.toLocaleString() || 0}`}
            />
            <StatusCard label="Win Rate" value={`${stats.winRate}%`} />
            <StatusCard label="Total Quotes" value={stats.totalQuotes} />
          </div>
        </div>

        {/* ================= TABS ================= */}
        <div className="flex gap-4">
          {["deals", "revenue", "quotes", "orders"].map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-6 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === key
                  ? "bg-red-600 text-white"
                  : "bg-[#111] border border-white/10 text-gray-400 hover:border-red-500"
              }`}
            >
              {key === "orders"
                ? "Sell Orders"
                : key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>

        {/* ================= DEALS ================= */}
        {activeTab === "deals" && (
          <>
            <details>
              <summary>Visuals</summary>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <ChartCard title="Deal Amount Trend">
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={dealsByAmount}>
                      <CartesianGrid stroke="#1f1f1f" />
                      <XAxis dataKey="dealName" stroke="#aaa" />
                      <YAxis stroke="#aaa" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#ef4444"
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Deal Stage Distribution">
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Tooltip />
                      <Pie
                        data={dealsByStage}
                        dataKey="value"
                        outerRadius={110}
                      >
                        {dealsByStage.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            </details>

            {/* DEAL TABLE */}
            <TableWrapper>
              {filteredDeals.length === 0 ? (
                <EmptyRow colSpan={10} message="No deals found" />
              ) : (
                filteredDeals.map((deal) => (
                  <tr
                    key={deal._id}
                    className="border-t border-gray-800 hover:bg-gray-900"
                  >
                    <td className="p-3">{deal.dealName}</td>
                    <td className="p-3">{deal.account?.accountName}</td>
                    <td className="p-3">{deal.stage}</td>
                    <td className="p-3">
                      {deal.amount?.toLocaleString() || 0}
                    </td>
                    <td className="p-3">{deal.currency}</td>
                    <td className="p-3">
                      {deal.contact?.firstName} {deal.contact?.lastName}
                    </td>
                    <td className="p-3">
                      {new Date(deal.closingDate).toLocaleDateString()}
                    </td>
                    <td className="p-3">{deal.probability}%</td>
                    <td className="p-3">{deal.dealOwner?.name}</td>
                    <td className="p-3 flex gap-3">
                      <button className="text-blue-400">View</button>
                      <button className="text-purple-500">
                        Stage-Pipeline
                      </button>
                      <button className="text-yellow-400">Edit</button>
                    </td>
                  </tr>
                ))
              )}
            </TableWrapper>
          </>
        )}

        {/* ================= QUOTES ================= */}
        {activeTab === "quotes" && (
          <>
            <ChartCard title="Quote Status Breakdown">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Tooltip />
                  <Pie data={quotesData} dataKey="value" outerRadius={120}>
                    {quotesData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <TableWrapper>
              {filteredQuotes.length === 0 ? (
                <EmptyRow colSpan={10} message="No quotes found" />
              ) : (
                filteredQuotes.map((q) => (
                  <tr
                    key={q._id}
                    className="border-t border-gray-800 hover:bg-gray-900"
                  >
                    <td className="p-3">{q.quoteNumber || "-"}</td>
                    <td className="p-3">{q.subject}</td>
                    <td className="p-3">
                      {typeof q.deal === "object" ? q.deal?.dealName : q.deal}
                    </td>
                    <td className="p-3">{q.account?.accountName}</td>
                    <td className="p-3">{q.quoteStage}</td>
                    <td className="p-3">
                      {q.contact?.firstName} {q.contact?.lastName}
                    </td>
                    <td className="p-3">
                      {q.grandTotal?.toLocaleString() || 0}
                    </td>
                    <td className="p-3">
                      {q.validUntil
                        ? new Date(q.validUntil).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="p-3">{q.quoteOwner?.name}</td>
                    <td className="p-3">
                      <a
                        href={`${process.env.REACT_APP_BACKEND_URL}quotes/${q._id}/pdf`}
                        className="text-green-400"
                      >
                        PDF
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </TableWrapper>
          </>
        )}
      </div>
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

const StatusCard = ({ label, value }) => (
  <div className="bg-black/40 border border-white/10 rounded-xl p-4">
    <p className="text-gray-400 text-xs">{label}</p>
    <h3 className="text-lg font-semibold text-red-500 mt-1">{value}</h3>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
    <h2 className="text-lg font-semibold mb-6">{title}</h2>
    {children}
  </div>
);

const TableWrapper = ({ children }) => (
  <div className="bg-black border border-gray-800 rounded overflow-x-auto">
    <table className="w-full text-sm">
      <tbody>{children}</tbody>
    </table>
  </div>
);

const EmptyRow = ({ colSpan, message }) => (
  <tr>
    <td colSpan={colSpan} className="text-center py-6 text-gray-400">
      {message}
    </td>
  </tr>
);
