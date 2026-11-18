import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Download, Eye, FileUp, Paperclip, Plus, Save, Send, Trash2, Truck } from "lucide-react";
import { fileUrl } from "../../lib/roles";
import { downloadFile, previewFile } from "../../lib/download";
import { toInputDate } from "../../lib/format";
import StatusBadge from "../StatusBadge";
import { Alert, Field, Modal, Spinner } from "../desk/ui";

const STEPS = [
  { key: "draft", label: "Draft" },
  { key: "in_transit", label: "In transit" },
  { key: "delivered", label: "Delivered" },
  { key: "forwarded_to_finance", label: "With finance" },
];
const UNITS = ["Units", "Pcs", "Boxes", "Sets", "Pairs", "KG", "Liter", "Meter", "Rolls", "Lot"];

const toForm = (d = {}) => ({
  dispatchDate: toInputDate(d.dispatchDate || d.createdAt || new Date()),
  carrier: d.carrier || "",
  trackingNumber: d.trackingNumber || "",
  vehicleNumber: d.vehicleNumber || "",
  driverName: d.driverName || "",
  driverPhone: d.driverPhone || "",
  packages: d.packages ?? "",
  receivedBy: d.receivedBy || "",
  receiverPhone: d.receiverPhone || "",
  remarks: d.remarks || "",
  shipTo: {
    name: d.order?.finalQuote?.account?.accountName || "",
    address: "",
    contactName: [d.order?.finalQuote?.contact?.firstName, d.order?.finalQuote?.contact?.lastName].filter(Boolean).join(" "),
    phone: "",
    ...Object.fromEntries(Object.entries(d.shipTo || {}).filter(([, v]) => v)),
  },
  // Older deliveries were saved without items — fall back to the sell order lines.
  items: (d.items?.length ? d.items : (d.order?.products || []).map((p) => ({
    productName: p.productName,
    description: p.description || "",
    uoM: "Units",
    orderedQty: Number(p.quantity) || 0,
    deliveredQty: Number(p.quantity) || 0,
  }))).map((i) => ({ ...i })),
});

