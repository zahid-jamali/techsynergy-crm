const ViewInvoiceModal = ({ invoice, onClose }) => {
  const { sellOrder } = invoice;

  return (
    <div className="fixed inset-0 bg-heading/40 flex items-center justify-center z-50">
      <div className="bg-card text-heading w-[1000px] max-h-[90vh] overflow-y-auto rounded-xl p-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">
              Invoice #{invoice.invoiceNumber}
            </h2>
            <p className="text-sm text-bodyText">
              Created on {new Date(invoice.documentDate).toLocaleDateString()}
            </p>
          </div>

          <button onClick={onClose} className="text-bodyText hover:text-heading">
            ✕
          </button>
        </div>

        {/* BASIC INFO */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <Info label="Customer PO">{invoice.customerRefNo || "-"}</Info>

          <Info label="Status">
            <span className="px-2 py-1 rounded text-xs bg-yellow-600/20 text-amber-700">
              {invoice.status}
            </span>
          </Info>

          <Info label="Account">{sellOrder?.account?.accountName}</Info>

          <Info label="Contact">
            {sellOrder?.contact?.firstName} {sellOrder?.contact?.lastName}
          </Info>
        </div>

        {/* DESCRIPTION */}
        {invoice.description && (
          <Section title="Invoice Description">
            <p className="text-sm text-bodyText">{invoice.description}</p>
          </Section>
        )}

        {/* PRODUCTS TABLE */}
        <Section title="Products">
          <table className="w-full text-sm">
            <thead className="bg-surface text-bodyText">
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Product</th>
                <th className="p-2 text-right">Qty</th>
                <th className="p-2 text-right">Price</th>
                <th className="p-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {sellOrder.products.map((p, i) => (
                <tr key={i} className="border-t border-gray-200">
                  <td className="p-2">{p.serialNo}</td>
                  <td className="p-2">{p.productName}</td>
                  <td className="p-2 text-right">{p.quantity}</td>
                  <td className="p-2 text-right">
                    {p.listPrice.toLocaleString()}
                  </td>
                  <td className="p-2 text-right">{p.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* TOTALS */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          <div />

          <div className="space-y-2 text-sm">
            <Row label="Sub Total">{sellOrder.subTotal.toLocaleString()}</Row>

            {sellOrder.isGstApplied && (
              <Row label={`GST (${sellOrder.gstRate}%)`}>
                {sellOrder.gstAmount.toLocaleString()}
              </Row>
            )}

            <Row label="Grand Total" bold>
              {sellOrder.grandTotal.toLocaleString()}
            </Row>
          </div>
        </div>

        {/* TERMS */}
        {(invoice.termsAndConditions.length > 0 ||
          sellOrder.termsAndConditions.length > 0) && (
          <Section title="Terms & Conditions">
            <ul className="list-disc ml-5 text-sm text-bodyText space-y-1">
              {sellOrder.termsAndConditions.map((t, i) => (
                <li key={`q-${i}`}>{t}</li>
              ))}
              {invoice.termsAndConditions.map((t, i) => (
                <li key={`i-${i}`}>{t}</li>
              ))}
            </ul>
          </Section>
        )}

        {/* FOOTER */}
        <div className="flex justify-end mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* ======================
     Helper Components
  ====================== */
const Section = ({ title, children }) => (
  <div className="mt-6">
    <h3 className="text-sm font-semibold text-bodyText mb-2">{title}</h3>
    <div className="bg-surface border border-gray-200 rounded p-4">
      {children}
    </div>
  </div>
);

const Info = ({ label, children }) => (
  <div>
    <p className="text-xs text-bodyText">{label}</p>
    <p className="text-sm">{children}</p>
  </div>
);

const Row = ({ label, children, bold }) => (
  <div className="flex justify-between">
    <span className="text-bodyText">{label}</span>
    <span className={bold ? "font-semibold" : ""}>{children}</span>
  </div>
);

export default ViewInvoiceModal;
