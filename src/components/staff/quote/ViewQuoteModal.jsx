import { Fragment, useEffect, useState } from "react";
import { api } from "../../../lib/api";

const ViewQuoteModal = ({ quote, onClose }) => {
  const [details, setDetails] = useState(quote);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!quote?._id) return;

    let cancelled = false;
    setDetails(quote);
    setLoading(true);
    api(`quotes/${quote._id}`)
      .then((data) => {
        if (!cancelled) setDetails(data.data || data);
      })
      .catch(() => {
        if (!cancelled) setDetails(quote);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [quote]);

  if (!quote) return null;

  const view = details || quote;
  const currency = view.currency || "USD";
  const format = (n) => Number(n || 0).toFixed(2);
  const products = view.products || [];

  const qtySum = products.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
  const amountSum = products.reduce((sum, p) => {
    const amount =
      Number(p.amount) > 0
        ? Number(p.amount)
        : (Number(p.listPrice) || 0) * (Number(p.quantity) || 0);
    return sum + amount;
  }, 0);
  const taxSum = products.reduce((sum, p) => sum + (Number(p.taxAmount) || 0), 0);
  const lineTotalSum = products.reduce((sum, p) => sum + (Number(p.total) || 0), 0);

  return (
    <div className="fixed inset-0 bg-heading/40 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="flex justify-center px-4 py-8">
        <div className="bg-card border border-gray-200 rounded-xl w-full max-w-5xl text-heading shadow-2xl">
          <div className="px-6 py-5 border-b border-gray-200 bg-surface">
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-bodyText">
                  {view.quoteNumber ? `Quote #${view.quoteNumber}` : "Quotation"}
                </p>
                <h2 className="text-xl font-semibold text-heading mt-1">
                  {view.subject || "Quote Details"}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-bodyText">
                  <span>{view.account?.accountName || "No account"}</span>
                  {view.deal?.dealName && (
                    <>
                      <span>•</span>
                      <span>{view.deal.dealName}</span>
                    </>
                  )}
                  {view.quoteStage && (
                    <span className="px-2.5 py-0.5 rounded-full bg-brand/10 text-brand text-xs font-medium">
                      {view.quoteStage}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-bodyText hover:text-heading text-lg"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6 text-sm">
            {loading ? (
              <p className="text-center text-bodyText py-8">Loading quote details...</p>
            ) : (
              <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Info label="Subject" value={view.subject} />
              <Info label="Stage" value={view.quoteStage} />
              <Info label="Account" value={view.account?.accountName || "-"} />
              <Info label="Deal" value={view.deal?.dealName || "-"} />
              <Info
                label="Contact"
                value={
                  view.contact
                    ? `${view.contact.firstName || ""} ${view.contact.lastName || ""}`.trim() ||
                      "-"
                    : "-"
                }
              />
              <Info
                label="Valid Until"
                value={
                  view.validUntil
                    ? new Date(view.validUntil).toLocaleDateString()
                    : "-"
                }
              />
              <Info label="Currency" value={currency} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Snapshot label="Items" value={products.length} />
              <Snapshot label="Total Qty" value={qtySum} />
              <Snapshot
                label="Amount (ex tax)"
                value={`${currency} ${format(amountSum)}`}
              />
              <Snapshot
                label="Grand Total"
                value={`${currency} ${format(view.grandTotal)}`}
                highlight
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-bodyText font-medium">Products</h3>
                <p className="text-[11px] text-bodyText">
                  Amount = Unit Price × Qty · Line Total = Amount + product tax
                </p>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-300">
                <table className="pro-table min-w-[900px]">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Product / Description</th>
                      <th className="text-right">Unit Price</th>
                      <th className="text-right">Qty</th>
                      <th className="text-right">Amount</th>
                      <th className="text-right">Tax</th>
                      <th className="text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p, i) => {
                      const amount =
                        Number(p.amount) > 0
                          ? Number(p.amount)
                          : (Number(p.listPrice) || 0) *
                            (Number(p.quantity) || 0);
                      return (
                        <Fragment key={i}>
                          <tr>
                            <td className="text-center">{p.serialNo || i + 1}</td>
                            <td>
                              <div className="font-medium text-heading">
                                {p.productName}
                              </div>
                              {p.description ? (
                                <div className="text-xs text-bodyText mt-1">
                                  {p.description}
                                </div>
                              ) : null}
                              {(p.vendorPrice > 0 || p.margin > 0) && (
                                <div className="text-[11px] text-bodyText mt-1">
                                  Vendor {currency} {format(p.vendorPrice)} · Margin{" "}
                                  {format(p.margin)}% · WHT {format(p.withHolding)}%
                                </div>
                              )}
                            </td>
                            <td className="text-right whitespace-nowrap">
                              {currency} {format(p.listPrice)}
                            </td>
                            <td className="text-right">{p.quantity}</td>
                            <td className="text-right whitespace-nowrap font-medium">
                              {currency} {format(amount)}
                            </td>
                            <td className="text-right whitespace-nowrap">
                              {p.Tax?.length ? (
                                <div>
                                  <div className="text-xs text-bodyText">
                                    {p.Tax.map((t) => `${t.tax} ${t.percent}%`).join(
                                      ", ",
                                    )}
                                  </div>
                                  <div>{currency} {format(p.taxAmount)}</div>
                                </div>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="text-right whitespace-nowrap text-brand font-semibold">
                              {currency} {format(p.total)}
                            </td>
                          </tr>
                        </Fragment>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3}>Totals</td>
                      <td className="text-right">{qtySum}</td>
                      <td className="text-right whitespace-nowrap">
                        {currency} {format(amountSum)}
                      </td>
                      <td className="text-right whitespace-nowrap">
                        {taxSum > 0 ? `${currency} ${format(taxSum)}` : "-"}
                      </td>
                      <td className="text-right whitespace-nowrap text-brand">
                        {currency} {format(lineTotalSum)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="bg-card border border-gray-300 rounded-lg p-5 space-y-3">
              <Info
                label="Goods amount (ex tax)"
                value={`${currency} ${format(amountSum)}`}
              />
              {taxSum > 0 && (
                <Info
                  label="Product tax"
                  value={`${currency} ${format(taxSum)}`}
                />
              )}
              <Info
                label="Sub Total"
                value={`${currency} ${format(view.subTotal)}`}
              />

              {view.otherTax?.length > 0 && (
                <>
                  <div className="border-t border-gray-200 my-2" />
                  {view.otherTax.map((t, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-xs text-bodyText"
                    >
                      <span>
                        {t.tax} ({t.percent}%)
                      </span>
                      <span>
                        {currency}{" "}
                        {format((Number(view.subTotal || 0) * Number(t.percent || 0)) / 100)}
                      </span>
                    </div>
                  ))}
                </>
              )}

              <div className="border-t border-gray-200 pt-3">
                <Info
                  label="Grand Total"
                  value={`${currency} ${format(view.grandTotal)}`}
                  highlight
                />
              </div>
            </div>

            {view.description && (
              <div>
                <h3 className="text-bodyText mb-1">Notes</h3>
                <p className="text-bodyText">{view.description}</p>
              </div>
            )}

            {view.termsAndConditions?.length > 0 && (
              <div>
                <h3 className="text-bodyText mb-2">Terms & Conditions</h3>
                <div className="space-y-2">
                  {view.termsAndConditions.map((term, i) => (
                    <div
                      key={i}
                      className="bg-card border border-gray-200 rounded p-3 text-bodyText"
                    >
                      {term}
                    </div>
                  ))}
                </div>
              </div>
            )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Snapshot = ({ label, value, highlight }) => (
  <div className="border border-gray-300 rounded-lg px-3 py-2.5 bg-surface">
    <p className="text-[11px] uppercase tracking-wide text-bodyText">{label}</p>
    <p
      className={`text-sm font-semibold mt-1 ${
        highlight ? "text-brand" : "text-heading"
      }`}
    >
      {value}
    </p>
  </div>
);

const Info = ({ label, value, highlight }) => (
  <div className="flex justify-between border-b border-gray-200 pb-1">
    <span className="text-bodyText">{label}</span>
    <span className={highlight ? "text-brand font-semibold" : ""}>{value}</span>
  </div>
);

export default ViewQuoteModal;
