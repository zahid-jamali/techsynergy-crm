import { useState, useMemo } from "react";

const QUOTE_STAGES = [
  "Draft",
  "Negotiation",
  "Delivered",
  "On Hold",
  "Confirmed",
  "Closed Won",
  "Closed Lost",
];

const round = (n) => Math.round(n * 100) / 100;

const EditQuoteModal = ({ quote, onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");

  const [formData, setFormData] = useState({
    subject: quote.subject,
    quoteStage: quote.quoteStage,
    validUntil: quote.validUntil ? quote.validUntil.slice(0, 10) : "",
    description: quote.description || "",
    currency: quote.currency || "PKR",
    isGstApplied: Boolean(quote.isGstApplied),
    otherTax: quote.otherTax?.length
      ? quote.otherTax.map((t) => ({
          tax: t.tax,
          percent: t.percent,
        }))
      : [],
    products: quote.products.map((p) => ({
      productName: p.productName,
      quantity: p.quantity,
      listPrice: p.listPrice,
      discount: p.discount,
    })),
  });

  /* ================= CHANGE HANDLERS ================= */

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

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
        { productName: "", quantity: 1, listPrice: 0, discount: 0 },
      ],
    });
  };

  const removeProduct = (index) => {
    setFormData({
      ...formData,
      products: formData.products.filter((_, i) => i !== index),
    });
  };

  const addOtherTax = () => {
    setFormData({
      ...formData,
      otherTax: [...formData.otherTax, { tax: "", percent: 0 }],
    });
  };

  const updateOtherTax = (index, field, value) => {
    const updated = [...formData.otherTax];
    updated[index][field] = value;
    setFormData({ ...formData, otherTax: updated });
  };

  const removeOtherTax = (index) => {
    setFormData({
      ...formData,
      otherTax: formData.otherTax.filter((_, i) => i !== index),
    });
  };

  /* ================= CALCULATIONS ================= */

  const calculateLineTotal = (p) => {
    const qty = Number(p.quantity) || 0;
    const price = Number(p.listPrice) || 0;
    const discount = Number(p.discount) || 0;
    return qty * price - discount;
  };

  const subTotal = useMemo(
    () =>
      round(
        formData.products.reduce(
          (acc, p) =>
            acc + (Number(p.quantity) || 0) * (Number(p.listPrice) || 0),
          0
        )
      ),
    [formData.products]
  );

  const discountTotal = useMemo(
    () =>
      round(
        formData.products.reduce((acc, p) => acc + (Number(p.discount) || 0), 0)
      ),
    [formData.products]
  );

  const taxableAmount = round(subTotal - discountTotal);

  const gstAmount = formData.isGstApplied ? round(taxableAmount * 0.18) : 0;

  const otherTaxAmount = round(
    formData.otherTax.reduce(
      (acc, t) => acc + (taxableAmount * (Number(t.percent) || 0)) / 100,
      0
    )
  );

  const grandTotal = round(taxableAmount + gstAmount + otherTaxAmount);

  /* ================= SUBMIT ================= */

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

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 overflow-y-auto">
      <div className="flex justify-center px-6 py-10">
        <div className="bg-[#0f172a] border border-gray-800 rounded-2xl w-full max-w-5xl text-white shadow-2xl">
          {/* HEADER */}
          <div className="flex justify-between items-center px-8 py-5 border-b border-gray-800">
            <div>
              <h2 className="text-2xl font-semibold text-red-500">
                Edit Quote
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Real-time financial calculations enabled
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-8 space-y-8 max-h-[85vh] overflow-y-auto"
          >
            {/* GENERAL INFO */}
            <div className="grid grid-cols-2 gap-6">
              <input
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="input"
                placeholder="Quote Subject"
              />

              <select
                name="quoteStage"
                value={formData.quoteStage}
                onChange={handleChange}
                className="input"
              >
                {QUOTE_STAGES.map((stage) => (
                  <option key={stage}>{stage}</option>
                ))}
              </select>

              <input
                type="date"
                name="validUntil"
                value={formData.validUntil}
                onChange={handleChange}
                className="input"
              />

              <select
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
                className="input"
              >
                <option value="USD">USD</option>
                <option value="PKR">PKR</option>
              </select>
            </div>

            {/* PRODUCTS */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-300">
                  Products
                </h3>
                <button
                  type="button"
                  onClick={addProduct}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm"
                >
                  + Add Product
                </button>
              </div>

              <div className="space-y-3">
                {formData.products.map((p, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-7 gap-3 bg-[#111827] border border-gray-800 rounded-xl p-4"
                  >
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

                    <div className="flex items-center justify-center text-red-400 font-semibold">
                      {formData.currency}{" "}
                      {round(calculateLineTotal(p)).toFixed(2)}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeProduct(i)}
                      className="text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* TAX CONFIG */}
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span>Apply GST (18%)</span>
                <input
                  type="checkbox"
                  checked={formData.isGstApplied}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isGstApplied: e.target.checked,
                    })
                  }
                  className="accent-red-600"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Other Taxes</span>
                  <button
                    type="button"
                    onClick={addOtherTax}
                    className="text-red-500 text-sm"
                  >
                    + Add Tax
                  </button>
                </div>

                {formData.otherTax.map((t, i) => (
                  <div key={i} className="grid grid-cols-6 gap-3">
                    <input
                      placeholder="Tax Name"
                      value={t.tax}
                      onChange={(e) => updateOtherTax(i, "tax", e.target.value)}
                      className="input col-span-3"
                    />
                    <input
                      type="number"
                      placeholder="%"
                      value={t.percent}
                      onChange={(e) =>
                        updateOtherTax(i, "percent", e.target.value)
                      }
                      className="input col-span-2"
                    />
                    <button
                      type="button"
                      onClick={() => removeOtherTax(i)}
                      className="text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* SUMMARY */}
            <div className="bg-black border border-gray-800 rounded-xl p-6 space-y-3">
              <SummaryRow
                label="Subtotal"
                value={subTotal}
                currency={formData.currency}
              />
              <SummaryRow
                label="Discount"
                value={discountTotal}
                currency={formData.currency}
              />
              <SummaryRow
                label="Taxable"
                value={taxableAmount}
                currency={formData.currency}
              />
              {formData.isGstApplied && (
                <SummaryRow
                  label="GST (18%)"
                  value={gstAmount}
                  currency={formData.currency}
                />
              )}
              {formData.otherTax.map((t, i) => (
                <SummaryRow
                  key={i}
                  label={`${t.tax || "Tax"} (${t.percent || 0}%)`}
                  value={round(
                    (taxableAmount * (Number(t.percent) || 0)) / 100
                  )}
                  currency={formData.currency}
                />
              ))}

              <div className="border-t border-gray-700 pt-3 flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-red-500">
                  {formData.currency} {grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* NOTES */}
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="input"
              placeholder="Additional notes..."
            />

            {/* ACTIONS */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg"
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
          background: #0f172a;
          border: 1px solid #374151;
          padding: 10px 12px;
          border-radius: 8px;
        }
        .input:focus {
          outline: none;
          border-color: #dc2626;
          box-shadow: 0 0 0 1px #dc2626;
        }
      `}</style>
    </div>
  );
};

const SummaryRow = ({ label, value, currency }) => (
  <div className="flex justify-between text-gray-400 text-sm">
    <span>{label}</span>
    <span>
      {currency} {value.toFixed(2)}
    </span>
  </div>
);

export default EditQuoteModal;
