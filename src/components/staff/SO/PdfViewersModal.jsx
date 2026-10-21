import { useState } from "react";
import { Download, ExternalLink, ZoomIn, ZoomOut, RotateCcw, X, FileText, Image as ImageIcon } from "lucide-react";

const PdfViewersModal = ({ pdfUrl, title = "Purchase Order Document", onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [useGoogleFallback, setUseGoogleFallback] = useState(false);

  const rawUrl = typeof pdfUrl === "object" ? pdfUrl?.url || "" : pdfUrl || "";
  const docTitle = typeof pdfUrl === "object" ? pdfUrl?.title || title : title;

  // Clean Cloudinary URL to prevent automatic attachment download
  const cleanUrl = rawUrl
    ? rawUrl
        .replace(/\/fl_attachment[^/]*\//g, "/")
        .replace(/\/upload\/fl_attachment\//g, "/upload/")
    : "";

  // Determine file type
  const pathWithoutQuery = cleanUrl.split(/[#?]/)[0];
  const ext = pathWithoutQuery.split(".").pop().toLowerCase();

  const isImage =
    ["jpg", "jpeg", "png", "webp", "gif", "svg", "bmp"].includes(ext) ||
    (cleanUrl.includes("/image/upload/") && !cleanUrl.includes(".pdf"));

  const isOfficeDoc = ["doc", "docx", "xls", "xlsx", "ppt", "pptx", "csv"].includes(ext);

  const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
    cleanUrl
  )}&embedded=true`;

  const handleDownload = async () => {
    if (!cleanUrl) return;
    try {
      const res = await fetch(cleanUrl);
      if (!res.ok) throw new Error("Fetch failed");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      const downloadExt = isImage ? ext || "jpg" : isOfficeDoc ? ext : "pdf";
      a.download = `Purchase-Order-${Date.now()}.${downloadExt}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      // Fallback direct link
      const a = document.createElement("a");
      a.href = cleanUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.download = `PO-${Date.now()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  if (!cleanUrl) return null;

  return (
    <div className="fixed inset-0 bg-heading/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-card border border-gray-200 rounded-2xl w-full max-w-6xl h-[92vh] flex flex-col shadow-2xl overflow-hidden text-heading">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-surface">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-brand/10 text-brand flex-shrink-0">
              {isImage ? <ImageIcon size={20} /> : <FileText size={20} />}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-base truncate">{docTitle}</h3>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-bodyText">
                <span className="uppercase font-mono font-medium tracking-wide px-1.5 py-0.5 rounded bg-gray-200 text-heading text-[10px]">
                  {isImage ? "Image" : isOfficeDoc ? "Document" : "PDF"}
                </span>
                <span>•</span>
                <span>Online Document Viewer</span>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-2">
            {isImage && (
              <div className="flex items-center gap-1 mr-2 bg-card border border-gray-200 rounded-lg p-1">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="p-1.5 hover:bg-surface rounded text-bodyText hover:text-heading"
                  title="Zoom Out"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="text-xs font-mono px-1 min-w-[3rem] text-center text-bodyText">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-1.5 hover:bg-surface rounded text-bodyText hover:text-heading"
                  title="Zoom In"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="p-1.5 hover:bg-surface rounded text-bodyText hover:text-heading ml-1 border-l border-gray-200"
                  title="Reset Zoom"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            )}

            {!isImage && !isOfficeDoc && (
              <button
                type="button"
                onClick={() => setUseGoogleFallback(!useGoogleFallback)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-bodyText hover:text-heading hover:bg-surface"
                title="Switch preview mode if document fails to render"
              >
                {useGoogleFallback ? "Native Preview" : "Google Docs Preview"}
              </button>
            )}

            <a
              href={cleanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-bodyText hover:text-heading hover:bg-surface"
              title="Open in new tab"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">New Tab</span>
            </a>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand hover:bg-brand/90 text-white text-xs font-semibold shadow-sm transition"
              title="Download file to computer"
            >
              <Download size={14} />
              <span>Download</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-bodyText hover:text-heading hover:bg-gray-100 rounded-lg transition ml-1"
              title="Close viewer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* VIEWER AREA */}
        <div className="flex-1 bg-gray-100 overflow-auto flex items-center justify-center p-4 relative">
          {isImage ? (
            <div className="max-w-full max-h-full overflow-auto flex items-center justify-center">
              <img
                src={cleanUrl}
                alt={docTitle}
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "center center",
                  transition: "transform 0.15s ease-out",
                }}
                className="max-w-full max-h-[78vh] object-contain rounded shadow-lg bg-white"
              />
            </div>
          ) : isOfficeDoc || useGoogleFallback ? (
            <iframe
              src={googleDocsViewerUrl}
              title={docTitle}
              className="w-full h-full rounded-lg bg-white border border-gray-200 shadow-inner"
            />
          ) : (
            <object
              data={cleanUrl}
              type="application/pdf"
              className="w-full h-full rounded-lg bg-white border border-gray-200 shadow-inner"
            >
              {/* Fallback if object is not supported or blocked */}
              <iframe
                src={googleDocsViewerUrl}
                title={docTitle}
                className="w-full h-full rounded-lg bg-white border border-gray-200"
              />
            </object>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfViewersModal;
