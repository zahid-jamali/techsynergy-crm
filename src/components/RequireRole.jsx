import { Navigate } from "react-router-dom";

export default function RequireRole({ role, children }) {
  const token = sessionStorage.getItem("token");
  const user = JSON.parse(sessionStorage.getItem("user"));

  // 1️⃣ Not logged in
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // 2️⃣ Admin route protection
  if (role === "admin" && !user.isSuperUser) {
    return <Navigate to="/staff/dashboard" replace />;
  }

  // 3️⃣ Staff route protection
  if (role === "staff" && user.isSuperUser) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // 4️⃣ Authorized
  return children;
}
