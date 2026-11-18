// Mirror of backend-crm/lib/fbr/tax.js so totals update live while editing.
// The server recomputes on save; these numbers are for display only.

export const round2 = (n) => Math.round((Number(n) || 0) * 100 + Number.EPSILON) / 100;

export const parseRate = (rate) => {
  const raw = String(rate ?? "").trim();
  if (!raw || /exempt/i.test(raw)) return { percent: 0, perUnit: 0 };
  const pct = raw.match(/(\d+(?:\.\d+)?)\s*%/);
  const per = raw.match(/Rs\.?\s*(\d+(?:\.\d+)?)\s*per/i);
  return { percent: pct ? Number(pct[1]) : 0, perUnit: per ? Number(per[1]) : 0 };
};

export const computeLine = (line = {}, tax = {}) => {
  const quantity = Number(line.quantity) || 0;
  const unitPrice = Number(line.unitPrice) || 0;
  const discount = round2(line.discount);
  const gross = round2(quantity * unitPrice);
  const valueExclST = round2(Math.max(0, gross - discount));
  const fixed = round2(line.fixedNotifiedValue);
  const { percent, perUnit } = parseRate(tax.rate);
  const third = /3rd schedule/i.test(tax.saleType || "");
  const base = third && fixed > 0 ? fixed : valueExclST;
  const salesTax = round2((base * percent) / 100 + perUnit * quantity * (1 + percent / 100));
  const furtherTax = round2((valueExclST * (Number(tax.furtherTaxPercent) || 0)) / 100);
  const extra = round2(line.extraTax) + round2(line.fedPayable);
  return {
    gross,
    discount,
    valueExclST,
    salesTax,
    furtherTax,
    total: round2(valueExclST + salesTax + furtherTax + extra),
  };
};

export const computeTotals = (lines = [], tax = {}) =>
  lines.reduce(
    (acc, l) => {
      const c = computeLine(l, tax);
      acc.gross += c.gross;
      acc.discount += c.discount;
      acc.valueExclST += c.valueExclST;
      acc.salesTax += c.salesTax;
      acc.furtherTax += c.furtherTax;
      acc.extra += round2(l.extraTax) + round2(l.fedPayable);
      acc.total += c.total;
      return acc;
    },
    { gross: 0, discount: 0, valueExclST: 0, salesTax: 0, furtherTax: 0, extra: 0, total: 0 }
  );

export const FURTHER_TAX_DEFAULT = 4; // % on supplies to unregistered persons
