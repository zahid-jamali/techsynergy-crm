import { useCallback, useEffect, useState } from "react";
import AddDealModal from "../components/staff/deals/AddDealModal";
import EditDealModal from "../components/staff/deals/EditDealModal";
import StageUpdateModal from "../components/staff/deals/StageUpdateModal";
import ViewDealModal from "../components/staff/deals/ViewDealModal";
import { BarChart3 } from "lucide-react";
import { Plus } from "lucide-react";
import DealsAnalyticsModal from "../components/staff/charts/DealsAnalyticsModal";
import ViewAccountModal from "../components/staff/account/ViewAccountModal";
import ViewContactModal from "../components/staff/contact/ViewContactModal";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
import Loading from "../components/Loading";

const TableSkeleton = ({ rows = 8 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse border-t border-gray-800">
          <td className="px-4 py-3">
            <div className="h-3 bg-gray-700 rounded w-40"></div>
          </td>

          <td className="px-4 py-3">
            <div className="h-3 bg-gray-700 rounded w-28"></div>
          </td>

          <td className="px-4 py-3">
            <div className="h-3 bg-gray-700 rounded w-20"></div>
          </td>

          <td className="px-4 py-3">
            <div className="h-3 bg-gray-700 rounded w-20"></div>
          </td>

          <td className="px-4 py-3">
            <div className="h-3 bg-gray-700 rounded w-20"></div>
          </td>

          <td className="px-4 py-3">
            <div className="h-3 bg-gray-700 rounded w-24"></div>
          </td>

          <td className="px-4 py-3">
            <div className="h-3 bg-gray-700 rounded w-24"></div>
          </td>

          <td className="px-4 py-3">
            <div className="h-3 bg-gray-700 rounded w-24"></div>
          </td>

          <td className="px-4 py-3">
            <div className="h-3 bg-gray-700 rounded w-28"></div>
          </td>
        </tr>
      ))}
    </>
  );
};

const AdminDealsPage = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState("");
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const { ref, inView } = useInView();
  const token = sessionStorage.getItem("token");

  const fetchDeals = useCallback(
    async (pageNumber = 1, reset = false) => {
      if (!hasMore && !reset) return;

      try {
        setLoading(true);

        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}deals/all?limit=20&page=${pageNumber}`,
          {
            headers: { authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();

        setDeals((prev) =>
          reset ? data.data || [] : [...prev, ...(data.data || [])]
        );

        setHasMore(data.hasMore);
        setTotal(data.total);
        setPage(pageNumber);
      } catch (err) {
        console.error("Failed to fetch deals");
      } finally {
        setLoading(false);
      }
    },
    [token, hasMore]
  );

  useEffect(() => {
    if (inView && hasMore && !loading) {
      fetchDeals(page + 1);
    }
  }, [inView]);

  useEffect(() => {
    fetchDeals(1, true);
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

      <div className="text-sm text-gray-400 mb-3">
        Showing {deals.length} of {total} deals
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
              <th className="px-4 py-3 text-left">Currency</th>
              <th className="px-4 py-3 text-left">POC</th>
              <th className="px-4 py-3 text-left">Closing Date</th>
              <th className="px-4 py-3 text-left">Probability</th>
              <th className="px-4 py-3 text-left">D/Owner</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {deals.length === 0 && loading ? (
              <TableSkeleton />
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
                  className="border-t border-gray-800 hover:bg-gray-900 group"
                >
                  <td onClick={() => View(deal)} className="px-4 py-3">
                    {deal.dealName}
                  </td>
                  <td
                    onClick={() => {
                      setShowModal("account");
                      setSelectedAccount(deal.account);
                    }}
                    className="px-4 py-3 hover:underline cursor-pointer hover:text-blue-700"
                  >
                    {deal.account?.accountName || "-"}
                  </td>
                  <td onClick={() => View(deal)} className="px-4 py-3">
                    {deal.stage}
                  </td>
                  <td onClick={() => View(deal)} className="px-4 py-3">
                    {deal.amount?.toLocaleString()}
                  </td>

                  <td onClick={() => View(deal)} className="px-4 py-3">
                    {deal.currency || "-"}
                  </td>

                  <td
                    onClick={() => {
                      setShowModal("contact");
                      setSelectedContact(deal.contact);
                    }}
                    className="px-4 py-3 hover:underline cursor-pointer hover:text-blue-600"
                  >
                    {deal.contact?.firstName || ""}{" "}
                    {deal.contact?.lastName || ""}
                  </td>
                  <td onClick={() => View(deal)} className="px-4 py-3">
                    {deal.closingDate
                      ? new Date(deal.closingDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td onClick={() => View(deal)} className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-800 rounded">
                        <div
                          className="h-2 bg-green-500 rounded"
                          style={{ width: `${deal.probability}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">
                        {deal.probability}%
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 hover:underline cursor-pointer hover:text-blue-600">
                    <Link
                      to={`/admin/singleUserPerformance/${deal.dealOwner._id}`}
                    >
                      {deal.dealOwner.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 text-xs opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => View(deal)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        View
                      </button>

                      <button
                        onClick={() => {
                          setShowModal("Pipeline");
                          setSelectedDeal(deal);
                        }}
                        className="text-purple-400 hover:text-purple-300"
                      >
                        Pipeline
                      </button>

                      <button
                        onClick={() => {
                          setShowModal("Edit");
                          setSelectedDeal(deal);
                        }}
                        className="text-yellow-400 hover:text-yellow-300"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div
          ref={ref}
          className="flex justify-center py-6 text-gray-400 text-sm"
        >
          {loading && deals.length > 0 && <span>Loading more deals...</span>}

          {!hasMore && deals.length > 0 && (
            <span className="text-gray-600">No more deals</span>
          )}
        </div>
      </div>

      {showModal === "Add" && (
        <AddDealModal
          onClose={() => {
            setShowModal(false);
          }}
          onSuccess={fetchDeals}
        />
      )}

      {showModal === "Analytics" && (
        <DealsAnalyticsModal
          deals={filteredDeals}
          onClose={() => setShowModal("")}
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
          onSuccess={fetchDeals}
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
          }}
        />
      )}

      {showModal === "account" && (
        <ViewAccountModal
          account={selectedAccount}
          onClose={() => {
            setSelectedAccount(null);
            setShowModal(null);
          }}
        />
      )}
      {showModal === "contact" && (
        <ViewContactModal
          contact={selectedContact}
          onClose={() => {
            setShowModal(null);
            setSelectedContact(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminDealsPage;
