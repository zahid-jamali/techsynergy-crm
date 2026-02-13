import { useState } from "react";

const AddVendorModal = ({ onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Vendor name is required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}vendors/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to create vendor");

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-black border border-gray-800 rounded-lg w-full max-w-md text-white">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-red-500">Add Vendor</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          <input
            type="text"
            placeholder="Vendor name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-800">
          <button onClick={onClose} className="bg-gray-700 px-4 py-2 rounded">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddVendorModal;