function Stepper({ status }) {
  const idx = Math.max(0, STEPS.findIndex((s) => s.key === status));
  return (
    <ol className="flex items-center gap-2 text-xs">
      {STEPS.map((s, i) => (
        <li key={s.key} className="flex items-center gap-2">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold ${
              i < idx ? "bg-emerald-600 text-white" : i === idx ? "bg-brand text-white" : "bg-gray-100 text-bodyText"
            }`}
          >
            {i < idx ? <CheckCircle2 size={14} /> : i + 1}
          </span>
          <span className={i === idx ? "font-semibold text-heading" : "text-bodyText"}>{s.label}</span>
          {i < STEPS.length - 1 && <span className="w-6 h-px bg-gray-200" />}
        </li>
      ))}
    </ol>
  );
}

const DeliveryManageModal = ({ order, delivery: existing, onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");
  const [delivery, setDelivery] = useState(existing || null);
  const [form, setForm] = useState(toForm(existing || {}));
  const [loading, setLoading] = useState(!existing);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState(null);
  const [noteFile, setNoteFile] = useState(null);
  const [supportFiles, setSupportFiles] = useState([]);

  const orderNo = order?.orderNumber || delivery?.order?.orderNumber;
  const account = order?.finalQuote?.account?.accountName || delivery?.order?.finalQuote?.account?.accountName || "";
  const locked = delivery?.status === "forwarded_to_finance";

  const adopt = (d) => {
    setDelivery(d);
    setForm(toForm(d));
    setNoteFile(null);
    setSupportFiles([]);
  };

  const loadExisting = useCallback(async () => {
    if (existing?._id) {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}deliveries/${existing._id}`, {
          headers: { authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) adopt(data.data);
      } finally {
        setLoading(false);
      }
      return;
    }
    if (!order?._id) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}deliveries?orderId=${order._id}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const found = (data.data || [])[0];
      if (found) adopt(found);
    } finally {
      setLoading(false);
    }
  }, [existing, order, token]);

  useEffect(() => {
    loadExisting();
  }, [loadExisting]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setShip = (patch) => set({ shipTo: { ...form.shipTo, ...patch } });
  const setItem = (i, patch) => set({ items: form.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });

  const body = (includeLists = true) => {
    const fd = new FormData();
    ["dispatchDate", "carrier", "trackingNumber", "vehicleNumber", "driverName", "driverPhone", "packages", "receivedBy", "receiverPhone", "remarks"].forEach(
      (k) => fd.append(k, form[k] ?? "")
    );
    if (includeLists) {
      fd.append("shipTo", JSON.stringify(form.shipTo));
      if (form.items.length) fd.append("items", JSON.stringify(form.items));
    }
    if (noteFile) fd.append("deliveryNote", noteFile);
    supportFiles.forEach((f) => fd.append("supportingDocuments", f));
    return fd;
  };

  const send = async (label, path, method, fd, successText) => {
    setBusy(label);
    setMsg(null);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}${path}`, {
        method,
        headers: { authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.msg || "Request failed");
      if (data.data) adopt(data.data);
      setMsg({ type: "success", text: successText || data.msg });
      return data;
    } catch (e) {
      setMsg({ type: "error", text: e.message });
      return null;
    } finally {
      setBusy("");
    }
  };

  const create = () => {
    const fd = body(false);
    fd.append("orderId", order._id);
    return send("create", "deliveries", "POST", fd, "Delivery challan created — review items and ship-to, then dispatch");
  };
  const save = (status) => {
    const fd = body(true);
    if (status) fd.append("status", status);
    return send(status ? "transit" : "save", `deliveries/${delivery._id}`, "PUT", fd, status === "in_transit" ? "Marked as in transit" : "Delivery saved");
  };
  const deliver = () => send("deliver", `deliveries/${delivery._id}/deliver`, "PATCH", body(true), "Marked as delivered");
  const forward = async () => {
    setBusy("forward");
    setMsg(null);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}deliveries/${delivery._id}/forward`, {
        method: "PATCH",
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.msg || "Forward failed");
      onSuccess?.();
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    } finally {
      setBusy("");
    }
  };

  const challan = async (preview) => {
    try {
      if (preview) await previewFile(`deliveries/${delivery._id}/challan`);
      else await downloadFile(`deliveries/${delivery._id}/challan`, `${delivery.deliveryNumber}.pdf`);
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    }
  };

  const hasSigned = Boolean(delivery?.deliveryNote?.url || noteFile);

  const footer = loading ? null : !delivery ? (
    <>
      <button className="btn-secondary" onClick={onClose}>Close</button>
      <button className="btn-primary" disabled={!!busy || !order?._id} onClick={create}>
        {busy === "create" ? <Spinner /> : <Truck size={16} />} Create delivery challan
      </button>
    </>
  ) : locked ? (
    <>
      <button className="btn-secondary" onClick={() => challan(false)}><Download size={16} /> Challan PDF</button>
      <button className="btn-primary" onClick={onClose}>Done</button>
    </>
  ) : (
    <>
      <button className="btn-secondary" disabled={!!busy} onClick={() => save()}>
        {busy === "save" ? <Spinner /> : <Save size={16} />} Save
      </button>
      {delivery.status === "draft" && (
        <button className="btn-secondary" disabled={!!busy} onClick={() => save("in_transit")}>
          {busy === "transit" ? <Spinner /> : <Truck size={16} />} Dispatch (in transit)
        </button>
      )}
      {delivery.status !== "delivered" && (
        <button className="btn-primary" disabled={!!busy || !hasSigned || !form.receivedBy.trim()} onClick={deliver} title={!hasSigned ? "Attach the signed challan first" : !form.receivedBy.trim() ? "Enter who received the goods" : ""}>
          {busy === "deliver" ? <Spinner /> : <CheckCircle2 size={16} />} Mark delivered
        </button>
      )}
      {delivery.status === "delivered" && (
        <button className="btn-primary" disabled={!!busy} onClick={forward}>
          {busy === "forward" ? <Spinner /> : <Send size={16} />} Forward to finance
        </button>
      )}
    </>
  );

  return (
    <Modal
      title={delivery ? `Delivery challan ${delivery.deliveryNumber}` : "New delivery"}
      subtitle={[orderNo && `Sell order ${orderNo}`, account].filter(Boolean).join(" · ")}
      onClose={onClose}
      size="max-w-5xl"
      footer={footer}
    >
      {loading ? (
        <div className="py-10 flex justify-center"><Spinner className="w-6 h-6 text-brand" /></div>
      ) : (
        <div className="space-y-5">
          {msg && <Alert type={msg.type} onClose={() => setMsg(null)}>{msg.text}</Alert>}

          {delivery && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-surface rounded-xl px-4 py-3">
              <Stepper status={delivery.status} />
              <div className="flex gap-2">
                <button className="btn-secondary text-xs px-3 py-1.5" onClick={() => challan(true)}><Eye size={14} /> Preview</button>
                <button className="btn-secondary text-xs px-3 py-1.5" onClick={() => challan(false)}><Download size={14} /> Challan PDF</button>
              </div>
            </div>
          )}

          {!delivery && (
            <Alert type="info">
              A delivery challan (DN) will be created for this order with the customer's ship-to address and ordered items.
              You can then adjust quantities, print the challan and record receipt.
            </Alert>
          )}

          <div>
            <h3 className="text-sm font-semibold text-heading mb-3">Dispatch details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Dispatch date">
                <input type="date" className="input" disabled={locked} value={form.dispatchDate} onChange={(e) => set({ dispatchDate: e.target.value })} />
              </Field>
              <Field label="Carrier / courier">
                <input className="input" disabled={locked} value={form.carrier} placeholder="Own vehicle, TCS, Leopards…" onChange={(e) => set({ carrier: e.target.value })} />
              </Field>
              <Field label="Tracking / bilty no.">
                <input className="input" disabled={locked} value={form.trackingNumber} onChange={(e) => set({ trackingNumber: e.target.value })} />
              </Field>
              <Field label="Packages">
                <input type="number" min="0" className="input" disabled={locked} value={form.packages} onChange={(e) => set({ packages: e.target.value })} />
              </Field>
              <Field label="Vehicle no.">
                <input className="input" disabled={locked} value={form.vehicleNumber} placeholder="KHI-1234" onChange={(e) => set({ vehicleNumber: e.target.value })} />
              </Field>
              <Field label="Driver name">
                <input className="input" disabled={locked} value={form.driverName} onChange={(e) => set({ driverName: e.target.value })} />
              </Field>
              <Field label="Driver phone">
                <input className="input" disabled={locked} value={form.driverPhone} onChange={(e) => set({ driverPhone: e.target.value })} />
              </Field>
            </div>
          </div>

          {delivery && (
            <>
              <div>
                <h3 className="text-sm font-semibold text-heading mb-3">Deliver to</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <Field label="Customer / site" className="md:col-span-2">
                    <input className="input" disabled={locked} value={form.shipTo.name} onChange={(e) => setShip({ name: e.target.value })} />
                  </Field>
                  <Field label="Attention">
                    <input className="input" disabled={locked} value={form.shipTo.contactName} onChange={(e) => setShip({ contactName: e.target.value })} />
                  </Field>
                  <Field label="Phone">
                    <input className="input" disabled={locked} value={form.shipTo.phone} onChange={(e) => setShip({ phone: e.target.value })} />
                  </Field>
                  <Field label="Delivery address" className="md:col-span-4">
                    <input className="input" disabled={locked} value={form.shipTo.address} onChange={(e) => setShip({ address: e.target.value })} />
                  </Field>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-heading">Items</h3>
                  {!locked && (
                    <button className="btn-ghost text-xs px-2.5 py-1" onClick={() => set({ items: [...form.items, { productName: "", uoM: "Units", orderedQty: 0, deliveredQty: 0 }] })}>
                      <Plus size={14} /> Add item
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="pro-table min-w-[760px]">
                    <thead>
                      <tr>
                        <th className="w-8">#</th>
                        <th>Item</th>
                        <th className="w-28">Unit</th>
                        <th className="w-24 text-right">Ordered</th>
                        <th className="w-24 text-right">Delivered</th>
                        <th className="w-48">Remarks</th>
                        {!locked && <th className="w-10" />}
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.map((it, i) => {
                        const short = Number(it.deliveredQty) < Number(it.orderedQty);
                        return (
                          <tr key={i}>
                            <td className="text-bodyText">{i + 1}</td>
                            <td>
                              <input className="input py-1.5" disabled={locked} value={it.productName} onChange={(e) => setItem(i, { productName: e.target.value })} />
                              <input className="input py-1.5 mt-1 text-xs" disabled={locked} value={it.description || ""} placeholder="Serial no., model, notes" onChange={(e) => setItem(i, { description: e.target.value })} />
                            </td>
                            <td>
                              <select className="input py-1.5" disabled={locked} value={it.uoM || "Units"} onChange={(e) => setItem(i, { uoM: e.target.value })}>
                                {[...new Set([it.uoM || "Units", ...UNITS])].map((u) => <option key={u}>{u}</option>)}
                              </select>
                            </td>
                            <td>
                              <input type="number" min="0" step="any" className="input py-1.5 text-right" disabled={locked} value={it.orderedQty} onChange={(e) => setItem(i, { orderedQty: e.target.value })} />
                            </td>
                            <td>
                              <input type="number" min="0" step="any" className={`input py-1.5 text-right ${short ? "border-amber-400" : ""}`} disabled={locked} value={it.deliveredQty} onChange={(e) => setItem(i, { deliveredQty: e.target.value })} />
                            </td>
                            <td>
                              <input className="input py-1.5" disabled={locked} value={it.remarks || ""} placeholder={short ? "Reason for short delivery" : ""} onChange={(e) => setItem(i, { remarks: e.target.value })} />
                            </td>
                            {!locked && (
                              <td>
                                <button className="p-1.5 rounded text-bodyText hover:text-red-600 hover:bg-red-50" onClick={() => set({ items: form.items.filter((_, idx) => idx !== i) })} aria-label="Remove item">
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-heading">Proof of delivery</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Received by" hint="Required to mark delivered">
                      <input className="input" disabled={locked} value={form.receivedBy} onChange={(e) => set({ receivedBy: e.target.value })} />
                    </Field>
                    <Field label="Receiver phone">
                      <input className="input" disabled={locked} value={form.receiverPhone} onChange={(e) => set({ receiverPhone: e.target.value })} />
                    </Field>
                  </div>
                  <Field label="Remarks">
                    <textarea className="input" rows={3} disabled={locked} value={form.remarks} onChange={(e) => set({ remarks: e.target.value })} />
                  </Field>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-heading">Documents</h3>
                  <Field label="Signed challan copy" hint="Scan / photo of the challan signed and stamped by the customer">
                    {delivery.deliveryNote?.url && (
                      <a href={fileUrl(delivery.deliveryNote.url)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-brand hover:underline mb-2">
                        <Paperclip size={14} /> {delivery.deliveryNote.originalName || "Current signed copy"}
                      </a>
                    )}
                    {!locked && (
                      <label className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-3 py-2.5 text-sm text-bodyText cursor-pointer hover:border-brand hover:text-brand">
                        <FileUp size={16} />
                        <span className="truncate">{noteFile ? noteFile.name : delivery.deliveryNote?.url ? "Replace signed copy" : "Upload signed copy (PDF / image)"}</span>
                        <input type="file" className="hidden" accept=".pdf,image/png,image/jpeg" onChange={(e) => setNoteFile(e.target.files?.[0] || null)} />
                      </label>
                    )}
                  </Field>
                  <Field label="Supporting documents" hint="GRN, inspection report, customer PO…">
                    <div className="space-y-1 mb-2">
                      {(delivery.supportingDocuments || []).map((doc, i) => (
                        <a key={i} href={fileUrl(doc.url)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-brand hover:underline">
                          <Paperclip size={14} /> {doc.originalName || `Document ${i + 1}`}
                        </a>
                      ))}
                    </div>
                    {!locked && (
                      <label className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-3 py-2.5 text-sm text-bodyText cursor-pointer hover:border-brand hover:text-brand">
                        <FileUp size={16} />
                        <span className="truncate">{supportFiles.length ? `${supportFiles.length} file(s) selected` : "Add files"}</span>
                        <input type="file" multiple className="hidden" accept=".pdf,image/png,image/jpeg" onChange={(e) => setSupportFiles(Array.from(e.target.files || []))} />
                      </label>
                    )}
                  </Field>
                  {delivery.status && <div className="text-xs text-bodyText flex items-center gap-2">Current status <StatusBadge value={delivery.status} /></div>}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
};

export default DeliveryManageModal;
