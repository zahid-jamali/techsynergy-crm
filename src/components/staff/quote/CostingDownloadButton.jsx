import { useState } from "react";
import { downloadQuoteCosting } from "../../../lib/quotePricing";

export default function CostingDownloadButton({ quote, className = "" }) {
  const [busy, setBusy] = useState(false);

  const onClick = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await downloadQuoteCosting(
        quote._id,
        `Costing-${quote.quoteNumber || quote.subject || quote._id}.xlsx`,
      );
    } catch (err) {
      window.alert(err.message || "Failed to download costing sheet");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={className || "text-sky-700 hover:underline"}
      title="Download internal costing sheet"
    >
      {busy ? "Costing..." : "Costing"}
    </button>
  );
}
