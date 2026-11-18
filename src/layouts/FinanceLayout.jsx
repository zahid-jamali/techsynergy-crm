import { LayoutDashboard, Inbox, Receipt, BarChart3, BookOpen, Wallet, FileSpreadsheet, ShieldAlert, Calendar, CheckSquare, BadgeCheck, UserRound, ShoppingCart } from "lucide-react";
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
      { to: "/finance/orders", icon: ShoppingCart, label: "Sales Orders" },
      { to: "/finance/queue", icon: Inbox, label: "Handoff Queue" },
      { to: "/finance/invoices", icon: Receipt, label: "Invoices" },
      { to: "/finance/fbr", icon: BadgeCheck, label: "FBR Digital Invoicing" },
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
  {
    title: "Account",
    items: [{ to: "/finance/profile", icon: UserRound, label: "My profile" }],
  },
];

export default function FinanceLayout({ children }) {
  return (
    <AppShell
      panelLabel="Finance Desk"
      headerTitle="Finance Workspace"
      headerSubtitle="Tax invoicing, FBR reporting, collections and books"
      profilePath="/finance/profile"
      navSections={navSections}
    >
      {children}
    </AppShell>
  );
}
