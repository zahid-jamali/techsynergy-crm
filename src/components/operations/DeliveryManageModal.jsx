import { useCallback, useEffect, useState } from "react";
import StatusBadge from "../StatusBadge";
import { fileUrl } from "../../lib/roles";

const DeliveryManageModal = ({ order, delivery: existing, onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");
  const [delivery, setDelivery] = useState(existing || null);
  const [loading, setLoading] = useState(!existing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    carrier: existing?.carrier || "",
    trackingNumber: existing?.trackingNumber || "",
    remarks: existing?.remarks || "",
  });
  const [noteFile, setNoteFile] = useState(null);
  const [supportFiles, setSupportFiles] = useState([]);

  const loadExisting = useCallback(async () => {
    if (existing || !order?._id) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}deliveries?orderId=${order._id}`,
        { headers: { authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      const found = (data.data || [])[0];
      if (found) {
        setDelivery(found);
        setForm({
          carrier: found.carrier || "",
          trackingNumber: found.trackingNumber || "",
          remarks: found.remarks || "",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [existing, order, token]);

  useEffect(() => {
    loadExisting();
  }, [loadExisting]);

  const appendFiles = (body) => {
    body.append("carrier", form.carrier);
    body.append("trackingNumber", form.trackingNumber);
    body.append("remarks", form.remarks);
    if (noteFile) body.append("deliveryNote", noteFile);
    supportFiles.forEach((f) => body.append("supportingDocuments", f));
  };

  const createOrUpdate = async () => {
    setSaving(true);
    setError("");
    try {
      const body = new FormData();
      appendFiles(body);

      let res;
      if (delivery?._id) {
        res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}deliveries/${delivery._id}`,
          {
            method: "PUT",
            headers: { authorization: `Bearer ${token}` },
            body,
          }
        );
      } else {
        body.append("orderId", order._id);
        res = await fetch(`${process.env.REACT_APP_BACKEND_URL}deliveries`, {
          method: "POST",
          headers: { authorization: `Bearer ${token}` },
          body,
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Save failed");
      setDelivery(data.data);
      setNoteFile(null);
      setSupportFiles([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const markDelivered = async () => {
    if (!delivery?._id) {
      setError("Save the delivery first");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const body = new FormData();
      appendFiles(body);
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}deliveries/${delivery._id}/deliver`,
        {
          method: "PATCH",
          headers: { authorization: `Bearer ${token}` },
          body,
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to mark delivered");
      setDelivery(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const forward = async () => {
    if (!delivery?._id) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}deliveries/${delivery._id}/forward`,
        {
          method: "PATCH",
          headers: { authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Forward failed");
      onSuccess?.();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const locked = delivery?.status === "forwarded_to_finance";

  return (
    <div className="modal-overlay">
      <div className="modal-panel max-w-2xl p-6">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="text-xl font-semibold text-heading">
              Delivery · {order?.orderNumber || delivery?.order?.orderNumber}
            </h2>
            <p className="text-sm text-bodyText mt-1">
              {order?.finalQuote?.account?.accountName ||
                delivery?.order?.finalQuote?.account?.accountName ||
                ""}
            </p>
          </div>
          <button onClick={onClose} className="text-bodyText hover:text-heading">
            ✕
          </button>
        </div>

        {loading ? (
          <p className="text-bodyText">Loading...</p>
        ) : (
          <div className="space-y-4">
            {delivery && (
              <div className="flex items-center justify-between bg-surface rounded-lg px-3 py-2">
                <span className="text-sm font-medium">
                  {delivery.deliveryNumber}
                </span>
                <StatusBadge value={delivery.status} />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Carrier</label>
                <input
                  className="input"
                  disabled={locked}
                  value={form.carrier}
                  onChange={(e) =>
                    setForm({ ...form, carrier: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">Tracking number</label>
                <input
                  className="input"
                  disabled={locked}
                  value={form.trackingNumber}
                  onChange={(e) =>
                    setForm({ ...form, trackingNumber: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="label">Remarks</label>
              <textarea
                className="input"
                rows={3}
                disabled={locked}
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Delivery note copy</label>
              {delivery?.deliveryNote?.url && (
                <a
                  href={fileUrl(delivery.deliveryNote.url)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-brand hover:underline block mb-2"
                >
                  {delivery.deliveryNote.originalName || "View current file"}
                </a>
              )}
              {!locked && (
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setNoteFile(e.target.files?.[0] || null)}
                  className="text-sm"
                />
              )}
            </div>

            <div>
              <label className="label">Supporting documents</label>
              <div className="space-y-1 mb-2">
                {(delivery?.supportingDocuments || []).map((doc, i) => (
                  <a
                    key={i}
                    href={fileUrl(doc.url)}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-sm text-brand hover:underline"
                  >
                    {doc.originalName || `Document ${i + 1}`}
                  </a>
                ))}
              </div>
              {!locked && (
                <input
                  type="file"
                  multiple
                  accept=".pdf,image/*"
                  onChange={(e) =>
                    setSupportFiles(Array.from(e.target.files || []))
                  }
                  className="text-sm"
                />
              )}
            </div>

            {!locked && (
              <div className="flex flex-wrap justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={createOrUpdate}
                  disabled={saving}
                  className="btn-secondary"
                >
                  {delivery ? "Save details" : "Create delivery"}
                </button>
                {delivery && delivery.status !== "delivered" && (
                  <button
                    onClick={markDelivered}
                    disabled={saving}
                    className="btn-primary"
                  >
                    Mark delivered
                  </button>
                )}
                {delivery?.status === "delivered" && (
                  <button
                    onClick={forward}
                    disabled={saving}
                    className="btn-primary"
                  >
                    Forward to finance
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryManageModal;
