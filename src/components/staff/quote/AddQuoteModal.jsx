import { useEffect, useMemo, useState, useRef } from "react";

const AddQuoteModal = ({ onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");

  const [deals, setDeals] = useState([]);
  const [dealQuery, setDealQuery] = useState("");
  const [selectedDeal, setSelectedDeal] = useState(null);

  const [contacts, setContacts] = useState([]);
  const [contactQuery, setContactQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    subject: "",
    validUntil: "",
    currency: "USD",
    description: "",
    isGstApplied: false,
    otherTax: [],
    products: [
      {
        productName: "",
        quantity: 1,
        description: "",
        pricingMode: "direct", // "direct" | "margin"
        listPrice: 0,
        purchasePrice: 0,
        margin: 0,
        discount: 0,
        suggestedPrice: null,
      },
    ],
    termsAndConditions: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [d, c, p] = await Promise.all([
          fetch(`${process.env.REACT_APP_BACKEND_URL}deals/my`, {
            headers: { authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.REACT_APP_BACKEND_URL}contact/my`, {
            headers: { authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.REACT_APP_BACKEND_URL}products/get`, {
            headers: { authorization: `Bearer ${token}` },
          }),
        ]);

        setDeals(await d.json());

        setContacts(await c.json());
        const prodRes = await p.json();
        setProducts(prodRes.data || []);
      } catch (err) {
        console.error("Failed loading reference data");
      }
    };

    fetchData();
  }, [token]);

  const updateProduct = (index, field, value) => {
    const updated = [...formData.products];
    updated[index][field] = value;

    const p = updated[index];

    // If margin mode → auto calculate list price
    if (p.pricingMode === "margin") {
      const cost = Number(p.purchasePrice) || 0;
      const margin = Number(p.margin) || 0;
      p.listPrice = cost + (cost * margin) / 100;
    }

    setFormData({ ...formData, products: updated });
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
    const updated = formData.otherTax.filter((_, i) => i !== index);
    setFormData({ ...formData, otherTax: updated });
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
          suggestedPrice: null,
        },
      ],
    });
  };

  /* ===============================
   TERMS & CONDITIONS
================================= */

  const addTerm = () => {
    setFormData({
      ...formData,
      termsAndConditions: [...formData.termsAndConditions, ""],
    });
  };

  const updateTerm = (index, value) => {
    const updated = [...formData.termsAndConditions];
    updated[index] = value;
    setFormData({ ...formData, termsAndConditions: updated });
  };

  const removeTerm = (index) => {
    const updated = formData.termsAndConditions.filter((_, i) => i !== index);
    setFormData({ ...formData, termsAndConditions: updated });
  };

  const removeProduct = (index) => {
    const updated = formData.products.filter((_, i) => i !== index);
    setFormData({ ...formData, products: updated });
  };

  const handleProductNameChange = (index, value) => {
    const updated = [...formData.products];
    updated[index].productName = value;

    const match = products.find((p) =>
      p.title.toLowerCase().includes(value.toLowerCase())
    );

    updated[index].suggestedPrice = match?.previousQuotePrice || null;

    setFormData({ ...formData, products: updated });
  };

  /* ===============================
     CALCULATIONS
  ================================= */

  const calculateLineTotal = (p) => {
    const qty = Number(p.quantity) || 0;
    const price = Number(p.listPrice) || 0;
    const discount = Number(p.discount) || 0;
    return qty * price - discount;
  };

  const subtotal = useMemo(() => {
    return formData.products.reduce((acc, p) => acc + calculateLineTotal(p), 0);
  }, [formData.products]);

  const gstAmount = formData.isGstApplied ? subtotal * 0.18 : 0;

  const otherTaxAmount = useMemo(() => {
    return formData.otherTax.reduce((acc, t) => {
      return acc + (subtotal * Number(t.percent || 0)) / 100;
    }, 0);
  }, [subtotal, formData.otherTax]);

  const finalTotal = subtotal + gstAmount + otherTaxAmount;

  /* ===============================
     SUBMIT
  ================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        deal: selectedDeal?._id,
        contact: selectedContact?._id,
      };

      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}quotes/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to create quote");

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     UI
  ================================= */

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="flex justify-center px-6 py-10">
        <div className="bg-black border border-gray-800 rounded-xl w-full max-w-6xl text-white">
          {/* HEADER */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
            <h2 className="text-xl font-semibold text-red-500">
              Create New Quote
            </h2>
            <button onClick={onClose}>✕</button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* ================= HEADER SECTION ================= */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <Input
                  label="Quote Subject *"
                  value={formData.subject}
                  required
                  onChange={(v) => setFormData({ ...formData, subject: v })}
                />

                <EntitySelect
                  label="Deal"
                  value={dealQuery}
                  onChange={setDealQuery}
                  options={deals.filter((d) =>
                    d.dealName?.toLowerCase().includes(dealQuery.toLowerCase())
                  )}
                  getDisplay={(d) => d.dealName}
                  getMeta={(d) => `${d.stage || ""} • ${d.amount || ""}`}
                  onSelect={(d) => {
                    setSelectedDeal(d);
                    setDealQuery(d.dealName);
                  }}
                />
              </div>

              <div className="space-y-4">
                <EntitySelect
                  label="POC"
                  value={contactQuery}
                  disabled={!selectedDeal}
                  onChange={setContactQuery}
                  options={contacts.filter((c) =>
                    `${c.firstName} ${c.lastName}`
                      .toLowerCase()
                      .includes(contactQuery.toLowerCase())
                  )}
                  getDisplay={(c) => `${c.firstName} ${c.lastName}`}
                  getMeta={(c) => c.email}
                  onSelect={(c) => {
                    setSelectedContact(c);
                    setContactQuery(`${c.firstName} ${c.lastName}`);
                  }}
                />

                <Input
                  label="Valid Until"
                  type="date"
                  value={formData.validUntil}
                  onChange={(v) => setFormData({ ...formData, validUntil: v })}
                />

                <Select
                  label="Currency"
                  value={formData.currency}
                  onChange={(v) => setFormData({ ...formData, currency: v })}
                />
              </div>
            </div>

            {/* ================= PRODUCTS + SUMMARY ================= */}
            <div className="grid grid-cols-4 gap-8">
              {/* PRODUCTS */}
              <div className="col-span-3 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-gray-300 font-semibold">
                    Products & Services
                  </h3>
                  <button
                    type="button"
                    onClick={addProduct}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-sm"
                  >
                    + Add Product
                  </button>
                </div>

                <div className="max-h-[350px] overflow-y-auto border border-gray-800 rounded-lg p-4 space-y-3">
                  {formData.products.map((p, i) => (
                    <div
                      key={i}
                      className="border border-gray-800 rounded-lg p-4 bg-[#0f172a]"
                    >
                      {/* TOP ROW */}
                      <div className="grid grid-cols-12 gap-3 mb-3">
                        <div className="col-span-3">
                          <input
                            value={p.productName}
                            onChange={(e) =>
                              handleProductNameChange(i, e.target.value)
                            }
                            placeholder="Product Name"
                            className="input"
                          />
                        </div>

                        <div className="col-span-3">
                          <input
                            value={p.description}
                            onChange={(e) =>
                              updateProduct(i, "description", e.target.value)
                            }
                            placeholder="Description"
                            className="input"
                          />
                        </div>

                        <div className="col-span-2">
                          <input
                            type="number"
                            value={p.quantity}
                            onChange={(e) =>
                              updateProduct(i, "quantity", e.target.value)
                            }
                            placeholder="Qty"
                            className="input text-center"
                          />
                        </div>

                        {/* PRICING MODE TOGGLE */}
                        <div className="col-span-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              updateProduct(i, "pricingMode", "direct")
                            }
                            className={`px-2 py-1 text-xs rounded ${
                              p.pricingMode === "direct"
                                ? "bg-red-600"
                                : "bg-gray-700"
                            }`}
                          >
                            Direct
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              updateProduct(i, "pricingMode", "margin")
                            }
                            className={`px-2 py-1 text-xs rounded ${
                              p.pricingMode === "margin"
                                ? "bg-red-600"
                                : "bg-gray-700"
                            }`}
                          >
                            Margin
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeProduct(i)}
                          className="col-span-1 text-red-500"
                        >
                          ✕
                        </button>
                      </div>

                      {/* PRICING SECTION */}
                      {p.pricingMode === "direct" ? (
                        <div className="grid grid-cols-4 gap-3 items-center">
                          <input
                            type="number"
                            value={p.listPrice}
                            onChange={(e) =>
                              updateProduct(i, "listPrice", e.target.value)
                            }
                            placeholder="List Price"
                            className="input"
                          />

                          <input
                            type="number"
                            value={p.discount}
                            onChange={(e) =>
                              updateProduct(i, "discount", e.target.value)
                            }
                            placeholder="Discount"
                            className="input"
                          />

                          <div className="text-sm text-gray-400">
                            Line Total
                          </div>

                          <div className="text-red-400 font-semibold">
                            {formData.currency}.{" "}
                            {calculateLineTotal(p).toFixed(2)}
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-6 gap-3 items-center">
                          <input
                            type="number"
                            value={p.purchasePrice}
                            onChange={(e) =>
                              updateProduct(i, "purchasePrice", e.target.value)
                            }
                            placeholder="Purchase Price"
                            className="input"
                          />

                          <input
                            type="number"
                            value={p.margin}
                            onChange={(e) =>
                              updateProduct(i, "margin", e.target.value)
                            }
                            placeholder="Margin %"
                            className="input"
                          />

                          <div className="col-span-2 text-sm text-gray-400">
                            Auto List Price
                          </div>

                          <div className="col-span-2 text-green-400 font-semibold">
                            {formData.currency}.{" "}
                            {Number(p.listPrice || 0).toFixed(2)}
                          </div>

                          <div className="col-span-6 text-xs text-gray-500">
                            Profit per unit:{" "}
                            {(p.listPrice - p.purchasePrice || 0).toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* OTHER TAX SECTION */}

              {/* SUMMARY */}
              <div className="col-span-1">
                <div className="sticky top-6 bg-[#0f172a] border border-gray-800 rounded-xl p-5 space-y-4">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Subtotal</span>
                    <span>
                      {formData.currency}. {subtotal.toFixed(2)}
                    </span>
                  </div>

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
                        {formData.currency}. {gstAmount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-gray-700 pt-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Other Taxes</span>
                      <button
                        type="button"
                        onClick={addOtherTax}
                        className="text-xs text-red-500"
                      >
                        + Add
                      </button>
                    </div>

                    {formData.otherTax.map((t, i) => (
                      <div key={i} className="space-y-1">
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

                        {t.percent > 0 && (
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>
                              {t.tax || "Tax"} ({t.percent}%)
                            </span>
                            <span>
                              {formData.currency}.{" "}
                              {((subtotal * t.percent) / 100).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}

                    {otherTaxAmount > 0 && (
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Total Other Tax</span>
                        <span>
                          {formData.currency}. {otherTaxAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-700 pt-3 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-red-500">
                      {formData.currency}. {finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= TERMS & CONDITIONS ================= */}
            <div className="border-t border-gray-800 pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-gray-300 font-semibold">
                  Terms & Conditions
                </h3>

                <button
                  type="button"
                  onClick={addTerm}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-sm"
                >
                  + Add Term
                </button>
              </div>

              {formData.termsAndConditions.length === 0 && (
                <p className="text-gray-500 text-sm">No terms added yet.</p>
              )}

              <div className="space-y-3">
                {formData.termsAndConditions.map((term, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <textarea
                      value={term}
                      onChange={(e) => updateTerm(i, e.target.value)}
                      placeholder={`Term ${i + 1}`}
                      rows={2}
                      className="input flex-1 resize-none"
                    />

                    <button
                      type="button"
                      onClick={() => removeTerm(i)}
                      className="text-red-500 mt-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-4 border-t border-gray-800 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-700 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded"
              >
                {loading ? "Saving..." : "Create Quote"}
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

/* ===============================
   REUSABLE INPUT
================================= */

const Input = ({ label, value, onChange, type = "text", required }) => (
  <div>
    <label className="text-sm text-gray-400 block mb-1">{label}</label>
    <input
      type={type}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input"
    />
  </div>
);

/* ===============================
   REUSABLE SELECT
================================= */

const Select = ({ label, value, onChange }) => (
  <div>
    <label className="text-sm text-gray-400 block mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input"
    >
      <option value="USD">USD</option>
      <option value="PKR">PKR</option>
    </select>
  </div>
);

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

  // Close on outside click
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
    <div className="relative" ref={wrapperRef}>
      <label className="text-sm text-gray-400 block mb-1">{label}</label>

      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => !disabled && setOpen(true)}
        placeholder={`Search ${label}...`}
        disabled={disabled}
        className={`input transition-all duration-150 ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "focus:border-red-500 focus:ring-1 focus:ring-red-500"
        }`}
      />

      {/* Dropdown */}
      {!disabled && open && value && options.length > 0 && (
        <div className="absolute z-50 w-full bg-[#0f172a] border border-gray-700 rounded-xl mt-2 shadow-2xl overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {options.slice(0, 6).map((item) => (
              <div
                key={item._id}
                onClick={() => {
                  onSelect(item);
                  setOpen(false); // ✅ CLOSE AFTER SELECT
                }}
                className="px-4 py-3 hover:bg-gray-800 cursor-pointer transition border-b border-gray-800 last:border-0"
              >
                <div className="font-medium text-white">{getDisplay(item)}</div>
                {getMeta && (
                  <div className="text-xs text-gray-400 mt-1">
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

export default AddQuoteModal;
