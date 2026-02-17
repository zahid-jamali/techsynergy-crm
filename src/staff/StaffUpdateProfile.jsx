import { useEffect, useState } from "react";

export default function StaffUpdateProfile() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const token = sessionStorage.getItem("token");
  const [user, setUser] = useState(null);

  // Prefill user data
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
    });
  }, [user]);

  // Handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Build payload (send only filled fields)
      const payload = {};
      if (form.name) payload.name = form.name;
      if (form.email) payload.email = form.email;
      if (form.phone) payload.phone = form.phone;
      if (form.password) payload.password = form.password;

      const res = await fetch(`${BACKEND_URL}user/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Update failed");

      // Update session user
      sessionStorage.setItem("user", JSON.stringify(data.user));

      setSuccess("Profile updated successfully");
      setForm((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-6">Update Profile</h1>

      {/* Alerts */}
      {error && (
        <div className="mb-4 bg-red-950 border border-red-800 text-red-400 px-4 py-2 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-950 border border-green-800 text-green-400 px-4 py-2 rounded">
          {success}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 px-3 py-2 rounded"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 px-3 py-2 rounded"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 px-3 py-2 rounded"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">
            New Password
          </label>
          <input
            name="password"
            type="password"
            placeholder="Leave blank to keep current password"
            value={form.password}
            onChange={handleChange}
            className="w-full bg-zinc-800 border border-zinc-700 px-3 py-2 rounded"
          />
          <p className="text-xs text-gray-500 mt-1">
            Optional — only fill if you want to change your password
          </p>
        </div>

        {/* Submit */}
        <button
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-semibold disabled:opacity-60"
        >
          {loading ? "Updating..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
