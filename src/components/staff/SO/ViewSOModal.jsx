import React from "react";

const ViewSOModal = ({ order, onClose }) => {
  if (!order) return null;

  const currency = order.finalQuote?.currency || "";

  const formatCurrency = (value) =>
    `${currency} ${Number(value || 0).toLocaleString()}`;

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "-";

  const getStatusBadge = (status) => {
    if (status === "Approved")
      return (
        <span className="px-2 py-1 text-xs rounded bg-emerald-600">Approved</span>
      );

    if (status === "Rejected")
      return (
        <span className="px-2 py-1 text-xs rounded bg-brand">Rejected</span>
      );

    return (
      <span className="px-2 py-1 text-xs rounded bg-yellow-600">Pending</span>
    );
  };

  return (
    <div className="fixed inset-0 bg-heading/40 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="flex justify-center px-4 py-8">
        <div className="bg-card border border-gray-200 rounded-lg w-full max-w-4xl text-heading">
          {/* HEADER */}

          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-brand">
              Sales Order Details
            </h2>

            <button
              onClick={onClose}
              className="text-bodyText hover:text-heading"
            >
              ✕
            </button>
          </div>

          {/* BODY */}

          <div className="p-6 space-y-6 text-sm">
            {/* BASIC INFO */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Info label="Subject" value={order.finalQuote?.subject} />

              <Info label="Stage" value={order.finalQuote?.quoteStage} />

              <Info
                label="Account"
                value={order.finalQuote?.account?.accountName}
              />

              <Info
                label="Contact"
                value={
                  order.finalQuote?.contact
                    ? `${order.finalQuote.contact.firstName} ${order.finalQuote.contact.lastName}`
                    : "-"
                }
              />

              <Info label="Deal" value={order.finalQuote?.deal?.dealName} />

              <Info
                label="Confirmed Date"
                value={formatDate(order.confirmedDate)}
              />

              <div className="flex justify-between border-b border-gray-200 pb-1">
                <span className="text-bodyText">Status</span>

                {getStatusBadge(order.status)}
              </div>
            </div>

            {/* PRODUCTS */}

            <div>
              <h3 className="text-bodyText mb-2">Products</h3>

              <div className="border border-gray-200 rounded overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-card text-bodyText">
                    <tr>
                      <th className="p-2">#</th>

                      <th className="p-2 text-left">Product</th>

                      <th className="p-2 text-left">Description</th>

                      <th className="p-2">Qty</th>

                      <th className="p-2 text-right">Price</th>

                      <th className="p-2 text-right">Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {order.products.map((p, i) => (
                      <>
                        {/* MAIN ROW */}
                        <tr
                          key={`row-${i}`}
                          className="border-t border-gray-200 hover:bg-surface transition"
                        >
                          <td className="p-2 text-center">{i + 1}</td>

                          <td className="p-2 font-medium">{p.productName}</td>

                          <td className="p-2 text-bodyText">
                            {p.description || "-"}
                          </td>

                          <td className="p-2 text-center">{p.quantity}</td>

                          <td className="p-2 text-right">
                            {formatCurrency(p.listPrice)}
                          </td>

                          <td className="p-2 text-right font-semibold text-red-400">
                            {formatCurrency(p.total)}
                          </td>
                        </tr>

                        {/* 🔥 PRODUCT TAX ROW */}
                        {p.Tax?.length > 0 && (
                          <tr className="bg-surface text-xs">
                            <td></td>
                            <td colSpan="5" className="px-4 pb-2 text-bodyText">
                              <div className="flex flex-wrap gap-2">
                                {p.Tax.map((t, ti) => (
                                  <span
                                    key={ti}
                                    className="bg-surface px-2 py-1 rounded"
                                  >
                                    {t.tax} ({t.percent}%)
                                  </span>
                                ))}
                              </div>

                              <div className="flex justify-end mt-1 text-bodyText">
                                Tax: {formatCurrency(p.taxAmount)}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TOTALS */}

            <div className="grid grid-cols-2 gap-4">
              <Info label="Sub Total" value={formatCurrency(order.subtotal)} />

              {order.otherTax?.length > 0 && (
                <>
                  {order.otherTax.map((t, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-xs text-bodyText"
                    >
                      <span>
                        {t.tax} ({t.percent}%)
                      </span>

                      <span>
                        {formatCurrency((order.subtotal * t.percent) / 100)}
                      </span>
                    </div>
                  ))}

                  <Info
                    label="Total Tax"
                    value={formatCurrency(order.otherTaxAmount)}
                  />
                </>
              )}

              <Info label="Discount" value={formatCurrency(order.discount)} />

              <Info
                label="Grand Total"
                value={formatCurrency(order.grandTotal)}
                highlight
              />
            </div>

            {/* NOTES */}

            {order.products?.length > 0 && (
              <div>
                <h3 className="text-bodyText mb-1">Summary</h3>

                <p className="text-bodyText">
                  {order.products.length} product
                  {order.products.length > 1 ? "s" : ""} included in this sales
                  order.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value, highlight }) => (
  <div className="flex justify-between border-b border-gray-200 pb-1">
    <span className="text-bodyText">{label}</span>

    <span className={highlight ? "text-red-400 font-semibold" : ""}>
      {value || "-"}
    </span>
  </div>
);

export default ViewSOModal;
