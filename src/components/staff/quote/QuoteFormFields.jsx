import { useMemo } from "react";
import LookupPicker from "../../lists/LookupPicker";
import { contactName } from "../../../lib/crm";
import {
  DEFAULT_WHT,
  calculateLine,
  emptyQuoteProduct,
  round,
} from "../../../lib/quotePricing";

export const TAX_OPTIONS = [
  { label: "GST", percent: 18 },
  { label: "SST", percent: 15 },
  { label: "PST", percent: 16 },
  { label: "KPK-ST", percent: 15 },
  { label: "Custom", percent: 0 },
];

export const QUOTE_STAGES = ["Draft", "Delivered", "On Hold", "Confirmed"];

export function normalizeTaxes(taxes = []) {
  return taxes.map((t) => ({
    tax: t.tax === "Custom" ? t.customName?.trim() || "Custom Tax" : t.tax,
    percent: Number(t.percent) || 0,
  }));
}

export function QuoteFormFields({
  mode = "create",
  formData,
  setFormData,
  catalog = [],
  selectedDeal,
  setSelectedDeal,
  selectedContact,
  setSelectedContact,
}) {
  const currency = formData.currency || "PKR";

  const updateProduct = (index, field, value) => {
    const products = [...formData.products];
    products[index] = { ...products[index], [field]: value };
    const line = calculateLine(products[index]);
    products[index].listPrice = line.listPrice;
    products[index].priceAfterMargin = line.priceAfterMargin;
    products[index].withHoldingAmount = line.withHoldingAmount;
    setFormData({ ...formData, products });
  };

  const handleProductNameChange = (index, value) => {
    const products = [...formData.products];
    products[index].productName = value;
    const match = catalog.find((p) =>
      String(p.title || "")
        .toLowerCase()
        .includes(String(value).toLowerCase()),
    );
    products[index].suggestedPrice = match?.previousQuotePrice || null;
    setFormData({ ...formData, products });
  };

  const addProduct = () =>
    setFormData({
      ...formData,
      products: [...formData.products, emptyQuoteProduct()],
    });

  const removeProduct = (index) =>
    setFormData({
      ...formData,
      products: formData.products.filter((_, i) => i !== index),
    });

  const addOtherTax = () =>
    setFormData({
      ...formData,
      otherTax: [...formData.otherTax, { tax: "", percent: 0, customName: "" }],
    });

  const updateOtherTax = (index, field, value) => {
    const otherTax = [...formData.otherTax];
    otherTax[index] = { ...otherTax[index], [field]: value };
    setFormData({ ...formData, otherTax });
  };

  const removeOtherTax = (index) =>
    setFormData({
      ...formData,
      otherTax: formData.otherTax.filter((_, i) => i !== index),
    });

  const addTerm = () =>
    setFormData({
      ...formData,
      termsAndConditions: [...(formData.termsAndConditions || []), ""],
    });

  const updateTerm = (index, value) => {
    const termsAndConditions = [...formData.termsAndConditions];
    termsAndConditions[index] = value;
    setFormData({ ...formData, termsAndConditions });
  };

  const removeTerm = (index) =>
    setFormData({
      ...formData,
      termsAndConditions: formData.termsAndConditions.filter(
        (_, i) => i !== index,
      ),
    });

  const lines = useMemo(
    () => formData.products.map((p) => ({ product: p, ...calculateLine(p) })),
    [formData.products],
  );

  const subtotal = round(lines.reduce((sum, line) => sum + line.total, 0));
  const otherTaxAmount = round(
    (formData.otherTax || []).reduce(
      (sum, t) => sum + (subtotal * Number(t.percent || 0)) / 100,
      0,
    ),
  );
  const vendorTotal = round(
    lines.reduce(
      (sum, line) =>
        sum + line.vendorPrice * (Number(line.product.quantity) || 0),
      0,
    ),
  );
  const whtTotal = round(
    lines.reduce(
      (sum, line) =>
        sum + line.withHoldingAmount * (Number(line.product.quantity) || 0),
      0,
    ),
  );
  const grandTotal = round(subtotal + otherTaxAmount);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <label className="block">
          <span className="label">Subject *</span>
          <input
            required
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
            className="input"
            placeholder="Quote subject"
          />
        </label>
        {mode === "create" ? (
          <LookupPicker
            label="Deal (any team account)"
            endpoint="deals/lookup"
            placeholder="Search any team deal..."
            value={selectedDeal}
            displayValue={selectedDeal?.dealName || ""}
            onSelect={(deal) => {
              setSelectedDeal(deal);
              setSelectedContact(deal?.contact || null);
            }}
            renderItem={(d) => (
              <div>
                <div className="font-medium">{d.dealName}</div>
                <div className="text-xs text-bodyText">
                  {d.account?.accountName || "Account"}
                  {d.dealOwner?.name ? ` · ${d.dealOwner.name}` : ""}
                </div>
              </div>
            )}
          />
        ) : (
          <label className="block">
            <span className="label">Stage</span>
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
          </label>
        )}
        {mode === "create" ? (
          <LookupPicker
            label="POC"
            endpoint="contact/lookup"
            extraParams={
              selectedDeal?.account?._id || selectedDeal?.account
                ? { account: selectedDeal.account._id || selectedDeal.account }
                : {}
            }
            placeholder={
              selectedDeal ? "Search contacts..." : "Select a deal first"
            }
            disabled={!selectedDeal}
            value={selectedContact}
            displayValue={selectedContact ? contactName(selectedContact) : ""}
            onSelect={setSelectedContact}
            renderItem={(c) => (
              <div>
                <div className="font-medium">{contactName(c)}</div>
                <div className="text-xs text-bodyText">
                  {c.email || "Contact"}
                </div>
              </div>
            )}
          />
        ) : null}
        <label className="block">
          <span className="label">Valid until</span>
          <input
            type="date"
            value={formData.validUntil}
            onChange={(e) =>
              setFormData({ ...formData, validUntil: e.target.value })
            }
            className="input"
          />
        </label>
        <label className="block">
          <span className="label">Currency</span>
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
        </label>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-semibold text-heading">
              Costing sheet
            </h3>
            <p className="text-xs text-bodyText">
              Vendor price → margin → withholding tax. WHT is applied after
              margin.
            </p>
          </div>
          <button
            type="button"
            onClick={addProduct}
            className="btn-primary text-sm py-1.5"
          >
            + Line
          </button>
        </div>
        <div className="space-y-4">
          {formData.products.map((p, i) => {
            const line = lines[i];
            return (
              <div
                key={i}
                className="border border-gray-300 rounded-xl p-4 bg-card shadow-sm"
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-sm font-semibold text-heading">
                    Line {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeProduct(i)}
                    className="text-red-600 text-xs hover:underline"
                    disabled={formData.products.length === 1}
                  >
                    Remove line
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
                  <label className="block min-w-0">
                    <span className="label">Product *</span>
                    <input
                      value={p.productName}
                      onChange={(e) => handleProductNameChange(i, e.target.value)}
                      placeholder="Product name"
                      className="input w-full min-w-0"
                      required
                    />
                    {p.suggestedPrice != null && (
                      <p className="text-[10px] text-bodyText mt-1">
                        Last quoted {currency}{" "}
                        {Number(p.suggestedPrice).toFixed(2)}
                      </p>
                    )}
                  </label>
                  <label className="block min-w-0">
                    <span className="label">Description</span>
                    <input
                      value={p.description || ""}
                      onChange={(e) =>
                        updateProduct(i, "description", e.target.value)
                      }
                      placeholder="Specs, part number, notes..."
                      className="input w-full min-w-0"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
                  <label className="block min-w-[5.5rem]">
                    <span className="label">Qty</span>
                    <input
                      type="number"
                      min="1"
                      value={p.quantity}
                      onChange={(e) =>
                        updateProduct(i, "quantity", e.target.value)
                      }
                      className="input w-full min-w-[5.5rem] text-center"
                    />
                  </label>
                  <label className="block min-w-0">
                    <span className="label">Vendor cost</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={p.vendorPrice}
                      onChange={(e) =>
                        updateProduct(i, "vendorPrice", e.target.value)
                      }
                      className="input w-full min-w-0"
                    />
                  </label>
                  <label className="block min-w-0">
                    <span className="label">Margin %</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={p.margin}
                      onChange={(e) =>
                        updateProduct(i, "margin", e.target.value)
                      }
                      className="input w-full min-w-0"
                    />
                  </label>
                  <label className="block min-w-[5.5rem]">
                    <span className="label">WHT %</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={p.withHolding}
                      onChange={(e) =>
                        updateProduct(i, "withHolding", e.target.value)
                      }
                      className="input w-full min-w-[5.5rem]"
                    />
                  </label>
                  <div className="rounded-lg border border-gray-200 bg-surface px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-bodyText">
                      After margin
                    </p>
                    <p className="text-sm font-medium text-heading mt-1 whitespace-nowrap">
                      {currency} {line.priceAfterMargin.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-surface px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-bodyText">
                      WHT amount
                    </p>
                    <p className="text-sm font-medium text-heading mt-1 whitespace-nowrap">
                      {currency} {line.withHoldingAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-lg border border-gray-200 bg-surface px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-bodyText">
                      Unit / List
                    </p>
                    <p className="text-sm font-semibold text-heading mt-1">
                      {currency} {line.listPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-surface px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-bodyText">
                      Amount (Unit × Qty)
                    </p>
                    <p className="text-sm font-semibold text-heading mt-1">
                      {currency} {line.amount.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-brand/20 bg-brand/5 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-brand">
                      Line total
                    </p>
                    <p className="text-sm font-semibold text-brand mt-1">
                      {currency} {line.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-xl border border-gray-300 bg-surface px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="text-[11px] text-bodyText uppercase">Total qty</p>
            <p className="font-semibold text-heading">
              {lines.reduce(
                (sum, line) => sum + (Number(line.product.quantity) || 0),
                0,
              )}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-bodyText uppercase">Goods amount</p>
            <p className="font-semibold text-heading">
              {currency}{" "}
              {round(lines.reduce((sum, line) => sum + line.amount, 0)).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-bodyText uppercase">Subtotal</p>
            <p className="font-semibold text-brand">
              {currency} {subtotal.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-bodyText uppercase">Grand total</p>
            <p className="font-semibold text-brand">
              {currency} {grandTotal.toFixed(2)}
            </p>
          </div>
        </div>
        <p className="text-[11px] text-bodyText mt-2">
          Amount = Unit / List × Qty · Line Total = Amount + product tax
        </p>

        <div className="mt-3 space-y-2">
          {formData.products.map((p, i) => (
            <div
              key={`tax-${i}`}
              className="bg-surface border border-gray-200 rounded-lg px-3 py-2"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-bodyText">
                  Product tax · {p.productName || `Line ${i + 1}`}
                </span>
                <button
                  type="button"
                  className="text-xs text-brand"
                  onClick={() => {
                    const products = [...formData.products];
                    products[i].Tax = [
                      ...(products[i].Tax || []),
                      { tax: "", percent: 0, customName: "" },
                    ];
                    setFormData({ ...formData, products });
                  }}
                >
                  + Tax
                </button>
              </div>
              {(p.Tax || []).length === 0 && (
                <p className="text-[11px] text-bodyText">
                  No product tax on this line.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {(p.Tax || []).map((t, ti) => (
                  <div key={ti} className="flex items-center gap-1">
                    <select
                      value={t.tax}
                      onChange={(e) => {
                        const selected = TAX_OPTIONS.find(
                          (opt) => opt.label === e.target.value,
                        );
                        if (!selected) return;
                        const products = [...formData.products];
                        products[i].Tax[ti] = {
                          tax: selected.label,
                          percent:
                            selected.label === "Custom" ? 0 : selected.percent,
                          customName: "",
                        };
                        setFormData({ ...formData, products });
                      }}
                      className="input py-1 text-xs w-28"
                    >
                      <option value="">Tax</option>
                      {TAX_OPTIONS.map((opt) => (
                        <option key={opt.label} value={opt.label}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {t.tax === "Custom" && (
                      <input
                        placeholder="Name"
                        value={t.customName || ""}
                        onChange={(e) => {
                          const products = [...formData.products];
                          products[i].Tax[ti].customName = e.target.value;
                          setFormData({ ...formData, products });
                        }}
                        className="input py-1 text-xs w-24"
                      />
                    )}
                    <input
                      type="number"
                      value={t.percent}
                      disabled={t.tax !== "Custom"}
                      onChange={(e) => {
                        const products = [...formData.products];
                        products[i].Tax[ti].percent = e.target.value;
                        setFormData({ ...formData, products });
                      }}
                      className="input py-1 text-xs w-16 text-center"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const products = [...formData.products];
                        products[i].Tax = products[i].Tax.filter(
                          (_, idx) => idx !== ti,
                        );
                        setFormData({ ...formData, products });
                      }}
                      className="text-red-600 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-heading">
              Quote-level tax
            </h3>
            <button
              type="button"
              onClick={addOtherTax}
              className="text-xs text-brand"
            >
              + Add tax
            </button>
          </div>
          {(formData.otherTax || []).map((t, i) => (
            <div key={i} className="flex gap-2 items-center">
              <select
                value={
                  TAX_OPTIONS.some((opt) => opt.label === t.tax)
                    ? t.tax
                    : t.tax
                      ? "Custom"
                      : ""
                }
                onChange={(e) => {
                  const selected = TAX_OPTIONS.find(
                    (opt) => opt.label === e.target.value,
                  );
                  if (!selected) return;
                  const otherTax = [...formData.otherTax];
                  otherTax[i] = {
                    ...otherTax[i],
                    tax: selected.label,
                    percent: selected.label === "Custom" ? 0 : selected.percent,
                    customName:
                      selected.label === "Custom"
                        ? otherTax[i].customName || ""
                        : "",
                  };
                  setFormData({ ...formData, otherTax });
                }}
                className="input text-xs"
              >
                <option value="">Select tax</option>
                {TAX_OPTIONS.map((opt) => (
                  <option key={opt.label} value={opt.label}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {t.tax === "Custom" && (
                <input
                  placeholder="Name"
                  value={t.customName || t.tax || ""}
                  onChange={(e) =>
                    updateOtherTax(i, "customName", e.target.value)
                  }
                  className="input text-xs"
                />
              )}
              <input
                type="number"
                value={t.percent}
                disabled={t.tax && t.tax !== "Custom"}
                onChange={(e) => updateOtherTax(i, "percent", e.target.value)}
                className="input text-xs w-20 text-center"
              />
              <button
                type="button"
                onClick={() => removeOtherTax(i)}
                className="text-red-600 text-xs"
              >
                ✕
              </button>
            </div>
          ))}

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-heading">Terms</h3>
              <button
                type="button"
                onClick={addTerm}
                className="text-xs text-brand"
              >
                + Add term
              </button>
            </div>
            {(formData.termsAndConditions || []).map((term, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <textarea
                  value={term}
                  onChange={(e) => updateTerm(i, e.target.value)}
                  className="input flex-1 text-sm"
                  rows={2}
                />
                <button
                  type="button"
                  onClick={() => removeTerm(i)}
                  className="text-red-600 text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-gray-300 rounded-xl p-4 space-y-2 h-fit">
          <div className="flex justify-between text-sm text-bodyText">
            <span>Vendor total</span>
            <span>
              {currency} {vendorTotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm text-bodyText">
            <span>WHT after margin</span>
            <span>
              {currency} {whtTotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm text-bodyText">
            <span>Goods amount (Unit × Qty)</span>
            <span>
              {currency}{" "}
              {round(lines.reduce((sum, line) => sum + line.amount, 0)).toFixed(
                2,
              )}
            </span>
          </div>
          <div className="flex justify-between text-sm text-bodyText">
            <span>Subtotal (with product tax)</span>
            <span>
              {currency} {subtotal.toFixed(2)}
            </span>
          </div>
          {otherTaxAmount > 0 && (
            <div className="flex justify-between text-sm text-bodyText">
              <span>Other tax</span>
              <span>
                {currency} {otherTaxAmount.toFixed(2)}
              </span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
            <span>Grand total</span>
            <span className="text-brand">
              {currency} {grandTotal.toFixed(2)}
            </span>
          </div>
          <p className="text-[11px] text-bodyText">
            Default WHT is {DEFAULT_WHT}%. Customer PDF shows list prices only
            (Unit × Qty).
          </p>
        </div>
      </div>
    </div>
  );
}
