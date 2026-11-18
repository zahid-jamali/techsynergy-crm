import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, FilePlus2, Inbox, Paperclip } from "lucide-react";
import { api } from "../lib/api";
import { downloadFile } from "../lib/download";
import { fileUrl } from "../lib/roles";
import { fmtDate, fmtMoney } from "../lib/format";
import StatusBadge from "../components/StatusBadge";
import { Alert, EmptyState, FbrBadge, PageHeader, Spinner, TableSkeleton } from "../components/desk/ui";

export default function FinanceQueuePage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api("finance/queue");
      setItems(d.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createInvoice = async (deliveryId) => {
    setBusyId(deliveryId);
    setError("");
    try {
      const d = await api("finance/invoices", { method: "POST", body: JSON.stringify({ deliveryId }) });
      navigate(`/finance/invoices/${d.data._id}`);
    } catch (e) {
      setError(e.message);
      setBusyId("");
    }
  };

  const pending = items.filter((i) => !i.invoice);

  return (
    <div className="page">
      <PageHeader
        eyebrow="Billing"
        title="Finance handoff queue"
        subtitle="Delivered orders forwarded by operations with signed challans — raise the tax invoice from here"
      />

      {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Delivery</th>
              <th>Customer / order</th>
              <th className="text-right">Order value</th>
              <th>Proof of delivery</th>
              <th>Forwarded</th>
              <th>Invoice</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton cols={7} />
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <EmptyState icon={Inbox} title="The queue is clear">
                    Operations forwards deliveries here once goods are delivered and the signed challan is attached.
                  </EmptyState>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item._id}>
                  <td>
                    <div className="font-medium">{item.deliveryNumber}</div>
                    <button
                      className="text-xs text-brand hover:underline inline-flex items-center gap-1"
                      onClick={() => downloadFile(`deliveries/${item._id}/challan`, `${item.deliveryNumber}.pdf`).catch((e) => setError(e.message))}
                    >
                      <Download size={12} /> Challan PDF
                    </button>
                  </td>
                  <td>
                    <div className="font-medium">{item.order?.finalQuote?.account?.accountName || "-"}</div>
                    <div className="text-xs text-bodyText">
                      {item.order?.orderNumber} · {item.order?.finalQuote?.deal?.dealName || "-"}
                    </div>
                  </td>
                  <td className="text-right tabular-nums whitespace-nowrap">
                    {fmtMoney(item.order?.grandTotal, item.order?.currency)}
                  </td>
                  <td className="text-xs space-y-1">
                    {item.deliveryNote?.url ? (
                      <a href={fileUrl(item.deliveryNote.url)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-brand hover:underline">
                        <Paperclip size={12} /> Signed challan
                      </a>
                    ) : (
                      <span className="text-red-600">Missing signed copy</span>
                    )}
                    {(item.supportingDocuments || []).map((doc, i) => (
                      <a key={i} href={fileUrl(doc.url)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-brand hover:underline">
                        <Paperclip size={12} /> {doc.originalName || `Document ${i + 1}`}
                      </a>
                    ))}
                  </td>
                  <td className="whitespace-nowrap">
                    {fmtDate(item.forwardedAt)}
                    <div className="text-xs text-bodyText">{item.forwardedBy?.name || ""}</div>
                  </td>
                  <td>
                    {item.invoice ? (
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{item.invoice.invoiceNumber}</div>
                        <div className="flex gap-1 flex-wrap">
                          <StatusBadge value={item.invoice.status} />
                          <FbrBadge fbr={item.invoice.fbr} />
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-bodyText">Not raised</span>
                    )}
                  </td>
                  <td className="text-right">
                    {item.invoice ? (
                      <button className="btn-secondary text-xs" onClick={() => navigate(`/finance/invoices/${item.invoice._id}`)}>
                        Open invoice
                      </button>
                    ) : (
                      <button disabled={busyId === item._id} onClick={() => createInvoice(item._id)} className="btn-primary text-xs">
                        {busyId === item._id ? <Spinner /> : <FilePlus2 size={14} />} Raise invoice
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {!loading && items.length > 0 && (
        <p className="text-xs text-bodyText">
          {pending.length} of {items.length} forwarded deliveries still need an invoice.
        </p>
      )}
    </div>
  );
}
