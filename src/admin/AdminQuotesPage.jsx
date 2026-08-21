import { useEffect, useMemo, useState } from "react";
import ViewQuoteModal from "../components/staff/quote/ViewQuoteModal";
import EditQuoteModal from "../components/staff/quote/EditQuateModal";
import AddQuoteModal from "../components/staff/quote/AddQuoteModal";
import UpdateQuoteStageModal from "../components/staff/quote/UpdateQuoteStageModal";
import ViewAccountModal from "../components/staff/account/ViewAccountModal";
import ViewContactModal from "../components/staff/contact/ViewContactModal";
import ViewDealModal from "../components/staff/deals/ViewDealModal";
import { Link } from "react-router-dom";
import { usePagedList } from "../hooks/usePagedList";
import ListToolbar from "../components/lists/ListToolbar";
import PaginationBar from "../components/lists/PaginationBar";
import ArchiveButton from "../components/lists/ArchiveButton";
import CostingDownloadButton from "../components/staff/quote/CostingDownloadButton";
import { QUOTE_STAGES, contactName } from "../lib/crm";
import { api } from "../lib/api";

const AdminQuotesPage = () => {
  const [showModal, setShowModal] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [stageFilter, setStageFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [owners, setOwners] = useState([]);
  const extraFilters = useMemo(
    () => ({
      stage: stageFilter,
      owner: ownerFilter,
      excludeStage: stageFilter === "all" ? "Confirmed,Closed Won" : undefined,
    }),
    [stageFilter, ownerFilter]
  );
  const list = usePagedList("quotes/all", extraFilters);

  useEffect(() => {
    api("user/all")
      .then((data) => setOwners(Array.isArray(data) ? data : data.data || []))
      .catch(() => setOwners([]));
  }, []);

  return (
    <div className="p-6 text-heading">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand">Quotes</h1>
          <p className="text-sm text-bodyText mt-1">
            Search the full quote book. Confirmed quotes stay on Sell Orders; archive the rest as needed.
          </p>
        </div>
        <button
          onClick={() => setShowModal("Add")}
          className="bg-brand hover:bg-brand/90 px-4 py-2 rounded text-white"
        >
          + New Quote
        </button>
      </div>

      <ListToolbar
        search={list.searchInput}
        onSearch={list.setSearchInput}
        searchPlaceholder="Search subject or quote number..."
        archived={list.archived}
        onArchivedChange={list.setArchived}
        onReset={() => {
          list.setSearchInput("");
          setStageFilter("all");
          setOwnerFilter("all");
        }}
        filters={[
          {
            name: "stage",
            allLabel: "All open stages",
            value: stageFilter,
            onChange: setStageFilter,
            options: QUOTE_STAGES,
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

      <div className="bg-card border border-gray-200 rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-card text-bodyText">
            <tr>
              <th className="p-3 text-left">No.</th>
              <th className="p-3 text-left">Subject</th>
              <th className="p-3">Deal</th>
              <th className="p-3">Account</th>
              <th className="p-3">Stage</th>
              <th className="p-3">POC</th>
              <th className="p-3">Total</th>
              <th className="p-3">Valid Until</th>
              <th className="p-3">Owner</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.loading ? (
              <tr>
                <td colSpan="10" className="p-6 text-center text-bodyText">
                  Loading...
                </td>
              </tr>
            ) : list.items.length === 0 ? (
              <tr>
                <td colSpan="10" className="p-6 text-center text-bodyText">
                  No quotes found
                </td>
              </tr>
            ) : (
              list.items.map((q) => (
                <tr key={q._id} className="border-t border-gray-200 hover:bg-surface">
                  <td className="p-3">{q.quoteNumber || "-"}</td>
                  <td className="p-3">{q.subject}</td>
                  <td
                    onClick={() => {
                      setShowModal("viewDeal");
                      setSelectedDeal(q.deal);
                    }}
                    className="p-3 hover:underline cursor-pointer"
                  >
                    {q.deal?.dealName || "-"}
                  </td>
                  <td
                    onClick={() => {
                      setSelectedAccount(q.account);
                      setShowModal("viewAccount");
                    }}
                    className="p-3 hover:underline cursor-pointer"
                  >
                    {q.account?.accountName || "-"}
                  </td>
                  <td className="p-3">{q.quoteStage}</td>
                  <td
                    onClick={() => {
                      setSelectedContact(q.contact);
                      setShowModal("viewContact");
                    }}
                    className={`p-3 ${q.contact ? "hover:underline cursor-pointer" : ""}`}
                  >
                    {contactName(q.contact)}
                  </td>
                  <td className="p-3">{q.grandTotal?.toLocaleString()}</td>
                  <td className="p-3">
                    {q.validUntil ? new Date(q.validUntil).toLocaleDateString() : "-"}
                  </td>
                  <td className="p-3">
                    {q.quoteOwner?._id ? (
                      <Link
                        to={`/admin/singleUserPerformance/${q.quoteOwner._id}`}
                        className="hover:underline hover:text-blue-600"
                      >
                        {q.quoteOwner?.name}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-3 flex gap-2 text-sm">
                    <button
                      onClick={() => {
                        setShowModal("edit");
                        setSelectedQuote(q);
                      }}
                      className="text-amber-700 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setShowModal("updateStage");
                        setSelectedQuote(q);
                      }}
                      className="text-brand hover:underline"
                    >
                      Update-stage
                    </button>
                    <ArchiveButton
                      path={`quotes/${q._id}/archive`}
                      archived={q.isArchived}
                      onDone={list.reload}
                    />
                    <a
                      href={`${process.env.REACT_APP_BACKEND_URL}quotes/${q._id}/pdf`}
                      className="text-emerald-700 hover:underline"
                    >
                      PDF
                    </a>
                    <CostingDownloadButton quote={q} />
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
        <AddQuoteModal onClose={() => setShowModal("")} onSuccess={list.reload} />
      )}
      {showModal === "viewQuote" && (
        <ViewQuoteModal quote={selectedQuote} onClose={() => setShowModal("")} />
      )}
      {showModal === "edit" && (
        <EditQuoteModal
          quote={selectedQuote}
          onClose={() => setShowModal("")}
          onSuccess={list.reload}
        />
      )}
      {showModal === "updateStage" && selectedQuote && (
        <UpdateQuoteStageModal
          quoteId={selectedQuote._id}
          currentStage={selectedQuote.quoteStage}
          deal={selectedQuote.deal}
          onClose={() => setShowModal("")}
          onSuccess={list.reload}
        />
      )}
      {showModal === "viewDeal" && (
        <ViewDealModal deal={selectedDeal} onClose={() => setShowModal("")} />
      )}
      {showModal === "viewAccount" && (
        <ViewAccountModal account={selectedAccount} onClose={() => setShowModal("")} />
      )}
      {showModal === "viewContact" && (
        <ViewContactModal contact={selectedContact} onClose={() => setShowModal("")} />
      )}
    </div>
  );
};

export default AdminQuotesPage;
