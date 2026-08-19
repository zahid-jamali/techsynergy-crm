const DeleteInvoiceModal = ({ invoice, onClose, onSuccess }) => {
  const remove = async () => {
    await fetch(`/api/invoices/${invoice._id}`, { method: "DELETE" });
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-heading/40 flex items-center justify-center z-50">
      <div className="bg-card border border-gray-200 p-6 rounded-xl w-[360px] shadow-elevate">
        <h2 className="font-semibold mb-4 text-red-600">Delete Invoice</h2>
        <p className="text-bodyText text-sm">This action cannot be undone.</p>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={remove} className="btn-danger">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteInvoiceModal;
