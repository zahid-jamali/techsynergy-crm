import { useEffect, useMemo, useState, useRef } from "react";

const AddOrderModal = ({ onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");

  const [quotes, setQuotes] = useState([]);
  const [quoteQuery, setQuoteQuery] = useState("");
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [purchaseOrderFile, setPurchaseOrderFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    products: [],
    otherTax: [], // ✅ rename
    currency: "USD",
  });

  /*
  ===============================
  FETCH CONFIRMED QUOTES
  ===============================
  */

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        setFetching(true);

        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}quotes/my?stage=Confirmed&limit=100&archived=false`,
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to load quotes");

        const data = await res.json();

        setQuotes(data.data || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load confirmed quotations");
      } finally {
        setFetching(false);
      }
    };

    fetchQuotes();
  }, [token]);

  /*
  ===============================
  SELECT QUOTE
  ===============================
  */

  const handleSelectQuote = (quote) => {
    setSelectedQuote(quote);
    setQuoteQuery(quote.subject);

    const products = quote.products.map((p) => ({
      productName: p.productName,
      description: p.description || "",
      quantity: p.quantity,
      listPrice: p.listPrice,
      Tax: p.Tax || [], // ✅ IMPORTANT
    }));

    setFormData({
      products,
      otherTax: quote.otherTax || [], // ✅ FIX
      currency: quote.currency || "USD",
    });
  };

  /*
  ===============================
  PRODUCT HANDLING
  ===============================
  */

  const updateProduct = (index, field, value) => {
    const updated = [...formData.products];

    if (field === "quantity") {
      value = Math.max(1, Number(value));
    }

    if (field === "listPrice") {
      value = Math.max(0, Number(value));
    }

    updated[index][field] = value;

    setFormData({
      ...formData,
      products: updated,
    });
  };

  const removeProduct = (index) => {
    const updated = formData.products.filter((_, i) => i !== index);

    setFormData({
      ...formData,
      products: updated,
    });
  };

  /*
===============================
TAX MANAGEMENT
===============================
*/

  const addTax = () => {
    setFormData({
      ...formData,
      otherTax: [...formData.otherTax, { tax: "", percent: 0 }],
    });
  };

  const updateTax = (index, field, value) => {
    const updated = [...formData.otherTax];

    if (field === "percent") {
      value = Math.max(0, Number(value));
    }

    updated[index][field] = value;

    setFormData({
      ...formData,
      otherTax: updated,
    });
  };

  const removeTax = (index) => {
    const updated = formData.otherTax.filter((_, i) => i !== index);

    setFormData({
      ...formData,
      otherTax: updated,
    });
  };

  /*
===============================
PO FILE HANDLING
===============================
*/

  /*
  ===============================
  CALCULATIONS
  ===============================
  */

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

  const subtotal = useMemo(() => {
    return formData.products.reduce((acc, p) => acc + calculateLineTotal(p), 0);
  }, [formData.products]);

  const totalTax = useMemo(() => {
    return formData.otherTax.reduce((acc, t) => {
      const percent = Number(t.percent) || 0;
      return acc + (subtotal * percent) / 100;
    }, 0);
  }, [formData.otherTax, subtotal]);

  const grandTotal = subtotal + totalTax;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedQuote) return alert("Please select a confirmed quotation");

    if (formData.products.length === 0)
      return alert("At least one product is required");

    setLoading(true);

    try {
      let res;

      /*
      ===============================
      IF FILE EXISTS → FormData
      ===============================
      */

      if (purchaseOrderFile) {
        const fd = new FormData();

        fd.append("quoteId", selectedQuote._id);
        fd.append("products", JSON.stringify(formData.products));
        fd.append("otherTax", JSON.stringify(formData.otherTax));

        fd.append("purchaseOrder", purchaseOrderFile);

        res = await fetch(`${process.env.REACT_APP_BACKEND_URL}orders/create`, {
          method: "POST",
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: fd,
        });
      } else {
        /*
      ===============================
      NORMAL JSON
      ===============================
      */
        res = await fetch(`${process.env.REACT_APP_BACKEND_URL}orders/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quoteId: selectedQuote._id,
            products: formData.products.map((p) => ({
              ...p,
              Tax: (p.Tax || []).map((t) => ({
                tax: t.tax || "",
                percent: Number(t.percent) || 0,
              })),
            })),
            otherTax: formData.otherTax, // ✅ FIX
          }),
        });
      }

      if (!res.ok) throw new Error("Order creation failed");

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  /*
  ===============================
  UI
  ===============================
  */

  return (
    <div className="fixed inset-0 bg-heading/40 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="flex justify-center px-6 py-10">
        <div className="bg-card border border-gray-200 rounded-2xl w-full max-w-7xl text-heading shadow-2xl">
          {/* HEADER */}

          <div className="flex justify-between items-center px-8 py-5 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-brand">
                Create Sales Order
              </h2>

              <p className="text-sm text-bodyText mt-1">
                Generate order from confirmed quotation
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-bodyText hover:text-heading text-xl"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* LOADING */}

            {fetching && (
              <div className="text-bodyText">
                Loading confirmed quotations...
              </div>
            )}

            {error && <div className="text-brand">{error}</div>}

            {/* QUOTE SELECT */}

            {!fetching && (
              <EntitySelect
                label="Select Confirmed Quotation"
                value={quoteQuery}
                onChange={setQuoteQuery}
                options={quotes.filter((q) =>
                  q.subject?.toLowerCase().includes(quoteQuery.toLowerCase())
                )}
                getDisplay={(q) => q.subject}
                getMeta={(q) =>
                  `${q.account.accountName} • ${q.currency} ${q.grandTotal}`
                }
                onSelect={handleSelectQuote}
              />
            )}

            {/* PRODUCTS */}

            {formData.products.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-bodyText">
                  Products
                </h3>

                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                  <table className="w-full text-sm">
                    <thead className="bg-card border-b border-gray-200">
                      <tr className="text-left text-bodyText">
                        <th className="p-3">Product</th>

                        <th className="p-3">Description</th>

                        <th className="p-3 text-center">Quantity</th>

                        <th className="p-3">Unit Price</th>

                        <th className="p-3">Total</th>

                        <th className="p-3"></th>
                      </tr>
                    </thead>

                    <tbody>
                      {formData.products.map((p, i) => {
                        const amount =
                          (Number(p.quantity) || 0) *
                          (Number(p.listPrice) || 0);

                        let productTax = 0;

                        p.Tax?.forEach((t) => {
                          productTax +=
                            (amount * (Number(t.percent) || 0)) / 100;
                        });

                        return (
                          <>
                            {/* MAIN ROW */}
                            <tr
                              key={`row-${i}`}
                              className="border-b border-gray-200 hover:bg-card"
                            >
                              <td className="p-3 font-medium">
                                {p.productName}
                              </td>

                              <td className="p-3">
                                <input
                                  value={p.description}
                                  onChange={(e) =>
                                    updateProduct(
                                      i,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  className="input"
                                />
                              </td>

                              <td className="p-3 text-center">
                                <input
                                  type="number"
                                  min="1"
                                  value={p.quantity}
                                  onChange={(e) =>
                                    updateProduct(i, "quantity", e.target.value)
                                  }
                                  className="input text-center w-20"
                                />
                              </td>

                              <td className="p-3">
                                <input
                                  type="number"
                                  value={p.listPrice}
                                  onChange={(e) =>
                                    updateProduct(
                                      i,
                                      "listPrice",
                                      e.target.value
                                    )
                                  }
                                  className="input w-28"
                                />
                              </td>

                              <td className="p-3 text-right">
                                <div className="font-semibold text-red-400">
                                  {formData.currency}{" "}
                                  {(amount + productTax).toFixed(2)}
                                </div>

                                <div className="text-xs text-bodyText">
                                  Tax: {productTax.toFixed(2)}
                                </div>
                              </td>

                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeProduct(i)}
                                  className="text-brand"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>

                            {/* TAX ROW */}
                            <tr key={`tax-${i}`} className="bg-surface">
                              <td colSpan="6" className="px-3 pb-3 pt-2">
                                <div className="flex flex-wrap gap-2 items-center">
                                  {(p.Tax || []).map((t, ti) => (
                                    <div
                                      key={ti}
                                      className="flex items-center gap-1 bg-card px-2 py-1 rounded text-xs border border-gray-200"
                                    >
                                      <input
                                        placeholder="Tax"
                                        value={t.tax}
                                        onChange={(e) => {
                                          const updated = [
                                            ...formData.products,
                                          ];
                                          updated[i].Tax[ti].tax =
                                            e.target.value;
                                          setFormData({
                                            ...formData,
                                            products: updated,
                                          });
                                        }}
                                        className="bg-transparent outline-none w-20"
                                      />

                                      <input
                                        type="number"
                                        value={t.percent}
                                        onChange={(e) => {
                                          const updated = [
                                            ...formData.products,
                                          ];
                                          updated[i].Tax[ti].percent =
                                            e.target.value;
                                          setFormData({
                                            ...formData,
                                            products: updated,
                                          });
                                        }}
                                        className="bg-transparent outline-none w-12 text-center"
                                      />

                                      <span>%</span>

                                      <button
                                        onClick={() => {
                                          const updated = [
                                            ...formData.products,
                                          ];
                                          updated[i].Tax = updated[
                                            i
                                          ].Tax.filter((_, x) => x !== ti);
                                          setFormData({
                                            ...formData,
                                            products: updated,
                                          });
                                        }}
                                        className="text-brand"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...formData.products];
                                      updated[i].Tax = [
                                        ...(updated[i].Tax || []),
                                        { tax: "", percent: 0 },
                                      ];
                                      setFormData({
                                        ...formData,
                                        products: updated,
                                      });
                                    }}
                                    className="text-xs text-brand"
                                  >
                                    + Add Tax
                                  </button>
                                </div>
                              </td>
                            </tr>
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedQuote && (
              <>
                {/* PURCHASE ORDER */}

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-bodyText">
                    Purchase Order
                  </h3>

                  <input
                    type="file"
                    onChange={(e) => setPurchaseOrderFile(e.target.files[0])}
                    className="input"
                  />

                  {purchaseOrderFile && (
                    <div className="flex justify-between items-center bg-card p-2 rounded">
                      <span className="text-sm">{purchaseOrderFile.name}</span>

                      <button
                        type="button"
                        onClick={() => setPurchaseOrderFile(null)}
                        className="text-brand hover:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* TAX MANAGEMENT */}

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-bodyText">
                      Order Tax
                    </h3>

                    <button
                      type="button"
                      onClick={addTax}
                      className="text-xs text-brand"
                    >
                      + Add
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formData.otherTax.map((t, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-[1fr_80px_30px] items-center gap-2 bg-surface px-3 py-2 rounded border border-gray-200 text-xs"
                      >
                        {/* TAX NAME */}
                        <input
                          placeholder="Tax name (e.g. GST)"
                          value={t.tax}
                          onChange={(e) => updateTax(i, "tax", e.target.value)}
                          className="input w-full"
                        />

                        {/* PERCENT */}
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={t.percent}
                            onChange={(e) =>
                              updateTax(i, "percent", e.target.value)
                            }
                            className="input w-full text-center"
                          />
                          <span className="text-bodyText">%</span>
                        </div>

                        {/* REMOVE */}
                        <button
                          type="button"
                          onClick={() => removeTax(i)}
                          className="text-brand text-center"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* SUMMARY */}

            {formData.products.length > 0 && (
              <div className="flex justify-end">
                <div className="bg-card border border-gray-200 rounded-xl p-6 w-80 space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>
                      {formData.currency} {subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>
                      {formData.currency} {totalTax.toFixed(2)}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-brand text-lg">
                    <span>Grand Total</span>
                    <span>
                      {formData.currency} {grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ACTIONS */}

            <div className="flex justify-end gap-4 border-t border-gray-200 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 px-5 py-2 rounded-lg"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="bg-brand hover:bg-brand/90 px-6 py-2 rounded-lg font-semibold"
              >
                {loading ? "Creating Order..." : "Create Order"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          padding: 8px 10px;
          border-radius: 6px;
          color: #111827;
        }

        .input:focus {
          outline: none;
          border-color: #021d54;
        }
      `}</style>
    </div>
  );
};

export default AddOrderModal;

/*
===============================
ENTITY SELECT
===============================
*/

const EntitySelect = ({
  label,
  value,
  onChange,
  options,
  getDisplay,
  getMeta,
  onSelect,
  disabled,
}) => {
  const [open, setOpen] = useState(false);

  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <label className="text-sm text-bodyText block mb-1">{label}</label>

      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => !disabled && setOpen(true)}
        placeholder={`Search ${label}...`}
        disabled={disabled}
        className="input"
      />

      {open && value && options.length > 0 && (
        <div className="absolute z-50 w-full bg-card border border-gray-200 rounded-xl mt-2 shadow-2xl">
          <div className="max-h-60 overflow-y-auto">
            {options.slice(0, 6).map((item) => (
              <div
                key={item._id}
                onClick={() => {
                  onSelect(item);
                  setOpen(false);
                }}
                className="px-4 py-3 hover:bg-surface cursor-pointer border-b border-gray-200"
              >
                <div className="font-medium text-heading">{getDisplay(item)}</div>

                {getMeta && (
                  <div className="text-xs text-bodyText mt-1">
                    {getMeta(item)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
