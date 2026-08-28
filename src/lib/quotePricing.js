export const DEFAULT_WHT = 5.5;

export const round = (n) => Math.round((Number(n) || 0) * 100) / 100;

export const emptyQuoteProduct = () => ({
  productName: "",
  description: "",
  quantity: 1,
  vendorPrice: 0,
  margin: 0,
  withHolding: DEFAULT_WHT,
  listPrice: 0,
  priceAfterMargin: 0,
  withHoldingAmount: 0,
  suggestedPrice: null,
  Tax: [],
});

export function priceFromCosting({ vendorPrice, margin, withHolding }) {
  const cost = Math.max(0, Number(vendorPrice) || 0);
  const marginPct = Math.max(0, Number(margin) || 0);
  const whtPct = Math.max(0, Number(withHolding) || 0);
  const priceAfterMargin = round(cost + (cost * marginPct) / 100);
  const withHoldingAmount = round((priceAfterMargin * whtPct) / 100);
  const listPrice = round(priceAfterMargin + withHoldingAmount);
  return { priceAfterMargin, withHoldingAmount, listPrice };
}

export function calculateLine(p = {}) {
  const vendorPrice = Math.max(0, Number(p.vendorPrice ?? p.purchasePrice) || 0);
  const costing = priceFromCosting({
    vendorPrice,
    margin: p.margin,
    withHolding: p.withHolding === "" || p.withHolding === undefined ? DEFAULT_WHT : p.withHolding,
  });
  const listPrice =
    vendorPrice > 0 ? costing.listPrice : round(Math.max(0, Number(p.listPrice) || 0));
  const qty = Math.max(0, Number(p.quantity) || 0);
  const amount = round(qty * listPrice);
  let taxAmount = 0;
  (p.Tax || []).forEach((t) => {
    taxAmount += (amount * (Number(t.percent) || 0)) / 100;
  });
  taxAmount = round(taxAmount);
  return {
    vendorPrice,
    priceAfterMargin: vendorPrice > 0 ? costing.priceAfterMargin : listPrice,
    withHoldingAmount: vendorPrice > 0 ? costing.withHoldingAmount : 0,
    listPrice,
    amount,
    taxAmount,
    total: round(amount + taxAmount),
  };
}

export function quoteDownloadName(quote, ext = "pdf", prefix = "") {
  const clean = (value, max = 56) =>
    String(value || "")
      .trim()
      .replace(/[<>:"/\\|?*]/g, "")
      .slice(0, max);
  const parts = [
    quote?.quoteNumber ? `Q-${quote.quoteNumber}` : null,
    clean(quote?.subject),
    clean(quote?.account?.accountName),
  ].filter(Boolean);
  let base = parts.join(" - ") || "quotation";
  if (prefix) base = `${prefix} - ${base}`;
  return `${base}.${ext}`;
}

export async function downloadQuoteCosting(quoteId, filename) {
  const token = sessionStorage.getItem("token");
  const res = await fetch(
    `${process.env.REACT_APP_BACKEND_URL}quotes/${quoteId}/costing-sheet`,
    { headers: { authorization: `Bearer ${token}` } },
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.msg || "Failed to download costing sheet");
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "costing-sheet.xlsx";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
