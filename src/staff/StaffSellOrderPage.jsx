import { useEffect, useState } from "react";
import AddOrderModal from "../components/staff/SO/AddOrderModal";
import DeleteOrderModal from "../components/staff/SO/DeleteOrderModal";
import ViewSOModal from "../components/staff/SO/ViewSOModal";

const StaffSellOrderPage = () => {
  const token = sessionStorage.getItem("token");

  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}orders/my`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch orders");

      const data = await res.json();

      setOrders(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (approved) => {
    if (approved)
      return (
        <span className="px-2 py-1 text-xs rounded bg-green-600">Approved</span>
      );

    return (
      <span className="px-2 py-1 text-xs rounded bg-yellow-600">Pending</span>
    );
  };

  return (
    <div className="p-6 text-white">
      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Sales Orders</h1>

          <p className="text-sm text-gray-400">
            Manage and track all sales orders
          </p>
        </div>

        <button
          onClick={() => setShowModal("Add")}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg shadow transition"
        >
          + New Sales Order
        </button>
      </div>

      {/* TABLE CONTAINER */}

      <div className="bg-[#0f172a] border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          {/* HEADER */}

          <thead className="bg-black border-b border-gray-800">
            <tr className="text-left text-gray-400">
              <th className="px-4 py-3">Subject</th>

              <th className="px-4 py-3">Account</th>

              <th className="px-4 py-3">Deal</th>

              <th className="px-4 py-3">Contact</th>

              <th className="px-4 py-3">Status</th>

              <th className="px-4 py-3">Total</th>

              <th className="px-4 py-3">Owner</th>

              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          {/* BODY */}

          <tbody>
            {loading && (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-400">
                  Loading orders...
                </td>
              </tr>
            )}

            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-500">
                  No sales orders found
                </td>
              </tr>
            )}

            {!loading &&
              orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-t border-gray-800 hover:bg-gray-900 transition"
                >
                  <td className="px-4 py-3 font-medium">
                    {order.finalQuote?.subject || "-"}
                  </td>

                  <td className="px-4 py-3">
                    {order.finalQuote?.account?.accountName || "-"}
                  </td>

                  <td className="px-4 py-3">
                    {order.finalQuote?.deal?.dealName || "-"}
                  </td>

                  <td className="px-4 py-3">
                    {order.finalQuote?.contact
                      ? `${order.finalQuote.contact.firstName} ${order.finalQuote.contact.lastName}`
                      : "-"}
                  </td>

                  <td className="px-4 py-3">
                    {getStatusBadge(order.isSOApproved)}
                  </td>

                  <td className="px-4 py-3 font-semibold text-red-400">
                    {order.finalQuote?.currency}{" "}
                    {order.grandTotal?.toLocaleString()}
                  </td>

                  <td className="px-4 py-3">{order.createdBy?.name || "-"}</td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowModal("View");
                        }}
                        className="px-3 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600"
                      >
                        View
                      </button>

                      {order.status === "Pending" && (
                        <>
                          <button className="px-3 py-1 text-xs rounded bg-blue-600 hover:bg-blue-700">
                            Edit
                          </button>

                          <button
                            onClick={() => {
                              setShowModal("Delete");
                              setSelectedOrder(order);
                            }}
                            className="px-3 py-1 text-xs rounded bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {order.purchaseOrder?.url && (
                        <a
                          href={`${process.env.REACT_APP_BACKEND_URL.replace(
                            "/api",
                            ""
                          )}${order.purchaseOrder.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <button className="px-3 py-1 text-xs rounded bg-green-500 hover:bg-green-600 text-white">
                            PO
                          </button>
                        </a>
                      )}

                      <a
                        href={`${process.env.REACT_APP_BACKEND_URL}quotes/${order.finalQuote?._id}/pdf`}
                      >
                        <button className="px-3 py-1 text-xs rounded bg-green-300 hover:bg-green-700">
                          Q-PDF
                        </button>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}

      {showModal === "Add" && (
        <AddOrderModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(null);
            fetchOrders();
          }}
        />
      )}

      {showModal === "View" && (
        <ViewSOModal order={selectedOrder} onClose={() => setShowModal(null)} />
      )}

      {showModal === "Delete" && (
        <DeleteOrderModal
          orderId={selectedOrder._id}
          onClose={() => setShowModal("")}
          onSuccess={() => {
            setShowModal(null);
            fetchOrders();
          }}
        />
      )}
    </div>
  );
};

export default StaffSellOrderPage;
