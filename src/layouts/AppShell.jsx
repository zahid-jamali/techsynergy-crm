import { NavLink } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { getUserRole, ROLE_LABELS } from "../lib/roles";

const NavItem = ({ to, icon: Icon, label, collapsed }) => (
  <NavLink
    to={to}
    title={label}
    className={({ isActive }) =>
      `group relative flex items-center ${
        collapsed ? "justify-center px-2" : "gap-3 px-3"
      } py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive
          ? "bg-white text-brand shadow-sm"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      }`
    }
  >
    <Icon size={18} className="shrink-0" />
    {!collapsed && <span className="truncate">{label}</span>}
  </NavLink>
);

const Section = ({ title, collapsed }) =>
  collapsed ? (
    <div className="mx-3 my-4 border-t border-white/10" />
  ) : (
    <p className="px-3 mt-6 mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
      {title}
    </p>
  );

export default function AppShell({
  panelLabel,
  headerTitle,
  headerSubtitle,
  navSections,
  children,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const role = getUserRole(user);

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
              <p className="text-[11px] text-white/50">{panelLabel}</p>
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

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="w-full mb-4 flex justify-center text-white/60 hover:text-white p-2 rounded-md hover:bg-white/10"
              aria-label="Expand sidebar"
            >
              <Menu size={18} />
            </button>
          )}
          {navSections.map((section) => (
            <div key={section.title}>
              <Section title={section.title} collapsed={collapsed} />
              {section.items.map((item) => (
                <NavItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  collapsed={collapsed}
                />
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card border-b border-gray-200 flex items-center justify-between px-6">
          <div>
            <h2 className="text-base font-semibold text-heading tracking-tight">
              {headerTitle}
            </h2>
            <p className="text-xs text-bodyText">{headerSubtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-heading capitalize">
                {user?.name || ROLE_LABELS[role]}
              </p>
              <p className="text-xs text-bodyText">{ROLE_LABELS[role]}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center text-sm font-semibold">
              {(user?.name?.[0] || "U").toUpperCase()}
            </div>
            <button
              onClick={() => {
                sessionStorage.clear();
                window.location.href = "/";
              }}
              className="flex items-center gap-2 bg-brand hover:bg-brand/90 text-white px-3.5 py-2 rounded-lg text-sm font-medium transition"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 bg-surface overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
