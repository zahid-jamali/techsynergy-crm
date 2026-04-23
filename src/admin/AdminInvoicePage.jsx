import { useCallback, useEffect, useState } from "react";

import ViewSOModal from "../components/staff/SO/ViewSOModal";
import ApproveSOModal from "../components/admin/ApproveSOModal";
import PdfViewersModal from "../components/staff/SO/PdfViewersModal";
import InvoiceTermsModal from "../components/admin/InvoiceTermsModal";

const AdminSellOrderPage = () => {
  const token = sessionStorage.getItem("token");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [viewOrder, setViewOrder] = useState(null);
  const [showApproveSO, setShowApproveSO] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);

  const [showModal, setShowModal] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState();

  /*
  ===============================
  FETCH ORDERS
  ===============================
  */

  const fetchOrders = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}orders/all?isSOApproved=true`,
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
    <div className="p-6 text-white">
      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-red-500">Invoices Page</h1>
      </div>

      {/* TABLE */}

      <div className="bg-black border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400">
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
                <td colSpan="8" className="p-6 text-center text-gray-400">
                  Loading orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-6 text-center text-gray-400">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-t border-gray-800 hover:bg-gray-900"
                >
                  {/* ORDER NUMBER */}

                  <td
                    onClick={() => setViewOrder(order)}
                    className="p-3 cursor-pointer hover:text-red-400"
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
                      <span className="px-2 py-1 rounded bg-green-600 text-xs">
                        Approved
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded bg-red-600 text-xs">
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
                        className="text-yellow-400 hover:underline"
                      >
                        Approve-SO
                      </button>
                    )}
                    {/* ORDER PDF */}
                    <a
                      href={`${process.env.REACT_APP_BACKEND_URL}quotes/${order.finalQuote?._id}/pdf`}
                      className="text-green-400 hover:underline"
                    >
                      Q- PDF
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
                        className="text-green-400 hover:underline"
                      >
                        PO
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setShowModal("terms");
                        setSelectedInvoice(order);
                      }}
                      className="text-red-500 hover:text-green-500"
                    >
                      Invoice-Terms
                    </button>
                    <a
                      href={`${process.env.REACT_APP_BACKEND_URL}invoice/${order._id}/pdf`}
                      className="text-green-400 hover:underline"
                    >
                      Invoice
                    </a>
                    <a
                      href={`${process.env.REACT_APP_BACKEND_URL}invoice/${order._id}/deliveryNote`}
                      className="text-green-400 hover:underline"
                    >
                      D-Note
                    </a>
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

      {showModal === "terms" && (
        <InvoiceTermsModal
          isOpen={showModal === "terms"}
          onClose={() => {
            setShowModal("");
            setSelectedInvoice(null);
          }}
          orderId={selectedInvoice._id}
          existingTerms={selectedInvoice.invoiceTermsAndConditions}
          onSaved={fetchOrders}
        />
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
