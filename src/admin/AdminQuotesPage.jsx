import { useCallback, useEffect, useState } from "react";
// import AddQuoteModal from "./AddQuoteModal";
// import ViewQuoteModal from "./ViewQuoteModal";
// import EditQuoteModal from "./EditQuoteModal";
import ViewQuoteModal from "../components/staff/quote/ViewQuoteModal";
import EditQuoteModal from "../components/staff/quote/EditQuateModal";
import AddQuoteModal from "../components/staff/quote/AddQuoteModal";
// import StageUpdateModal from "../components/staff/StageUpdateModal";import UpdateQuoteStageModal from "../components/staff/UpdateQuoteStageModal";
import UpdateQuoteStageModal from "../components/staff/quote/UpdateQuoteStageModal";
import ViewAccountModal from "../components/staff/account/ViewAccountModal";
import ViewContactModal from "../components/staff/contact/ViewContactModal";
import ViewDealModal from "../components/staff/deals/ViewDealModal";
import { Link } from "react-router-dom";
import { useInView } from "react-intersection-observer";
// import { InView } from "react-intersection-observer";

const AdminQuotesPage = () => {
  const token = sessionStorage.getItem("token");

  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState("");
  const [selectedAccount, setSelectedAccount] = useState();
  const [selectedContact, setSelectedContact] = useState();
  const [selectedDeal, setSelectedDeal] = useState();
  const [selectedQuote, setSelectedQuote] = useState();

  const [stagePipeline, setStagePipeline] = useState(null);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState();
  const [ref, inView] = useInView();

  const fetchQuotes = useCallback(
    async (pageNumber = 1, reset = false) => {
      if (!hasMore && !reset) return;

      try {
        setLoading(true);

        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}quotes/all?limit=20&page=${pageNumber}`,
          {
            headers: { authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();

        setQuotes((prev) =>
          reset ? data.data || [] : [...prev, ...(data.data || [])]
        );

        setTotal(data.total);
        setHasMore(data.hasMore);
        setPage(pageNumber);
      } catch (err) {
        console.error("Failed to fetch quotes");
      } finally {
        setLoading(false);
      }
    },
    [token, hasMore]
  );

  useEffect(() => {
    fetchQuotes(1, true);
  }, []);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      fetchQuotes(page + 1);
    }
  }, [inView]);

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

  const View = (q) => {
    setSelectedQuote(q);
    setShowModal("viewQuote");
  };

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
      <div className="text-sm text-gray-400 mb-3">
        Showing {quotes.length} of {total || 0} quotes
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
              <th className="p-3">POC</th>
              <th className="p-3">Total (PKR)</th>
              <th className="p-3">Valid Until</th>
              <th className="p-3">S/Owner</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {quotes.length === 0 && loading ? (
              <TableSkeleton rows={8} />
            ) : filteredQuotes.length === 0 ? (
              <tr>
                <td colSpan="10" className="p-6 text-center text-gray-400">
                  No quotes found
                </td>
              </tr>
            ) : (
              filteredQuotes.map((q) => (
                <tr
                  key={q._id}
                  className="border-t border-gray-800 hover:bg-gray-900 group"
                >
                  <td onClick={() => View(q)} className="p-3">
                    {q.quoteNumber || "-"}
                  </td>
                  <td onClick={() => View(q)} className="p-3">
                    {q.subject}
                  </td>
                  <td
                    onClick={() => {
                      setShowModal("viewDeal");
                      setSelectedDeal(q.deal);
                    }}
                    className="p-3 hover:underline cursor-pointer hover:text-blue-600"
                  >
                    {q.deal?.dealName || "-"}
                  </td>
                  <td
                    onClick={() => {
                      setSelectedAccount(q.account);
                      setShowModal("viewAccount");
                    }}
                    className="p-3 hover:underline cursor-pointer hover:text-blue-600"
                  >
                    {q.account?.accountName || "-"}
                  </td>
                  <td onClick={() => View(q)} className="p-3">
                    {q.quoteStage}
                  </td>
                  <td
                    onClick={() => {
                      setShowModal("viewContact");
                      setSelectedContact(q.contact);
                    }}
                    className="p-3 hover:underline cursor-pointer hover:text-blue-600"
                  >
                    {q.contact?.firstName || ""} {q.contact?.lastName || ""}
                  </td>
                  <td onClick={() => View(q)} className="p-3">
                    {q.grandTotal?.toLocaleString()}
                  </td>
                  <td onClick={() => View(q)} className="p-3">
                    {q.validUntil
                      ? new Date(q.validUntil).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-3">
                    <Link
                      to={`/admin/singleUserPerformance/${q.quoteOwner._id}`}
                      className={
                        "hover:underline cursor-pointer hover:text-blue-600"
                      }
                    >
                      {q.quoteOwner.name}
                    </Link>
                  </td>
                  <td className="p-3 flex gap-1 opacity-0 text-sm group-hover:opacity-100">
                    <button
                      onClick={() => {
                        setShowModal("edit");
                        setSelectedQuote(q);
                      }}
                      className="text-yellow-400 hover:underline"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        setShowModal("updateStage");
                        setSelectedQuote(q);
                      }}
                      className="text-blue-400 hover:underline"
                    >
                      Update-stage
                    </button>

                    <a
                      href={`${process.env.REACT_APP_BACKEND_URL}quotes/${q._id}/pdf`}
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
        <div
          ref={ref}
          className="flex justify-center py-6 text-gray-400 text-sm"
        >
          {loading && <span>Loading more quotes...</span>}

          {!hasMore && quotes.length > 0 && (
            <span className="text-gray-600">No more quotes</span>
          )}
        </div>
      </div>
      {/* Modals */}
      {showModal === "Add" && (
        <AddQuoteModal
          onClose={() => setShowModal("")}
          onSuccess={fetchQuotes}
        />
      )}

      {showModal === "viewQuote" && (
        <ViewQuoteModal
          quote={selectedQuote}
          onClose={() => {
            setShowModal("");
            setSelectedQuote(null);
          }}
        />
      )}

      {showModal === "edit" && (
        <EditQuoteModal
          quote={selectedQuote}
          onClose={() => {
            setShowModal("");
            setSelectedQuote(null);
          }}
          onSuccess={fetchQuotes}
        />
      )}
      {showModal === "updateStage" && (
        <UpdateQuoteStageModal
          quoteId={selectedQuote._id}
          currentStage={selectedQuote.stage}
          onClose={() => {
            setSelectedQuote(null);
            setShowModal("");
          }}
          onSuccess={() => fetchQuotes()}
        />
      )}

      {showModal === "viewDeal" && (
        <ViewDealModal
          deal={selectedDeal}
          onClose={() => {
            setShowModal("");
            setSelectedDeal(null);
          }}
        />
      )}

      {showModal === "viewAccount" && (
        <ViewAccountModal
          account={selectedAccount}
          onClose={() => {
            setShowModal("");
            setSelectedAccount(null);
          }}
        />
      )}

      {showModal === "viewContact" && (
        <ViewContactModal
          contact={selectedContact}
          onClose={() => {
            setShowModal("");
            setSelectedContact(null);
          }}
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

const TableSkeleton = ({ rows = 5 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse border-t border-gray-800">
          <td className="p-3">
            <div className="h-3 bg-gray-700 rounded w-10"></div>
          </td>

          <td className="p-3">
            <div className="h-3 bg-gray-700 rounded w-40"></div>
          </td>

          <td className="p-3">
            <div className="h-3 bg-gray-700 rounded w-32 mx-auto"></div>
          </td>

          <td className="p-3">
            <div className="h-3 bg-gray-700 rounded w-32 mx-auto"></div>
          </td>

          <td className="p-3">
            <div className="h-3 bg-gray-700 rounded w-24 mx-auto"></div>
          </td>

          <td className="p-3">
            <div className="h-3 bg-gray-700 rounded w-28 mx-auto"></div>
          </td>

          <td className="p-3">
            <div className="h-3 bg-gray-700 rounded w-20 mx-auto"></div>
          </td>

          <td className="p-3">
            <div className="h-3 bg-gray-700 rounded w-24 mx-auto"></div>
          </td>

          <td className="p-3">
            <div className="h-3 bg-gray-700 rounded w-28 mx-auto"></div>
          </td>

          <td className="p-3">
            <div className="h-3 bg-gray-700 rounded w-20 mx-auto"></div>
          </td>
        </tr>
      ))}
    </>
  );
};
