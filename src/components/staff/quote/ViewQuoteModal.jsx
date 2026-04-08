const ViewQuoteModal = ({ quote, onClose }) => {
  if (!quote) return null;

  const currency = quote.currency || "USD";

  const calculateTaxValue = (percent) => {
    return (Number(quote.subTotal) * Number(percent || 0)) / 100;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="flex justify-center px-4 py-8">
        <div className="bg-black border border-gray-800 rounded-lg w-full max-w-3xl text-white">
          {/* HEADER */}

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

          {/* BODY */}

          <div className="p-6 space-y-6 text-sm">
            {/* SUMMARY */}

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

              <Info label="Currency" value={currency} />
            </div>

            {/* PRODUCTS */}

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
                      <th className="p-2 text-right">Line Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {quote.products.map((p, i) => (
                      <tr
                        key={i}
                        className="border-t border-gray-800 align-top"
                      >
                        <td className="p-2 text-center">
                          {p.serialNo || i + 1}
                        </td>

                        <td className="p-2">
                          <div className="font-medium text-white">
                            {p.productName}
                          </div>

                          {p.description && (
                            <div className="text-xs text-gray-400 mt-1">
                              {p.description}
                            </div>
                          )}
                        </td>

                        <td className="p-2 text-center">{p.quantity}</td>

                        <td className="p-2 text-right">
                          {currency} {Number(p.listPrice).toFixed(2)}
                        </td>

                        <td className="p-2 text-right font-semibold text-red-400">
                          {currency} {Number(p.total).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TOTALS */}

            <div className="bg-[#0f172a] border border-gray-800 rounded-lg p-5 space-y-3">
              <Info
                label="Sub Total"
                value={`${currency} ${Number(quote.subTotal).toFixed(2)}`}
              />

              {/* OTHER TAXES */}

              {quote.otherTax && quote.otherTax.length > 0 && (
                <>
                  <div className="border-t border-gray-700 my-2" />

                  {quote.otherTax.map((t, i) => (
                    <Info
                      key={i}
                      label={`${t.tax} (${t.percent}%)`}
                      value={`${currency} ${calculateTaxValue(
                        t.percent
                      ).toFixed(2)}`}
                    />
                  ))}

                  <Info
                    label="Total Tax"
                    value={`${currency} ${Number(quote.taxAmount).toFixed(2)}`}
                  />
                </>
              )}

              <div className="border-t border-gray-700 pt-3">
                <Info
                  label="Grand Total"
                  value={`${currency} ${Number(quote.grandTotal).toFixed(2)}`}
                  highlight
                />
              </div>
            </div>

            {/* NOTES */}

            {quote.description && (
              <div>
                <h3 className="text-gray-400 mb-1">Notes</h3>

                <p className="text-gray-300">{quote.description}</p>
              </div>
            )}

            {/* TERMS */}

            {quote.termsAndConditions &&
              quote.termsAndConditions.length > 0 && (
                <div>
                  <h3 className="text-gray-400 mb-2">Terms & Conditions</h3>

                  <div className="space-y-2">
                    {quote.termsAndConditions.map((term, i) => (
                      <div
                        key={i}
                        className="bg-[#0f172a] border border-gray-800 rounded p-3 text-gray-300 text-sm"
                      >
                        {term}
                      </div>
                    ))}
                  </div>
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
