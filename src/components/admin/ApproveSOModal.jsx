import { useState } from "react";

const ApproveSOModal = ({ order, onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
  ===============================
  HANDLE APPROVAL / REJECTION
  ===============================
  */

  const handleAction = async (status) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}orders/${order._id}/approval`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update sales order");
      }

      onSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /*
  ===============================
  UI
  ===============================
  */

  return (
    <div className="fixed inset-0 bg-heading/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card border border-gray-200 rounded-lg w-full max-w-sm text-heading shadow-xl">
        {/* HEADER */}

        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-brand">
            Sales Order Decision
          </h2>

          <button onClick={onClose} className="text-bodyText hover:text-heading">
            ✕
          </button>
        </div>

        {/* BODY */}

        <div className="p-5 space-y-3">
          <h2 className="text-lg font-semibold text-brand">
            {order.finalQuote?.subject || ""} -{" "}
            {order.finalQuote?.account?.accountName}
          </h2>
          <p className="text-sm text-bodyText">
            Please choose an action for this Sales Order.
          </p>

          <p className="text-xs text-gray-500">
            Once approved or rejected, the order status will be updated.
          </p>

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        {/* FOOTER */}

        <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded"
          >
            Cancel
          </button>

          <button
            onClick={() => handleAction("Rejected")}
            disabled={loading}
            className="bg-gray-600 hover:bg-gray-100 px-4 py-2 rounded"
          >
            {loading ? "Processing..." : "Reject"}
          </button>

          <button
            onClick={() => handleAction("Accepted")}
            disabled={loading}
            className="bg-brand hover:bg-brand/90 px-4 py-2 rounded"
          >
            {loading ? "Processing..." : "Approve"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveSOModal;
