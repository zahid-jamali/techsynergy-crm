import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import LookupPicker from "../components/lists/LookupPicker";
import StatusBadge from "../components/StatusBadge";

export default function FinancePaymentsPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [party, setParty] = useState(null);
  const [form, setForm] = useState({
    direction: "inbound",
    method: "bank",
    cashAccountCode: "1110",
    amount: "",
    currency: "PKR",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const load = useCallback(async () => {
    const data = await api("finance/ledger/payments?limit=50");
    setItems(data.data || []);
  }, []);

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    if (!party?._id || !form.amount) return;
    setSaving(true);
    setError("");
    try {
      await api("finance/ledger/payments", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          partyId: party._id,
          amount: Number(form.amount),
          post: true,
        }),
      });
      setForm({ ...form, amount: "", notes: "" });
      setParty(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const voidPayment = async (id) => {
    await api(`finance/ledger/payments/${id}/void`, { method: "PATCH" });
    await load();
  };

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Payments</h1>
        <p className="page-subtitle">
          Customer receipts and vendor payments. Posting writes the cash/bank
          and AR/AP journal. If the journal fails, the payment stays posted and
          appears on the repair page.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="card p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <select
          className="input"
          value={form.direction}
          onChange={(e) => {
            setForm({ ...form, direction: e.target.value });
            setParty(null);
          }}
        >
          <option value="inbound">Customer receipt</option>
          <option value="outbound">Vendor payment</option>
        </select>
        {form.direction === "inbound" ? (
          <LookupPicker
            placeholder="Customer account"
            endpoint="account/lookup"
            value={party}
            displayValue={party?.accountName || ""}
            onSelect={setParty}
          />
        ) : (
          <LookupPicker
            placeholder="Vendor"
            endpoint="vendors/get"
            value={party}
            displayValue={party?.name || ""}
            onSelect={setParty}
          />
        )}
        <input
          className="input"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />
        <select
          className="input"
          value={form.currency}
          onChange={(e) => setForm({ ...form, currency: e.target.value })}
        >
          <option>PKR</option>
          <option>USD</option>
        </select>
        <select
          className="input"
          value={form.method}
          onChange={(e) => setForm({ ...form, method: e.target.value })}
        >
          <option value="cash">Cash</option>
          <option value="bank">Bank</option>
          <option value="cheque">Cheque</option>
          <option value="online">Online</option>
        </select>
        <select
          className="input"
          value={form.cashAccountCode}
          onChange={(e) => setForm({ ...form, cashAccountCode: e.target.value })}
        >
          <option value="1100">1100 Cash</option>
          <option value="1110">1110 Bank PKR</option>
          <option value="1120">1120 Bank USD</option>
        </select>
        <input
          className="input"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <input
          className="input md:col-span-2"
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <button className="btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Record & post"}
        </button>
      </form>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Number</th>
              <th>Direction</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p._id}>
                <td className="font-medium">{p.paymentNumber}</td>
                <td>{p.direction}</td>
                <td>
                  {p.currency} {p.amount?.toLocaleString()}
                </td>
                <td>
                  <StatusBadge value={p.status} />
                </td>
                <td>{new Date(p.date).toLocaleDateString()}</td>
                <td>
                  {p.status === "posted" && (
                    <button
                      type="button"
                      className="text-red-600 text-sm hover:underline"
                      onClick={() => voidPayment(p._id)}
                    >
                      Void
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-8 text-bodyText">
                  No payments yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
