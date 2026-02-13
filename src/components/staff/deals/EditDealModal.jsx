import { useEffect, useState } from "react";

const EditDealModal = ({ deal, onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");

  /* ---------------- Form State ---------------- */
  const [formData, setFormData] = useState({
    dealName: deal.dealName || "",
    stage: deal.stage || "Qualification",
    nextStep: deal.nextStep || "",
    previousStep: deal.previousStep || "",
    amount: deal.amount || 0,
    probability: deal.probability || 0,
    closingDate: deal.closingDate ? deal.closingDate.slice(0, 10) : "",
    description: deal.description || "",
  });

  /* ---------------- Accounts & Contacts ---------------- */
  const [accounts, setAccounts] = useState([]);
  const [contacts, setContacts] = useState([]);

  const [accountQuery, setAccountQuery] = useState(
    deal.account?.accountName || ""
  );
  const [contactQuery, setContactQuery] = useState(
    deal.contact ? `${deal.contact.firstName} ${deal.contact.lastName}` : ""
  );

  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);

  const [selectedAccount, setSelectedAccount] = useState(deal.account || null);
  const [selectedContact, setSelectedContact] = useState(deal.contact || null);

  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showContactDropdown, setShowContactDropdown] = useState(false);

  /* ---------------- Fetch data ONCE ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accRes, conRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_BACKEND_URL}/account/my`, {
            headers: { authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.REACT_APP_BACKEND_URL}/contact/my`, {
            headers: { authorization: `Bearer ${token}` },
          }),
        ]);

        const accData = await accRes.json();
        const conData = await conRes.json();

        setAccounts(accData.data || []);
        setContacts(conData.data || []);
      } catch (err) {
        console.error("Failed to fetch accounts/contacts", err);
      }
    };

    fetchData();
  }, [token]);

  /* ---------------- Client-side search ---------------- */
  useEffect(() => {
    if (!accountQuery) {
      setFilteredAccounts([]);
      return;
    }

    setFilteredAccounts(
      accounts.filter((a) =>
        a.accountName.toLowerCase().includes(accountQuery.toLowerCase())
      )
    );
  }, [accountQuery, accounts]);

  useEffect(() => {
    if (!contactQuery) {
      setFilteredContacts([]);
      return;
    }

    setFilteredContacts(
      contacts.filter((c) =>
        `${c.firstName} ${c.lastName}`
          .toLowerCase()
          .includes(contactQuery.toLowerCase())
      )
    );
  }, [contactQuery, contacts]);

  /* ---------------- Handlers ---------------- */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      amount: Number(formData.amount || 0),
      probability: Number(formData.probability || 0),
      account: selectedAccount?._id,
      contact: selectedContact?._id,
    };

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/deals/${deal._id}`,
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="flex justify-center px-4 py-8">
        <div className="bg-black border border-gray-800 rounded-lg w-full max-w-2xl text-white">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-red-500">Edit Deal</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-4 max-h-[75vh] overflow-y-auto"
          >
            <input
              name="dealName"
              value={formData.dealName}
              onChange={handleChange}
              className="input"
              placeholder="Deal Name"
            />

            {/* Account Search */}
            <div className="relative">
              <input
                placeholder="Search Account..."
                value={accountQuery}
                onFocus={() => setShowAccountDropdown(true)}
                onChange={(e) => setAccountQuery(e.target.value)}
                className="input"
              />

              {showAccountDropdown && filteredAccounts.length > 0 && (
                <div className="dropdown">
                  {filteredAccounts.slice(0, 6).map((a) => (
                    <div
                      key={a._id}
                      onClick={() => {
                        setSelectedAccount(a);
                        setAccountQuery(a.accountName);
                        setShowAccountDropdown(false);
                      }}
                      className="dropdown-item"
                    >
                      {a.accountName}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contact Search */}
            <div className="relative">
              <input
                placeholder="Search Contact..."
                value={contactQuery}
                onFocus={() => setShowContactDropdown(true)}
                onChange={(e) => setContactQuery(e.target.value)}
                className="input"
              />

              {showContactDropdown && filteredContacts.length > 0 && (
                <div className="dropdown">
                  {filteredContacts.slice(0, 6).map((c) => (
                    <div
                      key={c._id}
                      onClick={() => {
                        setSelectedContact(c);
                        setContactQuery(`${c.firstName} ${c.lastName}`);
                        setShowContactDropdown(false);
                      }}
                      className="dropdown-item"
                    >
                      {c.firstName} {c.lastName}
                    </div>
                  ))}
                </div>
              )}
            </div>

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

            <input
              name="amount"
              type="number"
              placeholder="Amount"
              value={formData.amount}
              onChange={handleChange}
              className="input"
            />

            <input
              name="probability"
              type="number"
              placeholder="Probability (%)"
              value={formData.probability}
              onChange={handleChange}
              className="input"
            />

            <input
              name="closingDate"
              type="date"
              value={formData.closingDate}
              onChange={handleChange}
              className="input"
            />

            <textarea
              name="description"
              placeholder="Description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="input"
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
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
          background: #111827;
          border: 1px solid #374151;
          padding: 8px 10px;
          border-radius: 6px;
        }
        .dropdown {
          position: absolute;
          width: 100%;
          background: #111827;
          border: 1px solid #374151;
          border-radius: 6px;
          margin-top: 4px;
          max-height: 160px;
          overflow-y: auto;
          z-index: 20;
        }
        .dropdown-item {
          padding: 8px 10px;
          cursor: pointer;
        }
        .dropdown-item:hover {
          background: #1f2937;
        }
      `}</style>
    </div>
  );
};

export default EditDealModal;
