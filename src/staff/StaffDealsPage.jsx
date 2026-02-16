import { useEffect, useState, useMemo, useCallback } from "react";
import DealsAnalyticsModal from "../components/staff/charts/DealsAnalyticsModal";
import AddDealModal from "../components/staff/deals/AddDealModal";
import EditDealModal from "../components/staff/deals/EditDealModal";
// import StageUpdateModal from "../components/staff/deals/StageUpdateModal";
import ViewDealModal from "../components/staff/deals/ViewDealModal";
import { Search, Plus, BarChart3 } from "lucide-react";
import UpdateQuoteStageModal from "../components/staff/quote/UpdateQuoteStageModal";

const StaffDealsPage = () => {
  const token = sessionStorage.getItem("token");

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usdRate, setUsdRate] = useState(0);

  const [showModal, setShowModal] = useState("");
  const [selectedDeal, setSelectedDeal] = useState(null);

  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [currencyFilter, setCurrencyFilter] = useState("ALL");

  /* ================= FETCH DEALS ================= */

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}deals/my`, {
        headers: { authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setDeals(data || []);
    } catch (err) {
      console.error("Failed to fetch deals");
    } finally {
      setLoading(false);
    }
  }, [token]);

  /* ================= FETCH USD RATE ================= */

  const fetchUsdRate = useCallback(async () => {
    try {
      const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      const data = await res.json();
      setUsdRate(data?.rates?.PKR || 0);
    } catch (err) {
      console.error("Failed to fetch USD rate");
    }
  }, []);

  useEffect(() => {
    fetchDeals();
    fetchUsdRate();
  }, [fetchDeals, fetchUsdRate]);

  /* ================= FILTERING ================= */

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const matchesSearch =
        deal.dealName?.toLowerCase().includes(search.toLowerCase()) ||
        deal.account?.accountName?.toLowerCase().includes(search.toLowerCase());

      const matchesStage = stageFilter === "ALL" || deal.stage === stageFilter;

      const matchesCurrency =
        currencyFilter === "ALL" ||
        (currencyFilter === "PKR" && (deal.currency || "PKR") === "PKR") ||
        (currencyFilter === "USD" && deal.currency === "USD");

      return matchesSearch && matchesStage && matchesCurrency;
    });
  }, [deals, search, stageFilter, currencyFilter]);

  const convertToPKR = (deal) => {
    if (!deal.amount) return 0;
    if ((deal.currency || "PKR") === "USD") {
      return usdRate ? deal.amount * usdRate : 0;
    }
    return deal.amount;
  };

  const convertExpectedToPKR = (deal) => {
    if (!deal.expectedRevenue) return 0;
    if ((deal.currency || "PKR") === "USD") {
      return usdRate ? deal.expectedRevenue * usdRate : 0;
    }
    return deal.expectedRevenue;
  };

  /* ================= KPI (PRIMARY CURRENCY PKR) ================= */

  const totalPipeline = filteredDeals.reduce(
    (acc, d) => acc + convertToPKR(d),
    0
  );

  const totalExpected = filteredDeals.reduce(
    (acc, d) => acc + convertExpectedToPKR(d),
    0
  );

  /* ================= HELPERS ================= */

  const formatMoney = (deal) => {
    if (currencyFilter === "PKR") {
      return `PKR ${convertToPKR(deal).toLocaleString()}`;
    }

    if (currencyFilter === "USD") {
      return `USD ${deal.amount?.toLocaleString()}`;
    }

    // ALL → show original currency
    return `${deal.currency || "PKR"} ${deal.amount?.toLocaleString()}`;
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case "Closed Won":
        return "bg-green-500/20 text-green-400";
      case "Closed Lost":
        return "bg-red-500/20 text-red-400";
      case "Qualification":
        return "bg-blue-500/20 text-blue-400";
      case "Proposal/Price Quote":
        return "bg-purple-500/20 text-purple-400";
      default:
        return "bg-gray-700 text-gray-300";
    }
  };

  const View = (deal) => {
    setSelectedDeal(deal);
    setShowModal("View");
  };

  /* ================= UI ================= */

  return (
    <div className="p-8 text-white space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-red-500">Deals Pipeline</h1>
          <p className="text-gray-400 text-sm mt-1">
            Primary Currency: PKR | Live USD Rate:{" "}
            {usdRate ? usdRate.toFixed(2) : "Loading..."}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowModal("Analytics")}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg border border-gray-700"
          >
            <BarChart3 size={16} />
            Analytics
          </button>

          <button
            onClick={() => setShowModal("Add")}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold"
          >
            <Plus size={16} />
            Add Deal
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <KpiCard label="Total Deals" value={filteredDeals.length} />
        <KpiCard
          label="Pipeline Value (PKR)"
          value={totalPipeline.toLocaleString()}
        />
        <KpiCard
          label="Expected Revenue (PKR)"
          value={totalExpected.toLocaleString()}
        />
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3 top-3 text-gray-500" />
          <input
            type="text"
            placeholder="Search deals or accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex gap-3">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2"
          >
            <option value="ALL">All Stages</option>
            {[...new Set(deals.map((d) => d.stage))].map((stage) => (
              <option key={stage}>{stage}</option>
            ))}
          </select>

          <select
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2"
          >
            <option value="ALL">All Currencies</option>
            <option value="PKR">PKR</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-[#0f172a] border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              <th className="px-6 py-4 text-left">Deal</th>
              <th className="px-6 py-4 text-left">Stage</th>
              <th className="px-6 py-4 text-left">Amount</th>
              <th className="px-6 py-4 text-left">Probability</th>
              <th className="px-6 py-4 text-left">Closing Date</th>

              <th className="px-6 py-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-500">
                  Loading deals...
                </td>
              </tr>
            ) : (
              filteredDeals.map((deal) => (
                <tr
                  key={deal._id}
                  className="border-t border-gray-800 hover:bg-gray-900 transition"
                >
                  <td
                    className="px-6 py-4 cursor-pointer"
                    onClick={() => View(deal)}
                  >
                    <div className="font-semibold">{deal.dealName}</div>
                    <div className="text-xs text-gray-400">
                      {deal.account?.accountName || "-"}
                    </div>
                  </td>

                  <td onClick={() => View(deal)} className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${getStageColor(
                        deal.stage
                      )}`}
                    >
                      {deal.stage}
                    </span>
                  </td>

                  <td onClick={() => View(deal)} className="px-6 py-4">
                    {formatMoney(deal)}
                  </td>

                  <td onClick={() => View(deal)} className="px-6 py-4">
                    {deal.probability}%
                  </td>

                  <td onClick={() => View(deal)} className="px-6 py-4">
                    {deal.closingDate
                      ? new Date(deal.closingDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setShowModal("Edit");
                        setSelectedDeal(deal);
                      }}
                      className="hover:text-blue-700 hover:underline "
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setShowModal("updateStage");
                        setSelectedDeal(deal);
                      }}
                      className="hover:text-blue-700 hover:underline "
                    >
                      Update-stage
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODALS */}
      {showModal === "Add" && (
        <AddDealModal onClose={() => setShowModal("")} onSuccess={fetchDeals} />
      )}
      {showModal === "View" && (
        <ViewDealModal deal={selectedDeal} onClose={() => setShowModal("")} />
      )}
      {showModal === "Analytics" && (
        <DealsAnalyticsModal deals={deals} onClose={() => setShowModal("")} />
      )}
      {showModal === "Edit" && (
        <EditDealModal
          deal={selectedDeal}
          onClose={() => {
            setShowModal("");
            setSelectedDeal(null);
          }}
          onSuccess={fetchDeals}
        />
      )}

      {showModal === "updateStage" && (
        <UpdateQuoteStageModal
          deal={selectedDeal}
          onClose={() => {
            setShowModal("");
            setSelectedDeal(null);
          }}
          onSuccess={fetchDeals}
        />
      )}
    </div>
  );
};

const KpiCard = ({ label, value }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
    <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
    <p className="text-2xl font-bold mt-2">PKR {value}</p>
  </div>
);

export default StaffDealsPage;
