import { useEffect, useState } from "react";

const UpsertTargetModal = ({ target, month, year, onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    user: "",
    month: month,
    year: year,
    targetAmount: "",
    forecastAmount: "",
  });

  /* ================= FETCH USERS ================= */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}user/all`,
          {
            headers: { authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        if (res.ok) setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users");
      }
    };

    fetchUsers();
  }, [token]);

  /* ================= PREFILL IF EDIT ================= */
  useEffect(() => {
    if (target) {
      setFormData({
        user: target.user?._id || target.user,
        month: target.month,
        year: target.year,
        targetAmount: target.targetAmount,
        forecastAmount: target.forecastAmount,
      });
    }
  }, [target]);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.user || !formData.targetAmount) {
      alert("User and Target Amount are required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}sales-target/upsert`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user: formData.user,
            month: formData.month,
            year: formData.year,
            targetAmount: Number(formData.targetAmount),
            forecastAmount: Number(formData.forecastAmount) || 0,
          }),
        }
      );

      const data = await res.json();

      if (!data.success) throw new Error();

      onSuccess();
    } catch (error) {
      console.error("Failed to save target");
      alert("Failed to save target");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-black border border-gray-800 rounded-lg w-full max-w-md text-white">
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-red-500">
            {target ? "Edit Sales Target" : "Create Sales Target"}
          </h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* USER */}
          <div>
            <label className="text-sm text-gray-400">Select User</label>
            <select
              value={formData.user}
              onChange={(e) => handleChange("user", e.target.value)}
              className="input mt-1"
              required
            >
              <option value="">-- Select User --</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          {/* MONTH & YEAR */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Month</label>
              <input
                type="number"
                value={formData.month}
                disabled
                className="input mt-1"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400">Year</label>
              <input
                type="number"
                value={formData.year}
                disabled
                className="input mt-1"
              />
            </div>
          </div>

          {/* TARGET */}
          <div>
            <label className="text-sm text-gray-400">Target Amount</label>
            <input
              type="number"
              value={formData.targetAmount}
              onChange={(e) => handleChange("targetAmount", e.target.value)}
              className="input mt-1"
              required
            />
          </div>

          {/* FORECAST */}
          <div>
            <label className="text-sm text-gray-400">Forecast Amount</label>
            <input
              type="number"
              value={formData.forecastAmount}
              onChange={(e) => handleChange("forecastAmount", e.target.value)}
              className="input mt-1"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-700 px-4 py-2 rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
            >
              {loading ? "Saving..." : "Save Target"}
            </button>
          </div>
        </form>

        <style jsx>{`
          .input {
            width: 100%;
            background: #111827;
            border: 1px solid #374151;
            padding: 8px 10px;
            border-radius: 6px;
            color: white;
          }
        `}</style>
      </div>
    </div>
  );
};

export default UpsertTargetModal;
