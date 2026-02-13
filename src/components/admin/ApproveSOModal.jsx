import { useState } from "react";

const ApproveSOModal = ({ quoteId, onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleApprove = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}quotes/${quoteId}/so-approve`,
        {
          method: "PUT",
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Failed to approve sales order");
      }

      onSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-black border border-gray-800 rounded-lg w-full max-w-sm text-white">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-red-500">
            Approve Sales Order
          </h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          <p className="text-sm text-gray-300">
            Are you sure you want to approve this Sales Order?
          </p>

          <p className="text-xs text-gray-500">
            Once approved, this action cannot be reversed.
          </p>

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-800">
          <button onClick={onClose} className="bg-gray-700 px-4 py-2 rounded">
            Cancel
          </button>

          <button
            onClick={handleApprove}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded disabled:opacity-60"
          >
            {loading ? "Approving..." : "Approve"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveSOModal;
