const ViewPOToVendorModal = ({ po, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-black border border-gray-800 rounded-lg w-full max-w-4xl text-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-800 flex justify-between">
          <h2 className="text-red-500 font-semibold">
            Purchase Order — {po.poToNumber}
          </h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-6 text-sm max-h-[75vh] overflow-y-auto">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <p>
              <span className="text-gray-400">Subject:</span> {po.subject}
            </p>

            <p>
              <span className="text-gray-400">Created On:</span>{" "}
              {new Date(po.createdAt).toLocaleDateString()}
            </p>

            <p>
              <span className="text-gray-400">Deal:</span>{" "}
              {po.refQuote?.deal?.dealName || "-"}
            </p>

            <p>
              <span className="text-gray-400">Account:</span>{" "}
              {po.refQuote?.account?.accountName || "-"}
            </p>

            <p>
              <span className="text-gray-400">Contact Email:</span>{" "}
              {po.refQuote?.contact?.email || "-"}
            </p>

            <p>
              <span className="text-gray-400">Contact Phone:</span>{" "}
              {po.refQuote?.contact?.phone || "-"}
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
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>

                <tbody>
                  {po.products?.map((p, index) => (
                    <tr key={index} className="border-t border-gray-800">
                      <td className="p-2">{p.serialNo}</td>

                      <td className="p-2">{p.productName}</td>

                      <td className="p-2 text-right">{p.quantity}</td>

                      <td className="p-2 text-right">
                        {p.listPrice?.toLocaleString()}
                      </td>

                      <td className="p-2 text-right">
                        {p.amount?.toLocaleString()}
                      </td>

                      <td className="p-2 text-right">
                        {p.total?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Taxes */}
          {po.Tax?.length > 0 && (
            <div>
              <p className="text-gray-400 mb-2">Taxes</p>

              <div className="border border-gray-800 rounded p-3 bg-gray-900 space-y-1">
                {po.Tax.map((t, i) => (
                  <div key={i} className="flex justify-between">
                    <span>
                      {t.tax} ({t.percent}%)
                    </span>

                    <span>
                      {((po.subTotal * t.percent) / 100).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>

                <span>{po.subTotal?.toLocaleString()}</span>
              </div>

              {po.Tax?.map((t, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-gray-400">
                    {t.tax} ({t.percent}%)
                  </span>

                  <span>
                    {((po.subTotal * t.percent) / 100).toLocaleString()}
                  </span>
                </div>
              ))}

              <div className="flex justify-between font-semibold border-t border-gray-700 pt-2 text-red-500">
                <span>Grand Total</span>

                <span>{po.grandTotal?.toLocaleString()}</span>
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
