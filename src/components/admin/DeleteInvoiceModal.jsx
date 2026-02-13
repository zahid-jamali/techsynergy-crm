const DeleteInvoiceModal = ({ invoice, onClose, onSuccess }) => {
  const remove = async () => {
    await fetch(`/api/invoices/${invoice._id}`, { method: "DELETE" });
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-[360px]">
        <h2 className="font-semibold mb-4 text-red-600">Delete Invoice</h2>
        <p>This action cannot be undone.</p>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={remove}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteInvoiceModal;
