import {
  LayoutDashboard,
  ShoppingCart,
  FileSpreadsheet,
  Truck,
  Package,
  Calendar,
  CheckSquare,
  BookOpen,
} from "lucide-react";
import AppShell from "./AppShell";

const navSections = [
  {
    title: "Overview",
    items: [
      {
        to: "/operations/dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
      },
    ],
  },
  {
    title: "Fulfillment",
    items: [
      {
        to: "/operations/orders",
        icon: ShoppingCart,
        label: "Approved Orders",
      },
      {
        to: "/operations/deliveries",
        icon: Package,
        label: "Deliveries",
      },
      {
        to: "/operations/purchase-orders",
        icon: FileSpreadsheet,
        label: "Purchase Orders",
      },
      {
        to: "/operations/vendors",
        icon: Truck,
        label: "Vendors",
      },
    ],
  },
  {
    title: "Workspace",
    items: [
      { to: "/operations/calendar", icon: Calendar, label: "Calendar" },
      { to: "/operations/todos", icon: CheckSquare, label: "To-dos" },
      { to: "/operations/notebooks", icon: BookOpen, label: "Notebooks" },
    ],
  },
];

export default function OperationsLayout({ children }) {
  return (
    <AppShell
      panelLabel="Operations Desk"
      headerTitle="Operations Workspace"
      headerSubtitle="Purchase orders, deliveries and finance handoff"
      navSections={navSections}
    >
      {children}
    </AppShell>
  );
}
