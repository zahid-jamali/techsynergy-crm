import React, { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

/* ================= PDF WORKER ================= */

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

/* ================= COMPONENT ================= */

const PdfViewersModal = ({ pdfUrl, onClose }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const safePdfUrl = pdfUrl?.endsWith(".pdf") ? pdfUrl : `${pdfUrl}`;

  /* ================= FETCH PDF ================= */

  useEffect(() => {
    if (!safePdfUrl) return;

    let url;

    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        setPageNumber(1);

        const response = await fetch(safePdfUrl);

        if (!response.ok) {
          throw new Error("Failed to fetch PDF");
        }

        const blob = await response.blob();

        url = URL.createObjectURL(blob);

        setBlobUrl(url);
      } catch (err) {
        console.error("PDF fetch error:", err);

        setError("Failed to load PDF");

        setLoading(false);
      }
    };

    loadPdf();

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [safePdfUrl]);

  /* ================= EVENTS ================= */

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (err) => {
    console.error("PDF load error:", err);

    setError("Unable to display PDF");

    setLoading(false);
  };

  /* ================= DOWNLOAD ================= */

  const handleDownload = () => {
    if (!blobUrl) return;

    const link = document.createElement("a");

    link.href = blobUrl;

    link.download = `purchase-order-${Date.now()}.pdf`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  /* ================= PAGINATION ================= */

  const handlePrev = () => {
    setPageNumber((p) => Math.max(p - 1, 1));
  };

  const handleNext = () => {
    setPageNumber((p) => Math.min(p + 1, numPages));
  };

  /* ================= RENDER ================= */

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        {/* HEADER */}

        <div style={headerStyle}>
          <h3 style={{ margin: 0 }}>Purchase Order PDF</h3>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleDownload} style={primaryBtnStyle}>
              Download
            </button>

            <button onClick={onClose} style={btnStyle}>
              Close
            </button>
          </div>
        </div>

        {/* VIEWER */}

        <div style={viewerStyle}>
          {loading && <div style={loadingStyle}>Loading PDF...</div>}

          {error && (
            <div style={errorStyle}>
              {error}

              <br />

              <button
                onClick={handleDownload}
                style={{
                  marginTop: 12,
                  padding: "8px 14px",
                  cursor: "pointer",
                }}
              >
                Download Instead
              </button>
            </div>
          )}

          {!error && blobUrl && (
            <Document
              file={blobUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading=""
            >
              <Page pageNumber={pageNumber} width={900} />
            </Document>
          )}
        </div>

        {/* PAGINATION */}

        <div style={paginationStyle}>
          <button
            disabled={pageNumber <= 1}
            onClick={handlePrev}
            style={btnStyle}
          >
            Prev
          </button>

          <span style={{ margin: "0 15px" }}>
            Page {pageNumber} of {numPages}
          </span>

          <button
            disabled={pageNumber >= numPages}
            onClick={handleNext}
            style={btnStyle}
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
  background: "rgba(0,0,0,0.85)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modalStyle = {
  background: "#0b0b0b",
  width: "85%",
  height: "92%",
  borderRadius: "14px",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  border: "1px solid #222",
  boxShadow: "0 0 30px rgba(0,0,0,0.6)",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 22px",
  borderBottom: "1px solid #222",
  background: "#111",
  color: "#fff",
  fontWeight: 600,
};

const viewerStyle = {
  flex: 1,
  overflow: "auto",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  padding: "24px",
  background: "#000",
};

const paginationStyle = {
  padding: "16px",
  textAlign: "center",
  borderTop: "1px solid #222",
  background: "#111",
  color: "#fff",
  fontWeight: 500,
};

const btnStyle = {
  padding: "8px 16px",
  cursor: "pointer",
  borderRadius: "8px",
  border: "1px solid #333",
  background: "#1a1a1a",
  color: "#fff",
  fontWeight: 500,
  transition: "0.2s",
};

const primaryBtnStyle = {
  padding: "8px 16px",
  cursor: "pointer",
  borderRadius: "8px",
  border: "none",
  background: "#e53935",
  color: "#fff",
  fontWeight: 600,
  transition: "0.2s",
};

const loadingStyle = {
  padding: 24,
  fontSize: 16,
  color: "#fff",
};

const errorStyle = {
  padding: 24,
  color: "#ff4d4f",
  textAlign: "center",
  fontWeight: 500,
};
