import { useState } from "react";
import { downloadOrderDocument } from "../../lib/orderDocuments";

export default function OrderDocumentDownload({
  orderId,
  type,
  label,
  fileName,
  className = "text-emerald-700 hover:underline text-sm",
}) {
  const [busy, setBusy] = useState(false);

  if (!orderId) return null;

  const onClick = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await downloadOrderDocument(orderId, type, fileName);
    } catch (err) {
      window.alert(err.message || "Download failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button type="button" onClick={onClick} className={className} disabled={busy}>
      {busy ? "Downloading..." : label}
    </button>
  );
}
