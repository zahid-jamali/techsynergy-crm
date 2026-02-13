import { useEffect, useState } from "react";
import DealsAnalyticsModal from "../components/staff/charts/DealsAnalyticsModal";
import AddDealModal from "../components/staff/deals/AddDealModal";
import EditDealModal from "../components/staff/deals/EditDealModal";
import StageUpdateModal from "../components/staff/deals/StageUpdateModal";
import ViewDealModal from "../components/staff/ViewDealModal";

const StaffDealsPage = () => {
  const token = sessionStorage.getItem("token");
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState("");
  const [selectedDeal, setSelectedDeal] = useState(null);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}deals/my`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setDeals(data || []);
    } catch (err) {
      console.error("Failed to fetch deals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const View = (deal) => {
    setSelectedDeal(deal);
    setShowModal("View");
  };

  return (
    <div className="p-6 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-red-500">Deals</h1>

        <div className="flex gap-3">
          <button
            onClick={() => setShowModal("Analytics")}
            className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-sm font-semibold border border-gray-700"
          >
            📊 Analytics
          </button>

          <button
            onClick={() => setShowModal("Add")}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-semibold"
          >
            + Add Deal
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-black border border-gray-800 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">Deal Name</th>
              <th className="px-4 py-3 text-left">Account</th>
              <th className="px-4 py-3 text-left">Stage</th>
              <th className="px-4 py-3 text-left">Amount</th>

              <th className="px-4 py-3 text-left">Probability</th>
              <th className="px-4 py-3 text-left">Closing Date</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-400">
                  Loading deals...
                </td>
              </tr>
            ) : deals.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-400">
                  No deals found
                </td>
              </tr>
            ) : (
              deals.map((deal) => (
                <tr
                  key={deal._id}
                  className="border-t border-gray-800 hover:bg-gray-900"
                >
                  <td onClick={() => View(deal)} className="px-4 py-3">
                    {deal.dealName}
                  </td>
                  <td onClick={() => View(deal)} className="px-4 py-3">
                    {deal.account?.accountName || "-"}
                  </td>
                  <td onClick={() => View(deal)} className="px-4 py-3">
                    {deal.stage}
                  </td>
                  <td onClick={() => View(deal)} className="px-4 py-3">
                    {deal.amount?.toLocaleString()}
                  </td>
                  <td className="relative group cursor-pointer">
                    <span>{deal.probability}%</span>

                    {/* Hover Card */}
                    <div className="absolute left-0 top-8 hidden group-hover:block z-20 bg-[#0f172a] border border-gray-700 rounded-lg p-3 w-48 shadow-xl">
                      <div className="text-xs text-gray-400 mb-2">
                        Win Probability
                      </div>

                      <div className="w-full bg-gray-800 h-2 rounded">
                        <div
                          className="bg-red-500 h-2 rounded"
                          style={{ width: `${deal.probability}%` }}
                        />
                      </div>

                      <div className="text-xs text-gray-400 mt-2">
                        Expected Revenue:
                        <span className="text-white ml-1">
                          {deal.currency}{" "}
                          {deal.expectedRevenue?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td onClick={() => View(deal)} className="px-4 py-3">
                    {deal.closingDate
                      ? new Date(deal.closingDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3 flex gap-3">
                    <button
                      onClick={() => {
                        setShowModal("Pipeline");
                        setSelectedDeal(deal);
                      }}
                      className="text-purple-500 hover:underline"
                    >
                      Stage-Pipeline
                    </button>

                    <button
                      onClick={() => {
                        setShowModal("Edit");
                        setSelectedDeal(deal);
                      }}
                      className="text-yellow-400 hover:underline"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal === "Add" && (
        <AddDealModal
          onClose={() => {
            setShowModal(false);
          }}
          onSuccess={fetchDeals}
        />
      )}
      {showModal === "View" && (
        <ViewDealModal
          deal={selectedDeal}
          onClose={() => {
            setSelectedDeal(null);
            setShowModal("");
          }}
        />
      )}

      {showModal === "Edit" && (
        <EditDealModal
          deal={selectedDeal}
          onClose={() => {
            setSelectedDeal(null);
            setShowModal("");
          }}
        />
      )}
      {showModal === "Pipeline" && (
        <StageUpdateModal
          deal={selectedDeal}
          onClose={() => {
            setSelectedDeal(null);
            setShowModal("");
          }}
          onSuccess={() => {
            fetchDeals();
            setSelectedDeal(null);
            setShowModal("");
          }}
        />
      )}

      {showModal === "Analytics" && (
        <DealsAnalyticsModal deals={deals} onClose={() => setShowModal("")} />
      )}
    </div>
  );
};

export default StaffDealsPage;
