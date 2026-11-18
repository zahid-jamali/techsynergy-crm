/** Download an authenticated backend file (PDF / XLSX) to the user's device. */
export async function downloadFile(path, filename) {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}${path}`, {
    headers: { authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.msg || data.message || "Download failed");
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}

/** Open an authenticated PDF in a new browser tab for preview / print. */
export async function previewFile(path) {
  const token = sessionStorage.getItem("token");
  const tab = window.open("", "_blank");
  try {
    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}${path}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.msg || data.message || "Preview failed");
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(
      new Blob([blob], { type: "application/pdf" })
    );
    if (tab) tab.location.href = url;
    else window.location.href = url;
  } catch (err) {
    if (tab) tab.close();
    throw err;
  }
}
