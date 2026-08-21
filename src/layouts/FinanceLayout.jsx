import { LayoutDashboard, Inbox, Receipt, BarChart3, BookOpen, Wallet, FileSpreadsheet, ShieldAlert, Calendar, CheckSquare } from "lucide-react";
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
    title: "Books",
    items: [
      { to: "/finance/ledger", icon: BookOpen, label: "Ledgers" },
      { to: "/finance/payments", icon: Wallet, label: "Payments" },
      { to: "/finance/vendor-bills", icon: FileSpreadsheet, label: "Vendor Bills" },
      { to: "/finance/posting-repair", icon: ShieldAlert, label: "Posting Repair" },
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
