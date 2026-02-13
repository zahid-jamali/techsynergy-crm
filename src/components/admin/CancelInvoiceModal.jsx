const CancelInvoiceModal = ({ invoice, onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");

  const cancelInvoice = async () => {
    await fetch(
      `${process.env.REACT_APP_BACKEND_URL}invoice/cancel/${invoice._id}`,
      {
        method: "PATCH",
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white w-[420px] rounded-xl border border-gray-800 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Cancel Invoice</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* Warning */}
        <div className="bg-red-600/10 border border-red-600/30 rounded p-3 mb-4">
          <p className="text-sm text-red-400">
            Cancelling this invoice will stop it from being processed further.
          </p>
        </div>

        {/* Invoice Info */}
        <div className="text-sm text-gray-300 mb-6 space-y-1">
          <div>
            <span className="text-gray-400">Invoice #:</span>{" "}
            {invoice.invoiceNumber}
          </div>
          <div>
            <span className="text-gray-400">Current Status:</span>{" "}
            {invoice.status}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-600 rounded hover:bg-gray-800"
          >
            No
          </button>

          <button
            onClick={cancelInvoice}
            className="px-5 py-2 bg-yellow-600 hover:bg-yellow-700 rounded"
          >
            Yes, Cancel Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelInvoiceModal;
