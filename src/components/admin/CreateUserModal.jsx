import { useState } from "react";

const CreateUserModal = ({ onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "staff",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.phone || !form.password) {
      return setError("All fields are required");
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}user/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Failed to create user");
      }

      onSuccess(); // refresh users
      onClose(); // close modal
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-heading/40 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-heading text-xl font-semibold">Create New User</h2>
          <button
            onClick={onClose}
            className="text-bodyText hover:text-brand transition"
          >
            ✕
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full bg-card border border-gray-200 rounded-lg px-4 py-2 text-heading focus:border-brand outline-none"
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="w-full bg-card border border-gray-200 rounded-lg px-4 py-2 text-heading focus:border-brand outline-none"
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            className="w-full bg-card border border-gray-200 rounded-lg px-4 py-2 text-heading focus:border-brand outline-none"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full bg-card border border-gray-200 rounded-lg px-4 py-2 text-heading focus:border-brand outline-none"
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full bg-card border border-gray-200 rounded-lg px-4 py-2 text-heading focus:border-brand outline-none"
          >
            <option value="staff">Staff</option>
            <option value="operations">Operations</option>
            <option value="finance">Finance</option>
            <option value="admin">Admin</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand hover:bg-brand/90 transition rounded-lg py-2 font-medium text-white disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
