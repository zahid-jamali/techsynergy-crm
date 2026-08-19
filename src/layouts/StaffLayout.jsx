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
    <div className="min-h-screen flex bg-surface text-bodyText">
      <aside
        className={`${
          collapsed ? "w-[76px]" : "w-72"
        } bg-brand text-white flex flex-col transition-all duration-300 shrink-0`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          {!collapsed && (
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                Tech<span className="text-white/80">Synergy</span>
              </h1>
              <p className="text-[11px] text-white/50">Staff Workspace</p>
            </div>
          )}
          {collapsed && (
            <span className="mx-auto text-sm font-bold tracking-wide">TS</span>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="text-white/60 hover:text-white p-1.5 rounded-md hover:bg-white/10"
              aria-label="Collapse sidebar"
            >
              <Menu size={18} />
            </button>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="w-full mb-3 flex justify-center text-white/60 hover:text-white p-2 rounded-md hover:bg-white/10"
              aria-label="Expand sidebar"
            >
              <Menu size={18} />
            </button>
          )}
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

        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => {
              sessionStorage.clear();
              window.location.href = "/";
            }}
            className={`flex items-center ${
              collapsed ? "justify-center" : "gap-2"
            } w-full px-3 py-2.5 rounded-lg bg-white text-brand hover:bg-white/90 transition text-sm font-medium`}
          >
            <LogOut size={16} />
            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card border-b border-gray-200 flex items-center justify-between px-6">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-heading">
              Staff Workspace
            </h2>
            <p className="text-xs text-bodyText">
              Manage deals, quotes and customers
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-heading capitalize">
                {user?.name || "Staff"}
              </p>
              <p className="text-xs text-bodyText">
                {user?.designation || "Sales Executive"}
              </p>
            </div>

            <div className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center text-sm font-semibold">
              {(user?.name?.[0] || "S").toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 bg-surface overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

const SidebarLink = ({ to, icon, label, collapsed }) => {
  return (
    <NavLink
      to={to}
      title={label}
      className={({ isActive }) =>
        `flex items-center ${
          collapsed ? "justify-center px-2" : "gap-3 px-3"
        } py-2.5 rounded-lg transition-all duration-200 ${
          isActive
            ? "bg-white text-brand shadow-sm"
            : "text-white/70 hover:bg-white/10 hover:text-white"
        }`
      }
    >
      <span className="shrink-0">{icon}</span>
      {!collapsed && (
        <span className="text-sm font-medium truncate">{label}</span>
      )}
    </NavLink>
  );
};
