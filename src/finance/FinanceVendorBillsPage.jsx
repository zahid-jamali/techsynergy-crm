import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import LookupPicker from "../components/lists/LookupPicker";
import StatusBadge from "../components/StatusBadge";

export default function FinanceVendorBillsPage() {
  const [items, setItems] = useState([]);
  const [vendor, setVendor] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    vendorBillRef: "",
    billDate: new Date().toISOString().slice(0, 10),
    currency: "PKR",
    productName: "",
    quantity: 1,
    listPrice: "",
    description: "",
  });

  const load = useCallback(async () => {
    const data = await api("finance/ledger/vendor-bills?limit=50");
    setItems(data.data || []);
  }, []);

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    if (!vendor?._id || !form.productName || !form.listPrice) return;
    setSaving(true);
    setError("");
    try {
      await api("finance/ledger/vendor-bills", {
        method: "POST",
        body: JSON.stringify({
          vendor: vendor._id,
          vendorBillRef: form.vendorBillRef,
          billDate: form.billDate,
          currency: form.currency,
          description: form.description,
          post: true,
          lines: [
            {
              productName: form.productName,
              quantity: Number(form.quantity) || 1,
              listPrice: Number(form.listPrice),
            },
          ],
        }),
      });
      setForm({ ...form, vendorBillRef: "", productName: "", listPrice: "", description: "" });
      setVendor(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const cancel = async (id) => {
    await api(`finance/ledger/vendor-bills/${id}/cancel`, { method: "PATCH" });
    await load();
  };

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Vendor bills</h1>
        <p className="page-subtitle">
          Accounts payable vouchers. Purchase orders are not billed until you
          raise a vendor bill here.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="card p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <LookupPicker
          placeholder="Vendor"
          endpoint="vendors/get"
          value={vendor}
          displayValue={vendor?.name || ""}
          onSelect={setVendor}
        />
        <input
          className="input"
          placeholder="Vendor bill no."
          value={form.vendorBillRef}
          onChange={(e) => setForm({ ...form, vendorBillRef: e.target.value })}
        />
        <input
          className="input"
          type="date"
          value={form.billDate}
          onChange={(e) => setForm({ ...form, billDate: e.target.value })}
        />
        <input
          className="input"
          placeholder="Description / item"
          value={form.productName}
          onChange={(e) => setForm({ ...form, productName: e.target.value })}
        />
        <input
          className="input"
          type="number"
          min="1"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
        />
        <input
          className="input"
          type="number"
          min="0"
          step="0.01"
          placeholder="Price"
          value={form.listPrice}
          onChange={(e) => setForm({ ...form, listPrice: e.target.value })}
        />
        <select
          className="input"
          value={form.currency}
          onChange={(e) => setForm({ ...form, currency: e.target.value })}
        >
          <option>PKR</option>
          <option>USD</option>
        </select>
        <button className="btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Create & post bill"}
        </button>
      </form>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Bill</th>
              <th>Vendor</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((bill) => (
              <tr key={bill._id}>
                <td className="font-medium">{bill.billNumber}</td>
                <td>{bill.vendor?.name || "-"}</td>
                <td>
                  {bill.currency} {bill.grandTotal?.toLocaleString()}
                </td>
                <td>
                  <StatusBadge value={bill.status} />
                </td>
                <td>{new Date(bill.billDate).toLocaleDateString()}</td>
                <td>
                  {bill.status !== "cancelled" && (
                    <button
                      type="button"
                      className="text-red-600 text-sm hover:underline"
                      onClick={() => cancel(bill._id)}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-8 text-bodyText">
                  No vendor bills yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
