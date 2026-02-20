import { NavLink } from "react-router-dom";

const navItemClass = ({ isActive }) =>
  `flex items-center px-4 py-2 rounded-lg text-sm transition-all ${
    isActive
      ? "bg-red-600 text-white shadow-md"
      : "text-gray-400 hover:bg-zinc-800 hover:text-white"
  }`;

const Section = ({ title, children }) => (
  <div className="mt-6">
    <p className="px-4 mb-2 text-xs uppercase tracking-wider text-gray-500">
      {title}
    </p>
    <div className="space-y-1">{children}</div>
  </div>
);

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-black text-gray-200">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <h1 className="text-lg font-bold text-red-500">TechSynergy CRM</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {/* OVERVIEW */}
          <Section title="Overview">
            <NavLink to="/admin/dashboard" className={navItemClass}>
              Dashboard
            </NavLink>
          </Section>

          {/* SALES */}
          <Section title="Sales Management">
            <NavLink to="/admin/deals" className={navItemClass}>
              Deals
            </NavLink>
            <NavLink to="/admin/quotes" className={navItemClass}>
              Quotes
            </NavLink>
            <NavLink to="/admin/sell-order" className={navItemClass}>
              Sell Orders
            </NavLink>
            <NavLink to="/admin/sales-target" className={navItemClass}>
              Sales Target
            </NavLink>
          </Section>

          {/* CRM */}
          <Section title="CRM">
            <NavLink to="/admin/accounts" className={navItemClass}>
              Accounts
            </NavLink>
            <NavLink to="/admin/contacts" className={navItemClass}>
              Contacts
            </NavLink>
            <NavLink to="/admin/products" className={navItemClass}>
              Products
            </NavLink>
          </Section>

          {/* FINANCE */}
          <Section title="Finance">
            <NavLink to="/admin/invoice" className={navItemClass}>
              Invoices
            </NavLink>
            <NavLink to="/admin/poToVendor" className={navItemClass}>
              Purchase Orders
            </NavLink>
            <NavLink to="/admin/vendors" className={navItemClass}>
              Vendors
            </NavLink>
          </Section>

          {/* ADMIN */}
          <Section title="Administration">
            <NavLink to="/admin/users" className={navItemClass}>
              Users
            </NavLink>
            <NavLink to="/admin/settings" className={navItemClass}>
              Settings
            </NavLink>
          </Section>
        </nav>
      </aside>

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold">Admin Control Panel</h2>

          <button
            onClick={() => {
              sessionStorage.clear();
              window.location.href = "/";
            }}
            className="bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded-lg text-sm font-medium shadow-md"
          >
            Logout
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 bg-zinc-950 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
