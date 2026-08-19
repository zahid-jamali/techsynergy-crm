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
    <div className="fixed inset-0 bg-heading/40 flex items-center justify-center z-50">
      <div className="bg-card text-heading w-[420px] rounded-xl border border-gray-200 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Issue Invoice</h2>
          <button onClick={onClose} className="text-bodyText hover:text-heading">
            ✕
          </button>
        </div>

        {/* Warning */}
        <div className="bg-yellow-600/10 border border-yellow-600/30 rounded p-3 mb-4">
          <p className="text-sm text-amber-700">
            Once issued, this invoice will be locked and cannot be edited.
          </p>
        </div>

        {/* Invoice Info */}
        <div className="text-sm text-bodyText mb-6 space-y-1">
          <div>
            <span className="text-bodyText">Invoice #:</span>{" "}
            {invoice.invoiceNumber}
          </div>
          <div>
            <span className="text-bodyText">Status:</span> {invoice.status}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded hover:bg-surface"
          >
            Cancel
          </button>

          <button
            onClick={issue}
            className="px-5 py-2 bg-emerald-600 hover:bg-green-700 rounded"
          >
            Issue Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueInvoiceModal;
