import { useState } from "react";

const CreateUserModal = ({ onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111] w-full max-w-md rounded-2xl shadow-2xl border border-white/10 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-xl font-semibold">Create New User</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition"
          >
            ✕
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
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
            className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:border-red-500 outline-none"
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:border-red-500 outline-none"
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:border-red-500 outline-none"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:border-red-500 outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 transition rounded-lg py-2 font-medium text-white disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
