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
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },

  modal: {
    width: "600px",
    background: "#000",
    color: "#fff",
    borderRadius: "8px",
    padding: "20px",
    maxHeight: "85vh",
    display: "flex",
    flexDirection: "column",
    border: "1px solid #333",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
    borderBottom: "1px solid #333",
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
    borderTop: "1px solid #333",
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
    padding: "8px",
    background: "#111",
    color: "#fff",
    border: "1px solid #444",
    borderRadius: "4px",
  },

  addBtn: {
    background: "#e53935",
    color: "#fff",
    padding: "8px 16px",
    border: "none",
    cursor: "pointer",
  },

  deleteBtn: {
    background: "#e53935",
    color: "#fff",
    padding: "8px 12px",
    border: "none",
    cursor: "pointer",
  },

  saveBtn: {
    background: "#e53935",
    color: "#fff",
    padding: "8px 18px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  },

  cancelBtn: {
    background: "#444",
    color: "#fff",
    padding: "8px 16px",
    border: "none",
    cursor: "pointer",
  },

  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: "18px",
    cursor: "pointer",
  },
};
