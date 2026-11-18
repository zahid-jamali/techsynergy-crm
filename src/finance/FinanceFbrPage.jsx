import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, CheckCircle2, Circle, FileCheck2, PlayCircle, RefreshCw, Send, ServerCog, XCircle } from "lucide-react";
import { api } from "../lib/api";
import { fmtDateTime } from "../lib/format";
import { Alert, KpiCard, Modal, PageHeader, Pill, Section, Spinner, TableSkeleton } from "../components/desk/ui";

const STATUS = {
  passed: ["green", "Passed", CheckCircle2],
  validated: ["sky", "Validated", FileCheck2],
  failed: ["red", "Failed", XCircle],
  pending: ["gray", "Pending", Circle],
};

export default function FinanceFbrPage() {
  const [cfg, setCfg] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState(null);
  const [detail, setDetail] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, s, l] = await Promise.all([
        api("finance/fbr/config"),
        api("finance/fbr/scenarios"),
        api("finance/fbr/submissions?limit=40"),
      ]);
      setCfg(c.data);
      setScenarios(s.data || []);
      setLog(l.data || []);
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (id, mode) => {
    setBusy(`${id}:${mode}`);
    setMsg(null);
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}finance/fbr/scenarios/${id}/run`, {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      const d = await res.json().catch(() => ({}));
      setMsg({ type: res.ok ? "success" : "error", text: d.msg || "Request failed" });
    } finally {
      setBusy("");
      load();
    }
  };

  const runAll = async (mode) => {
    for (const s of scenarios) {
      if (mode === "post" && s.status === "passed") continue;
      // eslint-disable-next-line no-await-in-loop
      await run(s.id, mode);
    }
  };

  const passed = scenarios.filter((s) => s.status === "passed").length;
  const sandbox = cfg?.environment === "sandbox";

  return (
    <div className="page">
      <PageHeader
        eyebrow="Compliance"
        title="FBR Digital Invoicing"
        subtitle="PRAL DI API integration — configuration, sandbox scenarios and submission log"
        actions={
          <button className="btn-secondary" onClick={load} disabled={loading}>
            <RefreshCw size={16} /> Refresh
          </button>
        }
      />

      {msg && <Alert type={msg.type} onClose={() => setMsg(null)}>{msg.text}</Alert>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Integration"
          value={cfg ? (cfg.ready ? "Connected" : cfg.enabled ? "Incomplete" : "Disabled") : "…"}
          hint={cfg ? `${cfg.environment === "production" ? "Production" : "Sandbox"} environment` : ""}
          icon={ServerCog}
          tone={cfg?.ready ? "green" : "amber"}
        />
        <KpiCard label="Seller NTN" value={cfg?.seller?.ntnCnic || "-"} hint={cfg?.seller?.province} icon={BadgeCheck} />
        <KpiCard label="Security token" value={cfg?.tokenHint || "Not set"} hint="Stored on the server only" icon={FileCheck2} tone="violet" />
        <KpiCard
          label="Sandbox scenarios"
          value={`${passed} / ${scenarios.length || 12}`}
          hint={passed === scenarios.length && passed ? "All assigned scenarios passed" : "Post each scenario once"}
          icon={CheckCircle2}
          tone={passed === scenarios.length && passed ? "green" : "sky"}
        />
      </div>

      <Section
        title="Sandbox scenarios"
        description={
          sandbox
            ? "Each scenario must be posted successfully in the sandbox before PRAL issues the production token. IRIS updates the status after a successful post."
            : "Production mode — scenario tests are disabled."
        }
        actions={
          sandbox && (
            <>
              <button className="btn-secondary text-xs" disabled={!!busy || !cfg?.ready} onClick={() => runAll("validate")}>
                <PlayCircle size={14} /> Validate all
              </button>
              <button className="btn-primary text-xs" disabled={!!busy || !cfg?.ready} onClick={() => runAll("post")}>
                <Send size={14} /> Post pending
              </button>
            </>
          )
        }
      >
        <div className="overflow-x-auto -mx-5">
          <table className="data-table">
            <thead>
              <tr>
                <th>Scenario</th>
                <th>Description</th>
                <th>Sale type</th>
                <th>Buyer</th>
                <th>Status</th>
                <th>Last result</th>
                {sandbox && <th className="text-right">Run</th>}
              </tr>
            </thead>
            <tbody>
              {loading && !scenarios.length ? (
                <TableSkeleton cols={7} rows={6} />
              ) : (
                scenarios.map((s) => {
                  const [tone, label, Icon] = STATUS[s.status] || STATUS.pending;
                  const last = s.lastPost || s.lastValidate;
                  return (
                    <tr key={s.id}>
                      <td className="font-mono font-medium">{s.id}</td>
                      <td>{s.title}</td>
                      <td className="text-xs text-bodyText">{s.saleType}</td>
                      <td className="text-xs">{s.buyerRegistrationType}</td>
                      <td>
                        <Pill tone={tone}>
                          <Icon size={12} /> {label}
                        </Pill>
                      </td>
                      <td className="text-xs max-w-xs">
                        {last ? (
                          <>
                            <div className={last.ok ? "text-emerald-700" : "text-red-700"}>
                              {s.lastPost?.irn || (last.ok ? "Accepted" : `${last.errorCode ? `[${last.errorCode}] ` : ""}${last.error || "Rejected"}`)}
                            </div>
                            <div className="text-bodyText">{fmtDateTime(last.at)}</div>
                          </>
                        ) : s.invoicesPosted ? (
                          <span className="text-emerald-700">{s.invoicesPosted} live invoice(s) posted</span>
                        ) : (
                          <span className="text-bodyText">Not run yet</span>
                        )}
                      </td>
                      {sandbox && (
                        <td className="text-right whitespace-nowrap">
                          <button className="btn-ghost text-xs px-2.5 py-1.5" disabled={!!busy || !cfg?.ready} onClick={() => run(s.id, "validate")}>
                            {busy === `${s.id}:validate` ? <Spinner /> : <FileCheck2 size={14} />} Validate
                          </button>
                          <button className="btn-ghost text-xs px-2.5 py-1.5 text-brand" disabled={!!busy || !cfg?.ready} onClick={() => run(s.id, "post")}>
                            {busy === `${s.id}:post` ? <Spinner /> : <Send size={14} />} Post
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Submission log" description="Every call made to FBR, newest first">
        {log.length === 0 ? (
          <p className="text-sm text-bodyText">No submissions yet.</p>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="data-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Source</th>
                  <th>Action</th>
                  <th>Result</th>
                  <th>IRN / error</th>
                  <th>By</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {log.map((r) => (
                  <tr key={r._id}>
                    <td className="whitespace-nowrap text-xs">{fmtDateTime(r.createdAt)}</td>
                    <td className="text-xs">
                      {r.invoice?.invoiceNumber || (r.source === "scenario_test" ? "Scenario test" : "-")}
                      {r.scenarioId && <span className="text-bodyText"> · {r.scenarioId}</span>}
                    </td>
                    <td className="text-xs capitalize">
                      {r.mode} · {r.environment}
                    </td>
                    <td>{r.ok ? <Pill tone="green">Accepted</Pill> : <Pill tone="red">Rejected</Pill>}</td>
                    <td className="text-xs max-w-sm">
                      {r.ok ? (
                        <span className="font-mono">{r.irn || "-"}</span>
                      ) : (
                        <span className="text-red-700">
                          {r.errorCode ? `[${r.errorCode}] ` : ""}
                          {r.error}
                        </span>
                      )}
                    </td>
                    <td className="text-xs">{r.createdBy?.name || "-"}</td>
                    <td>
                      <button className="text-xs text-brand hover:underline" onClick={() => setDetail(r)}>
                        JSON
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {detail && (
        <Modal
          title="FBR request & response"
          subtitle={`${detail.mode} · ${fmtDateTime(detail.createdAt)}`}
          onClose={() => setDetail(null)}
          size="max-w-4xl"
        >
          <div className="grid md:grid-cols-2 gap-4">
            {[
              ["Request", detail.request],
              ["Response", detail.response],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="label">{k}</p>
                <pre className="text-xs bg-surface border border-gray-200 rounded-lg p-3 overflow-auto max-h-[60vh] whitespace-pre-wrap break-words">
                  {JSON.stringify(v, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
