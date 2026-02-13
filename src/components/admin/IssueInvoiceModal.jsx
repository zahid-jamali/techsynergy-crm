const IssueInvoiceModal = ({ invoice, onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");

  const issue = async () => {
    await fetch(
      `${process.env.REACT_APP_BACKEND_URL}invoice/issue/${invoice._id}`,
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
          <h2 className="text-lg font-semibold">Issue Invoice</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* Warning */}
        <div className="bg-yellow-600/10 border border-yellow-600/30 rounded p-3 mb-4">
          <p className="text-sm text-yellow-400">
            Once issued, this invoice will be locked and cannot be edited.
          </p>
        </div>

        {/* Invoice Info */}
        <div className="text-sm text-gray-300 mb-6 space-y-1">
          <div>
            <span className="text-gray-400">Invoice #:</span>{" "}
            {invoice.invoiceNumber}
          </div>
          <div>
            <span className="text-gray-400">Status:</span> {invoice.status}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-600 rounded hover:bg-gray-800"
          >
            Cancel
          </button>

          <button
            onClick={issue}
            className="px-5 py-2 bg-green-600 hover:bg-green-700 rounded"
          >
            Issue Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueInvoiceModal;
