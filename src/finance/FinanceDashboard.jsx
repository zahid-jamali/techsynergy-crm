import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, BadgeCheck, CalendarClock, FileText, Inbox, Landmark, Receipt, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../lib/api";
import { accountOf, fmtCompact, fmtDate, fmtMoney } from "../lib/format";
import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";
import { Alert, EmptyState, FbrBadge, KpiCard, PageHeader, Section } from "../components/desk/ui";

export default function FinanceDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("finance/dashboard")
      .then((d) => setData(d.data))
      .catch((e) => setError(e.message));
  }, []);

  if (!data) {
    return (
      <div className="flex justify-center items-center h-60">
        {error ? <Alert type="error">{error}</Alert> : <Loading />}
      </div>
    );
  }

  const k = data.kpis;
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const month = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="page">
      <PageHeader
        eyebrow={month}
        title={`Welcome back${user.name ? `, ${user.name.split(" ")[0]}` : ""}`}
        subtitle="Billing pipeline, FBR reporting and this month's sales tax position"
        actions={
          <>
            <button className="btn-secondary" onClick={() => navigate("/finance/reports")}>
              <Landmark size={16} /> Reports
            </button>
            <button className="btn-primary" onClick={() => navigate("/finance/queue")}>
              <Inbox size={16} /> Handoff queue {k.queueCount ? `(${k.queueCount})` : ""}
            </button>
          </>
        }
      />

      {data.fbr && !data.fbr.ready && (
        <Alert type="warning" title="FBR Digital Invoicing is not ready">
          Invoices cannot be reported until the FBR token and seller NTN are configured on the server.
        </Alert>
      )}
      {k.fbrFailed > 0 && (
        <Alert type="error" title={`${k.fbrFailed} draft invoice${k.fbrFailed > 1 ? "s were" : " was"} rejected by FBR`}>
          <button className="underline" onClick={() => navigate("/finance/invoices")}>Review and correct them</button>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Awaiting invoice" value={k.queueCount} hint="Deliveries forwarded by operations" icon={Inbox} tone="violet" onClick={() => navigate("/finance/queue")} />
        <KpiCard label="Draft invoices" value={k.draftCount} hint="Need tax details & issuing" icon={FileText} tone="amber" onClick={() => navigate("/finance/invoices")} />
        <KpiCard label="Revenue this month" value={fmtCompact(k.monthlyRevenue)} hint={`${k.issuedThisMonth} invoices issued · PKR`} icon={Wallet} tone="green" />
        <KpiCard label="Output sales tax" value={fmtCompact(k.monthlySalesTax)} hint="This month · PKR" icon={Receipt} tone="brand" />
        <KpiCard label="Reported to FBR" value={k.fbrSubmitted} hint={data.fbr?.environment === "sandbox" ? "Sandbox environment" : "Production"} icon={BadgeCheck} tone="sky" />
        <KpiCard label="Issued (all time)" value={k.issuedCount} icon={Receipt} tone="gray" />
        <KpiCard label="Overdue" value={k.overdue} hint="Past due date" icon={CalendarClock} tone={k.overdue ? "red" : "gray"} />
        <KpiCard label="Cancelled" value={k.cancelledCount} icon={AlertTriangle} tone="gray" />
      </div>

      <div className="grid xl:grid-cols-5 gap-6">
        <Section title="Invoiced revenue" description="Last 6 months, issued invoices" className="xl:col-span-3">
          {data.trend?.length ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.trend} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickFormatter={fmtCompact} tickLine={false} axisLine={false} fontSize={12} width={56} />
                  <Tooltip formatter={(v) => fmtMoney(v, "")} cursor={{ fill: "rgba(11,41,101,0.04)" }} />
                  <Bar dataKey="revenue" name="Revenue" fill="#0b2965" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="salesTax" name="Sales tax" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState icon={Wallet} title="No issued invoices yet" />
          )}
        </Section>

        <Section title="Recent activity" className="xl:col-span-2">
          {data.recentInvoices?.length ? (
            <ul className="divide-y divide-gray-100 -my-2">
              {data.recentInvoices.map((inv) => (
                <li key={inv._id}>
                  <button
                    onClick={() => navigate(`/finance/invoices/${inv._id}`)}
                    className="w-full py-2.5 flex items-center justify-between gap-3 text-left hover:bg-surface -mx-2 px-2 rounded-lg"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-heading">{inv.invoiceNumber}</p>
                      <p className="text-xs text-bodyText truncate">
                        {accountOf(inv)} · {fmtDate(inv.documentDate)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium tabular-nums">{fmtMoney(inv.grandTotal, inv.currency)}</p>
                      <div className="flex gap-1 justify-end mt-0.5">
                        <StatusBadge value={inv.status} />
                        {inv.status !== "Cancelled" && <FbrBadge fbr={inv.fbr} />}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={FileText} title="No invoices yet" />
          )}
        </Section>
      </div>
    </div>
  );
}
