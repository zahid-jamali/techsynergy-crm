import { useCallback, useEffect, useState } from "react";

import ViewSOModal from "../components/staff/SO/ViewSOModal";
import ApproveSOModal from "../components/admin/ApproveSOModal";
import PdfViewersModal from "../components/staff/SO/PdfViewersModal";

const AdminSellOrderPage = () => {
  const token = sessionStorage.getItem("token");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [viewOrder, setViewOrder] = useState(null);
  const [showApproveSO, setShowApproveSO] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);

  /*
  ===============================
  FETCH ORDERS
  ===============================
  */

  const fetchOrders = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}orders/all`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setOrders(data.data || []);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /*
  ===============================
  UI
  ===============================
  */

  return (
    <div className="p-6 text-heading">
      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-brand">Sales Orders</h1>
      </div>

      {/* TABLE */}

      <div className="bg-card border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card text-bodyText">
            <tr>
              <th className="p-3 text-left">Order No</th>

              <th className="p-3">Account</th>

              <th className="p-3">Status</th>

              <th className="p-3">Admin Approval</th>

              <th className="p-3">Total (PKR)</th>

              <th className="p-3">Created By</th>

              <th className="p-3">Order Date</th>

              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="p-6 text-center text-bodyText">
                  Loading orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-6 text-center text-bodyText">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-t border-gray-200 hover:bg-surface"
                >
                  {/* ORDER NUMBER */}

                  <td
                    onClick={() => setViewOrder(order)}
                    className="p-3 cursor-pointer hover:text-brand"
                  >
                    {order.orderNumber || "-"}
                  </td>

                  {/* ACCOUNT */}

                  <td onClick={() => setViewOrder(order)} className="p-3">
                    {order.finalQuote?.account?.accountName || "-"}
                  </td>

                  {/* STATUS */}

                  <td onClick={() => setViewOrder(order)} className="p-3">
                    {order.status}
                  </td>

                  {/* APPROVAL */}

                  <td className="p-3">
                    {order.isSOApproved ? (
                      <span className="px-2 py-1 rounded bg-emerald-600 text-xs">
                        Approved
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded bg-brand text-xs">
                        Pending
                      </span>
                    )}
                  </td>

                  {/* TOTAL */}

                  <td onClick={() => setViewOrder(order)} className="p-3">
                    {order.grandTotal?.toLocaleString()}
                  </td>

                  {/* CREATED BY */}

                  <td onClick={() => setViewOrder(order)} className="p-3">
                    {order.createdBy?.name || "-"}
                  </td>

                  {/* DATE */}

                  <td onClick={() => setViewOrder(order)} className="p-3">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>

                  {/* ACTIONS */}

                  <td className="p-3 flex gap-2">
                    {/* APPROVE */}
                    {!order.isSOApproved && (
                      <button
                        onClick={() => setShowApproveSO(order)}
                        className="text-amber-700 hover:underline"
                      >
                        Approve-SO
                      </button>
                    )}
                    {/* ORDER PDF */}
                    <a
                      href={`${process.env.REACT_APP_BACKEND_URL}quotes/${order.finalQuote?._id}/pdf`}
                      className="text-emerald-700 hover:underline"
                    >
                      PDF
                    </a>
                    |{/* PURCHASE ORDER */}
                    {order.purchaseOrder?.url && (
                      <a
                        href={`${process.env.REACT_APP_BACKEND_URL.replace(
                          "/api/",
                          ""
                        )}${order.purchaseOrder.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 hover:underline"
                      >
                        PO
                      </a>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODALS */}

      {viewOrder && (
        <ViewSOModal order={viewOrder} onClose={() => setViewOrder(null)} />
      )}

      {showApproveSO && (
        <ApproveSOModal
          order={showApproveSO}
          onClose={() => setShowApproveSO(null)}
          onSuccess={fetchOrders}
        />
      )}

      {selectedPdf && (
        <PdfViewersModal
          pdfUrl={selectedPdf}
          onClose={() => setSelectedPdf(null)}
        />
      )}
    </div>
  );
};

export default AdminSellOrderPage;
