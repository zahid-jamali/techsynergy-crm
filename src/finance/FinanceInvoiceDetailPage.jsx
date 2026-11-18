import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  Ban,
  Download,
  Eye,
  FileCheck2,
  Plus,
  Save,
  Search,
  Send,
  Trash2,
  QrCode,
} from "lucide-react";
import { api } from "../lib/api";
import { downloadFile, previewFile } from "../lib/download";
import { fmtDate, fmtDateTime, fmtMoney, toInputDate } from "../lib/format";
import { computeLine, computeTotals, FURTHER_TAX_DEFAULT } from "../lib/fbrTax";
import { Alert, FbrBadge, Field, Modal, Pill, Section, Spinner } from "../components/desk/ui";
import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";

const TERMS = ["Due on receipt", "Net 7", "Net 15", "Net 30", "Net 45", "Net 60"];
const termDays = (t) => Number(String(t).match(/\d+/)?.[0] || 0);
const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

const blankLine = () => ({
  productName: "",
  description: "",
  hsCode: "",
  uoM: "Numbers, pieces, units",
  quantity: 1,
  unitPrice: 0,
  discount: 0,
  fixedNotifiedValue: 0,
});

const toForm = (inv) => ({
  documentDate: toInputDate(inv.documentDate),
  dueDate: toInputDate(inv.dueDate),
  paymentTerms: inv.paymentTerms || "Net 30",
  customerRefNo: inv.customerRefNo || "",
  description: inv.description || "",
  notes: inv.notes || "",
  exchangeRate: inv.exchangeRate || 1,
  termsAndConditions: (inv.termsAndConditions || []).join("\n"),
  buyer: {
    businessName: "",
    ntnCnic: "",
    strn: "",
    registrationType: "Unregistered",
    province: "",
    address: "",
    contactName: "",
    phone: "",
    email: "",
    ...(inv.buyer || {}),
  },
  tax: { ...(inv.tax || {}) },
  lines: (inv.lines || []).map((l) => ({ ...blankLine(), ...l })),
});

export default function FinanceInvoiceDetailPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [cfg, setCfg] = useState(null);
  const [form, setForm] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState(null);
  const [fbrErrors, setFbrErrors] = useState([]);
  const [confirmIssue, setConfirmIssue] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [regCheck, setRegCheck] = useState(null);

  const load = useCallback(async () => {
    const [d, c] = await Promise.all([api(`finance/invoices/${id}`), api("finance/fbr/config")]);
    setInvoice(d.data);
    setSubmissions(d.submissions || []);
    setForm(toForm(d.data));
    setCfg(c.data);
    setDirty(false);
  }, [id]);

  useEffect(() => {
    load().catch((e) => setMsg({ type: "error", text: e.message }));
  }, [load]);

  const editable = invoice?.status === "Draft";
  const totals = useMemo(() => (form ? computeTotals(form.lines, form.tax) : null), [form]);
  const saleTypes = cfg?.saleTypes || [];
  const preset = saleTypes.find((t) => t.key === form?.tax?.saleTypeKey);

  const set = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    setDirty(true);
  };
  const setBuyer = (patch) => set({ buyer: { ...form.buyer, ...patch } });
  const setTax = (patch) => set({ tax: { ...form.tax, ...patch } });
  const setLine = (i, patch) =>
    set({ lines: form.lines.map((l, idx) => (idx === i ? { ...l, ...patch } : l)) });

  const chooseSaleType = (key) => {
    const p = saleTypes.find((t) => t.key === key);
    if (!p) return;
    setTax({
      saleTypeKey: p.key,
      saleType: p.saleType,
      rate: p.rate,
      sroScheduleNo: p.sroScheduleNo,
      sroItemSerialNo: p.sroItemSerialNo,
    });
  };

  const payload = () => ({
    documentDate: form.documentDate,
    dueDate: form.dueDate,
    paymentTerms: form.paymentTerms,
    customerRefNo: form.customerRefNo,
    description: form.description,
    notes: form.notes,
    exchangeRate: Number(form.exchangeRate) || 1,
    termsAndConditions: form.termsAndConditions.split("\n").map((t) => t.trim()).filter(Boolean),
    buyer: form.buyer,
    tax: form.tax,
    lines: form.lines,
  });

  const save = async (quiet = false) => {
    setBusy("save");
    setMsg(null);
    try {
      const d = await api(`finance/invoices/${id}`, { method: "PUT", body: JSON.stringify(payload()) });
      setInvoice(d.data);
      setForm(toForm(d.data));
      setDirty(false);
      if (!quiet) setMsg({ type: "success", text: "Invoice saved" });
      return true;
    } catch (e) {
      setMsg({ type: "error", text: e.message });
      return false;
    } finally {
      setBusy("");
    }
  };

  const callFbr = async (path, method, label) => {
    setFbrErrors([]);
    setMsg(null);
    if (editable && dirty && !(await save(true))) return null;
    setBusy(label);
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}${path}`, {
        method,
        headers: { authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const list = [
          ...(data.errors || []),
          ...((data.fbr?.itemErrors || []).map((e) => `Line ${e.itemSNo}: [${e.errorCode}] ${e.error}`)),
        ];
        if (!list.length && data.fbr?.errorCode) list.push(`[${data.fbr.errorCode}] ${data.fbr.error}`);
        setFbrErrors(list);
        setMsg({ type: "error", text: data.msg || "FBR request failed" });
        return null;
      }
      setMsg({ type: "success", text: data.msg });
      return data;
    } finally {
      setBusy("");
      await load().catch(() => {});
    }
  };

  const validate = () => callFbr(`finance/invoices/${id}/fbr/validate`, "POST", "validate");
  const issue = async () => {
    setConfirmIssue(false);
    await callFbr(`finance/invoices/${id}/issue`, "PATCH", "issue");
  };

  const cancel = async () => {
    setBusy("cancel");
    try {
      const d = await api(`finance/invoices/${id}/cancel`, {
        method: "PATCH",
        body: JSON.stringify({ reason: cancelReason }),
      });
      setMsg({ type: "success", text: d.msg });
      setCancelOpen(false);
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    } finally {
      setBusy("");
    }
  };

  const checkRegistration = async () => {
    const reg = (form.buyer.ntnCnic || "").replace(/-/g, "").trim();
    if (!reg) return;
    setRegCheck({ loading: true });
    try {
      const d = await api(`finance/fbr/buyer-registration?regNo=${encodeURIComponent(reg)}`);
      const type = /^registered$/i.test(d.data?.REGISTRATION_TYPE || "") ? "Registered" : "Unregistered";
      setRegCheck({ type });
      setBuyer({ registrationType: type });
    } catch (e) {
      setRegCheck({ error: e.message });
    }
  };

  const doDownload = async (preview) => {
    try {
      if (dirty && editable) await save(true);
      if (preview) await previewFile(`finance/invoices/${id}/pdf`);
      else await downloadFile(`finance/invoices/${id}/pdf`, `${invoice.invoiceNumber}.pdf`);
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    }
  };

  if (!invoice || !form) {
    return (
      <div className="flex justify-center items-center h-60">
        {msg ? <Alert type="error">{msg.text}</Alert> : <Loading />}
      </div>
    );
  }

  const cur = invoice.currency || "PKR";
  const fbrReady = cfg?.ready;
  const isThird = /3rd schedule/i.test(form.tax.saleType || "");
  const unregistered = form.buyer.registrationType !== "Registered";
  const ro = !editable;

  return (
    <div className="page">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link to="/finance/invoices" className="inline-flex items-center gap-1.5 text-sm text-bodyText hover:text-brand mb-2">
            <ArrowLeft size={15} /> All invoices
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="page-title">{invoice.invoiceNumber}</h1>
            <StatusBadge value={invoice.status} />
            <FbrBadge fbr={invoice.fbr} />
            {dirty && <Pill tone="amber">Unsaved changes</Pill>}
          </div>
          <p className="page-subtitle">
            {form.buyer.businessName || "-"} · Order {invoice.order?.orderNumber || "-"} · Delivery{" "}
            {invoice.delivery?.deliveryNumber || "-"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={() => doDownload(true)}>
            <Eye size={16} /> Preview
          </button>
          <button className="btn-secondary" onClick={() => doDownload(false)}>
            <Download size={16} /> PDF
          </button>
          {editable && (
            <>
              <button className="btn-secondary" disabled={!!busy} onClick={() => save()}>
                {busy === "save" ? <Spinner /> : <Save size={16} />} Save
              </button>
              {cfg?.enabled && (
                <button className="btn-secondary" disabled={!!busy || !fbrReady} onClick={validate}>
                  {busy === "validate" ? <Spinner /> : <FileCheck2 size={16} />} Validate with FBR
                </button>
              )}
              <button className="btn-primary" disabled={!!busy} onClick={() => setConfirmIssue(true)}>
                {busy === "issue" ? <Spinner /> : <Send size={16} />}
                {cfg?.enabled ? "Issue & report to FBR" : "Issue invoice"}
              </button>
            </>
          )}
          {invoice.status !== "Cancelled" &&
            !(invoice.fbr?.irn && invoice.fbr?.environment === "production") && (
              <button className="btn-ghost text-red-600 hover:bg-red-50" disabled={!!busy} onClick={() => setCancelOpen(true)}>
                <Ban size={16} /> Cancel
              </button>
            )}
        </div>
      </div>

      {msg && (
        <Alert type={msg.type} onClose={() => setMsg(null)}>
          {msg.text}
          {fbrErrors.length > 0 && (
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              {fbrErrors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </Alert>
      )}

      {cfg?.enabled && !fbrReady && editable && (
        <Alert type="warning" title="FBR integration is not fully configured">
          Ask the administrator to set the FBR token and seller NTN on the server.
        </Alert>
      )}

      {invoice.fbr?.irn && (
        <div className="card p-5 flex flex-col md:flex-row md:items-center gap-4 border-emerald-200 bg-emerald-50/40">
          <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
            <QrCode size={22} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">FBR Invoice Reference Number</p>
            <p className="text-xl font-semibold text-heading tracking-wide">{invoice.fbr.irn}</p>
            <p className="text-xs text-bodyText mt-0.5">
              Reported {invoice.fbr.dated || fmtDateTime(invoice.fbr.submittedAt)} by{" "}
              {invoice.fbr.submittedBy?.name || "-"} · {invoice.fbr.environment === "sandbox" ? "Sandbox" : "Production"}
              {invoice.fbr.scenarioId && invoice.fbr.environment === "sandbox" ? ` · ${invoice.fbr.scenarioId}` : ""}
            </p>
          </div>
        </div>
      )}

      {invoice.status === "Cancelled" && (
        <Alert type="error" title="Cancelled invoice">
          {invoice.cancelReason ? `Reason: ${invoice.cancelReason}` : "This invoice was cancelled."}
        </Alert>
      )}

      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Section title="Buyer" description="Tax identity as registered with FBR">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Business name" className="md:col-span-2">
                <input className="input" disabled={ro} value={form.buyer.businessName} onChange={(e) => setBuyer({ businessName: e.target.value })} />
              </Field>
              <Field label="Registration type">
                <select className="input" disabled={ro} value={form.buyer.registrationType} onChange={(e) => setBuyer({ registrationType: e.target.value })}>
                  <option>Registered</option>
                  <option>Unregistered</option>
                </select>
              </Field>
              <Field
                label="NTN / CNIC"
                hint={
                  regCheck?.type
                    ? `FBR shows this buyer as ${regCheck.type}`
                    : regCheck?.error || "7-digit NTN or 13-digit CNIC (optional for unregistered)"
                }
              >
                <div className="flex gap-2">
                  <input className="input" disabled={ro} value={form.buyer.ntnCnic} placeholder="1234567" onChange={(e) => setBuyer({ ntnCnic: e.target.value })} />
                  {!ro && cfg?.enabled && (
                    <button type="button" className="btn-secondary px-3" onClick={checkRegistration} title="Check registration with FBR">
                      {regCheck?.loading ? <Spinner /> : <Search size={16} />}
                    </button>
                  )}
                </div>
              </Field>
              <Field label="STRN (sales tax reg. no.)">
                <input className="input" disabled={ro} value={form.buyer.strn} onChange={(e) => setBuyer({ strn: e.target.value })} />
              </Field>
              <Field label="Province">
                <select className="input" disabled={ro} value={form.buyer.province} onChange={(e) => setBuyer({ province: e.target.value })}>
                  <option value="">Select province</option>
                  {(cfg?.provinces || []).map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </Field>
              <Field label="Address" className="md:col-span-2">
                <input className="input" disabled={ro} value={form.buyer.address} onChange={(e) => setBuyer({ address: e.target.value })} />
              </Field>
              <Field label="Contact person">
                <input className="input" disabled={ro} value={form.buyer.contactName} onChange={(e) => setBuyer({ contactName: e.target.value })} />
              </Field>
              <Field label="Contact phone / email">
                <input className="input" disabled={ro} value={form.buyer.phone} onChange={(e) => setBuyer({ phone: e.target.value })} />
              </Field>
            </div>
          </Section>

          <Section
            title="Line items"
            description="HS code and unit of measure are mandatory for FBR"
            actions={
              editable && (
                <button className="btn-secondary text-xs px-3 py-1.5" onClick={() => set({ lines: [...form.lines, blankLine()] })}>
                  <Plus size={14} /> Add line
                </button>
              )
            }
          >
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="pro-table min-w-[900px]">
                <thead>
                  <tr>
                    <th className="w-8">#</th>
                    <th>Product / description</th>
                    <th className="w-28">HS code</th>
                    <th className="w-36">Unit</th>
                    <th className="w-20 text-right">Qty</th>
                    <th className="w-28 text-right">Unit price</th>
                    <th className="w-24 text-right">Discount</th>
                    {isThird && <th className="w-28 text-right">Retail value</th>}
                    <th className="w-28 text-right">Sales tax</th>
                    <th className="w-32 text-right">Total</th>
                    {editable && <th className="w-10" />}
                  </tr>
                </thead>
                <tbody>
                  {form.lines.map((l, i) => {
                    const c = computeLine(l, form.tax);
                    const hsBad = l.hsCode && !/^\d{4}\.\d{4}$/.test(l.hsCode);
                    return (
                      <tr key={i}>
                        <td className="text-bodyText">{i + 1}</td>
                        <td>
                          <input className="input py-1.5" disabled={ro} value={l.productName} placeholder="Product name" onChange={(e) => setLine(i, { productName: e.target.value })} />
                          <input className="input py-1.5 mt-1 text-xs" disabled={ro} value={l.description} placeholder="Description (optional)" onChange={(e) => setLine(i, { description: e.target.value })} />
                        </td>
                        <td>
                          <input
                            className={`input py-1.5 ${hsBad || (!l.hsCode && editable) ? "border-amber-400" : ""}`}
                            disabled={ro}
                            value={l.hsCode}
                            placeholder="8471.3010"
                            onChange={(e) => setLine(i, { hsCode: e.target.value })}
                          />
                        </td>
                        <td>
                          <select className="input py-1.5" disabled={ro} value={l.uoM} onChange={(e) => setLine(i, { uoM: e.target.value })}>
                            {[...new Set([l.uoM, ...(cfg?.uoms || [])])].filter(Boolean).map((u) => (
                              <option key={u}>{u}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input type="number" min="0" step="any" className="input py-1.5 text-right" disabled={ro} value={l.quantity} onChange={(e) => setLine(i, { quantity: e.target.value })} />
                        </td>
                        <td>
                          <input type="number" min="0" step="any" className="input py-1.5 text-right" disabled={ro} value={l.unitPrice} onChange={(e) => setLine(i, { unitPrice: e.target.value })} />
                        </td>
                        <td>
                          <input type="number" min="0" step="any" className="input py-1.5 text-right" disabled={ro} value={l.discount} onChange={(e) => setLine(i, { discount: e.target.value })} />
                        </td>
                        {isThird && (
                          <td>
                            <input type="number" min="0" step="any" className="input py-1.5 text-right" disabled={ro} value={l.fixedNotifiedValue} onChange={(e) => setLine(i, { fixedNotifiedValue: e.target.value })} />
                          </td>
                        )}
                        <td className="text-right tabular-nums">{fmtMoney(c.salesTax, "")}</td>
                        <td className="text-right tabular-nums font-medium">{fmtMoney(c.total, "")}</td>
                        {editable && (
                          <td>
                            <button
                              className="p-1.5 rounded text-bodyText hover:text-red-600 hover:bg-red-50 disabled:opacity-30"
                              disabled={form.lines.length === 1}
                              onClick={() => set({ lines: form.lines.filter((_, idx) => idx !== i) })}
                              aria-label="Remove line"
                            >
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
            {isThird && (
              <p className="text-xs text-bodyText mt-3">
                3rd Schedule goods: sales tax is charged on the printed retail price (retail value × quantity).
              </p>
            )}
          </Section>

          <Section title="Notes & terms">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Description (printed)">
                <textarea className="input" rows={3} disabled={ro} value={form.description} onChange={(e) => set({ description: e.target.value })} />
              </Field>
              <Field label="Notes (printed)">
                <textarea className="input" rows={3} disabled={ro} value={form.notes} onChange={(e) => set({ notes: e.target.value })} />
              </Field>
              <Field label="Terms & conditions" hint="One term per line" className="md:col-span-2">
                <textarea className="input" rows={4} disabled={ro} value={form.termsAndConditions} onChange={(e) => set({ termsAndConditions: e.target.value })} />
              </Field>
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Invoice details">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Invoice date">
                <input
                  type="date"
                  className="input"
                  disabled={ro}
                  value={form.documentDate}
                  onChange={(e) =>
                    set({
                      documentDate: e.target.value,
                      dueDate: toInputDate(addDays(e.target.value, termDays(form.paymentTerms))),
                    })
                  }
                />
              </Field>
              <Field label="Payment terms">
                <select
                  className="input"
                  disabled={ro}
                  value={form.paymentTerms}
                  onChange={(e) =>
                    set({
                      paymentTerms: e.target.value,
                      dueDate: toInputDate(addDays(form.documentDate || new Date(), termDays(e.target.value))),
                    })
                  }
                >
                  {[...new Set([form.paymentTerms, ...TERMS])].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <Field label="Due date">
                <input type="date" className="input" disabled={ro} value={form.dueDate} onChange={(e) => set({ dueDate: e.target.value })} />
              </Field>
              <Field label="Customer PO / ref">
                <input className="input" disabled={ro} value={form.customerRefNo} onChange={(e) => set({ customerRefNo: e.target.value })} />
              </Field>
              {cur === "USD" && (
                <Field label="PKR per USD" hint="FBR accepts PKR only" className="col-span-2">
                  <input type="number" min="1" step="any" className="input" disabled={ro} value={form.exchangeRate} onChange={(e) => set({ exchangeRate: e.target.value })} />
                </Field>
              )}
            </div>
          </Section>

          <Section title="Sales tax treatment" description="Drives the FBR sale type and rate">
            <div className="space-y-4">
              <Field label="Sale type">
                <select className="input" disabled={ro} value={form.tax.saleTypeKey || ""} onChange={(e) => chooseSaleType(e.target.value)}>
                  {saleTypes.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Rate" hint={preset && preset.rate !== form.tax.rate ? `Default ${preset.rate}` : undefined}>
                  <input className="input" disabled={ro} value={form.tax.rate || ""} onChange={(e) => setTax({ rate: e.target.value })} />
                </Field>
                <Field label="Further tax %" hint={unregistered ? `Usually ${FURTHER_TAX_DEFAULT}% for unregistered buyers` : "Registered buyer"}>
                  <input type="number" min="0" step="any" className="input" disabled={ro} value={form.tax.furtherTaxPercent ?? 0} onChange={(e) => setTax({ furtherTaxPercent: e.target.value })} />
                </Field>
                {(form.tax.sroScheduleNo || preset?.sroScheduleNo) && (
                  <>
                    <Field label="SRO / schedule">
                      <input className="input" disabled={ro} value={form.tax.sroScheduleNo || ""} onChange={(e) => setTax({ sroScheduleNo: e.target.value })} />
                    </Field>
                    <Field label="SRO item S.No">
                      <input className="input" disabled={ro} value={form.tax.sroItemSerialNo || ""} onChange={(e) => setTax({ sroItemSerialNo: e.target.value })} />
                    </Field>
                  </>
                )}
              </div>
              {["standard", "thirdSchedule", "reduced"].includes(form.tax.saleTypeKey) && (
                <label className="flex items-start gap-2 text-sm text-heading">
                  <input type="checkbox" className="mt-0.5" disabled={ro} checked={!!form.tax.retailToEndConsumer} onChange={(e) => setTax({ retailToEndConsumer: e.target.checked })} />
                  <span>
                    Retail sale to end consumer
                    <span className="block text-xs text-bodyText">Only if registered as a retailer in the sales tax profile</span>
                  </span>
                </label>
              )}
            </div>
          </Section>

          <Section title="Summary">
            <dl className="space-y-2 text-sm">
              {[
                ["Gross amount", totals.gross],
                ...(totals.discount ? [["Discount", -totals.discount]] : []),
                ["Value excl. sales tax", totals.valueExclST],
                [`Sales tax (${form.tax.rate || "-"})`, totals.salesTax],
                ...(totals.furtherTax ? [[`Further tax (${form.tax.furtherTaxPercent}%)`, totals.furtherTax]] : []),
                ...(totals.extra ? [["Extra tax / FED", totals.extra]] : []),
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-bodyText">{k}</dt>
                  <dd className="tabular-nums text-heading">{fmtMoney(v, "")}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-3 pt-3 mt-1 border-t border-gray-200">
                <dt className="font-semibold text-heading">Total</dt>
                <dd className="font-semibold text-lg text-brand tabular-nums">{fmtMoney(totals.total, cur)}</dd>
              </div>
              {cur === "USD" && (
                <p className="text-xs text-bodyText text-right">
                  ≈ {fmtMoney(totals.total * (Number(form.exchangeRate) || 1), "PKR")} reported to FBR
                </p>
              )}
            </dl>
          </Section>

          {cfg?.enabled && (
            <Section title="FBR activity" description={`${cfg.environment === "sandbox" ? "Sandbox" : "Production"} · seller ${cfg.seller?.ntnCnic || "-"}`}>
              {invoice.fbr?.lastError && invoice.fbr?.status === "failed" && (
                <div className="mb-3">
                  <Alert type="error" title={`Last FBR error ${invoice.fbr.lastErrorCode ? `(${invoice.fbr.lastErrorCode})` : ""}`}>
                    {invoice.fbr.lastError}
                  </Alert>
                </div>
              )}
              {submissions.length === 0 ? (
                <p className="text-sm text-bodyText">No FBR calls yet. Validate before issuing to catch errors early.</p>
              ) : (
                <ul className="space-y-2.5">
                  {submissions.map((s) => (
                    <li key={s._id} className="flex items-start gap-2.5 text-sm">
                      <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${s.ok ? "bg-emerald-500" : "bg-red-500"}`} />
                      <div className="min-w-0">
                        <p className="text-heading">
                          {s.mode === "post" ? "Reported" : "Validated"} · {s.ok ? "accepted" : "rejected"}
                          {s.irn ? ` · ${s.irn}` : ""}
                        </p>
                        {!s.ok && <p className="text-xs text-red-700 break-words">{s.errorCode ? `[${s.errorCode}] ` : ""}{s.error}</p>}
                        <p className="text-xs text-bodyText">
                          {fmtDateTime(s.createdAt)} · {s.createdBy?.name || "-"}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          )}

          <Section title="Audit">
            <dl className="text-sm space-y-1.5">
              <div className="flex justify-between"><dt className="text-bodyText">Created</dt><dd>{fmtDate(invoice.createdAt)} · {invoice.createdBy?.name || "-"}</dd></div>
              {invoice.issuedAt && <div className="flex justify-between"><dt className="text-bodyText">Issued</dt><dd>{fmtDate(invoice.issuedAt)} · {invoice.issuedBy?.name || "-"}</dd></div>}
              {invoice.delivery?.deliveredAt && <div className="flex justify-between"><dt className="text-bodyText">Delivered</dt><dd>{fmtDate(invoice.delivery.deliveredAt)}</dd></div>}
            </dl>
          </Section>
        </div>
      </div>

      {confirmIssue && (
        <Modal
          title={cfg?.enabled ? "Issue and report to FBR?" : "Issue invoice?"}
          subtitle={`${invoice.invoiceNumber} · ${fmtMoney(totals.total, cur)}`}
          onClose={() => setConfirmIssue(false)}
          size="max-w-lg"
          footer={
            <>
              <button className="btn-secondary" onClick={() => setConfirmIssue(false)}>Back</button>
              <button className="btn-primary" onClick={issue}>
                <BadgeCheck size={16} /> Confirm & issue
              </button>
            </>
          }
        >
          <div className="space-y-3 text-sm text-heading">
            <p>Once issued, the invoice is locked and posted to the ledger.</p>
            {cfg?.enabled && (
              <p>
                It will be submitted to the FBR Digital Invoicing System
                {cfg.environment === "sandbox" ? " (sandbox)" : ""}. FBR returns an Invoice Reference Number (IRN) and QR code
                that are printed on the invoice. {cfg.environment === "production" && "Reported invoices cannot be cancelled."}
              </p>
            )}
            {!form.lines.every((l) => /^\d{4}\.\d{4}$/.test(l.hsCode)) && cfg?.enabled && (
              <Alert type="warning">Some lines are missing a valid HS code — FBR will reject the invoice.</Alert>
            )}
          </div>
        </Modal>
      )}

      {cancelOpen && (
        <Modal
          title="Cancel invoice"
          subtitle={invoice.invoiceNumber}
          onClose={() => setCancelOpen(false)}
          size="max-w-lg"
          footer={
            <>
              <button className="btn-secondary" onClick={() => setCancelOpen(false)}>Keep invoice</button>
              <button
                className="btn-danger"
                disabled={busy === "cancel" || (invoice.status === "Issued" && !cancelReason.trim())}
                onClick={cancel}
              >
                {busy === "cancel" && <Spinner />} Cancel invoice
              </button>
            </>
          }
        >
          <div className="space-y-3">
            <p className="text-sm text-heading">
              The sell order returns to the finance queue so a corrected invoice can be raised.
              {invoice.status === "Issued" && " The ledger entry will be reversed."}
            </p>
            <Field label="Reason">
              <textarea className="input" rows={3} value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
            </Field>
          </div>
        </Modal>
      )}
    </div>
  );
}
