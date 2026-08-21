import { useEffect, useState, useMemo, useCallback } from "react";
import DealsAnalyticsModal from "../components/staff/charts/DealsAnalyticsModal";
import AddDealModal from "../components/staff/deals/AddDealModal";
import EditDealModal from "../components/staff/deals/EditDealModal";
import ViewDealModal from "../components/staff/deals/ViewDealModal";
import { Plus, BarChart3 } from "lucide-react";
import StageUpdateModal from "../components/staff/deals/StageUpdateModal";
import { usePagedList } from "../hooks/usePagedList";
import ListToolbar from "../components/lists/ListToolbar";
import PaginationBar from "../components/lists/PaginationBar";
import { DEAL_STAGES } from "../lib/crm";

const StaffDealsPage = () => {
  const [usdRate, setUsdRate] = useState(0);
  const [showModal, setShowModal] = useState("");
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [stageFilter, setStageFilter] = useState("all");
  const [currencyFilter, setCurrencyFilter] = useState("all");
  const extraFilters = useMemo(
    () => ({
      stage: stageFilter,
      currency: currencyFilter,
    }),
    [stageFilter, currencyFilter]
  );
  const list = usePagedList("deals/my", extraFilters);
  const deals = list.items;

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
    fetchUsdRate();
  }, [fetchUsdRate]);

  const convertToPKR = (deal) => {
    if (!deal.amount) return 0;
    if ((deal.currency || "PKR") === "USD") {
      return usdRate ? deal.amount * usdRate : 0;
    }
    return deal.amount;
  };

  const totalPipeline = deals.reduce((acc, d) => acc + convertToPKR(d), 0);

  const formatMoney = (deal) => {
    if (currencyFilter === "PKR") {
      return `PKR ${convertToPKR(deal).toLocaleString()}`;
    }
    if (currencyFilter === "USD") {
      return `USD ${deal.amount?.toLocaleString()}`;
    }
    return `${deal.currency || "PKR"} ${deal.amount?.toLocaleString()}`;
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case "Closed Won":
        return "bg-emerald-50 text-emerald-700";
      case "Closed Lost":
        return "bg-red-50 text-red-400";
      case "Qualification":
        return "bg-brand/10 text-brand";
      case "Proposal/Price Quote":
        return "bg-gray-100 text-bodyText";
      default:
        return "bg-gray-100 text-bodyText";
    }
  };

  const View = (deal) => {
    setSelectedDeal(deal);
    setShowModal("View");
  };

  /* ================= UI ================= */

  return (
    <div className="p-8 text-heading space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-brand">Deals Pipeline</h1>
          <p className="text-bodyText text-sm mt-1">
            Primary Currency: PKR | Live USD Rate:{" "}
            {usdRate ? usdRate.toFixed(2) : "Loading..."}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowModal("Analytics")}
            className="flex items-center gap-2 bg-surface hover:bg-gray-100 px-4 py-2 rounded-lg border border-gray-200"
          >
            <BarChart3 size={16} />
            Analytics
          </button>

          <button
            onClick={() => setShowModal("Add")}
            className="flex items-center gap-2 bg-brand hover:bg-brand/90 px-4 py-2 rounded-lg font-semibold"
          >
            <Plus size={16} />
            Add Deal
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <KpiCard
          label="Total Deals"
          showPKR={false}
          value={deals.length}
        />
        <KpiCard
          label="Pipeline Value (PKR)"
          value={totalPipeline.toLocaleString()}
        />
      </div>

      <ListToolbar
        search={list.searchInput}
        onSearch={list.setSearchInput}
        searchPlaceholder="Search deals..."
        showArchive={false}
        onReset={() => {
          list.setSearchInput("");
          setStageFilter("all");
          setCurrencyFilter("all");
        }}
        filters={[
          {
            name: "stage",
            allLabel: "All stages",
            value: stageFilter,
            onChange: setStageFilter,
            options: DEAL_STAGES,
          },
          {
            name: "currency",
            allLabel: "All currencies",
            value: currencyFilter,
            onChange: setCurrencyFilter,
            options: ["PKR", "USD"],
          },
        ]}
      />

      {/* TABLE */}
      <div className="bg-card border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card text-bodyText">
            <tr>
              <th className="px-6 py-4 text-left">Deal</th>
              <th className="px-6 py-4 text-left">Stage</th>
              <th className="px-6 py-4 text-left">Amount</th>
              <th className="px-6 py-4 text-left">Currencry</th>
              <th className="px-6 py-4 text-left">Probability</th>
              <th className="px-6 py-4 text-left">Closing Date</th>

              <th className="px-6 py-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {list.loading ? (
              <tr>
                <td colSpan="7" className="text-center py-10 text-gray-500">
                  Loading deals...
                </td>
              </tr>
            ) : deals.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-10 text-gray-500">
                  No deals found
                </td>
              </tr>
            ) : (
              deals.map((deal) => (
                <tr
                  key={deal._id}
                  className="border-t border-gray-200 hover:bg-surface transition"
                >
                  <td
                    className="px-6 py-4 cursor-pointer"
                    onClick={() => View(deal)}
                  >
                    <div className="font-semibold">{deal.dealName}</div>
                    <div className="text-xs text-bodyText">
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
                    {deal.currency || "-"}
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
                      className="hover:text-brand hover:underline "
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setShowModal("updateStage");
                        setSelectedDeal(deal);
                      }}
                      className="hover:text-brand hover:underline "
                    >
                      Update-stage
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <PaginationBar
          page={list.page}
          pages={list.pagination.pages}
          total={list.pagination.total}
          limit={list.limit}
          onPage={list.setPage}
          onLimit={list.setLimit}
        />
      </div>

      {/* MODALS */}
      {showModal === "Add" && (
        <AddDealModal onClose={() => setShowModal("")} onSuccess={list.reload} />
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
          onSuccess={list.reload}
        />
      )}

      {showModal === "updateStage" && (
        <StageUpdateModal
          deal={selectedDeal}
          onClose={() => {
            setShowModal("");
            setSelectedDeal(null);
          }}
          onSuccess={list.reload}
        />
      )}
    </div>
  );
};

const KpiCard = ({ label, value, showPKR = true }) => (
  <div className="bg-card border border-gray-200 rounded-xl p-6">
    <p className="text-xs text-bodyText uppercase tracking-wide">{label}</p>
    <p className="text-2xl font-bold mt-2 text-brand">
      {showPKR ? "PKR" : ""} {value}
    </p>
  </div>
);

export default StaffDealsPage;
