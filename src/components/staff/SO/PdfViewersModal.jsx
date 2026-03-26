import React, { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const PdfViewersModal = ({ pdfUrl, onClose }) => {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* Ensure extension */

  const safePdfUrl = pdfUrl?.endsWith(".pdf") ? pdfUrl : `${pdfUrl}`;

  useEffect(() => {
    if (!safePdfUrl) return;

    setPageNumber(1);
    setLoading(true);
    setError(null);

    const downloadAndPrefetch = async () => {
      try {
        const response = await fetch(safePdfUrl);

        if (!response.ok) throw new Error("Failed to fetch PDF");

        const blob = await response.blob();

        /* Auto download */

        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = blobUrl;
        link.download = "purchase-order.pdf";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(blobUrl);
      } catch (err) {
        console.error("Auto download failed:", err);
      }
    };

    downloadAndPrefetch();
  }, [safePdfUrl]);

  /* ================= VIEWER EVENTS ================= */

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (err) => {
    console.error("PDF load error:", err);
    setError("Failed to load PDF");
    setLoading(false);
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h3>Purchase Order PDF</h3>

          <button onClick={onClose} style={btnStyle}>
            Close
          </button>
        </div>

        {/* VIEWER */}

        <div style={viewerStyle}>
          {loading && <div style={{ padding: 20 }}>Loading PDF...</div>}

          {error && (
            <div
              style={{
                padding: 20,
                color: "red",
              }}
            >
              {error}
            </div>
          )}

          {!error && (
            <Document
              file={{
                url: safePdfUrl,
                withCredentials: false,
              }}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading=""
            >
              <Page pageNumber={pageNumber} />
            </Document>
          )}
        </div>

        {/* PAGINATION */}

        <div style={paginationStyle}>
          <button
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber((p) => p - 1)}
          >
            Prev
          </button>

          <span>
            Page {pageNumber} of {numPages}
          </span>

          <button
            disabled={pageNumber >= numPages}
            onClick={() => setPageNumber((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default PdfViewersModal;

/* ================= STYLES ================= */

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.75)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modalStyle = {
  background: "#fff",
  width: "85%",
  height: "92%",
  borderRadius: "12px",
  display: "flex",
  flexDirection: "column",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  padding: "12px 20px",
  borderBottom: "1px solid #ccc",
};

const viewerStyle = {
  flex: 1,
  overflow: "auto",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const paginationStyle = {
  padding: "12px",
  textAlign: "center",
};

const btnStyle = {
  padding: "6px 14px",
  cursor: "pointer",
};
