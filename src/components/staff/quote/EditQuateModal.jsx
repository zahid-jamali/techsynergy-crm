import { useState, useMemo } from "react";

const QUOTE_STAGES = ["Draft", "Delivered", "On Hold", "Confirmed"];
const TAX_OPTIONS = [
  { label: "GST", percent: 18 },
  { label: "SST", percent: 15 },
  { label: "PST", percent: 16 },
  { label: "KPK-ST", percent: 15 },
  { label: "Custom", percent: 0 },
];

const round = (n) => Math.round(n * 100) / 100;

const EditQuoteModal = ({ quote, onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");

  const [formData, setFormData] = useState({
    subject: quote.subject || "",
    quoteStage: quote.quoteStage,
    validUntil: quote.validUntil?.slice(0, 10) || "",
    description: quote.description || "",
    currency: quote.currency || "USD",

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
      Tax: (p.Tax || []).map((t) => {
        const predefined = ["GST", "SST", "PST", "KPK-ST"];

        if (predefined.includes(t.tax)) {
          return { ...t };
        }

        return {
          tax: "Custom",
          percent: t.percent,
          customName: t.tax, // important
        };
      }),
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

  const calculateLineTotal = (p) => {
    const qty = Number(p.quantity) || 0;
    const price = Number(p.listPrice) || 0;

    const amount = qty * price;

    let tax = 0;

    if (Array.isArray(p.Tax)) {
      p.Tax.forEach((t) => {
        tax += (amount * (Number(t.percent) || 0)) / 100;
      });
    }

    return amount + tax;
  };

  const subtotal = useMemo(
    () =>
      round(
        formData.products.reduce((acc, p) => acc + calculateLineTotal(p), 0)
      ),
    [formData.products]
  );

  const taxAmount = round(
    formData.otherTax.reduce(
      (acc, t) => acc + (subtotal * (Number(t.percent) || 0)) / 100,
      0
    )
  );

  const grandTotal = round(subtotal + taxAmount);

  /* ================= SUBMIT ================= */

  // ONLY showing CHANGED PARTS (safe integration)

  const normalizeTaxesForPayload = (taxes = []) =>
    taxes.map((t) => ({
      tax: t.tax === "Custom" ? t.customName?.trim() || "Custom Tax" : t.tax,
      percent: Number(t.percent) || 0,
    }));

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        subject: formData.subject,
        quoteStage: formData.quoteStage,
        validUntil: formData.validUntil,
        description: formData.description,
        currency: formData.currency,

        termsAndConditions: formData.termsAndConditions,

        products: formData.products.map((p) => ({
          productName: p.productName,
          description: p.description,
          quantity: Number(p.quantity),
          listPrice: Number(p.listPrice),

          // ✅ FIXED TAX PAYLOAD
          Tax: normalizeTaxesForPayload(p.Tax),
        })),

        otherTax: normalizeTaxesForPayload(formData.otherTax),
      };

      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}quotes/update/${quote._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to update quote");

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Update Quote Error:", error);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 overflow-y-auto">
      <div className="flex justify-center px-6 py-10">
        <div className="bg-black border border-gray-800 rounded-2xl w-full max-w-7xl text-white shadow-2xl">
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
                  setFormData({
                    ...formData,
                    quoteStage: e.target.value,
                  })
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
                  setFormData({
                    ...formData,
                    validUntil: e.target.value,
                  })
                }
                className="input"
              />

              <select
                value={formData.currency}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    currency: e.target.value,
                  })
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
                <div className="flex justify-between items-center">
                  <h3 className="text-gray-300 font-semibold">Products</h3>

                  <button
                    type="button"
                    onClick={addProduct}
                    className="bg-red-600 px-3 py-1 rounded text-sm"
                  >
                    + Add Product
                  </button>
                </div>

                {formData.products.map((p, i) => (
                  <div
                    key={i}
                    className="bg-[#0f172a] border border-gray-800 rounded-xl p-5"
                  >
                    <div className="grid grid-cols-12 gap-3 mb-4">
                      <input
                        className="input col-span-4"
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

                    <div className="mt-3 border-t border-gray-800 pt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-400">Tax</span>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...formData.products];
                            updated[i].Tax = [
                              ...(updated[i].Tax || []),
                              { tax: "", percent: 0, customName: "" },
                            ];
                            setFormData({ ...formData, products: updated });
                          }}
                          className="text-xs text-red-500"
                        >
                          + Add
                        </button>
                      </div>

                      <div className="space-y-1">
                        {(p.Tax || []).map((t, ti) => (
                          <div
                            key={ti}
                            className="flex items-center gap-2 text-xs bg-black/40 px-2 py-1.5 rounded border border-gray-800"
                          >
                            {/* SELECT */}
                            <select
                              value={t.tax}
                              onChange={(e) => {
                                const selected = TAX_OPTIONS.find(
                                  (opt) => opt.label === e.target.value
                                );

                                const updated = [...formData.products];

                                updated[i].Tax[ti] = {
                                  tax: selected.label,
                                  percent:
                                    selected.label === "Custom"
                                      ? 0
                                      : selected.percent,
                                  customName: "",
                                };

                                setFormData({ ...formData, products: updated });
                              }}
                              className="bg-[#111827] border border-gray-700 rounded px-2 py-1 flex-1 focus:border-red-500"
                            >
                              <option value="">Tax</option>
                              {TAX_OPTIONS.map((opt) => (
                                <option key={opt.label} value={opt.label}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>

                            {/* CUSTOM NAME */}
                            {t.tax === "Custom" && (
                              <input
                                placeholder="name"
                                value={t.customName || ""}
                                onChange={(e) => {
                                  const updated = [...formData.products];
                                  updated[i].Tax[ti].customName =
                                    e.target.value;
                                  setFormData({
                                    ...formData,
                                    products: updated,
                                  });
                                }}
                                className="bg-[#111827] border border-gray-700 rounded px-2 py-1 w-24"
                              />
                            )}

                            {/* % */}
                            <input
                              type="number"
                              value={t.percent}
                              disabled={t.tax !== "Custom"}
                              onChange={(e) => {
                                const updated = [...formData.products];
                                updated[i].Tax[ti].percent = e.target.value;
                                setFormData({ ...formData, products: updated });
                              }}
                              className={`bg-[#111827] border border-gray-700 rounded px-1 text-center w-14 ${
                                t.tax !== "Custom"
                                  ? "opacity-60 cursor-not-allowed"
                                  : ""
                              }`}
                            />

                            <span className="text-gray-400">%</span>

                            {/* REMOVE */}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...formData.products];
                                updated[i].Tax = updated[i].Tax.filter(
                                  (_, idx) => idx !== ti
                                );
                                setFormData({ ...formData, products: updated });
                              }}
                              className="text-red-500"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>

                      {(p.Tax || []).length > 0 && (
                        <div className="flex justify-between text-xs text-gray-400 mt-2">
                          <span>Tax Total</span>
                          <span>
                            {formData.currency}{" "}
                            {(() => {
                              const amount =
                                (Number(p.quantity) || 0) *
                                (Number(p.listPrice) || 0);

                              let tax = 0;

                              p.Tax.forEach((t) => {
                                tax +=
                                  (amount * (Number(t.percent) || 0)) / 100;
                              });

                              return round(tax).toFixed(2);
                            })()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-right text-red-400 font-semibold">
                      {formData.currency}{" "}
                      {round(calculateLineTotal(p)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* SUMMARY */}

              <div className="col-span-1">
                <div className="sticky top-6 bg-[#0f172a] border border-gray-800 rounded-xl p-6 space-y-5">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Subtotal</span>
                    <span>
                      {formData.currency} {subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="border-t border-gray-700 pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Other Taxes</span>

                      <button
                        type="button"
                        onClick={addOtherTax}
                        className="text-xs text-red-500"
                      >
                        + Add Tax
                      </button>
                    </div>

                    {formData.otherTax.map((t, i) => (
                      <div
                        key={i}
                        className="space-y-2 bg-black/40 p-3 rounded-lg border border-gray-800"
                      >
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

                    {taxAmount > 0 && (
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Total Tax</span>
                        <span>
                          {formData.currency} {taxAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

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
