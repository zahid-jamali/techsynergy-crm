import { useEffect, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      let url = process.env.REACT_APP_BACKEND_URL;
      const res = await fetch(`${url}user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Login failed");
      }

      // Save token (example)
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      // Redirect (change route later)
      if (data.user.isSuperUser) {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/staff/dashboard";
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let user = sessionStorage.getItem("user");
    if (user) {
      if (user.isSuperUser) {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/staff/dashboard";
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      {/* Card */}
      <div className="w-full max-w-md bg-zinc-900 rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-red-500">TechSynergy CRM</h1>
          <p className="text-gray-400 mt-2">Sign in to your account</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-950 border border-red-800 px-3 py-2 rounded">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white placeholder-gray-500 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white placeholder-gray-500 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-semibold transition duration-200
              ${
                loading
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }
              text-white`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          © {new Date().getFullYear()} TechSynergy CRM
        </p>
      </div>
    </div>
  );
}
