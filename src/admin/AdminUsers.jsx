import { useCallback, useEffect, useState } from "react";
import CreateUserModal from "../components/admin/CreateUserModal";
import EditUserModal from "../components/admin/EditUserModal";
import { Link } from "react-router-dom";
import { getUserRole, ROLE_LABELS } from "../lib/roles";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const token = sessionStorage.getItem("token");

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}user/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Failed to fetch users");
      }

      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, BACKEND_URL]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSaveUser = async (updatedUser, submit = false) => {
    setSelectedUser(updatedUser);

    if (!submit) return;

    try {
      setSaving(true);

      const res = await fetch(`${BACKEND_URL}user/update/${updatedUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: updatedUser.role || (updatedUser.isSuperUser ? "admin" : "staff"),
          isSuperUser: updatedUser.role
            ? updatedUser.role === "admin"
            : updatedUser.isSuperUser,
          isActive: updatedUser.isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Update failed");

      // Update UI instantly
      setUsers((prev) =>
        prev.map((u) => (u._id === updatedUser._id ? data.user : u))
      );

      setSelectedUser(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-bodyText">Loading users...</p>;
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  return (
    <div className="text-heading">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage admin, staff, operations and finance access</p>
        </div>
        <button
          onClick={() => setShowModal("Add")}
          className="btn-primary"
        >
          + Add User
        </button>
      </div>
      <div className="table-wrap">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface text-bodyText">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-card divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-4 py-3">
                  <Link to={`/admin/singleUserPerformance/${user._id}`}>
                    {user.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-bodyText">
                  <Link to={`/admin/singleUserPerformance/${user._id}`}>
                    {user.email}
                  </Link>
                </td>

                {/* Role */}
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      getUserRole(user) === "admin"
                        ? "bg-brand text-white"
                        : "bg-gray-100 text-bodyText"
                    }`}
                  >
                    <Link to={`/admin/singleUserPerformance/${user._id}`}>
                      {ROLE_LABELS[getUserRole(user)] || "Staff"}
                    </Link>
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      user.isActive
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 text-bodyText"
                    }`}
                  >
                    <Link to={`/admin/singleUserPerformance/${user._id}`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Link>
                  </span>
                </td>
                {/* Actions */}
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    className="px-3 py-1 bg-surface hover:bg-gray-100 rounded"
                    onClick={() => setSelectedUser(user)}
                  >
                    Edit
                  </button>

                  <button
                    className="px-3 py-1 btn-danger rounded"
                    onClick={() => alert("Users cannot be deleted!")}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Modal */}
      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          loading={saving}
          onClose={() => setSelectedUser(null)}
          onSave={handleSaveUser}
        />
      )}
      {showModal && (
        <CreateUserModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchUsers}
        />
      )}
    </div>
  );
}
