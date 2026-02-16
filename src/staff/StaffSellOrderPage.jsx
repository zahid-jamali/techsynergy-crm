import { useCallback, useEffect, useState } from "react";

// import ViewSellOrderModal from "../components/staff/ViewSellOrderModal";
// import EditSellOrderModal from "../components/staff/EditSellOrderModal";
// import AddSellOrderModal from "../components/staff/AddSellOrderModal";
// import UpdateSellOrderStatusModal from "../components/staff/UpdateSellOrderStatusModal";
import ViewSOModal from "../components/staff/SO/ViewSOModal";

const StaffSellOrderPage = () => {
  const token = sessionStorage.getItem("token");

  const [sellOrders, setSellOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [viewOrder, setViewOrder] = useState(null);

  const fetchSellOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}quotes/my`, {
        headers: { authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setSellOrders(data.data || []);
    } catch (err) {
      console.error("Failed to fetch sell orders");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSellOrders();
  }, [fetchSellOrders]);

  const confirmedQuotes = sellOrders.filter(
    (q) => q.quoteStage === "Confirmed"
  );

  return (
    <div className="p-6 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Sell Orders</h1>

        {/* <button
          onClick={() => setShowAdd(true)}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
        >
          + New Sell Order
        </button> */}
      </div>

      {/* Table */}
      <div className="bg-black border border-gray-800 rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              <th className="p-3 text-left">Order No</th>
              <th className="p-3">Account</th>
              <th className="p-3">Status</th>
              <th className="p-3">Admin approval</th>
              <th className="p-3">Total (PKR)</th>
              <th className="p-3">Order Date</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : confirmedQuotes.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-400">
                  No sell orders found
                </td>
              </tr>
            ) : (
              confirmedQuotes.map((order) => (
                <tr
                  key={order._id}
                  className="border-t border-gray-800 hover:bg-gray-900"
                >
                  <td className="p-3">{order.quoteNumber}</td>
                  <td className="p-3">{order.account?.accountName}</td>
                  <td className="p-3">{order.quoteStage}</td>
                  <td className="p-3">
                    {order.isSOApproved ? (
                      <span className="bg-green-600">Approved</span>
                    ) : (
                      <span className="bg-red-600">Pending</span>
                    )}
                  </td>
                  <td className="p-3">{order.grandTotal?.toLocaleString()}</td>
                  <td className="p-3">
                    {order.confirmedDate
                      ? new Date(order.confirmedDate).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => setViewOrder(order)}
                      className="text-blue-400 hover:underline"
                    >
                      View
                    </button>
                    {/* <button
                      onClick={() => setEditOrder(order)}
                      className="text-yellow-400 hover:underline"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => setStatusModal(order)}
                      className="text-purple-400 hover:underline"
                    >
                      Update Status
                    </button> */}
                    <a
                      href={`${process.env.REACT_APP_BACKEND_URL}quotes/${order._id}/pdf`}
                      className="text-green-400 hover:underline"
                    >
                      PDF
                    </a>
                    |
                    <a
                      href={order.purchaseOrder ? order.purchaseOrder.url : "#"}
                      className="text-green-400 hover:underline"
                    >
                      PO
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}

      {viewOrder && (
        <ViewSOModal quote={viewOrder} onClose={() => setViewOrder(null)} />
      )}

      {/* {showAdd && (
        <AddSellOrderModal
          onClose={() => setShowAdd(false)}
          onSuccess={fetchSellOrders}
        />
      )}

      

      {editOrder && (
        <EditSellOrderModal
          sellOrder={editOrder}
          onClose={() => setEditOrder(null)}
          onSuccess={fetchSellOrders}
        />
      )}

      {statusModal && (
        <UpdateSellOrderStatusModal
          sellOrderId={statusModal._id}
          currentStatus={statusModal.orderStatus}
          onClose={() => setStatusModal(null)}
          onSuccess={fetchSellOrders}
        />
      )} */}
    </div>
  );
};

export default StaffSellOrderPage;
