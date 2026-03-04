import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import Loading from "../components/Loading";
import DealsTab from "../components/admin/singleUserPerformance/DealsTab";
import QuoteTab from "../components/admin/singleUserPerformance/QuoteTab";
export default function AdminSingleUserPerformance() {
  const [activeTab, setActiveTab] = useState("deals");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const { userId } = useParams();
  const token = sessionStorage.getItem("token");
  const COLORS = ["#ef4444", "#dc2626", "#b91c1c", "#7f1d1d"];

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
            <DealsTab
              filteredDeals={filteredDeals}
              dealsByAmount={dealsByAmount}
              dealsByStage={dealsByStage}
            />
          </>
        )}

        {/* ================= QUOTES ================= */}
        {activeTab === "quotes" && (
          <>
            <QuoteTab filteredQuotes={filteredQuotes} quotesData={quotesData} />
          </>
        )}

        {activeTab === "orders" && (
          <>
            <p className="text-center">Under Development</p>
          </>
        )}

        {activeTab === "revenue" && (
          <>
            <p className="text-center">Under Development</p>
            {/* <QuoteTab filteredQuotes={filteredQuotes} quotesData={quotesData} /> */}
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
