import { useEffect, useState } from "react";
import { QuoteFormFields, normalizeTaxes } from "./QuoteFormFields";
import { emptyQuoteProduct } from "../../../lib/quotePricing";

const AddQuoteModal = ({ onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    validUntil: "",
    currency: "USD",
    description: "",
    otherTax: [],
    products: [emptyQuoteProduct()],
    termsAndConditions: [],
  });

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}products/get`, {
      headers: { authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCatalog(data.data || []))
      .catch(() => setCatalog([]));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        deal: selectedDeal?._id,
        contact: selectedContact?._id,
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
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}quotes/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create quote");
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-panel max-w-7xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-heading">Create quote</h2>
            <p className="text-xs text-bodyText mt-0.5">
              Fill the costing sheet. Withholding is calculated after margin.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-bodyText">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <QuoteFormFields
            mode="create"
            formData={formData}
            setFormData={setFormData}
            catalog={catalog}
            selectedDeal={selectedDeal}
            setSelectedDeal={setSelectedDeal}
            selectedContact={selectedContact}
            setSelectedContact={setSelectedContact}
          />
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Saving..." : "Create quote"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddQuoteModal;
