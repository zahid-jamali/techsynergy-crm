export default function EditUserModal({ user, onClose, onSave, loading }) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg w-full max-w-md p-6 border border-zinc-800">
        <h2 className="text-xl font-bold text-white mb-4">Edit User</h2>

        {/* Role */}
        <div className="mb-4">
          <label className="block text-sm text-gray-300 mb-1">Role</label>
          <select
            value={user.isSuperUser ? "admin" : "staff"}
            onChange={(e) =>
              onSave({
                ...user,
                isSuperUser: e.target.value === "admin",
              })
            }
            className="w-full bg-zinc-800 text-white px-3 py-2 rounded border border-zinc-700"
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Status */}
        <div className="mb-6">
          <label className="block text-sm text-gray-300 mb-1">Status</label>
          <select
            value={user.isActive ? "active" : "inactive"}
            onChange={(e) =>
              onSave({
                ...user,
                isActive: e.target.value === "active",
              })
            }
            className="w-full bg-zinc-800 text-white px-3 py-2 rounded border border-zinc-700"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={() => onSave(user, true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
