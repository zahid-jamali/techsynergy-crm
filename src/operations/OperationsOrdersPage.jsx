import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, FileSpreadsheet, Search, ShoppingCart, Truck } from "lucide-react";
import { api } from "../lib/api";
import { downloadFile } from "../lib/download";
import { fmtDate, fmtMoney } from "../lib/format";
import StatusBadge from "../components/StatusBadge";
import DeliveryManageModal from "../components/operations/DeliveryManageModal";
import ViewSOModal from "../components/staff/SO/ViewSOModal";
import { Alert, EmptyState, PageHeader, Tabs, TableSkeleton } from "../components/desk/ui";

const FILTERS = {
  open: (o) => !["forwarded_to_finance", "invoiced"].includes(o.fulfillmentStatus),
  ready_for_operations: (o) => o.fulfillmentStatus === "ready_for_operations",
  in_delivery: (o) => ["po_created", "in_delivery"].includes(o.fulfillmentStatus),
  delivered: (o) => o.fulfillmentStatus === "delivered",
  closed: (o) => ["forwarded_to_finance", "invoiced"].includes(o.fulfillmentStatus),
};

export default function OperationsOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewOrder, setViewOrder] = useState(null);
  const [deliveryOrder, setDeliveryOrder] = useState(null);
  const [tab, setTab] = useState("open");
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api("orders/all?isSOApproved=true&limit=200");
      setOrders((d.data || []).filter((o) => o.status === "Accepted"));
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
    return orders.filter(FILTERS[tab]).filter((o) =>
      !n
        ? true
        : [o.orderNumber, o.finalQuote?.account?.accountName, o.finalQuote?.deal?.dealName]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(n))
    );
  }, [orders, tab, q]);

  const count = (k) => orders.filter(FILTERS[k]).length;

  return (
    <div className="page">
      <PageHeader
        eyebrow="Fulfillment"
        title="Approved sell orders"
        subtitle="Procure from vendors, dispatch with a delivery challan, then forward to finance for invoicing"
        actions={
          <button className="btn-secondary" onClick={() => navigate("/operations/purchase-orders")}>
            <FileSpreadsheet size={16} /> Vendor POs
          </button>
        }
      />

      {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}

      <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:justify-between">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { value: "open", label: "Open", count: count("open") },
            { value: "ready_for_operations", label: "Ready", count: count("ready_for_operations") },
            { value: "in_delivery", label: "In progress", count: count("in_delivery") },
            { value: "delivered", label: "Delivered", count: count("delivered") },
            { value: "closed", label: "With finance", count: count("closed") },
          ]}
        />
        <div className="relative w-full lg:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-bodyText" />
          <input className="input pl-9" placeholder="Search order, customer, deal…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer / deal</th>
              <th className="text-right">Value</th>
              <th>Items</th>
              <th>Fulfillment</th>
              <th>Confirmed</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton cols={7} />
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <EmptyState icon={ShoppingCart} title="No orders in this view" />
                </td>
              </tr>
            ) : (
              rows.map((o) => (
                <tr key={o._id}>
                  <td>
                    <button className="font-medium text-brand hover:underline" onClick={() => setViewOrder(o)}>
                      {o.orderNumber}
                    </button>
                  </td>
                  <td>
                    <div className="font-medium">{o.finalQuote?.account?.accountName || "-"}</div>
                    <div className="text-xs text-bodyText">{o.finalQuote?.deal?.dealName || "-"}</div>
                  </td>
                  <td className="text-right tabular-nums whitespace-nowrap">{fmtMoney(o.grandTotal, o.currency)}</td>
                  <td className="text-xs text-bodyText">
                    {(o.products || []).length} line{(o.products || []).length === 1 ? "" : "s"} ·{" "}
                    {(o.products || []).reduce((a, p) => a + (Number(p.quantity) || 0), 0)} qty
                  </td>
                  <td><StatusBadge value={o.fulfillmentStatus} /></td>
                  <td className="whitespace-nowrap">{fmtDate(o.confirmedDate || o.createdAt)}</td>
                  <td className="text-right whitespace-nowrap">
                    <button className="btn-secondary text-xs px-3 py-1.5" onClick={() => setDeliveryOrder(o)}>
                      <Truck size={14} /> {["ready_for_operations", "po_created"].includes(o.fulfillmentStatus) ? "Create delivery" : "Delivery"}
                    </button>
                    <button
                      className="btn-secondary text-xs px-3 py-1.5 ml-1.5"
                      title="Download delivery note"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadFile(`invoice/${o._id}/deliveryNote`, `Delivery-Note-${o.orderNumber || o._id}.pdf`).catch((err) => setError(err.message));
                      }}
                    >
                      <Download size={14} /> D-Note
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {viewOrder && <ViewSOModal order={viewOrder} onClose={() => setViewOrder(null)} />}
      {deliveryOrder && (
        <DeliveryManageModal
          order={deliveryOrder}
          onClose={() => {
            setDeliveryOrder(null);
            load();
          }}
          onSuccess={() => {
            setDeliveryOrder(null);
            load();
          }}
        />
      )}
    </div>
  );
}
