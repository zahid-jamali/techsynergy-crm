const DeletePOToVendorModal = ({ po, onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");

  const handleDelete = async () => {
    await fetch(
      `${process.env.REACT_APP_BACKEND_URL}potovendor/delete/${po._id}`,
      {
        method: "DELETE",
        headers: { authorization: `Bearer ${token}` },
      }
    );

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-heading/40 z-50 flex items-center justify-center">
      <div className="bg-card border border-gray-200 rounded-lg w-full max-w-md text-heading">
        <div className="px-5 py-4 border-b border-gray-200 flex justify-between">
          <h2 className="text-brand font-semibold">Delete PO</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="p-5 text-sm">
          Are you sure you want to delete{" "}
          <b className="text-red-400">{po.poToNumber}</b>?
        </div>

        <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="bg-gray-100 px-4 py-2 rounded">
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="btn-danger px-4 py-2 rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePOToVendorModal;
