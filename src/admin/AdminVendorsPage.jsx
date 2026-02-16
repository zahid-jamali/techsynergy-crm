import { useCallback, useEffect, useState } from "react";
import AddVendorModal from "../components/admin/AddVendorModal";
import EditVendorModal from "../components/admin/EditVendorModal";
import DeleteVendorModal from "../components/admin/DeleteVendorModal";

const AdminVendorsPage = () => {
  const token = sessionStorage.getItem("token");

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [editVendor, setEditVendor] = useState(null);
  const [deleteVendor, setDeleteVendor] = useState(null);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}vendors/get`,
        {
          headers: { authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setVendors(data.data || []);
    } catch (err) {
      console.error("Failed to fetch vendors");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  return (
    <div className="p-6 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-red-500">
          Vendor Management
        </h1>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm"
        >
          + Add Vendor
        </button>
      </div>

      {/* Table */}
      <div className="bg-black border border-gray-800 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3">Status</th>
              <th className="p-3">Contacts</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : vendors.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-400">
                  No vendors found
                </td>
              </tr>
            ) : (
              vendors.map((v) => (
                <tr
                  key={v._id}
                  className="border-t border-gray-800 hover:bg-gray-900"
                >
                  <td className="p-3">{v.name}</td>
                  <td className="p-3">
                    <span className="text-xs px-2 py-1 rounded bg-gray-800 text-green-400">
                      {v.status}
                    </span>
                  </td>
                  <td className="p-3">{v.contacts?.length || 0}</td>
                  <td className="p-3 flex gap-3">
                    <button
                      onClick={() => setEditVendor(v)}
                      className="text-yellow-400 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteVendor(v)}
                      className="text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showAdd && (
        <AddVendorModal
          onClose={() => setShowAdd(false)}
          onSuccess={fetchVendors}
        />
      )}

      {editVendor && (
        <EditVendorModal
          vendor={editVendor}
          onClose={() => setEditVendor(null)}
          onSuccess={fetchVendors}
        />
      )}

      {deleteVendor && (
        <DeleteVendorModal
          vendor={deleteVendor}
          onClose={() => setDeleteVendor(null)}
          onSuccess={fetchVendors}
        />
      )}
    </div>
  );
};

export default AdminVendorsPage;
