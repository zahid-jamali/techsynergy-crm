import { useState } from "react";
import LookupPicker from "../../lists/LookupPicker";

const AddContactModal = ({ onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");

  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    mobile: "",
    description: "",
    designation: "",
  });

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

  return (
    <div className="fixed inset-0 bg-heading/40 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="flex justify-center px-4 py-8">
        <div className="bg-card border border-gray-200 rounded-lg w-full max-w-xl text-heading">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-brand">
              Add New Contact
            </h2>
            <button
              onClick={onClose}
              className="text-bodyText hover:text-heading"
            >
              ✕
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
          >
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

            <LookupPicker
              label="Account (any team account)"
              endpoint="account/lookup"
              placeholder="Search any team account..."
              value={selectedAccount}
              displayValue={selectedAccount?.accountName || ""}
              onSelect={setSelectedAccount}
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

            <textarea
              name="description"
              placeholder="Description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="input"
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-brand hover:bg-brand/90 rounded disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save Contact"}
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
          padding: 8px 10px;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
};

export default AddContactModal;
