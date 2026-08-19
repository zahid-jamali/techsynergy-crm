import React, { useEffect, useState } from "react";

const InvoiceTermsModal = ({
  isOpen,
  onClose,
  orderId,
  existingTerms = [],
  onSaved,
}) => {
  const token = sessionStorage.getItem("token");

  const [terms, setTerms] = useState([]);
  const [newTerm, setNewTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setTerms(Array.isArray(existingTerms) ? [...existingTerms] : []);
    setNewTerm("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddTerm = () => {
    if (!newTerm.trim()) return;

    setTerms([...terms, newTerm.trim()]);
    setNewTerm("");
  };

  const handleDeleteTerm = (index) => {
    setTerms(terms.filter((_, i) => i !== index));
  };

  const handleUpdateTerm = (value, index) => {
    const updated = [...terms];
    updated[index] = value;
    setTerms(updated);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      await fetch(
        `${process.env.REACT_APP_BACKEND_URL}invoice/terms?orderId=${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            termsAndConditions: terms,
          }),
        }
      );

      if (onSaved) onSaved();

      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save terms");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* HEADER */}

        <div style={styles.header}>
          <h3 style={{ margin: 0 }}>Invoice Terms & Conditions</h3>

          <button onClick={onClose} style={styles.closeBtn}>
            ✕
          </button>
        </div>

        {/* BODY */}

        <div style={styles.body}>
          {terms.map((term, index) => (
            <div key={index} style={styles.termRow}>
              <input
                type="text"
                value={term}
                onChange={(e) => handleUpdateTerm(e.target.value, index)}
                style={styles.input}
              />

              <button
                onClick={() => handleDeleteTerm(index)}
                style={styles.deleteBtn}
              >
                Delete
              </button>
            </div>
          ))}

          <div style={styles.addRow}>
            <input
              type="text"
              placeholder="Add new term..."
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              style={styles.input}
            />

            <button onClick={handleAddTerm} style={styles.addBtn}>
              Add
            </button>
          </div>
        </div>

        {/* FOOTER */}

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelBtn}>
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            style={styles.saveBtn}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTermsModal;

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(17, 24, 39, 0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },

  modal: {
    width: "600px",
    background: "#ffffff",
    color: "#111827",
    borderRadius: "16px",
    padding: "20px",
    maxHeight: "85vh",
    display: "flex",
    flexDirection: "column",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 30px rgba(2, 29, 84, 0.08)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "10px",
  },

  body: {
    flex: 1,
    overflowY: "auto",
  },

  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "15px",
    borderTop: "1px solid #e5e7eb",
    paddingTop: "10px",
  },

  termRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "10px",
  },

  addRow: {
    display: "flex",
    gap: "10px",
    marginTop: "15px",
  },

  input: {
    flex: 1,
    padding: "8px 12px",
    background: "#ffffff",
    color: "#111827",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
  },

  addBtn: {
    background: "#021d54",
    color: "#fff",
    padding: "8px 16px",
    border: "none",
    cursor: "pointer",
    borderRadius: "8px",
  },

  deleteBtn: {
    background: "#dc2626",
    color: "#fff",
    padding: "8px 12px",
    border: "none",
    cursor: "pointer",
    borderRadius: "8px",
  },

  saveBtn: {
    background: "#021d54",
    color: "#fff",
    padding: "8px 18px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    borderRadius: "8px",
  },

  cancelBtn: {
    background: "#f9fafb",
    color: "#111827",
    padding: "8px 16px",
    border: "1px solid #e5e7eb",
    cursor: "pointer",
    borderRadius: "8px",
  },

  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#4b5563",
    fontSize: "18px",
    cursor: "pointer",
  },
};
