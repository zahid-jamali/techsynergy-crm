import { useEffect, useState } from "react";
import { api } from "../lib/api";
import LookupPicker from "../components/lists/LookupPicker";

export default function FinanceLedgerPage() {
  const [tab, setTab] = useState("customer");
  const [party, setParty] = useState(null);
  const [currency, setCurrency] = useState("PKR");
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!party?._id) {
        setRows([]);
        setTotals(null);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const path =
          tab === "customer"
            ? `finance/ledger/customers/${party._id}?currency=${currency}`
            : `finance/ledger/vendors/${party._id}?currency=${currency}`;
        const data = await api(path);
        setRows(data.data || []);
        setTotals(data.totals || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [party, tab, currency]);

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Customer / vendor ledger</h1>
        <p className="page-subtitle">
          Running balance from posted journal lines only. Draft invoices and
          purchase orders do not appear here.
        </p>
      </div>

      <div className="card p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {["customer", "vendor"].map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setTab(id);
                setParty(null);
                setRows([]);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                tab === id ? "bg-brand text-white" : "bg-surface text-bodyText"
              }`}
            >
              {id === "customer" ? "Customer" : "Vendor"}
            </button>
          ))}
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="input w-28"
          >
            <option>PKR</option>
            <option>USD</option>
          </select>
        </div>
        {tab === "customer" ? (
          <LookupPicker
            label="Customer account"
            endpoint="account/lookup"
            placeholder="Search team accounts..."
            value={party}
            displayValue={party?.accountName || ""}
            onSelect={setParty}
            renderItem={(a) => (
              <div>
                <div className="font-medium">{a.accountName}</div>
                <div className="text-xs text-bodyText">{a.industry || "Account"}</div>
              </div>
            )}
          />
        ) : (
          <LookupPicker
            label="Vendor"
            endpoint="vendors/get"
            placeholder="Search vendors..."
            value={party}
            displayValue={party?.name || ""}
            onSelect={setParty}
            renderItem={(v) => v.name || v.code}
          />
        )}
      </div>

      {totals && (
        <div className="kpi-card">
          <p className="text-sm text-bodyText">
            {tab === "customer" ? "Receivable" : "Payable"} ({currency})
          </p>
          <p className="text-2xl font-semibold text-brand mt-1">
            {Number(totals.balance || 0).toLocaleString()}
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Entry</th>
              <th>Account</th>
              <th>Narration</th>
              <th>Debit</th>
              <th>Credit</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-bodyText">
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-bodyText">
                  {party ? "No posted lines" : "Select a party"}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row._id}>
                  <td>{new Date(row.date).toLocaleDateString()}</td>
                  <td>{row.entryNumber}</td>
                  <td>
                    {row.ledgerAccount?.code} {row.ledgerAccount?.name}
                  </td>
                  <td>{row.narration}</td>
                  <td>{row.debit ? row.debit.toLocaleString() : ""}</td>
                  <td>{row.credit ? row.credit.toLocaleString() : ""}</td>
                  <td>{row.runningBalance?.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
