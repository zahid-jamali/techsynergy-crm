import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  Briefcase,
  FileText,
  ShoppingCart,
  User,
  LogOut,
  Menu,
} from "lucide-react";

export default function StaffLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  return (
    <div className="min-h-screen flex bg-[#0b0f19] text-gray-200">
      {/* ===== SIDEBAR ===== */}
      <aside
        className={`${
          collapsed ? "w-20" : "w-72"
        } bg-[#111827] border-r border-gray-800 flex flex-col transition-all duration-300`}
      >
        {/* Logo */}
        <div className="px-4 py-6 border-b border-gray-800 flex items-center justify-between">
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold tracking-wide">
                <span className="text-white">Tech</span>
                <span className="text-red-500">Synergy</span>
              </h1>
              <p className="text-xs text-gray-500">Staff Panel</p>
            </div>
          )}

          {collapsed && (
            <div className="text-red-500 font-bold text-xl mx-auto">TS</div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-6 space-y-2">
          <SidebarLink
            collapsed={collapsed}
            to="/staff/dashboard"
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
          />
          <SidebarLink
            collapsed={collapsed}
            to="/staff/account"
            icon={<Building2 size={18} />}
            label="Accounts"
          />
          <SidebarLink
            collapsed={collapsed}
            to="/staff/contacts"
            icon={<Users size={18} />}
            label="Contacts"
          />
          <SidebarLink
            collapsed={collapsed}
            to="/staff/deals"
            icon={<Briefcase size={18} />}
            label="Deals"
          />
          <SidebarLink
            collapsed={collapsed}
            to="/staff/quotes"
            icon={<FileText size={18} />}
            label="Quotes"
          />
          <SidebarLink
            collapsed={collapsed}
            to="/staff/s-order"
            icon={<ShoppingCart size={18} />}
            label="Sales Orders"
          />
          <SidebarLink
            collapsed={collapsed}
            to="/staff/profile"
            icon={<User size={18} />}
            label="Profile"
          />
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-800">
          <button
            onClick={() => {
              sessionStorage.clear();
              window.location.href = "/";
            }}
            className={`flex items-center ${
              collapsed ? "justify-center" : "gap-2"
            } w-full px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition text-sm`}
          >
            <LogOut size={16} />
            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>

      {/* ===== MAIN AREA ===== */}
      <div className="flex-1 flex flex-col">
        {/* TOPBAR */}
        <header className="h-16 bg-[#111827] border-b border-gray-800 flex items-center justify-between px-6">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-gray-800 transition"
            >
              <Menu size={20} />
            </button>

            <div>
              <h2 className="text-lg font-semibold tracking-wide">
                Staff Workspace
              </h2>
              <p className="text-xs text-gray-500">
                Manage deals, quotes & customers
              </p>
            </div>
          </div>

          {/* Profile */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium capitalize">{user?.name}</p>
              <p className="text-xs text-gray-500">
                {user?.designation || "Sales Executive"}
              </p>
            </div>

            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-8 bg-[#0b0f19] overflow-y-auto transition-all duration-300">
          <div className="bg-[#111827] rounded-2xl border border-gray-800 p-6 shadow-xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ===== SidebarLink ===== */

const SidebarLink = ({ to, icon, label, collapsed }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center ${
          collapsed ? "justify-center" : "gap-3"
        } px-4 py-3 rounded-xl transition-all duration-200 ${
          isActive
            ? "bg-red-600 text-white shadow-lg"
            : "text-gray-400 hover:bg-gray-800 hover:text-white"
        }`
      }
    >
      {icon}
      {!collapsed && (
        <span className="text-sm font-medium tracking-wide">{label}</span>
      )}
    </NavLink>
  );
};
