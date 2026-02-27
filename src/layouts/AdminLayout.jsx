import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Handshake,
  FileText,
  ShoppingCart,
  Target,
  Building2,
  Users,
  Boxes,
  Receipt,
  FileSpreadsheet,
  Truck,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { useState } from "react";

const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
        isActive
          ? "bg-red-600 text-white shadow-lg"
          : "text-gray-400 hover:bg-zinc-800 hover:text-white"
      }`
    }
  >
    <Icon size={18} />
    {label}
  </NavLink>
);

const Section = ({ title }) => (
  <p className="px-4 mt-6 mb-2 text-xs uppercase tracking-widest text-gray-500">
    {title}
  </p>
);

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-black text-gray-200">
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`${
          collapsed ? "w-20" : "w-72"
        } bg-zinc-900 border-r border-zinc-800 flex flex-col transition-all duration-300`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-800">
          {!collapsed && (
            <h1 className="text-lg font-bold text-red-500 tracking-wide">
              TechSynergy
            </h1>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-white"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <Section title="Overview" />
          <NavItem
            to="/admin/dashboard"
            icon={LayoutDashboard}
            label={!collapsed && "Dashboard"}
          />

          <Section title="Sales" />
          <NavItem
            to="/admin/deals"
            icon={Handshake}
            label={!collapsed && "Deals"}
          />
          <NavItem
            to="/admin/quotes"
            icon={FileText}
            label={!collapsed && "Quotes"}
          />
          <NavItem
            to="/admin/sell-order"
            icon={ShoppingCart}
            label={!collapsed && "Sell Orders"}
          />
          <NavItem
            to="/admin/sales-target"
            icon={Target}
            label={!collapsed && "Sales Target"}
          />

          <Section title="CRM" />
          <NavItem
            to="/admin/accounts"
            icon={Building2}
            label={!collapsed && "Accounts"}
          />
          <NavItem
            to="/admin/contacts"
            icon={Users}
            label={!collapsed && "Contacts"}
          />
          <NavItem
            to="/admin/products"
            icon={Boxes}
            label={!collapsed && "Products"}
          />

          <Section title="Finance" />
          <NavItem
            to="/admin/invoice"
            icon={Receipt}
            label={!collapsed && "Invoices"}
          />
          <NavItem
            to="/admin/poToVendor"
            icon={FileSpreadsheet}
            label={!collapsed && "Purchase Orders"}
          />
          <NavItem
            to="/admin/vendors"
            icon={Truck}
            label={!collapsed && "Vendors"}
          />

          <Section title="Administration" />
          <NavItem
            to="/admin/users"
            icon={Users}
            label={!collapsed && "Users"}
          />
          <NavItem
            to="/admin/settings"
            icon={Settings}
            label={!collapsed && "Settings"}
          />
        </nav>
      </aside>

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-8">
          <div>
            <h2 className="text-lg font-semibold tracking-wide">
              Admin Control Panel
            </h2>
            <p className="text-xs text-gray-500">
              Welcome back to TechSynergy CRM
            </p>
          </div>

          <button
            onClick={() => {
              sessionStorage.clear();
              window.location.href = "/";
            }}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl text-sm font-medium shadow-lg transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 bg-zinc-950 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
