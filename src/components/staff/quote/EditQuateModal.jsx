import { useState } from "react";

const QUOTE_STAGES = [
  "Draft",
  "Negotiation",
  "Delivered",
  "On Hold",
  "Confirmed",
  "Closed Won",
  "Closed Lost",
];

const EditQuoteModal = ({ quote, onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");

  const [formData, setFormData] = useState({
    subject: quote.subject,
    quoteStage: quote.quoteStage,
    validUntil: quote.validUntil ? quote.validUntil.slice(0, 10) : "",
    description: quote.description || "",
    currency: quote.currency || "PKR",
    isGstApplied: Boolean(quote.isGstApplied), // ✅ GST checkbox
    products: quote.products.map((p) => ({
      productName: p.productName,
      quantity: p.quantity,
      listPrice: p.listPrice,
      discount: p.discount,
    })),
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  /* ---------------- Products ---------------- */
  const updateProduct = (index, field, value) => {
    const products = [...formData.products];
    products[index][field] = value;
    setFormData({ ...formData, products });
  };

  const addProduct = () => {
    setFormData({
      ...formData,
      products: [
        ...formData.products,
        {
          productName: "",
          quantity: 1,
          listPrice: 0,
          discount: 0,
        },
      ],
    });
  };

  const removeProduct = (index) => {
    setFormData({
      ...formData,
      products: formData.products.filter((_, i) => i !== index),
    });
  };

  /* ---------------- Submit ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch(
      `${process.env.REACT_APP_BACKEND_URL}quotes/${quote._id}/update`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      }
    );

    onSuccess();
    onClose();
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="flex justify-center px-4 py-8">
        <div className="bg-black border border-gray-800 rounded-lg w-full max-w-3xl text-white">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-red-500">Edit Quote</h2>
            <button onClick={onClose}>✕</button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-5 max-h-[75vh] overflow-y-auto"
          >
            {/* Subject */}
            <input
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="input"
              placeholder="Subject"
            />

            {/* Quote Stage */}
            <select
              name="quoteStage"
              value={formData.quoteStage}
              onChange={handleChange}
              className="input"
            >
              {QUOTE_STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>

            {/* Valid Until */}
            <input
              type="date"
              name="validUntil"
              value={formData.validUntil}
              onChange={handleChange}
              className="input"
            />

            <select
              className="bg-black border border-gray-800 rounded-lg w-22 text-white"
              onChange={(e) => {
                setFormData({ ...formData, currency: e.target.value });
              }}
            >
              <option value={"USD"}>USD</option>
              <option value={"PKR"}>PKR</option>
            </select>

            {/* GST Checkbox */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.isGstApplied}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isGstApplied: e.target.checked,
                  })
                }
                className="w-4 h-4 accent-red-600"
              />
              <span className="text-gray-300">
                Apply GST (18%) on Grand Total
              </span>
            </div>

            {/* Products */}
            <div>
              <h3 className="text-gray-400 mb-2">Products</h3>

              {formData.products.map((p, i) => (
                <div key={i} className="grid grid-cols-6 gap-2 mb-2">
                  <input
                    placeholder="Product"
                    value={p.productName}
                    onChange={(e) =>
                      updateProduct(i, "productName", e.target.value)
                    }
                    className="input col-span-2"
                  />
                  <input
                    type="number"
                    value={p.quantity}
                    onChange={(e) =>
                      updateProduct(i, "quantity", e.target.value)
                    }
                    className="input"
                  />
                  <input
                    type="number"
                    value={p.listPrice}
                    onChange={(e) =>
                      updateProduct(i, "listPrice", e.target.value)
                    }
                    className="input"
                  />
                  <input
                    type="number"
                    value={p.discount}
                    onChange={(e) =>
                      updateProduct(i, "discount", e.target.value)
                    }
                    className="input"
                  />
                  <button
                    type="button"
                    onClick={() => removeProduct(i)}
                    className="text-red-400"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addProduct}
                className="text-blue-400 mt-2"
              >
                + Add Product
              </button>
            </div>

            {/* Notes */}
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="input"
              placeholder="Notes"
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-700 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          background: #111827;
          border: 1px solid #374151;
          padding: 8px 10px;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
};

export default EditQuoteModal;
