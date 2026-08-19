import { useCallback, useEffect, useState } from "react";
import StatusBadge from "../components/StatusBadge";

const FinanceInvoicesPage = () => {
  const token = sessionStorage.getItem("token");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}finance/invoices`,
        { headers: { authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setItems(data.data || []);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const patchInvoice = async (id, action) => {
    setBusyId(id);
    try {
      await fetch(
        `${process.env.REACT_APP_BACKEND_URL}finance/invoices/${id}/${action}`,
        {
          method: "PATCH",
          headers: { authorization: `Bearer ${token}` },
        }
      );
      await fetchInvoices();
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Invoices</h1>
        <p className="page-subtitle">
          Draft, issue and download invoices for forwarded deliveries
        </p>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Order</th>
              <th>Account</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Issued</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-bodyText">
                  Loading invoices...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-bodyText">
                  No invoices yet. Create them from the handoff queue.
                </td>
              </tr>
            ) : (
              items.map((inv) => (
                <tr key={inv._id}>
                  <td className="font-medium">{inv.invoiceNumber}</td>
                  <td>{inv.order?.orderNumber || "-"}</td>
                  <td>
                    {inv.order?.finalQuote?.account?.accountName || "-"}
                  </td>
                  <td>
                    {inv.currency} {inv.grandTotal?.toLocaleString()}
                  </td>
                  <td>
                    <StatusBadge value={inv.status} />
                  </td>
                  <td>
                    {inv.issuedAt
                      ? new Date(inv.issuedAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="space-x-3 whitespace-nowrap">
                    {inv.order?._id && (
                      <a
                        href={`${process.env.REACT_APP_BACKEND_URL}invoice/${inv.order._id}/pdf`}
                        className="text-brand hover:underline text-sm"
                      >
                        PDF
                      </a>
                    )}
                    {inv.status === "Draft" && (
                      <button
                        disabled={busyId === inv._id}
                        onClick={() => patchInvoice(inv._id, "issue")}
                        className="text-emerald-700 hover:underline text-sm"
                      >
                        Issue
                      </button>
                    )}
                    {inv.status !== "Cancelled" && (
                      <button
                        disabled={busyId === inv._id}
                        onClick={() => patchInvoice(inv._id, "cancel")}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Cancel
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

export default FinanceInvoicesPage;
