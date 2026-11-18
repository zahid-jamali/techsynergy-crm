import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Package, Search } from "lucide-react";
import { api } from "../lib/api";
import { downloadFile } from "../lib/download";
import { fmtDate } from "../lib/format";
import StatusBadge from "../components/StatusBadge";
import DeliveryManageModal from "../components/operations/DeliveryManageModal";
import { Alert, EmptyState, PageHeader, Tabs, TableSkeleton } from "../components/desk/ui";

const FILTERS = {
  all: () => true,
  draft: (d) => d.status === "draft",
  in_transit: (d) => d.status === "in_transit",
  delivered: (d) => d.status === "delivered",
  forwarded_to_finance: (d) => d.status === "forwarded_to_finance",
};

export default function OperationsDeliveriesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api("deliveries");
      setItems(d.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(() => {
    const n = q.trim().toLowerCase();
    return items.filter(FILTERS[tab]).filter((d) =>
      !n
        ? true
        : [d.deliveryNumber, d.order?.orderNumber, d.order?.finalQuote?.account?.accountName, d.carrier, d.trackingNumber, d.receivedBy]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(n))
    );
  }, [items, tab, q]);

  const count = (k) => items.filter(FILTERS[k]).length;

  return (
    <div className="page">
      <PageHeader
        eyebrow="Fulfillment"
        title="Deliveries"
        subtitle="Dispatch goods with a delivery challan, record receipt and hand over to finance"
      />

      {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}

      <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:justify-between">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { value: "all", label: "All", count: items.length },
            { value: "draft", label: "Draft", count: count("draft") },
            { value: "in_transit", label: "In transit", count: count("in_transit") },
            { value: "delivered", label: "Delivered", count: count("delivered") },
            { value: "forwarded_to_finance", label: "With finance", count: count("forwarded_to_finance") },
          ]}
        />
        <div className="relative w-full lg:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-bodyText" />
          <input className="input pl-9" placeholder="Search challan, order, customer…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Challan</th>
              <th>Customer / order</th>
              <th>Dispatch</th>
              <th>Carrier</th>
              <th>Received by</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton cols={7} />
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <EmptyState icon={Package} title="No deliveries">
                    Open an approved sell order and create a delivery challan to start.
                  </EmptyState>
                </td>
              </tr>
            ) : (
              rows.map((d) => (
                <tr key={d._id} className="cursor-pointer" onClick={() => setSelected(d)}>
                  <td className="font-medium text-brand">{d.deliveryNumber}</td>
                  <td>
                    <div className="font-medium">{d.order?.finalQuote?.account?.accountName || "-"}</div>
                    <div className="text-xs text-bodyText">{d.order?.orderNumber || "-"}</div>
                  </td>
                  <td className="whitespace-nowrap">{fmtDate(d.dispatchDate || d.createdAt)}</td>
                  <td>
                    <div>{d.carrier || "-"}</div>
                    {d.trackingNumber && <div className="text-xs text-bodyText">{d.trackingNumber}</div>}
                  </td>
                  <td>
                    {d.receivedBy || <span className="text-bodyText">-</span>}
                    {d.deliveredAt && <div className="text-xs text-bodyText">{fmtDate(d.deliveredAt)}</div>}
                  </td>
                  <td><StatusBadge value={d.status} /></td>
                  <td className="text-right whitespace-nowrap">
                    <button
                      className="p-1.5 rounded text-bodyText hover:text-brand hover:bg-surface"
                      title="Download challan"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadFile(`deliveries/${d._id}/challan`, `${d.deliveryNumber}.pdf`).catch((err) => setError(err.message));
                      }}
                    >
                      <Download size={16} />
                    </button>
                    <button className="btn-secondary text-xs px-3 py-1.5 ml-1" onClick={(e) => { e.stopPropagation(); setSelected(d); }}>
                      Manage
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <DeliveryManageModal
          delivery={selected}
          onClose={() => {
            setSelected(null);
            load();
          }}
          onSuccess={() => {
            setSelected(null);
            load();
          }}
        />
      )}
    </div>
  );
}
