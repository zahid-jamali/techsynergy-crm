import { useEffect, useState } from "react";

import ViewSOModal from "../components/staff/SO/ViewSOModal";
import ApproveSOModal from "../components/admin/ApproveSOModal";

const AdminSellOrderPage = () => {
  const token = sessionStorage.getItem("token");

  const [sellOrders, setSellOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewOrder, setViewOrder] = useState(null);
  const [showApproveSO, setShowApproveSO] = useState(null);

  const fetchSellOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}quotes/all`,
        {
          headers: { authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setSellOrders(data.data || []);
    } catch (err) {
      console.error("Failed to fetch sell orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellOrders();
  }, []);

  const confirmedQuotes = sellOrders.filter(
    (q) => q.quoteStage === "Confirmed"
  );

  return (
    <div className="p-6 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Sell Orders</h1>
      </div>

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
                  <td onClick={() => setViewOrder(order)} className="p-3">
                    {order.quoteNumber}
                  </td>
                  <td onClick={() => setViewOrder(order)} className="p-3">
                    {order.account?.accountName}
                  </td>
                  <td onClick={() => setViewOrder(order)} className="p-3">
                    {order.quoteStage}
                  </td>
                  <td onClick={() => setViewOrder(order)} className="p-3">
                    {order.isSOApproved ? (
                      <span className="bg-green-600">Approved</span>
                    ) : (
                      <span className="bg-red-600">Pending</span>
                    )}
                  </td>
                  <td onClick={() => setViewOrder(order)} className="p-3">
                    {order.grandTotal?.toLocaleString()}
                  </td>
                  <td onClick={() => setViewOrder(order)} className="p-3">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 flex gap-2">
                    {order.isSOApproved ? (
                      <></>
                    ) : (
                      <button
                        onClick={() => setShowApproveSO(order)}
                        className="text-yellow-400 hover:underline"
                      >
                        Approve-SO
                      </button>
                    )}
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

      {showApproveSO && (
        <ApproveSOModal
          quoteId={showApproveSO._id}
          onClose={() => setShowApproveSO(null)}
          onSuccess={() => fetchSellOrders()}
        />
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

export default AdminSellOrderPage;
