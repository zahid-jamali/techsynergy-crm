import { useCallback, useEffect, useState } from "react";
import CreateUserModal from "../components/admin/CreateUserModal";
import EditUserModal from "../components/admin/EditUserModal";

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
          isSuperUser: updatedUser.isSuperUser,
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
    return <p className="text-gray-400">Loading users...</p>;
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  return (
    <div className="text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-red-500">User Management</h1>
        <button
          onClick={() => setShowModal("Add")}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-semibold"
        >
          + Add Users
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-900 text-gray-300">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-zinc-950 divide-y divide-zinc-800">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3 text-gray-400">{user.email}</td>

                {/* Role */}
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      user.isSuperUser
                        ? "bg-red-600 text-white"
                        : "bg-zinc-700 text-gray-200"
                    }`}
                  >
                    {user.isSuperUser ? "Admin" : "Staff"}
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      user.isActive
                        ? "bg-green-600 text-white"
                        : "bg-zinc-700 text-gray-300"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded"
                    onClick={() => setSelectedUser(user)}
                  >
                    Edit
                  </button>

                  <button
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded"
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
