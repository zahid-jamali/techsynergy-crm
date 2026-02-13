import { queryByTitle } from "@testing-library/dom";

const ViewQuoteModal = ({ quote, onClose }) => {
  if (!quote) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="flex justify-center px-4 py-8">
        <div className="bg-black border border-gray-800 rounded-lg w-full max-w-3xl text-white">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-red-500">
              Quote Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 text-sm">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Info label="Subject" value={quote.subject} />
              <Info label="Stage" value={quote.quoteStage} />
              <Info label="Account" value={quote.account?.accountName} />
              <Info
                label="Contact"
                value={
                  quote.contact
                    ? `${quote.contact.firstName} ${quote.contact.lastName}`
                    : "-"
                }
              />
              <Info
                label="Valid Until"
                value={
                  quote.validUntil
                    ? new Date(quote.validUntil).toLocaleDateString()
                    : "-"
                }
              />

              {/* GST Status */}
              <div className="flex justify-between border-b border-gray-800 pb-1">
                <span className="text-gray-400">GST</span>
                {quote.isGstApplied ? (
                  <span className="text-green-400 font-medium">
                    Applied (18%)
                  </span>
                ) : (
                  <span className="text-gray-500">Not Applied</span>
                )}
              </div>

              <div className="flex justify-between border-b border-gray-800 pb-1">
                <span className="text-gray-400">Currency</span>
                <span className="text-green-400 font-medium">
                  {quote.currency}
                </span>
              </div>
            </div>

            {/* Products */}
            <div>
              <h3 className="text-gray-400 mb-2">Products</h3>
              <div className="border border-gray-800 rounded overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-900 text-gray-400">
                    <tr>
                      <th className="p-2">#</th>
                      <th className="p-2 text-left">Product</th>
                      <th className="p-2">Qty</th>
                      <th className="p-2 text-right">Price</th>
                      <th className="p-2 text-right">Discount</th>
                      <th className="p-2 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.products.map((p, i) => (
                      <tr key={i} className="border-t border-gray-800">
                        <td className="p-2 text-center">{p.serialNo}</td>
                        <td className="p-2">{p.productName}</td>
                        <td className="p-2 text-center">{p.quantity}</td>
                        <td className="p-2 text-right">
                          {quote.currency}: {p.listPrice}
                        </td>
                        <td className="p-2 text-right">
                          {quote.currency}: {p.discount}
                        </td>
                        <td className="p-2 text-right">
                          {quote.currency}: {p.total}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-2 gap-4">
              <Info label="Sub Total" value={quote.subTotal} />
              <Info label="Discount" value={quote.discountTotal} />

              {quote.isGstApplied && (
                <Info label="GST (18%)" value={quote.gstAmount} />
              )}

              <Info label="Grand Total" value={quote.grandTotal} highlight />
            </div>

            {/* Notes */}
            {quote.description && (
              <div>
                <h3 className="text-gray-400 mb-1">Notes</h3>
                <p className="text-gray-300">{quote.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value, highlight }) => (
  <div className="flex justify-between border-b border-gray-800 pb-1">
    <span className="text-gray-400">{label}</span>
    <span className={highlight ? "text-red-400 font-semibold" : ""}>
      {value}
    </span>
  </div>
);

export default ViewQuoteModal;
