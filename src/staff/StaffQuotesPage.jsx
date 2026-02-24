import { useCallback, useEffect, useState } from "react";
// import AddQuoteModal from "./AddQuoteModal";
// import ViewQuoteModal from "./ViewQuoteModal";
// import EditQuoteModal from "./EditQuoteModal";
import ViewQuoteModal from "../components/staff/quote/ViewQuoteModal";
import EditQuoteModal from "../components/staff/quote/EditQuateModal";
import AddQuoteModal from "../components/staff/quote/AddQuoteModal";
// import StageUpdateModal from "../components/staff/StageUpdateModal";import UpdateQuoteStageModal from "../components/staff/UpdateQuoteStageModal";
import UpdateQuoteStageModal from "../components/staff/quote/UpdateQuoteStageModal";

const StaffQuotePage = () => {
  const token = sessionStorage.getItem("token");

  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState("");
  const [selectedQuote, setSelectedQuote] = useState(null);

  // const [showAdd, setShowAdd] = useState(false);
  // const [viewQuote, setViewQuote] = useState(null);
  // const [editQuote, setEditQuote] = useState(null);
  // const [stagePipeline, setStagePipeline] = useState(null);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}quotes/my`, {
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setQuotes(data.data || []);
    } catch (err) {
      console.error("Failed to fetch quotes");
    } finally {
      setLoading(false);
      setShowModal("");
    }
  }, [token]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const View = (q) => {
    setShowModal("View");
    setSelectedQuote(q);
  };

  const filteredQuotes = quotes.filter((q) => {
    // ❌ Always hide these
    if (q.quoteStage === "Confirmed" || q.quoteStage === "Closed Won") {
      return false;
    }

    // ❌ Hide Closed Lost unless Show All is ON
    if (!showAll && q.quoteStage === "Closed Lost") {
      return false;
    }

    // 🔍 Search
    const matchesSearch =
      q.subject?.toLowerCase().includes(search.toLowerCase()) ||
      q.account?.accountName?.toLowerCase().includes(search.toLowerCase());

    // 🎯 Stage filter
    const matchesStage = stageFilter === "all" || q.quoteStage === stageFilter;

    return matchesSearch && matchesStage;
  });

  return (
    <div className="p-6 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Quotes</h1>
        <button
          onClick={() => {
            setShowModal("Add");
          }}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
        >
          + New Quote
        </button>
      </div>

      {/* Filters */}
      <div className="bg-black border border-gray-800 rounded-lg p-4 mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search subject or account..."
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
          <option value="Draft">Draft</option>
          <option value="Negotiation">Negotiation</option>
          <option value="Delivered">Delivered</option>
          <option value="On Hold">On Hold</option>
          {showAll && <option value="Closed Lost">Closed Lost</option>}
        </select>

        {/* Show All Toggle */}
        <button
          onClick={() => setShowAll((prev) => !prev)}
          className={`px-4 py-2 rounded text-sm border ${
            showAll
              ? "bg-red-600 border-red-600"
              : "bg-gray-900 border-gray-700"
          }`}
        >
          {showAll ? "Hide Closed Quotes" : "Show All"}
        </button>
      </div>

      {/* Table */}
      <div className="bg-black border border-gray-800 rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              <th className="p-3 text-left">Subject</th>
              <th className="p-3">Account</th>
              <th className="p-3">Stage</th>
              <th className="p-3">Total </th>
              <th className="p-3">Valid Until</th>
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
                  <td onClick={() => View(q)} className="p-3">
                    {q.subject}
                  </td>
                  <td onClick={() => View(q)} className="p-3">
                    {q.account?.accountName}
                  </td>
                  <td onClick={() => View(q)} className="p-3">
                    {q.quoteStage}
                  </td>
                  <td onClick={() => View(q)} className="p-3">
                    {" "}
                    {q.currency ? q.currency : "PKR"}{" "}
                    {q.grandTotal?.toLocaleString()}
                  </td>
                  <td onClick={() => View(q)} className="p-3">
                    {q.validUntil
                      ? new Date(q.validUntil).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-3 flex gap-2">
                    {/* <button
                      onClick={}
                      className="text-blue-400 hover:underline"
                    >
                      View
                    </button> */}

                    <button
                      onClick={() => {
                        setShowModal("Edit");
                        setSelectedQuote(q);
                      }}
                      className="text-yellow-400 hover:underline"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        setShowModal("stage");
                        setSelectedQuote(q);
                      }}
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
      {showModal === "Add" && (
        <AddQuoteModal
          onClose={() => setShowModal("")}
          onSuccess={fetchQuotes}
        />
      )}

      {showModal === "View" && (
        <ViewQuoteModal
          quote={selectedQuote}
          onClose={() => {
            setShowModal("");
          }}
        />
      )}

      {showModal === "Edit" && (
        <EditQuoteModal
          quote={selectedQuote}
          onClose={() => {
            setShowModal("");
            setSelectedQuote(null);
          }}
          onSuccess={fetchQuotes}
        />
      )}
      {showModal === "stage" && (
        <UpdateQuoteStageModal
          quoteId={selectedQuote._id}
          currentStage={selectedQuote.stage}
          deal={selectedQuote.deal}
          onClose={() => {
            setSelectedQuote(null);
            setShowModal("");
          }}
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

export default StaffQuotePage;
