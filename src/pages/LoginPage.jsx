import { useEffect, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));

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
    <div className="min-h-screen grid lg:grid-cols-2 bg-surface">
      <div className="hidden lg:flex flex-col justify-between bg-brand text-white p-12">
        <div>
          <p className="text-sm font-medium tracking-[0.2em] uppercase text-white/60">
            TechSynergy
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-tight max-w-md">
            Operate sales, quotes and finance from one workspace.
          </h1>
          <p className="mt-4 text-white/70 max-w-md text-sm leading-relaxed">
            A professional CRM built for the TechSynergy team — deals, accounts,
            invoices and vendor operations in a single place.
          </p>
        </div>
        <p className="text-xs text-white/50">
          © {new Date().getFullYear()} TechSynergy. All rights reserved.
        </p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md bg-card rounded-2xl border border-gray-200 shadow-elevate p-8">
          <div className="mb-8">
            <img
              src="/images/logo.jpeg"
              width={120}
              className="mb-5 rounded-md"
              alt="TechSynergy"
            />
            <h2 className="text-2xl font-semibold text-heading">
              Sign in to CRM
            </h2>
            <p className="text-bodyText mt-1.5 text-sm">
              Enter your credentials to continue
            </p>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2.5 rounded-lg">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                placeholder="you@techsynergy.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-bodyText text-xs mt-8 lg:hidden">
            © {new Date().getFullYear()} TechSynergy CRM
          </p>
        </div>
      </div>
    </div>
  );
}
