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
  const currentStage = quote.quoteStage;

  const [probability, setProbability] = useState(quote?.deal?.probability || 0);

  const [formData, setFormData] = useState({
    subject: quote.subject || "",
    quoteStage: quote.quoteStage,
    validUntil: quote.validUntil?.slice(0, 10) || "",
    description: quote.description || "",
    currency: quote.currency || "USD",
    isGstApplied: Boolean(quote.isGstApplied),
    otherTax: quote.otherTax || [],
    termsAndConditions: quote.termsAndConditions || [],
    products: quote.products.map((p) => ({
      productName: p.productName,
      description: p.description || "",
      quantity: p.quantity,
      pricingMode: "direct",
      listPrice: p.listPrice,
      purchasePrice: 0,
      margin: 0,
      discount: p.discount,
    })),
  });

  /* ================= PRODUCT LOGIC ================= */

  const updateProduct = (i, field, value) => {
    const updated = [...formData.products];
    updated[i][field] = value;

    const p = updated[i];
    if (p.pricingMode === "margin") {
      const cost = Number(p.purchasePrice) || 0;
      const margin = Number(p.margin) || 0;
      p.listPrice = cost + (cost * margin) / 100;
    }

    setFormData({ ...formData, products: updated });
  };

  const addProduct = () =>
    setFormData({
      ...formData,
      products: [
        ...formData.products,
        {
          productName: "",
          description: "",
          quantity: 1,
          pricingMode: "direct",
          listPrice: 0,
          purchasePrice: 0,
          margin: 0,
          discount: 0,
        },
      ],
    });

  const removeProduct = (i) =>
    setFormData({
      ...formData,
      products: formData.products.filter((_, index) => index !== i),
    });

  /* ================= TAX ================= */

  const addOtherTax = () =>
    setFormData({
      ...formData,
      otherTax: [...formData.otherTax, { tax: "", percent: 0 }],
    });

  const updateOtherTax = (i, field, value) => {
    const updated = [...formData.otherTax];
    updated[i][field] = value;
    setFormData({ ...formData, otherTax: updated });
  };

  const removeOtherTax = (i) =>
    setFormData({
      ...formData,
      otherTax: formData.otherTax.filter((_, index) => index !== i),
    });

  /* ================= TERMS ================= */

  const addTerm = () =>
    setFormData({
      ...formData,
      termsAndConditions: [...formData.termsAndConditions, ""],
    });

  const updateTerm = (i, value) => {
    const updated = [...formData.termsAndConditions];
    updated[i] = value;
    setFormData({ ...formData, termsAndConditions: updated });
  };

  const removeTerm = (i) =>
    setFormData({
      ...formData,
      termsAndConditions: formData.termsAndConditions.filter(
        (_, index) => index !== i
      ),
    });

  /* ================= CALCULATIONS ================= */

  const calculateLineTotal = (p) =>
    (Number(p.quantity) || 0) * (Number(p.listPrice) || 0) -
    (Number(p.discount) || 0);

  const subtotal = useMemo(
    () =>
      round(
        formData.products.reduce((acc, p) => acc + calculateLineTotal(p), 0)
      ),
    [formData.products]
  );

  const gstAmount = formData.isGstApplied ? round(subtotal * 0.18) : 0;

  const otherTaxAmount = round(
    formData.otherTax.reduce(
      (acc, t) => acc + (subtotal * (Number(t.percent) || 0)) / 100,
      0
    )
  );

  const grandTotal = round(subtotal + gstAmount + otherTaxAmount);

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch(
      `${process.env.REACT_APP_BACKEND_URL}quotes/update/${quote._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          probability,
        }),
      }
    );

    onSuccess();
    onClose();
  };

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 overflow-y-auto">
      <div className="flex justify-center px-6 py-10">
        <div className="bg-black border border-gray-800 rounded-2xl w-full max-w-7xl text-white shadow-2xl">
          {/* HEADER */}
          <div className="flex justify-between items-center px-8 py-5 border-b border-gray-800">
            <h2 className="text-2xl font-semibold text-red-500">Edit Quote</h2>
            <button onClick={onClose}>✕</button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-10">
            {/* GENERAL INFO */}
            <div className="grid grid-cols-2 gap-6">
              <input
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="input"
                placeholder="Quote Subject"
              />

              <select
                value={formData.quoteStage}
                onChange={(e) =>
                  setFormData({ ...formData, quoteStage: e.target.value })
                }
                className="input"
              >
                {QUOTE_STAGES.map((stage) => (
                  <option key={stage}>{stage}</option>
                ))}
              </select>

              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) =>
                  setFormData({ ...formData, validUntil: e.target.value })
                }
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

            {/* PRODUCTS + SUMMARY */}
            <div className="grid grid-cols-4 gap-8">
              <div className="col-span-3 space-y-4">
                {formData.products.map((p, i) => (
                  <div
                    key={i}
                    className="bg-[#0f172a] border border-gray-800 rounded-xl p-5"
                  >
                    <div className="grid grid-cols-12 gap-3 mb-4">
                      <input
                        className="input col-span-3"
                        placeholder="Product Name"
                        value={p.productName}
                        onChange={(e) =>
                          updateProduct(i, "productName", e.target.value)
                        }
                      />

                      <input
                        className="input col-span-3"
                        placeholder="Description"
                        value={p.description}
                        onChange={(e) =>
                          updateProduct(i, "description", e.target.value)
                        }
                      />

                      <input
                        type="number"
                        className="input col-span-2"
                        value={p.quantity}
                        onChange={(e) =>
                          updateProduct(i, "quantity", e.target.value)
                        }
                      />

                      <input
                        type="number"
                        className="input col-span-2"
                        value={p.listPrice}
                        onChange={(e) =>
                          updateProduct(i, "listPrice", e.target.value)
                        }
                      />

                      <button
                        type="button"
                        onClick={() => removeProduct(i)}
                        className="col-span-1 text-red-500"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="text-right text-red-400 font-semibold">
                      {formData.currency}{" "}
                      {round(calculateLineTotal(p)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* SUMMARY */}
              {/* SUMMARY */}
              <div className="col-span-1">
                <div className="sticky top-6 bg-[#0f172a] border border-gray-800 rounded-xl p-6 space-y-5">
                  {/* SUBTOTAL */}
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Subtotal</span>
                    <span>
                      {formData.currency} {subtotal.toFixed(2)}
                    </span>
                  </div>

                  {/* GST */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">
                      Apply GST (18%)
                    </span>
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

                  {formData.isGstApplied && (
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>GST</span>
                      <span>
                        {formData.currency} {gstAmount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* OTHER TAX SECTION */}
                  <div className="border-t border-gray-700 pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Other Taxes</span>
                      <button
                        type="button"
                        onClick={addOtherTax}
                        className="text-xs text-red-500 hover:text-red-400"
                      >
                        + Add Tax
                      </button>
                    </div>

                    {formData.otherTax.map((t, i) => (
                      <div
                        key={i}
                        className="space-y-2 bg-black/40 p-3 rounded-lg border border-gray-800"
                      >
                        {/* INPUT ROW */}
                        <div className="flex gap-2">
                          <input
                            placeholder="Tax Name"
                            value={t.tax}
                            onChange={(e) =>
                              updateOtherTax(i, "tax", e.target.value)
                            }
                            className="input text-xs"
                          />

                          <input
                            type="number"
                            placeholder="%"
                            value={t.percent}
                            onChange={(e) =>
                              updateOtherTax(i, "percent", e.target.value)
                            }
                            className="input text-xs w-20 text-center"
                          />

                          <button
                            type="button"
                            onClick={() => removeOtherTax(i)}
                            className="text-red-500 text-xs"
                          >
                            ✕
                          </button>
                        </div>

                        {/* CALCULATED VALUE */}
                        {Number(t.percent) > 0 && (
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>
                              {t.tax || "Tax"} ({t.percent}%)
                            </span>
                            <span>
                              {formData.currency}{" "}
                              {round((subtotal * t.percent) / 100).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}

                    {otherTaxAmount > 0 && (
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Total Other Tax</span>
                        <span>
                          {formData.currency} {otherTaxAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* GRAND TOTAL */}
                  <div className="border-t border-gray-700 pt-4 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-red-500">
                      {formData.currency} {grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* TERMS */}
            <div>
              <h3 className="text-gray-300 font-semibold mb-4">
                Terms & Conditions
              </h3>

              {formData.termsAndConditions.map((term, i) => (
                <textarea
                  key={i}
                  value={term}
                  onChange={(e) => updateTerm(i, e.target.value)}
                  className="input mb-3"
                />
              ))}

              <button
                type="button"
                onClick={addTerm}
                className="bg-red-600 px-4 py-2 rounded"
              >
                + Add Term
              </button>
            </div>

            <div className="flex justify-end gap-4 border-t border-gray-800 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-700 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button type="submit" className="bg-red-600 px-6 py-2 rounded">
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

export default EditQuoteModal;
