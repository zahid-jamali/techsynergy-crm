import { useState } from "react";
import LookupPicker from "../../lists/LookupPicker";
import { contactName } from "../../../lib/crm";

const AddDealModal = ({ onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");

  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);

  const [formData, setFormData] = useState({
    dealName: "",
    dealType: "-None-",
    stage: "Qualification",
    nextStep: "",
    previousStep: "",
    amount: "",
    currency: "PKR",
    closingDate: "",
    description: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        account: selectedAccount?._id,
        contact: selectedContact?._id,
      };

      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}deals/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) throw new Error("Failed to create deal");

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-heading/40 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="flex justify-center px-6 py-10">
        <div className="bg-card border border-gray-200 rounded-xl w-full max-w-3xl text-heading shadow-2xl">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-brand">Add New Deal</h2>
            <button
              onClick={onClose}
              className="text-bodyText hover:text-heading text-xl"
            >
              ✕
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-6 max-h-[80vh] overflow-y-auto"
          >
            {/* DEAL NAME */}
            <div>
              <label className="label">Deal Name *</label>
              <input
                name="dealName"
                required
                value={formData.dealName}
                onChange={handleChange}
                className="input"
              />
            </div>

            <LookupPicker
              label="Account (shared across team)"
              endpoint="account/lookup"
              placeholder="Search any team account..."
              value={selectedAccount}
              displayValue={selectedAccount?.accountName || ""}
              onSelect={(account) => {
                setSelectedAccount(account);
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
              label="POC (global — any teammate)"
              endpoint="contact/lookup"
              extraParams={{ global: true }}
              placeholder="Search any contact on the team..."
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

            {/* STAGE + CURRENCY */}
            <div className="grid grid-cols-2 gap-4">
              {/* <div>
                <label className="label">Stage</label>
                <select
                  name="stage"
                  value={formData.stage}
                  onChange={handleChange}
                  className="input"
                >
                  {[
                    "Qualification",
                    "Needs Analysis",
                    "Value Proposition",
                    "Identify Decision Makers",
                    "Proposal/Price Quote",
                    "Negotiation/Review",
                    "Closed Won",
                    "Closed Lost",
                    "Closed Lost to Competition",
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div> */}

              <div>
                <label className="label">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  className="input"
                >
                  <option value="PKR">PKR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            {/* AMOUNT + PROBABILITY */}
            {/* <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Amount</label>
                <input
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Closing Date</label>
                <input
                  name="closingDate"
                  type="date"
                  value={formData.closingDate}
                  onChange={handleChange}
                  className="input"
                />
              </div> */}
            {/* </div> */}

            {/* DATE */}

            {/* DESCRIPTION */}
            <div>
              <label className="label">Description</label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                className="input"
              />
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-brand hover:bg-brand/90 px-5 py-2 rounded"
              >
                {loading ? "Saving..." : "Save Deal"}
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
          transition: all 0.15s ease;
        }

        .label {
          display: block;
          font-size: 12px;
          color: #4b5563;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .dropdown {
          position: absolute;
          width: 100%;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          margin-top: 6px;
          max-height: 220px;
          overflow-y: auto;
          box-shadow: 0 10px 30px rgba(2, 29, 84, 0.08);
          z-index: 50;
        }

        .dropdown-item {
          padding: 10px 14px;
          cursor: pointer;
          border-bottom: 1px solid #f3f4f6;
          transition: background 0.15s ease;
        }

        .dropdown-item:last-child {
          border-bottom: none;
        }

        .dropdown-item:hover {
          background: #f9fafb;
        }
      `}</style>
    </div>
  );
};

export default AddDealModal;
