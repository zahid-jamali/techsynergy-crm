const ViewPOToVendorModal = ({ po, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-black border border-gray-800 rounded-lg w-full max-w-3xl text-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-800 flex justify-between">
          <h2 className="text-red-500 font-semibold">
            Purchase Order — {po.poToNumber}
          </h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 text-sm max-h-[70vh] overflow-y-auto">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <p>
              <span className="text-gray-400">Subject:</span>{" "}
              <span className="text-white">{po.subject}</span>
            </p>

            <p>
              <span className="text-gray-400">Created On:</span>{" "}
              {new Date(po.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Description */}
          {po.description && (
            <div>
              <p className="text-gray-400 mb-1">Description</p>
              <p className="bg-gray-900 border border-gray-800 rounded p-3">
                {po.description}
              </p>
            </div>
          )}

          {/* Products */}
          <div>
            <p className="text-gray-400 mb-2">Products</p>

            <div className="border border-gray-800 rounded overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-900 text-gray-400">
                  <tr>
                    <th className="p-2 text-left">#</th>
                    <th className="p-2 text-left">Product</th>
                    <th className="p-2 text-right">Qty</th>
                    <th className="p-2 text-right">Unit Price</th>
                    <th className="p-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {po.products.map((p, index) => (
                    <tr key={index} className="border-t border-gray-800">
                      <td className="p-2">{p.serialNo}</td>
                      <td className="p-2">{p.productName}</td>
                      <td className="p-2 text-right">{p.quantity}</td>
                      <td className="p-2 text-right">
                        {p.listPrice.toLocaleString()}
                      </td>
                      <td className="p-2 text-right">
                        {p.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span>{po.subTotal.toLocaleString()}</span>
              </div>

              {po.isGstApplied && (
                <div className="flex justify-between">
                  <span className="text-gray-400">GST ({po.gstRate}%)</span>
                  <span>{po.gstAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between font-semibold border-t border-gray-700 pt-2">
                <span>Grand Total</span>
                <span>{po.grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewPOToVendorModal;
