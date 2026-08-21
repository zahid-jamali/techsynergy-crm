import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import StatusBadge from "../components/StatusBadge";

export default function FinancePostingRepairPage() {
  const [failed, setFailed] = useState([]);
  const [unposted, setUnposted] = useState([]);
  const [totals, setTotals] = useState({ issuedScanned: 0, missingJournals: 0 });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [failRes, missingRes] = await Promise.all([
        api("finance/ledger/postings/failed?status=open&limit=100"),
        api("finance/ledger/postings/unposted-invoices"),
      ]);
      setFailed(failRes.data || []);
      setUnposted(missingRes.data || []);
      setTotals(missingRes.totals || { issuedScanned: 0, missingJournals: 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const retry = async (sourceType, sourceId, key) => {
    setBusy(key);
    setMessage("");
    setError("");
    try {
      const data = await api("finance/ledger/postings/retry", {
        method: "POST",
        body: JSON.stringify({ sourceType, sourceId }),
      });
      setMessage(data.msg || "Retry complete");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Journal posting repair</h1>
        <p className="page-subtitle">
          Issued invoices keep their original billing result even if a journal
          fails. Retry is idempotent and will not create duplicate journals.
          Historical issued invoices without a journal are listed here; they are
          not backfilled unless you retry a specific row.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}
      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-lg text-sm">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="kpi-card">
          <p className="text-sm text-bodyText">Open posting failures</p>
          <p className="text-2xl font-semibold text-brand mt-1">{failed.length}</p>
        </div>
        <div className="kpi-card">
          <p className="text-sm text-bodyText">Issued invoices with no posted journal</p>
          <p className="text-2xl font-semibold text-brand mt-1">
            {totals.missingJournals}
          </p>
          <p className="text-xs text-bodyText mt-1">
            Scanned {totals.issuedScanned} issued invoices
          </p>
        </div>
      </div>

      <div className="table-wrap">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-heading">Failed posting attempts</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Source</th>
              <th>Action</th>
              <th>Error</th>
              <th>Retries</th>
              <th>Last attempt</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-bodyText">
                  Loading...
                </td>
              </tr>
            ) : failed.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-bodyText">
                  No open journal failures
                </td>
              </tr>
            ) : (
              failed.map((row) => (
                <tr key={row._id}>
                  <td>
                    {row.sourceType}
                    <div className="text-xs text-bodyText">{String(row.sourceId)}</div>
                  </td>
                  <td>
                    <StatusBadge value={row.action} />
                  </td>
                  <td className="max-w-sm text-sm">{row.lastError}</td>
                  <td>{row.retryCount}</td>
                  <td>
                    {row.lastAttemptAt
                      ? new Date(row.lastAttemptAt).toLocaleString()
                      : "-"}
                  </td>
                  <td>
                    <button
                      disabled={busy === row._id}
                      onClick={() => retry(row.sourceType, row.sourceId, row._id)}
                      className="text-brand hover:underline text-sm"
                    >
                      {busy === row._id ? "Retrying..." : "Retry"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="table-wrap">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-heading">
            Issued invoices without a posted journal
          </h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Account</th>
              <th>Amount</th>
              <th>Issued</th>
              <th>Failure</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {unposted.length === 0 && !loading ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-bodyText">
                  All scanned issued invoices have a posted journal, or none
                  have been issued yet
                </td>
              </tr>
            ) : (
              unposted.map((inv) => (
                <tr key={inv._id}>
                  <td className="font-medium">{inv.invoiceNumber}</td>
                  <td>
                    {inv.order?.finalQuote?.account?.accountName || "-"}
                  </td>
                  <td>
                    {inv.currency} {inv.grandTotal?.toLocaleString()}
                  </td>
                  <td>
                    {inv.issuedAt
                      ? new Date(inv.issuedAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="text-sm text-bodyText max-w-xs">
                    {inv.postingFailure?.lastError ||
                      "No journal (pre-ledger or unrecorded failure)"}
                  </td>
                  <td>
                    <button
                      disabled={busy === inv._id}
                      onClick={() => retry("invoice", inv._id, inv._id)}
                      className="text-brand hover:underline text-sm"
                    >
                      {busy === inv._id ? "Retrying..." : "Post journal"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
