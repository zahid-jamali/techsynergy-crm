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
        `${process.env.REACT_APP_BACKEND_URL}contact/${contact._id}`,
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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-center px-4">
      <div className="bg-black border border-gray-800 rounded-lg w-full max-w-md text-white p-6 space-y-4">
        <h2 className="text-lg font-semibold text-red-500">Delete Contact</h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <p className="text-gray-300">
          Are you sure you want to delete{" "}
          <span className="text-red-400 font-semibold">
            {contact.firstName} {contact.lastName}
          </span>
          ?
        </p>

        <p className="text-sm text-gray-500">
          This will deactivate the contact but not permanently remove it.
        </p>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded disabled:opacity-60"
          >
            {loading ? "Deleting..." : "Delete Contact"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteContactModal;
