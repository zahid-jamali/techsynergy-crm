import { useState } from "react";

const EditVendorModal = ({ vendor, onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");
  const [name, setName] = useState(vendor.name);
  const [status, setStatus] = useState(vendor.status || "Active");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await fetch(
        `${process.env.REACT_APP_BACKEND_URL}vendors/update/${vendor._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, status }),
        }
      );

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-black border border-gray-800 rounded-lg w-full max-w-md text-white">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-red-500">Edit Vendor</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Blacklisted">Blacklisted</option>
          </select>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-800">
          <button onClick={onClose} className="bg-gray-700 px-4 py-2 rounded">
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditVendorModal;
