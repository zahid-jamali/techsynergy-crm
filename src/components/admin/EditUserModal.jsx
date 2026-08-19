export default function EditUserModal({ user, onClose, onSave, loading }) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-heading/40 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg w-full max-w-md p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-heading mb-4">Edit User</h2>

        {/* Role */}
        <div className="mb-4">
          <label className="block text-sm text-bodyText mb-1">Role</label>
          <select
            value={user.isSuperUser ? "admin" : "staff"}
            onChange={(e) =>
              onSave({
                ...user,
                isSuperUser: e.target.value === "admin",
              })
            }
            className="w-full bg-surface text-heading px-3 py-2 rounded border border-gray-200"
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Status */}
        <div className="mb-6">
          <label className="block text-sm text-bodyText mb-1">Status</label>
          <select
            value={user.isActive ? "active" : "inactive"}
            onChange={(e) =>
              onSave({
                ...user,
                isActive: e.target.value === "active",
              })
            }
            className="w-full bg-surface text-heading px-3 py-2 rounded border border-gray-200"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={() => onSave(user, true)}
            className="px-4 py-2 bg-brand hover:bg-brand/90 rounded disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
