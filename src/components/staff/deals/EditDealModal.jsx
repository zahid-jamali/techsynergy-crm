import { useState } from "react";
import LookupPicker from "../../lists/LookupPicker";
import { contactName, DEAL_STAGES } from "../../../lib/crm";

const EditDealModal = ({ deal, onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");

  const [formData, setFormData] = useState({
    dealName: deal.dealName || "",
    stage: deal.stage || "Qualification",
    nextStep: deal.nextStep || "",
    previousStep: deal.previousStep || "",
    amount: deal.amount || 0,
    currency: deal.currency || "PKR",
    closingDate: deal.closingDate ? deal.closingDate.slice(0, 10) : "",
    description: deal.description || "",
  });

  const [selectedAccount, setSelectedAccount] = useState(deal.account || null);
  const [selectedContact, setSelectedContact] = useState(deal.contact || null);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      amount: Number(formData.amount || 0),
      account: selectedAccount?._id,
      contact: selectedContact?._id,
    };

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}deals/update/${deal._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to update deal");

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Update deal failed", err);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="fixed inset-0 bg-heading/40 backdrop-blur-md z-50 overflow-y-auto">
      <div className="flex justify-center px-6 py-10">
        <div className="bg-card border border-gray-200 rounded-2xl w-full max-w-3xl text-heading shadow-2xl">
          {/* HEADER */}
          <div className="flex justify-between items-center px-8 py-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-semibold text-brand">Edit Deal</h2>
              <p className="text-sm text-bodyText mt-1">
                Update opportunity details and pipeline information
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-bodyText hover:text-heading transition text-lg"
            >
              ✕
            </button>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="p-8 space-y-8 max-h-[80vh] overflow-y-auto"
          >
            {/* BASIC INFO */}
            <div className="space-y-5">
              <h3 className="section-title">Basic Information</h3>

              <input
                name="dealName"
                value={formData.dealName}
                onChange={handleChange}
                className="input"
                placeholder="Deal Name"
              />

              <LookupPicker
                label="Account (shared across team)"
                endpoint="account/lookup"
                placeholder="Search any team account..."
                value={selectedAccount}
                displayValue={selectedAccount?.accountName || ""}
                onSelect={(account) => {
                  setSelectedAccount(account);
                  setSelectedContact(null);
                }}
                renderItem={(a) => (
                  <div>
                    <div className="font-medium">{a.accountName}</div>
                    <div className="text-xs text-bodyText">
                      {a.industry || "Account"}
                      {a.accountOwner?.name ? ` · ${a.accountOwner.name}` : ""}
                    </div>
                  </div>
                )}
              />

              <LookupPicker
                label="POC (any teammate's contact)"
                endpoint="contact/lookup"
                extraParams={
                  selectedAccount?._id ? { account: selectedAccount._id } : {}
                }
                placeholder="Search any team contact..."
                value={selectedContact}
                displayValue={selectedContact ? contactName(selectedContact) : ""}
                onSelect={(contact) => {
                  setSelectedContact(contact);
                  if (contact?.account && typeof contact.account === "object") {
                    setSelectedAccount(contact.account);
                  }
                }}
                renderItem={(c) => (
                  <div>
                    <div className="font-medium">{contactName(c)}</div>
                    <div className="text-xs text-bodyText">
                      {c.account?.accountName || c.email || c.phone || "Contact"}
                      {c.contactOwner?.name ? ` · ${c.contactOwner.name}` : ""}
                    </div>
                  </div>
                )}
              />
            </div>

            {/* PIPELINE DETAILS */}
            <div className="space-y-5">
              <h3 className="section-title">Pipeline Details</h3>

              <div className="grid grid-cols-2 gap-6">
                <select
                  name="stage"
                  value={formData.stage}
                  onChange={handleChange}
                  className="input"
                >
                  {DEAL_STAGES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>

                <input
                  name="closingDate"
                  type="date"
                  value={formData.closingDate}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="input"
                  >
                    {["USD", "PKR"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <label className="label">Deal Amount</label>

                  <input
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleChange}
                    className="input pl-12"
                  />
                </div>

                {/* <div className="space-y-3">
                  <label className="label">Win Probability</label>

                  <div className="flex justify-between text-sm text-bodyText">
                    <span>Confidence</span>
                    <span className="text-brand font-semibold">
                      {formData.probability}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    name="probability"
                    value={formData.probability}
                    onChange={handleChange}
                    className="w-full accent-red-600"
                  />

                  <div className="w-full bg-surface rounded-full h-2">
                    <div
                      className="h-2 bg-brand rounded-full transition-all"
                      style={{ width: `${formData.probability}%` }}
                    />
                  </div>
                </div> */}
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-4">
              <h3 className="section-title">Additional Notes</h3>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                className="input"
                placeholder="Add relevant notes about this opportunity..."
              />
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 px-5 py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-brand hover:bg-brand/90 px-6 py-2 rounded-lg font-medium transition"
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
          background: #ffffff;
          border: 1px solid #e5e7eb;
          padding: 10px 12px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        .input:focus {
          outline: none;
          border-color: #1e4a8a;
          box-shadow: 0 0 0 1px #1e4a8a;
        }
        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: #d1d5db;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
};

export default EditDealModal;
