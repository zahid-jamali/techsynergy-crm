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

  /* ---------------- Fetch data ---------------- */
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

  /* ---------------- Search Logic ---------------- */
  useEffect(() => {
    if (!accountQuery) return setFilteredAccounts([]);

    setFilteredAccounts(
      accounts.filter((a) =>
        a.accountName.toLowerCase().includes(accountQuery.toLowerCase())
      )
    );
  }, [accountQuery, accounts]);

  useEffect(() => {
    if (!contactQuery) return setFilteredContacts([]);

    setFilteredContacts(
      contacts.filter((c) =>
        `${c.firstName} ${c.lastName}`
          .toLowerCase()
          .includes(contactQuery.toLowerCase())
      )
    );
  }, [contactQuery, contacts]);

  /* ---------------- Handlers ---------------- */
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 overflow-y-auto">
      <div className="flex justify-center px-6 py-10">
        <div className="bg-[#0f172a] border border-gray-800 rounded-2xl w-full max-w-3xl text-white shadow-2xl">
          {/* HEADER */}
          <div className="flex justify-between items-center px-8 py-6 border-b border-gray-800">
            <div>
              <h2 className="text-2xl font-semibold text-red-500">Edit Deal</h2>
              <p className="text-sm text-gray-400 mt-1">
                Update opportunity details and pipeline information
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition text-lg"
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

              {/* ACCOUNT SEARCH */}
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

              {/* CONTACT SEARCH */}
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
                  name="closingDate"
                  type="date"
                  value={formData.closingDate}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <input
                  name="amount"
                  type="number"
                  placeholder="Deal Amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="input"
                />

                <input
                  name="probability"
                  type="number"
                  placeholder="Win Probability (%)"
                  value={formData.probability}
                  onChange={handleChange}
                  className="input"
                />
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
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-medium transition"
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
          padding: 10px 12px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        .input:focus {
          outline: none;
          border-color: #dc2626;
          box-shadow: 0 0 0 1px #dc2626;
        }
        .dropdown {
          position: absolute;
          width: 100%;
          background: #0f172a;
          border: 1px solid #374151;
          border-radius: 8px;
          margin-top: 6px;
          max-height: 200px;
          overflow-y: auto;
          z-index: 20;
        }
        .dropdown-item {
          padding: 10px 12px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .dropdown-item:hover {
          background: #1f2937;
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
