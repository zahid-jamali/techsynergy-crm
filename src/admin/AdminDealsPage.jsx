import { useEffect, useState } from "react";
import AddDealModal from "../components/staff/deals/AddDealModal";
import EditDealModal from "../components/staff/deals/EditDealModal";
import StageUpdateModal from "../components/staff/deals/StageUpdateModal";
import ViewDealModal from "../components/staff/deals/ViewDealModal";

const AdminDealsPage = () => {
  const token = sessionStorage.getItem("token");
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState("");
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}deals/all`, {
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
  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      deal.dealName?.toLowerCase().includes(search.toLowerCase()) ||
      deal.account?.accountName?.toLowerCase().includes(search.toLowerCase()) ||
      `${deal.contact?.firstName} ${deal.contact?.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStage = stageFilter === "all" || deal.stage === stageFilter;

    const matchesOwner =
      ownerFilter === "all" || deal.dealOwner?._id === ownerFilter;

    return matchesSearch && matchesStage && matchesOwner;
  });

  return (
    <div className="p-6 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-red-500">Deals</h1>
        {/* <button
          onClick={() => {
            setShowModal("Add");
          }}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-semibold"
        >
          + Add Deal
        </button> */}
      </div>

      {/* Filters */}
      <div className="bg-black border border-gray-800 rounded-lg p-4 mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search deal, account or contact..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white w-64 focus:outline-none focus:border-red-500"
        />

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm"
        >
          <option value="all">All Stages</option>
          <option value="Prospecting">Prospecting</option>
          <option value="Qualification">Qualification</option>
          <option value="Proposal">Proposal</option>
          <option value="Negotiation">Negotiation</option>
          <option value="Closed Won">Closed Won</option>
          <option value="Closed Lost">Closed Lost</option>
        </select>

        <select
          value={ownerFilter}
          onChange={(e) => setOwnerFilter(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm"
        >
          <option value="all">All Owners</option>
          {[
            ...new Map(
              deals.map((d) => [d.dealOwner?._id, d.dealOwner])
            ).values(),
          ]
            .filter(Boolean)
            .map((owner) => (
              <option key={owner._id} value={owner._id}>
                {owner.name}
              </option>
            ))}
        </select>

        <button
          onClick={() => {
            setSearch("");
            setStageFilter("all");
            setOwnerFilter("all");
          }}
          className="text-sm text-gray-400 hover:text-red-400"
        >
          Reset
        </button>
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
              <th className="px-4 py-3 text-left">POS</th>
              <th className="px-4 py-3 text-left">Closing Date</th>
              <th className="px-4 py-3 text-left">Probability</th>
              <th className="px-4 py-3 text-left">D/Owner</th>
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
            ) : filteredDeals.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-400">
                  No deals found
                </td>
              </tr>
            ) : (
              filteredDeals.map((deal) => (
                <tr
                  key={deal._id}
                  className="border-t border-gray-800 hover:bg-gray-900"
                >
                  <td className="px-4 py-3">{deal.dealName}</td>
                  <td className="px-4 py-3">
                    {deal.account?.accountName || "-"}
                  </td>
                  <td className="px-4 py-3">{deal.stage}</td>
                  <td className="px-4 py-3">{deal.amount?.toLocaleString()}</td>

                  <td className="px-4 py-3">
                    {deal.contact.firstName} {deal.contact.lastName}
                  </td>
                  <td className="px-4 py-3">
                    {deal.closingDate
                      ? new Date(deal.closingDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3">{deal.probability}</td>
                  <td className="px-4 py-3">{deal.dealOwner.name}</td>
                  <td className="px-4 py-3 flex gap-3">
                    <button
                      onClick={() => {
                        setSelectedDeal(deal);
                        setShowModal("View");
                      }}
                      className="text-blue-400 hover:underline"
                    >
                      View
                    </button>

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
    </div>
  );
};

export default AdminDealsPage;
