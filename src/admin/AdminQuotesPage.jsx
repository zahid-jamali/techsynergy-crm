import { useEffect, useState } from "react";
// import AddQuoteModal from "./AddQuoteModal";
// import ViewQuoteModal from "./ViewQuoteModal";
// import EditQuoteModal from "./EditQuoteModal";
import ViewQuoteModal from "../components/staff/quote/ViewQuoteModal";
import EditQuoteModal from "../components/staff/quote/EditQuateModal";
import AddQuoteModal from "../components/staff/quote/AddQuoteModal";
// import StageUpdateModal from "../components/staff/StageUpdateModal";import UpdateQuoteStageModal from "../components/staff/UpdateQuoteStageModal";
import UpdateQuoteStageModal from "../components/staff/quote/UpdateQuoteStageModal";

const AdminQuotesPage = () => {
  const token = sessionStorage.getItem("token");

  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [viewQuote, setViewQuote] = useState(null);
  const [editQuote, setEditQuote] = useState(null);
  const [stagePipeline, setStagePipeline] = useState(null);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}quotes/all`,
        {
          headers: { authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setQuotes(data.data || []);
    } catch (err) {
      console.error("Failed to fetch quotes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const filteredQuotes = quotes.filter((q) => {
    if (q.quoteStage === "Confirmed") {
      return false;
    }
    const matchesSearch =
      q.subject?.toLowerCase().includes(search.toLowerCase()) ||
      q.deal?.dealName?.toLowerCase().includes(search.toLowerCase()) ||
      q.account?.accountName?.toLowerCase().includes(search.toLowerCase()) ||
      `${q.contact?.firstName} ${q.contact?.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStage = stageFilter === "all" || q.quoteStage === stageFilter;

    const matchesOwner =
      ownerFilter === "all" || q.quoteOwner?._id === ownerFilter;

    return matchesSearch && matchesStage && matchesOwner;
  });

  return (
    <div className="p-6 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Quotes</h1>
        {/* <button
          onClick={() => setShowAdd(true)}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
        >
          + New Quote
        </button> */}
      </div>

      {/* Filters */}
      <div className="bg-black border border-gray-800 rounded-lg p-4 mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search subject, deal, account or contact..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white w-72 focus:outline-none focus:border-red-500"
        />

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm"
        >
          <option value="all">All Stages</option>
          {[
            "Draft",
            "Negotiation",
            "Delivered",
            "On Hold",
            "Confirmed",
            "Closed Won",
            "Closed Lost",
          ].map((stage) => (
            <>
              {stage === "Confirmed" ? (
                <option disabled key={stage}>
                  {stage}
                </option>
              ) : (
                <option value={stage} key={stage}>
                  {stage}
                </option>
              )}
            </>
          ))}

          {/* <option value="Draft">Draft</option>
          <option value="Sent">Sent</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option> */}
        </select>

        <select
          value={ownerFilter}
          onChange={(e) => setOwnerFilter(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm"
        >
          <option value="all">All Owners</option>
          {[
            ...new Map(
              quotes.map((q) => [q.quoteOwner?._id, q.quoteOwner])
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
      <div className="bg-black border border-gray-800 rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              <th className="p-3 text-left">Q.No</th>
              <th className="p-3 text-left">Subject</th>
              <th className="p-3">Deal</th>
              <th className="p-3">Account</th>
              <th className="p-3">Stage</th>
              <th className="p-3">POS</th>
              <th className="p-3">Total (PKR)</th>
              <th className="p-3">Valid Until</th>
              <th className="p-3">S/Owner</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : filteredQuotes.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-400">
                  No quotes found
                </td>
              </tr>
            ) : (
              filteredQuotes.map((q) => (
                <tr
                  key={q._id}
                  className="border-t border-gray-800 hover:bg-gray-900"
                >
                  <td onClick={() => setViewQuote(q)} className="p-3">
                    {q.quoteNumber || "-"}
                  </td>
                  <td onClick={() => setViewQuote(q)} className="p-3">
                    {q.subject}
                  </td>
                  <td onClick={() => setViewQuote(q)} className="p-3">
                    {q.deal.dealName}
                  </td>
                  <td onClick={() => setViewQuote(q)} className="p-3">
                    {q.account?.accountName}
                  </td>
                  <td onClick={() => setViewQuote(q)} className="p-3">
                    {q.quoteStage}
                  </td>
                  <td onClick={() => setViewQuote(q)} className="p-3">
                    {q.contact.firstName} {q.contact.lastName}
                  </td>
                  <td onClick={() => setViewQuote(q)} className="p-3">
                    {q.grandTotal?.toLocaleString()}
                  </td>
                  <td onClick={() => setViewQuote(q)} className="p-3">
                    {q.validUntil
                      ? new Date(q.validUntil).toLocaleDateString()
                      : "-"}
                  </td>
                  <td onClick={() => setViewQuote(q)} className="p-3">
                    {q.quoteOwner.name}
                  </td>
                  <td className="p-3 flex gap-2">
                    {/* <button
                      onClick={() => setViewQuote(q)}
                      className="text-blue-400 hover:underline"
                    >
                      View
                    </button> */}

                    <button
                      onClick={() => setEditQuote(q)}
                      className="text-yellow-400 hover:underline"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => setStagePipeline(q)}
                      className="text-blue-400 hover:underline"
                    >
                      Update-stage
                    </button>

                    {/* <button
                      onClick={}
                      className="text-yellow-400 hover:underline"
                    ></button> */}

                    <a
                      href={`${process.env.REACT_APP_BACKEND_URL}quotes/${q._id}/pdf`}
                      //   target="_blank"
                      //   rel="noreferrer"
                      className="text-green-400 hover:underline"
                    >
                      PDF
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Modals */}
      {showAdd && (
        <AddQuoteModal
          onClose={() => setShowAdd(false)}
          onSuccess={fetchQuotes}
        />
      )}

      {viewQuote && (
        <ViewQuoteModal quote={viewQuote} onClose={() => setViewQuote(null)} />
      )}

      {editQuote && (
        <EditQuoteModal
          quote={editQuote}
          onClose={() => setEditQuote(null)}
          onSuccess={fetchQuotes}
        />
      )}
      {stagePipeline && (
        <UpdateQuoteStageModal
          quoteId={stagePipeline._id}
          currentStage={stagePipeline.stage}
          onClose={() => setStagePipeline(null)}
          onSuccess={() => fetchQuotes()}
        />
      )}
      {/* quoteId,
  currentStage,
  onClose,
  onSuccess, */}
    </div>
  );
};

export default AdminQuotesPage;
