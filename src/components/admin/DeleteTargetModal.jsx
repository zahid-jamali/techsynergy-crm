import { useState } from "react";

const DeleteTargetModal = ({ target, onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");
  const [loading, setLoading] = useState(false);

  if (!target) return null;

  const monthName = new Date(0, target.month - 1).toLocaleString("default", {
    month: "long",
  });

  const handleDelete = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}sales-target/${target._id}`,
        {
          method: "DELETE",
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!data.success) throw new Error();

      onSuccess();
    } catch (error) {
      console.error("Failed to delete target");
      alert("Failed to delete target");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-heading/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-card border border-red-900 rounded-lg w-full max-w-md text-heading shadow-2xl">
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-brand">
            Delete Sales Target
          </h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-4">
          {/* Warning Box */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
            ⚠️ This action cannot be undone.
          </div>

          <p className="text-bodyText text-sm">
            Are you sure you want to delete the sales target for:
          </p>

          {/* Target Info */}
          <div className="bg-card border border-gray-200 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-bodyText">User</span>
              <span>{target.user?.name || "Unknown"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-bodyText">Month</span>
              <span>
                {monthName} {target.year}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-bodyText">Target</span>
              <span>₹ {target.targetAmount}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-bodyText">Forecast</span>
              <span>₹ {target.forecastAmount}</span>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={loading}
              className="bg-gray-100 px-4 py-2 rounded"
            >
              Cancel
            </button>

            <button
              onClick={handleDelete}
              disabled={loading}
              className="btn-danger px-4 py-2 rounded"
            >
              {loading ? "Deleting..." : "Confirm Delete"}
            </button>
          </div>
        </div>

        <style jsx>{`
          .input {
            width: 100%;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            padding: 8px 10px;
            border-radius: 6px;
            color: #111827;
          }
        `}</style>
      </div>
    </div>
  );
};

export default DeleteTargetModal;
