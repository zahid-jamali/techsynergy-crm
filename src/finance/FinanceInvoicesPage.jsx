import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Eye, FileText, Inbox, Receipt, Search } from "lucide-react";
import { api } from "../lib/api";
import { downloadFile, previewFile } from "../lib/download";
import { accountOf, fmtDate, fmtMoney } from "../lib/format";
import StatusBadge from "../components/StatusBadge";
import { Alert, EmptyState, FbrBadge, PageHeader, Tabs, TableSkeleton } from "../components/desk/ui";

const TAB_FILTERS = {
  all: () => true,
  Draft: (i) => i.status === "Draft",
  Issued: (i) => i.status === "Issued",
  fbr_failed: (i) => i.status === "Draft" && i.fbr?.status === "failed",
  overdue: (i) => i.status === "Issued" && i.dueDate && new Date(i.dueDate) < new Date(),
  Cancelled: (i) => i.status === "Cancelled",
};

export default function FinanceInvoicesPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api("finance/invoices");
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

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter(TAB_FILTERS[tab]).filter((i) => {
      if (!needle) return true;
      return [i.invoiceNumber, accountOf(i), i.buyer?.ntnCnic, i.fbr?.irn, i.customerRefNo, i.order?.orderNumber]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(needle));
    });
  }, [items, tab, q]);

  const count = (k) => items.filter(TAB_FILTERS[k]).length;
  const sum = rows.filter((r) => r.status !== "Cancelled").reduce((a, r) => a + (r.currency === "USD" ? (r.grandTotal || 0) * (r.exchangeRate || 1) : r.grandTotal || 0), 0);

  const pdf = async (e, inv, preview) => {
    e.stopPropagation();
    try {
      if (preview) await previewFile(`finance/invoices/${inv._id}/pdf`);
      else await downloadFile(`finance/invoices/${inv._id}/pdf`, `${inv.invoiceNumber}.pdf`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="Billing"
        title="Sales tax invoices"
        subtitle="Draft, validate with FBR, issue and download customer invoices"
        actions={
          <button className="btn-secondary" onClick={() => navigate("/finance/queue")}>
            <Inbox size={16} /> Handoff queue
          </button>
        }
      />

      {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}

      <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:justify-between">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { value: "all", label: "All", count: items.length },
            { value: "Draft", label: "Drafts", count: count("Draft") },
            { value: "Issued", label: "Issued", count: count("Issued") },
            { value: "fbr_failed", label: "FBR rejected", count: count("fbr_failed") },
            { value: "overdue", label: "Overdue", count: count("overdue") },
            { value: "Cancelled", label: "Cancelled", count: count("Cancelled") },
          ]}
        />
        <div className="relative w-full lg:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-bodyText" />
          <input
            className="input pl-9"
            placeholder="Search invoice, buyer, NTN, IRN…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Buyer</th>
              <th>Date / due</th>
              <th className="text-right">Sales tax</th>
              <th className="text-right">Total</th>
              <th>Status</th>
              <th>FBR</th>
              <th className="text-right">Document</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton cols={8} />
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan="8">
                  <EmptyState icon={Receipt} title="No invoices here">
                    Invoices are created from deliveries that operations forwards to the finance handoff queue.
                  </EmptyState>
                </td>
              </tr>
            ) : (
              rows.map((inv) => {
                const overdue = TAB_FILTERS.overdue(inv);
                return (
                  <tr key={inv._id} className="cursor-pointer" onClick={() => navigate(`/finance/invoices/${inv._id}`)}>
                    <td>
                      <div className="font-medium text-brand">{inv.invoiceNumber}</div>
                      <div className="text-xs text-bodyText">{inv.order?.orderNumber || "-"}</div>
                    </td>
                    <td>
                      <div className="font-medium">{accountOf(inv)}</div>
                      <div className="text-xs text-bodyText">
                        {inv.buyer?.registrationType || "-"}
                        {inv.buyer?.ntnCnic ? ` · ${inv.buyer.ntnCnic}` : ""}
                      </div>
                    </td>
                    <td className="whitespace-nowrap">
                      <div>{fmtDate(inv.documentDate)}</div>
                      <div className={`text-xs ${overdue ? "text-red-600 font-medium" : "text-bodyText"}`}>
                        {inv.dueDate ? `Due ${fmtDate(inv.dueDate)}` : "-"}
                      </div>
                    </td>
                    <td className="text-right tabular-nums whitespace-nowrap">
                      {fmtMoney(inv.totals?.salesTax || 0, "")}
                    </td>
                    <td className="text-right tabular-nums whitespace-nowrap font-medium">
                      {fmtMoney(inv.grandTotal, inv.currency)}
                    </td>
                    <td>
                      <StatusBadge value={inv.status} />
                    </td>
                    <td>
                      <FbrBadge fbr={inv.fbr} />
                      {inv.fbr?.irn && <div className="text-[11px] text-bodyText mt-0.5 font-mono">{inv.fbr.irn}</div>}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <button className="p-1.5 rounded text-bodyText hover:text-brand hover:bg-surface" title="Preview" onClick={(e) => pdf(e, inv, true)}>
                        <Eye size={16} />
                      </button>
                      <button className="p-1.5 rounded text-bodyText hover:text-brand hover:bg-surface" title="Download PDF" onClick={(e) => pdf(e, inv, false)}>
                        <Download size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {!loading && rows.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan="4">
                  <span className="inline-flex items-center gap-1.5">
                    <FileText size={14} /> {rows.length} invoice{rows.length === 1 ? "" : "s"}
                  </span>
                </td>
                <td className="text-right tabular-nums whitespace-nowrap">{fmtMoney(sum, "PKR")}</td>
                <td colSpan="3" className="text-xs font-normal text-bodyText">excl. cancelled, USD at invoice rate</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
