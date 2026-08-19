import { FULFILLMENT_LABELS } from "../lib/roles";

const TONE = {
  awaiting_approval: "bg-gray-100 text-bodyText",
  ready_for_operations: "bg-brand/10 text-brand",
  po_created: "bg-sky-50 text-sky-800",
  in_delivery: "bg-amber-50 text-amber-800",
  delivered: "bg-emerald-50 text-emerald-700",
  forwarded_to_finance: "bg-violet-50 text-violet-800",
  invoiced: "bg-brand text-white",
  draft: "bg-gray-100 text-bodyText",
  in_transit: "bg-amber-50 text-amber-800",
  Draft: "bg-gray-100 text-bodyText",
  Issued: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-red-50 text-red-700",
};

export default function StatusBadge({ value }) {
  if (!value) return <span className="text-bodyText">-</span>;
  const label = FULFILLMENT_LABELS[value] || String(value).replace(/_/g, " ");
  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
        TONE[value] || "bg-gray-100 text-bodyText"
      }`}
    >
      {label}
    </span>
  );
}
