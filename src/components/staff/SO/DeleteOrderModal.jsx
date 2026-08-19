import { useState } from "react";

const DeleteOrderModal = ({ orderId, onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
  ===============================
  DELETE ORDER
  ===============================
  */

  const handleDelete = async () => {
    if (!orderId) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}orders/${orderId}/delete`,
        {
          method: "DELETE",
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete order");
      }

      /*
      SUCCESS
      */

      if (onSuccess) onSuccess();

      onClose();
    } catch (err) {
      console.error(err);
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
      <div className="bg-card border border-gray-200 rounded-2xl w-full max-w-md text-heading shadow-2xl">
        {/* HEADER */}

        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-brand">Delete Order</h2>
        </div>

        {/* BODY */}

        <div className="p-6 space-y-4">
          <p className="text-bodyText">
            Are you sure you want to delete this order?
          </p>

          <p className="text-sm text-gray-500">
            This action will deactivate the order. Approved orders cannot be
            deleted.
          </p>

          {error && <div className="text-brand text-sm">{error}</div>}
        </div>

        {/* ACTIONS */}

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="btn-danger px-5 py-2 rounded-lg font-semibold"
          >
            {loading ? "Deleting..." : "Delete Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteOrderModal;
