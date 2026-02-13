import { NavLink } from "react-router-dom";

export default function StaffLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-black text-gray-200">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800">
        <div className="p-6 text-xl font-bold text-red-500">
          TechSynergy CRM
        </div>

        <nav className="px-4 space-y-2">
          <NavLink
            to="/staff/dashboard"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition ${
                isActive ? "bg-red-600 text-white" : "hover:bg-zinc-800"
              }`
            }
          >
            Dashboard
          </NavLink>

          {/* <NavLink
            to="/staff/leads"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition ${
                isActive ? "bg-red-600 text-white" : "hover:bg-zinc-800"
              }`
            }
          >
            Leads
          </NavLink> */}

          <NavLink
            to="/staff/account"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition ${
                isActive ? "bg-red-600 text-white" : "hover:bg-zinc-800"
              }`
            }
          >
            Account
          </NavLink>

          <NavLink
            to="/staff/contacts"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition ${
                isActive ? "bg-red-600 text-white" : "hover:bg-zinc-800"
              }`
            }
          >
            Contact
          </NavLink>

          <NavLink
            to="/staff/deals"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition ${
                isActive ? "bg-red-600 text-white" : "hover:bg-zinc-800"
              }`
            }
          >
            Deals
          </NavLink>

          <NavLink
            to="/staff/quotes"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition ${
                isActive ? "bg-red-600 text-white" : "hover:bg-zinc-800"
              }`
            }
          >
            Quotes
          </NavLink>

          <NavLink
            to="/staff/s-order"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition ${
                isActive ? "bg-red-600 text-white" : "hover:bg-zinc-800"
              }`
            }
          >
            Sell Order
          </NavLink>

          <NavLink
            to="/staff/profile"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition ${
                isActive ? "bg-red-600 text-white" : "hover:bg-zinc-800"
              }`
            }
          >
            Profile
          </NavLink>
        </nav>
      </aside>

      {/* Main Section */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold">Staff Panel</h2>

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
