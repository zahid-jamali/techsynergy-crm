import { LayoutDashboard, Inbox, Receipt, BarChart3, Calendar, CheckSquare, BookOpen } from "lucide-react";
import AppShell from "./AppShell";

const navSections = [
  {
    title: "Overview",
    items: [
      { to: "/finance/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    title: "Billing",
    items: [
      { to: "/finance/queue", icon: Inbox, label: "Handoff Queue" },
      { to: "/finance/invoices", icon: Receipt, label: "Invoices" },
      { to: "/finance/reports", icon: BarChart3, label: "Reports" },
    ],
  },
  {
    title: "Workspace",
    items: [
      { to: "/finance/calendar", icon: Calendar, label: "Calendar" },
      { to: "/finance/todos", icon: CheckSquare, label: "To-dos" },
      { to: "/finance/notebooks", icon: BookOpen, label: "Notebooks" },
    ],
  },
];

export default function FinanceLayout({ children }) {
  return (
    <AppShell
      panelLabel="Finance Desk"
      headerTitle="Finance Workspace"
      headerSubtitle="Invoices, collections and period reports"
      navSections={navSections}
    >
      {children}
    </AppShell>
  );
}
