import { useCallback, useEffect, useState } from "react";
import StatusBadge from "../components/StatusBadge";
import { fileUrl } from "../lib/roles";

const FinanceQueuePage = () => {
  const token = sessionStorage.getItem("token");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}finance/queue`, {
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setItems(data.data || []);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const createInvoice = async (deliveryId) => {
    setBusyId(deliveryId);
    setError("");
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}finance/invoices`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ deliveryId }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to create invoice");
      await fetchQueue();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Finance Handoff Queue</h1>
        <p className="page-subtitle">
          Orders forwarded by operations with delivery notes and supporting
          documents
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Delivery</th>
              <th>Order / Account</th>
              <th>Amount</th>
              <th>Documents</th>
              <th>Forwarded</th>
              <th>Invoice</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-bodyText">
                  Loading queue...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-bodyText">
                  Nothing in the finance queue yet
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item._id}>
                  <td className="font-medium">{item.deliveryNumber}</td>
                  <td>
                    <div>{item.order?.orderNumber}</div>
                    <div className="text-xs text-bodyText">
                      {item.order?.finalQuote?.account?.accountName || "-"}
                    </div>
                  </td>
                  <td>
                    {item.order?.currency}{" "}
                    {item.order?.grandTotal?.toLocaleString()}
                  </td>
                  <td className="space-y-1">
                    {item.deliveryNote?.url && (
                      <a
                        href={fileUrl(item.deliveryNote.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-xs text-brand hover:underline"
                      >
                        Delivery note
                      </a>
                    )}
                    {(item.supportingDocuments || []).map((doc, i) => (
                      <a
                        key={i}
                        href={fileUrl(doc.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-xs text-brand hover:underline"
                      >
                        {doc.originalName || `Support ${i + 1}`}
                      </a>
                    ))}
                  </td>
                  <td>
                    {item.forwardedAt
                      ? new Date(item.forwardedAt).toLocaleDateString()
                      : "-"}
                    <div className="text-xs text-bodyText">
                      {item.forwardedBy?.name || ""}
                    </div>
                  </td>
                  <td>
                    {item.invoice ? (
                      <StatusBadge value={item.invoice.status} />
                    ) : (
                      <span className="text-xs text-bodyText">Not created</span>
                    )}
                  </td>
                  <td>
                    {!item.invoice && (
                      <button
                        disabled={busyId === item._id}
                        onClick={() => createInvoice(item._id)}
                        className="btn-primary text-xs"
                      >
                        {busyId === item._id ? "Creating..." : "Create invoice"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinanceQueuePage;
