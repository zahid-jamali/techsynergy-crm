import { useState } from "react";

const DeleteContactModal = ({ contact, onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}contact/delete/${contact._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to delete");

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-heading/40 backdrop-blur-sm flex justify-center items-center px-4">
      <div className="bg-card border border-gray-200 rounded-lg w-full max-w-md text-heading p-6 space-y-4">
        <h2 className="text-lg font-semibold text-brand">Delete Contact</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <p className="text-bodyText">
          Are you sure you want to delete{" "}
          <span className="text-red-400 font-semibold">
            {contact.firstName} {contact.lastName}
          </span>
          ?
        </p>

        <p className="text-sm text-gray-500">
          This will deactivate the contact but not permanently remove it.
        </p>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 btn-danger rounded disabled:opacity-60"
          >
            {loading ? "Deleting..." : "Delete Contact"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteContactModal;
