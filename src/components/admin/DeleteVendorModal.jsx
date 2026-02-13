const DeleteVendorModal = ({ vendor, onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");

  const handleDelete = async () => {
    try {
      await fetch(
        `${process.env.REACT_APP_BACKEND_URL}vendors/delete/${vendor._id}`,
        {
          method: "DELETE",
          headers: { authorization: `Bearer ${token}` },
        }
      );

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-black border border-gray-800 rounded-lg w-full max-w-md text-white">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-red-500">Delete Vendor</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="p-5">
          <p className="text-sm text-gray-300">
            Are you sure you want to delete{" "}
            <span className="text-red-400 font-semibold">{vendor.name}</span>?
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-800">
          <button onClick={onClose} className="bg-gray-700 px-4 py-2 rounded">
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteVendorModal;
