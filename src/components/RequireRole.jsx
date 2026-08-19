import { Navigate } from "react-router-dom";
import { getHomePath, getUserRole } from "../lib/roles";

export default function RequireRole({ role, children }) {
  const token = sessionStorage.getItem("token");
  const user = JSON.parse(sessionStorage.getItem("user") || "null");

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  const current = getUserRole(user);
  if (current !== role) {
    return <Navigate to={getHomePath(user)} replace />;
  }

  return children;
}
