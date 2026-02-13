import { useState } from "react";

const EditContactModal = ({ contact, accounts = [], onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    ...contact,
    postalAddress: contact.postalAddress || {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e) => {
    setFormData({
      ...formData,
      postalAddress: {
        ...formData.postalAddress,
        [e.target.name]: e.target.value,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}contact/${contact._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to update contact");

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="flex justify-center px-4 py-8">
        <div className="bg-black border border-gray-800 rounded-lg w-full max-w-3xl text-white">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-red-500">Edit Contact</h2>
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
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded text-sm">
                {error}
              </div>
            )}

            {/* BASIC INFO */}
            <div>
              <h3 className="text-sm text-gray-400 mb-3 uppercase tracking-wide">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="firstName"
                  value={formData.firstName || ""}
                  onChange={handleChange}
                  placeholder="First Name"
                  className="input"
                />

                <input
                  name="lastName"
                  value={formData.lastName || ""}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className="input"
                />

                <input
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  placeholder="Email"
                  className="input"
                />

                <input
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  placeholder="Phone"
                  className="input"
                />

                <input
                  name="mobile"
                  value={formData.mobile || ""}
                  onChange={handleChange}
                  placeholder="Mobile"
                  className="input"
                />

                {/* Account Select */}
                <select
                  name="account"
                  value={formData.account || ""}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Select Account</option>
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.accountName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ADDRESS */}
            <div>
              <h3 className="text-sm text-gray-400 mb-3 uppercase tracking-wide">
                Postal Address
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["street", "city", "state", "postalCode", "country"].map(
                  (field) => (
                    <input
                      key={field}
                      name={field}
                      placeholder={field}
                      value={formData.postalAddress[field] || ""}
                      onChange={handleAddressChange}
                      className="input"
                    />
                  )
                )}
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <h3 className="text-sm text-gray-400 mb-2 uppercase tracking-wide">
                Description
              </h3>
              <textarea
                name="description"
                rows="3"
                value={formData.description || ""}
                onChange={handleChange}
                className="input"
              />
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded disabled:opacity-60"
              >
                {loading ? "Updating..." : "Update Contact"}
              </button>
            </div>

            <style jsx>{`
              .input {
                width: 100%;
                background: #111827;
                border: 1px solid #374151;
                padding: 8px 10px;
                border-radius: 6px;
                color: white;
              }
            `}</style>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditContactModal;
