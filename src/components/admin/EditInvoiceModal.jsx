const EditInvoiceModal = ({ invoice, onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");

  const submit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);

    await fetch(`${process.env.REACT_APP_BACKEND_URL}invoice/${invoice._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(Object.fromEntries(form)),
    });

    onSuccess();
    onClose();
  };

  const isEditable = invoice.status === "Draft";

  return (
    <div className="fixed inset-0 bg-heading/40 flex items-center justify-center z-50">
      <form
        onSubmit={submit}
        className="bg-card text-heading w-[480px] rounded-xl border border-gray-200 p-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold">Edit Invoice</h2>
            <p className="text-xs text-bodyText">
              Invoice #{invoice.invoiceNumber}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-bodyText hover:text-heading"
          >
            ✕
          </button>
        </div>

        {/* Warning if not Draft */}
        {!isEditable && (
          <div className="bg-yellow-600/10 border border-yellow-600/30 rounded p-3 mb-4">
            <p className="text-sm text-amber-700">
              Only draft invoices can be edited.
            </p>
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="text-sm text-bodyText">
              Customer Purchase Order No
            </label>
            <input
              name="customerRefNo"
              defaultValue={invoice.customerRefNo}
              disabled={!isEditable}
              className="w-full bg-surface border border-gray-200 rounded px-3 py-2 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="text-sm text-bodyText">Description</label>
            <textarea
              name="description"
              rows={4}
              defaultValue={invoice.description}
              disabled={!isEditable}
              className="w-full bg-surface border border-gray-200 rounded px-3 py-2 disabled:opacity-60"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded hover:bg-surface"
          >
            Cancel
          </button>

          {isEditable && (
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded"
            >
              Update Invoice
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default EditInvoiceModal;
