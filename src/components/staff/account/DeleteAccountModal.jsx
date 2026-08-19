import AccountWrapperModal from "./AccountWrapperModal";
import { useState } from "react";

const DeleteAccountModal = ({ account, onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}account/delete/${account._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Failed to delete account");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccountWrapperModal title="Delete Account" onClose={onClose}>
      <div className="p-6 space-y-4">
        {error && (
          <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <p className="text-bodyText">
          Are you sure you want to delete{" "}
          <span className="text-brand font-semibold">
            {account.accountName}
          </span>
          ?
        </p>

        <p className="text-sm text-gray-500">
          This action will deactivate the account but will not permanently
          remove it.
        </p>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded">
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 btn-danger rounded disabled:opacity-60"
          >
            {loading ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>
    </AccountWrapperModal>
  );
};

export default DeleteAccountModal;
