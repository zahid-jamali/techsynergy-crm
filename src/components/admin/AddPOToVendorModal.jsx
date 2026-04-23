import { useEffect, useState } from "react";

const round = (n) => Math.round(n * 100) / 100;

const AddPOToVendorModal = ({ onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");

  /* ================= BASIC ================= */

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  /* ================= VENDOR SEARCH ================= */

  const [vendors, setVendors] = useState([]);
  const [vendorSearch, setVendorSearch] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showVendorList, setShowVendorList] = useState(false);

  /* ================= ORDER SEARCH ================= */

  const [orders, setOrders] = useState([]);
  const [orderSearch, setOrderSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderList, setShowOrderList] = useState(false);

  /* ================= PRODUCTS ================= */

  const [products, setProducts] = useState([]);

  /* ================= TAX ================= */

  const [taxes, setTaxes] = useState([]);

  /* ================= TERMS ================= */

  const [terms, setTerms] = useState([""]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    if (token) {
      fetchVendors();
      fetchOrders();
    }
  }, [token]);

  const fetchVendors = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}vendors/get`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setVendors(data.data || []);
    } catch {
      console.error("Vendor fetch failed");
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}orders/all`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setOrders(data.data || []);
    } catch {
      console.error("Order fetch failed");
    }
  };

  /* ================= FILTER ================= */

  const filteredVendors = vendors.filter((v) =>
    (v.name || "").toLowerCase().includes(vendorSearch.toLowerCase())
  );

  const filteredOrders = orders.filter((o) =>
    `${o.orderNumber} ${o.finalQuote?.subject}`
      .toLowerCase()
      .includes(orderSearch.toLowerCase())
  );

  /* ================= SELECT ORDER ================= */

  const selectOrder = (order) => {
    setSelectedOrder(order);

    setOrderSearch(`${order.orderNumber} - ${order.finalQuote?.subject}`);

    setShowOrderList(false);

    if (order.products) {
      const mapped = order.products.map((p) => ({
        productName: p.productName || "",
        quantity: Number(p.quantity) || 1,

        customerPrice: Number(p.listPrice) || 0,

        listPrice: Number(p.listPrice) || 0,
      }));

      setProducts(mapped);
    }
  };

  /* ================= PRODUCT ================= */

  const updateProduct = (index, field, value) => {
    const updated = [...products];

    updated[index][field] = value;

    setProducts(updated);
  };

  /* ================= TAX ================= */

  const addTax = () => {
    setTaxes([
      ...taxes,
      {
        tax: "",
        percent: 0,
      },
    ]);
  };

  const updateTax = (index, field, value) => {
    const updated = [...taxes];

    updated[index][field] = value;

    setTaxes(updated);
  };

  const removeTax = (index) => {
    setTaxes(taxes.filter((_, i) => i !== index));
  };

  /* ================= TERMS ================= */

  const updateTerm = (index, value) => {
    const updated = [...terms];

    updated[index] = value;

    setTerms(updated);
  };

  /* ================= CALCULATIONS ================= */

  const subTotal = round(
    products.reduce((sum, p) => {
      const qty = Number(p.quantity) || 0;

      const price = Number(p.listPrice) || 0;

      return sum + qty * price;
    }, 0)
  );

  const totalTax = round(
    taxes.reduce((sum, t) => {
      return sum + (subTotal * Number(t.percent || 0)) / 100;
    }, 0)
  );

  const grandTotal = round(subTotal + totalTax);

  /* ================= CREATE ================= */

  const handleCreate = async () => {
    setError("");

    if (!subject.trim()) return setError("Subject required");

    if (!selectedVendor) return setError("Vendor required");

    if (!selectedOrder) return setError("Order required");

    if (products.length === 0) return setError("Products required");

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}potovendor/create`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            subject,
            vendor: selectedVendor._id,
            Order: selectedOrder._id,
            refQuote: selectedOrder.finalQuote?._id,
            description,
            products,
            Tax: taxes,
            termsAndConditions: terms.filter((t) => t.trim()),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.msg);

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-black border border-gray-800 rounded-lg w-full max-w-6xl text-white">
        {/* HEADER */}

        <div className="px-6 py-4 border-b border-gray-800 flex justify-between">
          <h2 className="text-red-500 font-semibold">Create PO to Vendor</h2>

          <button onClick={onClose}>✕</button>
        </div>

        {/* BODY */}

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* SUBJECT */}

          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="PO Subject"
            className="w-full bg-gray-900 border border-gray-700 px-3 py-2 rounded"
          />

          {/* VENDOR SEARCH */}

          <div className="relative">
            <input
              value={vendorSearch}
              onChange={(e) => {
                setVendorSearch(e.target.value);
                setShowVendorList(true);
              }}
              placeholder="Search Vendor"
              className="w-full bg-gray-900 border border-gray-700 px-3 py-2 rounded"
            />

            {showVendorList && (
              <div className="absolute w-full bg-black border border-gray-800 mt-1 max-h-40 overflow-y-auto z-10">
                {filteredVendors.map((v) => (
                  <div
                    key={v._id}
                    onClick={() => {
                      setSelectedVendor(v);

                      setVendorSearch(v.name);

                      setShowVendorList(false);
                    }}
                    className="px-3 py-2 hover:bg-gray-800 cursor-pointer"
                  >
                    {v.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ORDER SEARCH */}

          <div className="relative">
            <input
              value={orderSearch}
              onChange={(e) => {
                setOrderSearch(e.target.value);
                setShowOrderList(true);
              }}
              placeholder="Search Order"
              className="w-full bg-gray-900 border border-gray-700 px-3 py-2 rounded"
            />

            {showOrderList && (
              <div className="absolute w-full bg-black border border-gray-800 mt-1 max-h-40 overflow-y-auto">
                {filteredOrders.map((o) => (
                  <div
                    key={o._id}
                    onClick={() => selectOrder(o)}
                    className="px-3 py-2 hover:bg-gray-800 cursor-pointer"
                  >
                    {o.finalQuote?.subject} -{" "}
                    {o.finalQuote?.account?.accountName}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PRODUCTS TABLE */}

          <div>
            <h3 className="text-gray-400 mb-2">Products</h3>

            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400">
                  <th>Product</th>

                  <th>Qty</th>

                  <th>Customer Price</th>

                  <th>Vendor Price</th>

                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                {products.map((p, i) => (
                  <tr key={i}>
                    <td>{p.productName}</td>

                    <td>{p.quantity}</td>

                    <td>{p.customerPrice}</td>

                    <td>
                      <input
                        type="number"
                        value={p.listPrice}
                        onChange={(e) =>
                          updateProduct(i, "listPrice", e.target.value)
                        }
                        className="bg-gray-900 border border-gray-700 px-2 py-1 rounded"
                      />
                    </td>

                    <td>{round(p.quantity * p.listPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TAX */}

          <div>
            <h3 className="text-gray-400">Taxes</h3>

            {taxes.map((t, i) => (
              <div key={i} className="flex gap-2 mt-2">
                <input
                  placeholder="Tax"
                  value={t.tax}
                  onChange={(e) => updateTax(i, "tax", e.target.value)}
                  className="bg-gray-900 border border-gray-700 px-2 py-1 rounded"
                />

                <input
                  type="number"
                  placeholder="%"
                  value={t.percent}
                  onChange={(e) => updateTax(i, "percent", e.target.value)}
                  className="w-24 bg-gray-900 border border-gray-700 px-2 py-1 rounded"
                />

                <button onClick={() => removeTax(i)} className="text-red-400">
                  Remove
                </button>
              </div>
            ))}

            <button onClick={addTax} className="text-blue-400 mt-2">
              + Add Tax
            </button>
          </div>

          {/* TOTALS */}

          <div className="text-right space-y-1">
            <div>Subtotal: {subTotal}</div>

            <div>Tax: {totalTax}</div>

            <div className="text-red-500 font-semibold">
              Grand Total: {grandTotal}
            </div>
          </div>

          {error && <p className="text-red-400">{error}</p>}
        </div>

        {/* FOOTER */}

        <div className="px-6 py-4 border-t border-gray-800 flex justify-end gap-3">
          <button onClick={onClose} className="bg-gray-700 px-4 py-2 rounded">
            Cancel
          </button>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            {loading ? "Saving..." : "Create PO"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPOToVendorModal;
