import { NavLink } from "react-router-dom";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-black text-gray-200">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800">
        <div className="p-6 text-xl font-bold text-red-500">
          TechSynergy CRM
        </div>

        <nav className="px-4 space-y-2">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition ${
                isActive ? "bg-red-600 text-white" : "hover:bg-zinc-800"
              }`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/sales-target"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition ${
                isActive ? "bg-red-600 text-white" : "hover:bg-zinc-800"
              }`
            }
          >
            Sales Target
          </NavLink>

          <NavLink
            to="/admin/contacts"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition ${
                isActive ? "bg-red-600 text-white" : "hover:bg-zinc-800"
              }`
            }
          >
            Contacts
          </NavLink>

          <NavLink
            to="/admin/accounts"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition ${
                isActive ? "bg-red-600 text-white" : "hover:bg-zinc-800"
              }`
            }
          >
            Accounts
          </NavLink>

          <NavLink
            to="/admin/deals"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition ${
                isActive ? "bg-red-600 text-white" : "hover:bg-zinc-800"
              }`
            }
          >
            Deals
          </NavLink>

          <NavLink
            to="/admin/quotes"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition ${
                isActive ? "bg-red-600 text-white" : "hover:bg-zinc-800"
              }`
            }
          >
            Quotes
          </NavLink>

          <NavLink
            to="/admin/sell-order"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition ${
                isActive ? "bg-red-600 text-white" : "hover:bg-zinc-800"
              }`
            }
          >
            Sell Order
          </NavLink>

          <NavLink
            to="/admin/invoice"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition ${
                isActive ? "bg-red-600 text-white" : "hover:bg-zinc-800"
              }`
            }
          >
            Invoice
          </NavLink>

          <NavLink
            to="/admin/Products"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition ${
                isActive ? "bg-red-600 text-white" : "hover:bg-zinc-800"
              }`
            }
          >
            Products{" "}
          </NavLink>

          <NavLink
            to="/admin/vendors"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition ${
                isActive ? "bg-red-600 text-white" : "hover:bg-zinc-800"
              }`
            }
          >
            Vendors
          </NavLink>

          <NavLink
            to="/admin/poToVendor"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition ${
                isActive ? "bg-red-600 text-white" : "hover:bg-zinc-800"
              }`
            }
          >
            Purchase Orders
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition ${
                isActive ? "bg-red-600 text-white" : "hover:bg-zinc-800"
              }`
            }
          >
            Users
          </NavLink>

          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition ${
                isActive ? "bg-red-600 text-white" : "hover:bg-zinc-800"
              }`
            }
          >
            Settings
          </NavLink>
        </nav>
      </aside>

      {/* Main Section */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold">Admin Panel</h2>

          <button
            onClick={() => {
              sessionStorage.clear();
              window.location.href = "/";
            }}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm"
          >
            Logout
          </button>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 p-6 bg-zinc-950 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
