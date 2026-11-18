import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardCheck, Package, Send, ShoppingCart, Truck } from "lucide-react";
import { api } from "../lib/api";
import { fmtDate } from "../lib/format";
import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";
import { Alert, EmptyState, KpiCard, PageHeader, Section } from "../components/desk/ui";

const FLOW = [
  ["readyForOps", "Ready", ShoppingCart, "brand"],
  ["poCreated", "PO created", Truck, "sky"],
  ["inDelivery", "In delivery", Package, "amber"],
  ["delivered", "Delivered", ClipboardCheck, "green"],
  ["forwarded", "With finance", Send, "violet"],
];

export default function OperationsDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("deliveries/dashboard")
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
  const total = FLOW.reduce((a, [key]) => a + (k[key] || 0), 0) || 1;

  return (
    <div className="page">
      <PageHeader
        eyebrow="Operations"
        title={`Welcome back${user.name ? `, ${user.name.split(" ")[0]}` : ""}`}
        subtitle="Approved sell orders move through procurement, delivery and finance handoff"
        actions={
          <>
            <button className="btn-secondary" onClick={() => navigate("/operations/deliveries")}>
              <Package size={16} /> Deliveries
            </button>
            <button className="btn-primary" onClick={() => navigate("/operations/orders")}>
              <ShoppingCart size={16} /> Approved orders
            </button>
          </>
        }
      />

      {k.delivered > 0 && (
        <Alert type="info" title={`${k.delivered} delivered order${k.delivered > 1 ? "s are" : " is"} waiting to be forwarded to finance`}>
          <button className="underline" onClick={() => navigate("/operations/deliveries")}>Open deliveries</button>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {FLOW.map(([key, label, Icon, tone]) => (
          <KpiCard
            key={key}
            label={label}
            value={k[key] || 0}
            icon={Icon}
            tone={tone}
            onClick={() => navigate(key === "delivered" || key === "inDelivery" ? "/operations/deliveries" : "/operations/orders")}
          />
        ))}
      </div>

      <Section title="Pipeline" description="Where approved orders are right now">
        <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
          {FLOW.map(([key, , , tone]) => {
            const w = ((k[key] || 0) / total) * 100;
            const color = { brand: "bg-brand", sky: "bg-sky-400", amber: "bg-amber-400", green: "bg-emerald-500", violet: "bg-violet-500" }[tone];
            return w ? <div key={key} className={color} style={{ width: `${w}%` }} title={`${key}: ${k[key]}`} /> : null;
          })}
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-xs text-bodyText">
          {FLOW.map(([key, label, , tone]) => (
            <span key={key} className="inline-flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${{ brand: "bg-brand", sky: "bg-sky-400", amber: "bg-amber-400", green: "bg-emerald-500", violet: "bg-violet-500" }[tone]}`} />
              {label} {k[key] || 0}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Recent deliveries" actions={<button className="btn-ghost text-xs" onClick={() => navigate("/operations/deliveries")}>View all</button>}>
        {data.recentDeliveries?.length ? (
          <ul className="divide-y divide-gray-100 -my-2">
            {data.recentDeliveries.map((d) => (
              <li key={d._id} className="py-2.5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-heading">{d.deliveryNumber}</p>
                  <p className="text-xs text-bodyText truncate">
                    {d.order?.orderNumber} · {d.order?.finalQuote?.account?.accountName || "-"} · {fmtDate(d.updatedAt)}
                  </p>
                </div>
                <StatusBadge value={d.status} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={Package} title="No deliveries yet" />
        )}
      </Section>
    </div>
  );
}
