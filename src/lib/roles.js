export const ROLE_HOME = {
  admin: "/admin/dashboard",
  staff: "/staff/dashboard",
  operations: "/operations/dashboard",
  finance: "/finance/dashboard",
};

export const ROLE_LABELS = {
  admin: "Admin",
  staff: "Staff",
  operations: "Operations",
  finance: "Finance",
};

export function getUserRole(user) {
  if (!user) return null;
  if (user.role) return user.role;
  if (user.isSuperUser) return "admin";
  return "staff";
}

export function getHomePath(user) {
  return ROLE_HOME[getUserRole(user)] || "/";
}

export function fileUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const api = process.env.REACT_APP_BACKEND_URL || "";
  const origin = api.replace(/\/api\/?$/, "");
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export const FULFILLMENT_LABELS = {
  awaiting_approval: "Awaiting approval",
  ready_for_operations: "Ready for operations",
  po_created: "PO created",
  in_delivery: "In delivery",
  delivered: "Delivered",
  forwarded_to_finance: "With finance",
  invoiced: "Invoiced",
};
