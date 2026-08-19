import { useCallback, useEffect, useState } from "react";
import StatusBadge from "../components/StatusBadge";
import DeliveryManageModal from "../components/operations/DeliveryManageModal";

const OperationsDeliveriesPage = () => {
  const token = sessionStorage.getItem("token");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}deliveries`, {
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setItems(data.data || []);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Deliveries</h1>
        <p className="page-subtitle">
          Attach the delivery note and supporting files, then forward to finance
        </p>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Delivery</th>
              <th>Sell order</th>
              <th>Account</th>
              <th>Carrier</th>
              <th>Status</th>
              <th>Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-bodyText">
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-bodyText">
                  No deliveries yet. Open an approved order to start one.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item._id}>
                  <td className="font-medium">{item.deliveryNumber}</td>
                  <td>{item.order?.orderNumber || "-"}</td>
                  <td>
                    {item.order?.finalQuote?.account?.accountName || "-"}
                  </td>
                  <td>{item.carrier || "-"}</td>
                  <td>
                    <StatusBadge value={item.status} />
                  </td>
                  <td>{new Date(item.updatedAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => setSelected(item)}
                      className="text-brand hover:underline text-sm"
                    >
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
          order={selected.order}
          delivery={selected}
          onClose={() => setSelected(null)}
          onSuccess={() => {
            setSelected(null);
            fetchDeliveries();
          }}
        />
      )}
    </div>
  );
};

export default OperationsDeliveriesPage;
