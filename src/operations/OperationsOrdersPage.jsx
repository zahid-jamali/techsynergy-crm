import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import DeliveryManageModal from "../components/operations/DeliveryManageModal";
import ViewSOModal from "../components/staff/SO/ViewSOModal";
import OrderDocumentDownload from "../components/documents/OrderDocumentDownload";

const OperationsOrdersPage = () => {
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewOrder, setViewOrder] = useState(null);
  const [deliveryOrder, setDeliveryOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}orders/all?isSOApproved=true&limit=100`,
        { headers: { authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setOrders(data.data || []);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const accepted = orders.filter((o) => o.status === "Accepted");

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Approved Sell Orders</h1>
          <p className="page-subtitle">
            Create vendor POs, manage deliveries, then forward completed work to
            finance
          </p>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Account / Deal</th>
              <th>Total</th>
              <th>Fulfillment</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-bodyText">
                  Loading orders...
                </td>
              </tr>
            ) : accepted.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-bodyText">
                  No approved sell orders yet
                </td>
              </tr>
            ) : (
              accepted.map((order) => (
                <tr key={order._id}>
                  <td
                    className="cursor-pointer font-medium"
                    onClick={() => setViewOrder(order)}
                  >
                    {order.orderNumber}
                  </td>
                  <td>
                    <div className="font-medium">
                      {order.finalQuote?.account?.accountName || "-"}
                    </div>
                    <div className="text-xs text-bodyText">
                      {order.finalQuote?.deal?.dealName || "-"}
                    </div>
                  </td>
                  <td>
                    {order.currency} {order.grandTotal?.toLocaleString()}
                  </td>
                  <td>
                    <StatusBadge value={order.fulfillmentStatus} />
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="space-x-3 whitespace-nowrap">
                    <OrderDocumentDownload
                      orderId={order._id}
                      type="invoice"
                      label="Invoice"
                      fileName={`Invoice-${order.orderNumber || order._id}.pdf`}
                    />
                    <OrderDocumentDownload
                      orderId={order._id}
                      type="deliveryNote"
                      label="D-Note"
                      fileName={`Delivery-Note-${order.orderNumber || order._id}.pdf`}
                    />
                    <button
                      onClick={() => navigate("/operations/purchase-orders")}
                      className="text-brand hover:underline text-sm"
                    >
                      Vendor PO
                    </button>
                    <button
                      onClick={() => setDeliveryOrder(order)}
                      className="text-brand hover:underline text-sm"
                    >
                      Delivery
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {viewOrder && (
        <ViewSOModal order={viewOrder} onClose={() => setViewOrder(null)} />
      )}
      {deliveryOrder && (
        <DeliveryManageModal
          order={deliveryOrder}
          onClose={() => setDeliveryOrder(null)}
          onSuccess={() => {
            setDeliveryOrder(null);
            fetchOrders();
          }}
        />
      )}
    </div>
  );
};

export default OperationsOrdersPage;
