import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BadgeCheck, FileSpreadsheet, Receipt, Send, Wallet, Inbox } from "lucide-react";
import { api } from "../lib/api";
import { downloadFile } from "../lib/download";
import { accountOf, fmtCompact, fmtDate, fmtMoney } from "../lib/format";
import { Alert, EmptyState, FbrBadge, KpiCard, PageHeader, Spinner, Tabs, TableSkeleton } from "../components/desk/ui";

const PERIODS = [
  { value: "weekly", label: "This week" },
  { value: "monthly", label: "This month" },
  { value: "quarterly", label: "This quarter" },
  { value: "yearly", label: "This year" },
];

export default function FinanceReportsPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("monthly");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api(`finance/reports?period=${period}`);
      setReport(d.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    load();
  }, [load]);

  const exportExcel = async () => {
    setExporting(true);
    try {
      await downloadFile(`finance/reports/excel?period=${period}`, `sales-tax-register-${period}.xlsx`);
    } catch (e) {
      setError(e.message);
    } finally {
      setExporting(false);
    }
  };

  const t = report?.totals;

  return (
    <div className="page">
      <PageHeader
        eyebrow="Reporting"
        title="Sales tax register"
        subtitle={
          report
            ? `${fmtDate(report.start)} — ${fmtDate(report.end)} · issued invoices only`
            : "Issued invoices by period"
        }
        actions={
          <button onClick={exportExcel} className="btn-primary" disabled={exporting}>
            {exporting ? <Spinner /> : <FileSpreadsheet size={16} />} Export Excel
          </button>
        }
      />

      {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}

      <Tabs value={period} onChange={setPeriod} items={PERIODS} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <KpiCard label="Invoices issued" value={t ? t.invoicesIssued : "…"} icon={Receipt} />
        <KpiCard label="Value excl. tax" value={t ? fmtCompact(t.valueExclST) : "…"} icon={Wallet} tone="green" />
        <KpiCard label="Output sales tax" value={t ? fmtCompact(t.salesTax) : "…"} hint={t?.furtherTax ? `+ ${fmtCompact(t.furtherTax)} further tax` : undefined} icon={BadgeCheck} tone="sky" />
        <KpiCard label="Reported to FBR" value={t ? `${t.fbrReported} / ${t.invoicesIssued}` : "…"} icon={Send} tone="violet" />
        <KpiCard label="Pending invoicing" value={t ? t.pendingInvoicing : "…"} hint={t ? `${t.forwarded} forwarded in period` : undefined} icon={Inbox} tone="amber" onClick={() => navigate("/finance/queue")} />
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Date</th>
              <th>Buyer</th>
              <th>NTN / CNIC</th>
              <th>Sale type</th>
              <th className="text-right">Value excl. ST</th>
              <th className="text-right">Sales tax</th>
              <th className="text-right">Total</th>
              <th>FBR</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton cols={9} />
            ) : !report?.invoices?.length ? (
              <tr>
                <td colSpan="9">
                  <EmptyState icon={Receipt} title="No issued invoices in this period" />
                </td>
              </tr>
            ) : (
              report.invoices.map((inv) => (
                <tr key={inv._id} className="cursor-pointer" onClick={() => navigate(`/finance/invoices/${inv._id}`)}>
                  <td className="font-medium text-brand">{inv.invoiceNumber}</td>
                  <td className="whitespace-nowrap">{fmtDate(inv.documentDate)}</td>
                  <td>{accountOf(inv)}</td>
                  <td className="text-xs">
                    {inv.buyer?.ntnCnic || "-"}
                    <div className="text-bodyText">{inv.buyer?.registrationType}</div>
                  </td>
                  <td className="text-xs text-bodyText">
                    {inv.tax?.saleType || "-"} {inv.tax?.rate ? `· ${inv.tax.rate}` : ""}
                  </td>
                  <td className="text-right tabular-nums">{fmtMoney(inv.totals?.valueExclST ?? inv.subtotal, "")}</td>
                  <td className="text-right tabular-nums">{fmtMoney(inv.totals?.salesTax, "")}</td>
                  <td className="text-right tabular-nums font-medium whitespace-nowrap">{fmtMoney(inv.grandTotal, inv.currency)}</td>
                  <td>
                    <FbrBadge fbr={inv.fbr} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {!loading && report?.invoices?.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan="5">Period total</td>
                <td className="text-right tabular-nums">{fmtMoney(t.valueExclST, "")}</td>
                <td className="text-right tabular-nums">{fmtMoney(t.salesTax, "")}</td>
                <td className="text-right tabular-nums">{fmtMoney(t.totalRevenue, "")}</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
