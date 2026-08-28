export async function downloadOrderDocument(orderId, type, filename) {
  const token = sessionStorage.getItem("token");
  const path =
    type === "invoice"
      ? `invoice/${orderId}/pdf`
      : `invoice/${orderId}/deliveryNote`;

  const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}${path}`, {
    headers: { authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || data.msg || "Download failed");
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download =
    filename ||
    (type === "invoice" ? `invoice-${orderId}.pdf` : `delivery-note-${orderId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
