import { useEffect, useMemo, useState } from "react";

const CreateInvoiceModal = ({ onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");

  const [sellOrders, setSellOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [terms, setTerms] = useState([""]);

  const [form, setForm] = useState({
    documentDate: new Date().toISOString().split("T")[0],
    customerRefNo: "",
    description: "",
  });

  useEffect(() => {
    const fetchSellOrders = async () => {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}quotes/all`,
        {
          headers: { authorization: `Bearer ${token}` },
        }
      );

      const json = await res.json();

      const valid = json.data.filter(
        (q) =>
          q.isActive === true &&
          q.isSOApproved === true &&
          q.quoteStage === "Confirmed"
      );

      setSellOrders(valid);
    };

    fetchSellOrders();
  }, [token]);

  /* ==============================
     REAL-TIME SEARCH (FIXED)
  ============================== */
  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return sellOrders;

    return sellOrders.filter((order) => {
      const subject = (order.subject || "").toLowerCase();
      const quote = (order.quoteNumber || "").toLowerCase();
      const account = (
        order.account?.name ||
        order.account?.accountName ||
        ""
      ).toLowerCase();
      const deal = (
        order.deal?.name ||
        order.deal?.dealName ||
        ""
      ).toLowerCase();

      return (
        subject.includes(q) ||
        quote.includes(q) ||
        account.includes(q) ||
        deal.includes(q)
      );
    });
  }, [search, sellOrders]);

  /* ==============================
     Submit
  ============================== */
  const submit = async (e) => {
    e.preventDefault();

    if (!selectedOrder) {
      alert("Please select a valid Sell Order");
      return;
    }

    const payload = {
      ...form,
      sellOrder: selectedOrder._id,
      termsAndConditions: terms.filter((t) => t.trim() !== ""),
    };

    const res = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}invoice/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      alert(err.message || "Failed to create invoice");
      return;
    }

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <form
        onSubmit={submit}
        className="bg-gray-900 text-white w-[950px] rounded-xl p-6"
      >
        <h2 className="text-xl font-semibold mb-5">Create Invoice</h2>

        <div className="grid grid-cols-2 gap-6">
          {/* LEFT */}
          <div className="space-y-4">
            <Input label="Document Date">
              <input
                type="date"
                value={form.documentDate}
                onChange={(e) =>
                  setForm({ ...form, documentDate: e.target.value })
                }
                className="input"
              />
            </Input>

            <Input label="Customer Purchase Order No">
              <input
                value={form.customerRefNo}
                onChange={(e) =>
                  setForm({ ...form, customerRefNo: e.target.value })
                }
                className="input"
              />
            </Input>

            <Input label="Description">
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="input"
              />
            </Input>

            {/* TERMS */}
            <div>
              <label className="text-sm text-gray-400">
                Terms & Conditions
              </label>

              {terms.map((t, i) => (
                <div key={i} className="flex gap-2 mt-2">
                  <input
                    value={t}
                    onChange={(e) => {
                      const copy = [...terms];
                      copy[i] = e.target.value;
                      setTerms(copy);
                    }}
                    className="input flex-1"
                    placeholder={`Term ${i + 1}`}
                  />
                  {terms.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setTerms(terms.filter((_, idx) => idx !== i))
                      }
                      className="text-red-500"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => setTerms([...terms, ""])}
                className="text-sm text-blue-400 mt-2"
              >
                + Add Term
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div>
            <label className="text-sm text-gray-400">
              Select Sell Order (Confirmed Only)
            </label>

            <input
              placeholder="Search by Subject, Account, Deal, Quote #"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input mb-2"
            />

            <div className="h-[420px] overflow-y-auto border border-gray-700 rounded">
              {filteredOrders.map((order) => (
                <div
                  key={order._id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-3 cursor-pointer border-b border-gray-700 hover:bg-gray-700 ${
                    selectedOrder?._id === order._id ? "bg-gray-700" : ""
                  }`}
                >
                  <div className="font-medium text-sm">
                    {order.subject || "No Subject"}
                  </div>
                  <div className="text-xs text-gray-400">
                    {order.quoteNumber} •{" "}
                    {order.account?.name || order.account?.accountName} •{" "}
                    {order.deal?.name || order.deal?.dealName || "No Deal"}
                  </div>
                </div>
              ))}

              {filteredOrders.length === 0 && (
                <div className="p-4 text-sm text-gray-400">
                  No matching sell orders found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 pt-6">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button className="btn-primary">Create Invoice</button>
        </div>
      </form>
    </div>
  );
};

/* ==============================
   Small UI Helpers
============================== */
const Input = ({ label, children }) => (
  <div>
    <label className="text-sm text-gray-400">{label}</label>
    {children}
  </div>
);

export default CreateInvoiceModal;

/* ==============================
   Tailwind helpers (global CSS)
============================== */
/*
.input {
  @apply w-full bg-gray-800 border border-gray-700 rounded px-3 py-2;
}
.btn-primary {
  @apply px-5 py-2 bg-red-600 rounded;
}
.btn-secondary {
  @apply px-4 py-2 border border-gray-600 rounded;
}
*/
