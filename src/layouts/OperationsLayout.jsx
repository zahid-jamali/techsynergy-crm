import {
  LayoutDashboard,
  ShoppingCart,
  FileSpreadsheet,
  Truck,
  Package,
  Calendar,
  CheckSquare,
  BookOpen,
  MessagesSquare,
  UserRound,
} from "lucide-react";
import AppShell from "./AppShell";
import PriceQueryUnreadBadge from "../components/PriceQueryUnreadBadge";

const navSections = [
  {
    title: "Overview",
    items: [
      {
        to: "/operations/dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
      },
      {
        to: "/operations/price-queries",
        icon: MessagesSquare,
        label: "Price Queries",
        badge: <PriceQueryUnreadBadge />,
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
  {
    title: "Account",
    items: [{ to: "/operations/profile", icon: UserRound, label: "My profile" }],
  },
];

export default function OperationsLayout({ children }) {
  return (
    <AppShell
      panelLabel="Operations Desk"
      headerTitle="Operations Workspace"
      headerSubtitle="Purchase orders, deliveries and finance handoff"
      profilePath="/operations/profile"
      navSections={navSections}
    >
      {children}
    </AppShell>
  );
}
