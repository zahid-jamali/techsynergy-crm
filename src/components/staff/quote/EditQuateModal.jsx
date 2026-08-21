import { useState } from "react";
import { QuoteFormFields, normalizeTaxes } from "./QuoteFormFields";
import { DEFAULT_WHT, calculateLine, emptyQuoteProduct } from "../../../lib/quotePricing";

const mapProduct = (p) => {
  const product = {
    productName: p.productName || "",
    description: p.description || "",
    quantity: p.quantity || 1,
    vendorPrice: p.vendorPrice ?? p.purchasePrice ?? 0,
    margin: p.margin ?? 0,
    withHolding: p.withHolding ?? DEFAULT_WHT,
    listPrice: p.listPrice || 0,
    Tax: (p.Tax || []).map((t) => {
      const predefined = ["GST", "SST", "PST", "KPK-ST"];
      if (predefined.includes(t.tax)) return { ...t };
      return { tax: "Custom", percent: t.percent, customName: t.tax };
    }),
  };
  const line = calculateLine(product);
  return {
    ...product,
    listPrice: line.listPrice,
    priceAfterMargin: line.priceAfterMargin,
    withHoldingAmount: line.withHoldingAmount,
  };
};

const EditQuoteModal = ({ quote, onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: quote.subject || "",
    quoteStage: quote.quoteStage,
    validUntil: quote.validUntil?.slice(0, 10) || "",
    description: quote.description || "",
    currency: quote.currency || "USD",
    otherTax: (quote.otherTax || []).map((t) => {
      const predefined = ["GST", "SST", "PST", "KPK-ST"];
      if (predefined.includes(t.tax)) return { ...t };
      return { tax: "Custom", percent: t.percent, customName: t.tax };
    }),
    termsAndConditions: quote.termsAndConditions || [],
    products:
      quote.products?.length > 0
        ? quote.products.map(mapProduct)
        : [emptyQuoteProduct()],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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
          quantity: Number(p.quantity) || 1,
          vendorPrice: Number(p.vendorPrice) || 0,
          margin: Number(p.margin) || 0,
          withHolding: Number(p.withHolding) || 0,
          listPrice: Number(p.listPrice) || 0,
          Tax: normalizeTaxes(p.Tax),
        })),
        otherTax: normalizeTaxes(formData.otherTax),
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
        },
      );
      if (!res.ok) throw new Error("Failed to update quote");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Update Quote Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-panel max-w-7xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-heading">Edit quote</h2>
            <p className="text-xs text-bodyText mt-0.5">
              Costing updates save vendor price, margin and withholding on the quote.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-bodyText">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <QuoteFormFields mode="edit" formData={formData} setFormData={setFormData} />
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQuoteModal;
