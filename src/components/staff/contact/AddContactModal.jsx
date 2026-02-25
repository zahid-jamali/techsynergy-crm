import { useEffect, useState } from "react";

const AddContactModal = ({ onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");

  /* ---------------- State ---------------- */
  const [loading, setLoading] = useState(false);

  const [allAccounts, setAllAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [accountQuery, setAccountQuery] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    mobile: "",
    description: "",
    designation: "",
  });

  /* ---------------- Fetch accounts ONCE ---------------- */
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}account/my`,
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch accounts");

        const data = await res.json();
        setAllAccounts(data || []);
      } catch (err) {
        console.error("Failed to load accounts", err);
      }
    };

    if (token) fetchAccounts();
  }, [token]);

  /* ---------------- Frontend search ---------------- */
  useEffect(() => {
    if (!showDropdown) return;

    if (!accountQuery.trim()) {
      setFilteredAccounts(allAccounts.slice(0, 10)); // show first 10
      return;
    }

    const query = accountQuery.toLowerCase();

    const results = allAccounts.filter((acc) =>
      acc.accountName?.toLowerCase().includes(query)
    );

    setFilteredAccounts(results);
  }, [accountQuery, allAccounts, showDropdown]);

  /* ---------------- Handlers ---------------- */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        account: selectedAccount?._id,
      };

      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}contact/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to create contact");

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Create contact failed", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="flex justify-center px-4 py-8">
        <div className="bg-black border border-gray-800 rounded-lg w-full max-w-xl text-white">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-red-500">
              Add New Contact
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
          >
            {/* Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                className="input"
              />
              <input
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                className="input"
              />
            </div>

            {/* Email */}
            <input
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="input"
            />
            <input
              name="designation"
              placeholder="Designation"
              value={formData.designation}
              onChange={handleChange}
              className="input"
            />

            {/* Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
                className="input"
              />
              <input
                name="mobile"
                placeholder="Mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="input"
              />
            </div>

            {/* Account Search */}
            <div className="relative">
              <input
                placeholder="Search Account..."
                value={accountQuery}
                onFocus={() => {
                  setShowDropdown(true);
                  setFilteredAccounts(allAccounts.slice(0, 10));
                }}
                onChange={(e) => {
                  setAccountQuery(e.target.value);
                  setSelectedAccount(null);
                }}
                className="input"
              />

              {showDropdown &&
                filteredAccounts.length > 0 &&
                !selectedAccount && (
                  <div className="absolute z-10 w-full bg-gray-900 border border-gray-700 rounded mt-1 max-h-40 overflow-y-auto">
                    {filteredAccounts.map((acc) => (
                      <div
                        key={acc._id}
                        onClick={() => {
                          setSelectedAccount(acc);
                          setAccountQuery(acc.accountName);
                          setShowDropdown(false);
                          setFilteredAccounts([]);
                        }}
                        className="px-3 py-2 hover:bg-gray-800 cursor-pointer"
                      >
                        {acc.accountName}
                      </div>
                    ))}
                  </div>
                )}
            </div>

            {/* Description */}
            <textarea
              name="description"
              placeholder="Description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="input"
            />

            {/* Actions */}
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
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save Contact"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Shared input style */}
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

export default AddContactModal;
