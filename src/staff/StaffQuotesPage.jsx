import { useMemo, useState } from "react";
import ViewQuoteModal from "../components/staff/quote/ViewQuoteModal";
import EditQuoteModal from "../components/staff/quote/EditQuateModal";
import AddQuoteModal from "../components/staff/quote/AddQuoteModal";
import UpdateQuoteStageModal from "../components/staff/quote/UpdateQuoteStageModal";
import { usePagedList } from "../hooks/usePagedList";
import ListToolbar from "../components/lists/ListToolbar";
import PaginationBar from "../components/lists/PaginationBar";
import ArchiveButton from "../components/lists/ArchiveButton";
import CostingDownloadButton from "../components/staff/quote/CostingDownloadButton";
import QuotePdfLink from "../components/staff/quote/QuotePdfLink";
import { QUOTE_STAGES } from "../lib/crm";

const StaffQuotePage = () => {
  const [showModal, setShowModal] = useState("");
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [stageFilter, setStageFilter] = useState("all");
  const extraFilters = useMemo(
    () => ({
      stage: stageFilter,
      excludeStage: stageFilter === "all" ? "Confirmed,Closed Won" : undefined,
    }),
    [stageFilter]
  );
  const list = usePagedList("quotes/my", extraFilters);

  const openView = (quote) => {
    setSelectedQuote(quote);
    setShowModal("View");
  };

  return (
    <div className="p-6 text-heading">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold">Quotes</h1>
          <p className="text-sm text-bodyText mt-1">
            Search live quotes, archive old ones, and restore them whenever needed.
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
        }}
        filters={[
          {
            name: "stage",
            allLabel: "All open stages",
            value: stageFilter,
            onChange: setStageFilter,
            options: QUOTE_STAGES,
          },
        ]}
      />

      <div className="bg-card border border-gray-300 rounded overflow-x-auto">
        <table className="pro-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Deal</th>
              <th>Account</th>
              <th>Stage</th>
              <th>Total</th>
              <th>Valid Until</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.loading ? (
              <tr>
                <td colSpan="7" className="p-6 text-center text-bodyText">
                  Loading...
                </td>
              </tr>
            ) : list.items.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-6 text-center text-bodyText">
                  No quotes found
                </td>
              </tr>
            ) : (
              list.items.map((q) => (
                <tr key={q._id} className="hover:bg-surface">
                  <td
                    onClick={() => openView(q)}
                    className="cursor-pointer hover:text-brand font-medium"
                  >
                    {q.subject}
                  </td>
                  <td onClick={() => openView(q)} className="cursor-pointer">
                    {q.deal?.dealName || "-"}
                  </td>
                  <td onClick={() => openView(q)} className="cursor-pointer">
                    {q.account?.accountName}
                  </td>
                  <td onClick={() => openView(q)} className="cursor-pointer">
                    {q.quoteStage}
                  </td>
                  <td onClick={() => openView(q)} className="cursor-pointer">
                    {q.currency || "PKR"} {q.grandTotal?.toLocaleString()}
                  </td>
                  <td onClick={() => openView(q)} className="cursor-pointer">
                    {q.validUntil ? new Date(q.validUntil).toLocaleDateString() : "-"}
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => openView(q)}
                      className="text-brand hover:underline"
                    >
                      View
                    </button>
                    {q.quoteStage !== "On Hold" && (
                      <>
                        <button
                          onClick={() => {
                            setShowModal("Edit");
                            setSelectedQuote(q);
                          }}
                          className="text-amber-700 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setShowModal("stage");
                            setSelectedQuote(q);
                          }}
                          className="text-brand hover:underline"
                        >
                          Update-stage
                        </button>
                      </>
                    )}
                    <ArchiveButton
                      path={`quotes/${q._id}/archive`}
                      archived={q.isArchived}
                      onDone={list.reload}
                    />
                    <QuotePdfLink quote={q} />
                    <CostingDownloadButton quote={q} />
                    </div>
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
      {showModal === "View" && (
        <ViewQuoteModal quote={selectedQuote} onClose={() => setShowModal("")} />
      )}
      {showModal === "Edit" && (
        <EditQuoteModal
          quote={selectedQuote}
          onClose={() => setShowModal("")}
          onSuccess={list.reload}
        />
      )}
      {showModal === "stage" && (
        <UpdateQuoteStageModal
          quoteId={selectedQuote._id}
          currentStage={selectedQuote.quoteStage}
          deal={selectedQuote.deal}
          onClose={() => setShowModal("")}
          onSuccess={list.reload}
        />
      )}
    </div>
  );
};

export default StaffQuotePage;
