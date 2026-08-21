import { useEffect, useMemo, useState } from "react";
import AddDealModal from "../components/staff/deals/AddDealModal";
import EditDealModal from "../components/staff/deals/EditDealModal";
import StageUpdateModal from "../components/staff/deals/StageUpdateModal";
import ViewDealModal from "../components/staff/deals/ViewDealModal";
import { BarChart3, Plus } from "lucide-react";
import DealsAnalyticsModal from "../components/staff/charts/DealsAnalyticsModal";
import ViewAccountModal from "../components/staff/account/ViewAccountModal";
import ViewContactModal from "../components/staff/contact/ViewContactModal";
import { Link } from "react-router-dom";
import { usePagedList } from "../hooks/usePagedList";
import ListToolbar from "../components/lists/ListToolbar";
import PaginationBar from "../components/lists/PaginationBar";
import { DEAL_STAGES, contactName } from "../lib/crm";
import { api } from "../lib/api";

const AdminDealsPage = () => {
  const [showModal, setShowModal] = useState("");
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [stageFilter, setStageFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [owners, setOwners] = useState([]);
  const extraFilters = useMemo(
    () => ({ stage: stageFilter, owner: ownerFilter }),
    [stageFilter, ownerFilter]
  );
  const list = usePagedList("deals/all", extraFilters);

  useEffect(() => {
    api("user/all")
      .then((data) => setOwners(Array.isArray(data) ? data : data.data || []))
      .catch(() => setOwners([]));
  }, []);

  return (
    <div className="p-6 text-heading">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand">Deals</h1>
          <p className="text-sm text-bodyText mt-1">
            Search and filter the full pipeline. Staff can also create deals on shared accounts.
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
            className="flex items-center gap-2 bg-brand hover:bg-brand/90 px-4 py-2 rounded-lg font-semibold text-white"
          >
            <Plus size={16} />
            Add Deal
          </button>
        </div>
      </div>

      <ListToolbar
        search={list.searchInput}
        onSearch={list.setSearchInput}
        searchPlaceholder="Search deal name..."
        showArchive={false}
        onReset={() => {
          list.setSearchInput("");
          setStageFilter("all");
          setOwnerFilter("all");
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
            name: "owner",
            allLabel: "All owners",
            value: ownerFilter,
            onChange: setOwnerFilter,
            options: owners.map((u) => ({ value: u._id, label: u.name || u.email })),
          },
        ]}
      />

      <div className="bg-card border border-gray-200 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-card text-bodyText">
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
            {list.loading ? (
              <tr>
                <td colSpan="10" className="text-center py-6 text-bodyText">
                  Loading deals...
                </td>
              </tr>
            ) : list.items.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center py-6 text-bodyText">
                  No deals found
                </td>
              </tr>
            ) : (
              list.items.map((deal) => (
                <tr key={deal._id} className="border-t border-gray-200 hover:bg-surface group">
                  <td className="px-4 py-3">{deal.dealName}</td>
                  <td
                    onClick={() => {
                      setShowModal("account");
                      setSelectedAccount(deal.account);
                    }}
                    className="px-4 py-3 hover:underline cursor-pointer"
                  >
                    {deal.account?.accountName || "-"}
                  </td>
                  <td className="px-4 py-3">{deal.stage}</td>
                  <td className="px-4 py-3">{deal.amount?.toLocaleString()}</td>
                  <td className="px-4 py-3">{deal.currency || "-"}</td>
                  <td
                    onClick={() => {
                      if (!deal.contact) return;
                      setShowModal("contact");
                      setSelectedContact(deal.contact);
                    }}
                    className="px-4 py-3 hover:underline cursor-pointer"
                  >
                    {contactName(deal.contact)}
                  </td>
                  <td className="px-4 py-3">
                    {deal.closingDate ? new Date(deal.closingDate).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-3">{deal.probability || 0}%</td>
                  <td className="px-4 py-3">
                    {deal.dealOwner?._id ? (
                      <Link
                        to={`/admin/singleUserPerformance/${deal.dealOwner._id}`}
                        className="hover:underline hover:text-blue-600"
                      >
                        {deal.dealOwner?.name}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3 flex gap-3 text-xs">
                    <button
                      onClick={() => {
                        setSelectedDeal(deal);
                        setShowModal("View");
                      }}
                      className="text-brand hover:underline"
                    >
                      View
                    </button>
                    <button
                      onClick={() => {
                        setShowModal("Pipeline");
                        setSelectedDeal(deal);
                      }}
                      className="text-bodyText hover:underline"
                    >
                      Pipeline
                    </button>
                    <button
                      onClick={() => {
                        setShowModal("Edit");
                        setSelectedDeal(deal);
                      }}
                      className="text-amber-700 hover:underline"
                    >
                      Edit
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

      {showModal === "Add" && (
        <AddDealModal onClose={() => setShowModal("")} onSuccess={list.reload} />
      )}
      {showModal === "Analytics" && (
        <DealsAnalyticsModal deals={list.items} onClose={() => setShowModal("")} />
      )}
      {showModal === "View" && (
        <ViewDealModal deal={selectedDeal} onClose={() => setShowModal("")} />
      )}
      {showModal === "Edit" && (
        <EditDealModal
          deal={selectedDeal}
          onClose={() => setShowModal("")}
          onSuccess={list.reload}
        />
      )}
      {showModal === "Pipeline" && (
        <StageUpdateModal
          deal={selectedDeal}
          onClose={() => setShowModal("")}
          onSuccess={list.reload}
        />
      )}
      {showModal === "account" && (
        <ViewAccountModal account={selectedAccount} onClose={() => setShowModal("")} />
      )}
      {showModal === "contact" && (
        <ViewContactModal contact={selectedContact} onClose={() => setShowModal("")} />
      )}
    </div>
  );
};

export default AdminDealsPage;
