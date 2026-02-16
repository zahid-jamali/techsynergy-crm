import { useCallback, useEffect, useState } from "react";
import AddPOToVendorModal from "../components/admin/AddPOToVendorModal";
import ViewPOToVendorModal from "../components/admin/ViewPOToVendorModal";
import EditPOToVendorModal from "../components/admin/EditPOToVendorModal";
import DeletePOToVendorModal from "../components/admin/DeletePOToVendorModal";

const AdminPOToVendorPage = () => {
  const token = sessionStorage.getItem("token");

  const [pos, setPOs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [viewPO, setViewPO] = useState(null);
  const [editPO, setEditPO] = useState(null);
  const [deletePO, setDeletePO] = useState(null);

  const fetchPOs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}potovendor/get`,
        { headers: { authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setPOs(data.data || []);
    } catch (err) {
      console.error("Failed to fetch POs");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPOs();
  }, [fetchPOs]);

  return (
    <div className="p-6 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-red-500">
          Purchase Orders (Vendors)
        </h1>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm"
        >
          + New PO
        </button>
      </div>

      {/* Table */}
      <div className="bg-black border border-gray-800 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              <th className="p-3 text-left">PO No</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Ref Quote</th>
              <th className="p-3">Total</th>
              <th className="p-3">Created</th>
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
            ) : pos.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-400">
                  No purchase orders found
                </td>
              </tr>
            ) : (
              pos.map((po) => (
                <tr
                  key={po._id}
                  className="border-t border-gray-800 hover:bg-gray-900"
                >
                  <td className="p-3">{po.poToNumber}</td>
                  <td className="p-3">{po.subject}</td>
                  <td className="p-3">{po.refQuote?.quoteNumber || "-"}</td>
                  <td className="p-3">{po.grandTotal?.toLocaleString()}</td>
                  <td className="p-3">
                    {new Date(po.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 flex gap-3">
                    <button
                      onClick={() => setViewPO(po)}
                      className="text-blue-400 hover:underline"
                    >
                      View
                    </button>
                    <button
                      onClick={() => setEditPO(po)}
                      className="text-yellow-400 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletePO(po)}
                      className="text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                    <a
                      href={`${process.env.REACT_APP_BACKEND_URL}potovendor/${po._id}/pdf`}
                      className="text-green-400 hover:underline"
                    >
                      Download
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showAdd && (
        <AddPOToVendorModal
          onClose={() => setShowAdd(false)}
          onSuccess={fetchPOs}
        />
      )}

      {viewPO && (
        <ViewPOToVendorModal po={viewPO} onClose={() => setViewPO(null)} />
      )}

      {editPO && (
        <EditPOToVendorModal
          po={editPO}
          onClose={() => setEditPO(null)}
          onSuccess={fetchPOs}
        />
      )}

      {deletePO && (
        <DeletePOToVendorModal
          po={deletePO}
          onClose={() => setDeletePO(null)}
          onSuccess={fetchPOs}
        />
      )}
    </div>
  );
};

export default AdminPOToVendorPage;
