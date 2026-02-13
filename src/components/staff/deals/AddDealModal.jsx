import { useEffect, useState } from "react";

const AddDealModal = ({ onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");

  const [loading, setLoading] = useState(false);

  const [accounts, setAccounts] = useState([]);
  const [contacts, setContacts] = useState([]);

  const [accountQuery, setAccountQuery] = useState("");
  const [contactQuery, setContactQuery] = useState("");

  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);

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

    probability: "",
    closingDate: "",
    description: "",
  });

  /* -------- Fetch accounts & contacts ONCE -------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accRes, conRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_BACKEND_URL}account/my`, {
            headers: { authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.REACT_APP_BACKEND_URL}contact/my`, {
            headers: { authorization: `Bearer ${token}` },
          }),
        ]);

        const accData = await accRes.json();
        const conData = await conRes.json();

        setAccounts(accData || []);
        setContacts(conData || []);
      } catch (err) {
        console.error("Failed to load data");
      }
    };

    fetchData();
  }, []);

  /* -------- Client-side search -------- */
  useEffect(() => {
    setFilteredAccounts(
      accounts.filter((a) =>
        a.accountName.toLowerCase().includes(accountQuery.toLowerCase())
      )
    );
  }, [accountQuery, accounts]);

  useEffect(() => {
    setFilteredContacts(
      contacts.filter((c) =>
        `${c.firstName} ${c.lastName}`
          .toLowerCase()
          .includes(contactQuery.toLowerCase())
      )
    );
  }, [contactQuery, contacts]);

  /* -------- Handlers -------- */
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
        }
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="flex justify-center px-6 py-10">
        <div className="bg-black border border-gray-800 rounded-xl w-full max-w-3xl text-white shadow-2xl">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-red-500">Add New Deal</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-xl"
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

            {/* ACCOUNT SELECT */}
            <div className="relative">
              <label className="label">Account</label>
              <input
                placeholder="Search Account..."
                value={accountQuery}
                onChange={(e) => setAccountQuery(e.target.value)}
                className="input focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />

              {accountQuery && filteredAccounts.length > 0 && (
                <div className="dropdown">
                  {filteredAccounts.slice(0, 6).map((a) => (
                    <div
                      key={a._id}
                      onClick={() => {
                        setSelectedAccount(a);
                        setAccountQuery(a.accountName);
                        setFilteredAccounts([]);
                      }}
                      className="dropdown-item"
                    >
                      <div className="font-medium">{a.accountName}</div>
                      <div className="text-xs text-gray-400">{a.industry}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CONTACT SELECT */}
            <div className="relative">
              <label className="label">Contact</label>
              <input
                placeholder="Search Contact..."
                value={contactQuery}
                onChange={(e) => setContactQuery(e.target.value)}
                className="input focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />

              {contactQuery && filteredContacts.length > 0 && (
                <div className="dropdown">
                  {filteredContacts.slice(0, 6).map((c) => (
                    <div
                      key={c._id}
                      onClick={() => {
                        setSelectedContact(c);
                        setContactQuery(`${c.firstName} ${c.lastName}`);
                        setFilteredContacts([]);
                      }}
                      className="dropdown-item"
                    >
                      <div className="font-medium">
                        {c.firstName} {c.lastName}
                      </div>
                      <div className="text-xs text-gray-400">{c.email}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* STAGE + CURRENCY */}
            <div className="grid grid-cols-2 gap-4">
              <div>
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
              </div>

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
            <div className="grid grid-cols-2 gap-4">
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
                <label className="label">Probability (%)</label>
                <input
                  name="probability"
                  type="number"
                  value={formData.probability}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>

            {/* DATE */}
            <div>
              <label className="label">Closing Date</label>
              <input
                name="closingDate"
                type="date"
                value={formData.closingDate}
                onChange={handleChange}
                className="input"
              />
            </div>

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
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded"
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
          background: #111827;
          border: 1px solid #374151;
          padding: 10px 12px;
          border-radius: 8px;
          transition: all 0.15s ease;
        }

        .label {
          display: block;
          font-size: 12px;
          color: #9ca3af;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .dropdown {
          position: absolute;
          width: 100%;
          background: #0f172a;
          border: 1px solid #374151;
          border-radius: 10px;
          margin-top: 6px;
          max-height: 220px;
          overflow-y: auto;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
          z-index: 50;
        }

        .dropdown-item {
          padding: 10px 14px;
          cursor: pointer;
          border-bottom: 1px solid #1f2937;
          transition: background 0.15s ease;
        }

        .dropdown-item:last-child {
          border-bottom: none;
        }

        .dropdown-item:hover {
          background: #1f2937;
        }
      `}</style>
    </div>
  );
};

export default AddDealModal;
