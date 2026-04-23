import { useState } from "react";

const round = (n) => Math.round(n * 100) / 100;

const EditPOToVendorModal = ({ po, onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");

  const [subject, setSubject] = useState(po.subject || "");
  const [description, setDescription] = useState(po.description || "");

  const [products, setProducts] = useState(
    po.products?.map((p) => ({
      productName: p.productName,
      quantity: Number(p.quantity),
      listPrice: Number(p.listPrice),
    })) || []
  );

  const [taxes, setTaxes] = useState(po.Tax?.length ? po.Tax : []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================= PRODUCT ================= */

  const updateProduct = (index, field, value) => {
    const updated = [...products];

    updated[index][field] = field === "productName" ? value : Number(value);

    setProducts(updated);
  };

  const addProduct = () => {
    setProducts([
      ...products,
      {
        productName: "",
        quantity: 1,
        listPrice: 0,
      },
    ]);
  };

  const removeProduct = (index) => {
    if (products.length === 1) return;

    setProducts(products.filter((_, i) => i !== index));
  };

  /* ================= TAX ================= */

  const updateTax = (index, field, value) => {
    const updated = [...taxes];

    updated[index][field] = field === "tax" ? value : Number(value);

    setTaxes(updated);
  };

  const addTax = () => {
    setTaxes([
      ...taxes,
      {
        tax: "",
        percent: 0,
      },
    ]);
  };

  const removeTax = (index) => {
    setTaxes(taxes.filter((_, i) => i !== index));
  };

  /* ================= CALCULATIONS ================= */

  const subTotal = round(
    products.reduce((sum, p) => {
      return sum + Number(p.quantity || 0) * Number(p.listPrice || 0);
    }, 0)
  );

  const totalTax = round(
    taxes.reduce((sum, t) => {
      return sum + (subTotal * Number(t.percent || 0)) / 100;
    }, 0)
  );

  const grandTotal = round(subTotal + totalTax);

  /* ================= UPDATE ================= */

  const handleUpdate = async () => {
    setError("");

    if (!subject.trim()) return setError("Subject required");

    if (products.length === 0) return setError("Products required");

    if (products.some((p) => !p.productName.trim()))
      return setError("Each product must have name");

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}potovendor/update/${po._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subject,
            description,
            products,
            Tax: taxes,
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
          <h2 className="text-red-500 font-semibold">
            Edit PO — {po.poToNumber}
          </h2>

          <button onClick={onClose}>✕</button>
        </div>

        {/* BODY */}

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* SUBJECT */}

          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="PO Subject"
            className="w-full bg-gray-900 border border-gray-700 px-3 py-2 rounded"
          />

          {/* DESCRIPTION */}

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full bg-gray-900 border border-gray-700 px-3 py-2 rounded"
          />

          {/* PRODUCTS TABLE */}

          <div>
            <h3 className="text-gray-400 mb-2">Products</h3>

            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400">
                  <th className="text-left">Product</th>

                  <th>Qty</th>

                  <th>Vendor Price</th>

                  <th>Amount</th>

                  <th></th>
                </tr>
              </thead>

              <tbody>
                {products.map((p, i) => (
                  <tr key={i}>
                    <td>
                      <input
                        value={p.productName}
                        onChange={(e) =>
                          updateProduct(i, "productName", e.target.value)
                        }
                        className="bg-gray-900 border border-gray-700 px-2 py-1 rounded w-full"
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        value={p.quantity}
                        min="1"
                        onChange={(e) =>
                          updateProduct(i, "quantity", e.target.value)
                        }
                        className="w-20 bg-gray-900 border border-gray-700 px-2 py-1 rounded"
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        value={p.listPrice}
                        min="0"
                        onChange={(e) =>
                          updateProduct(i, "listPrice", e.target.value)
                        }
                        className="w-28 bg-gray-900 border border-gray-700 px-2 py-1 rounded"
                      />
                    </td>

                    <td>{round(p.quantity * p.listPrice)}</td>

                    <td>
                      <button
                        onClick={() => removeProduct(i)}
                        className="text-red-400"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button onClick={addProduct} className="text-blue-400 mt-2">
              + Add Product
            </button>
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
            onClick={handleUpdate}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            {loading ? "Updating..." : "Update PO"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPOToVendorModal;
