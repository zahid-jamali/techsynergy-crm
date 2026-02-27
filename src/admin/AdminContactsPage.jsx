import { useCallback, useEffect, useState } from "react";
import AddContactModal from "../components/staff/contact/AddContactModal";
import ViewContactModal from "../components/staff/contact/ViewContactModal";
import EditContactModal from "../components/staff/contact/EditContactModal";
import DeleteContactModal from "../components/staff/contact/DeleteContactModal";
import ViewAccountModal from "../components/staff/account/ViewAccountModal";

const AdminContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedAccountFilter, setSelectedAccountFilter] = useState("all");
  const [selectedOwnerFilter, setSelectedOwnerFilter] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showAll, setShowAll] = useState(false);

  const token = sessionStorage.getItem("token");

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}contact/all`,
        {
          method: "GET",
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setContacts(data || []);
    } catch (err) {
      console.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const filteredContacts = contacts.filter((c) => {
    // Toggle logic
    if (!showAll && !c.isActive) return false;

    // Search filter
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    if (
      search &&
      !fullName.includes(search.toLowerCase()) &&
      !c.email?.toLowerCase().includes(search.toLowerCase()) &&
      !c.phone?.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }

    // Account filter
    if (
      selectedAccountFilter !== "all" &&
      c.account?._id !== selectedAccountFilter
    ) {
      return false;
    }

    // Owner filter
    if (
      selectedOwnerFilter !== "all" &&
      c.contactOwner?._id !== selectedOwnerFilter
    ) {
      return false;
    }

    // Status filter
    if (selectedStatus !== "all" && String(c.isActive) !== selectedStatus) {
      return false;
    }

    return true;
  });

  const View = (contact) => {
    setShowModal("View");
    setSelectedContact(contact);
  };

  return (
    <div className="p-6 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-red-500">Contacts</h1>
        <button
          onClick={() => setShowModal("Add")}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-semibold"
        >
          + Add Contact
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg mb-4 grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-black border border-gray-700 px-3 py-2 rounded text-white"
        />

        {/* Account Filter */}
        <select
          value={selectedAccountFilter}
          onChange={(e) => setSelectedAccountFilter(e.target.value)}
          className="bg-black border border-gray-700 px-3 py-2 rounded"
        >
          <option value="all">All Accounts</option>
          {[
            ...new Map(
              contacts.map((c) => [c.account?._id, c.account])
            ).values(),
          ]
            .filter(Boolean)
            .map((acc) => (
              <option key={acc._id} value={acc._id}>
                {acc.accountName}
              </option>
            ))}
        </select>

        {/* Owner Filter */}
        <select
          value={selectedOwnerFilter}
          onChange={(e) => setSelectedOwnerFilter(e.target.value)}
          className="bg-black border border-gray-700 px-3 py-2 rounded"
        >
          <option value="all">All Owners</option>
          {[
            ...new Map(
              contacts.map((c) => [c.contactOwner?._id, c.contactOwner])
            ).values(),
          ]
            .filter(Boolean)
            .map((owner) => (
              <option key={owner._id} value={owner._id}>
                {owner.name}
              </option>
            ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-black border border-gray-700 px-3 py-2 rounded"
        >
          <option value="all">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        {/* Toggle Show All */}
        <div className="flex items-center gap-3">
          <span className="text-sm">Show All</span>
          <button
            onClick={() => setShowAll(!showAll)}
            className={`w-12 h-6 rounded-full transition ${
              showAll ? "bg-red-600" : "bg-gray-600"
            }`}
          >
            <div
              className={`h-6 w-6 bg-white rounded-full transform transition ${
                showAll ? "translate-x-6" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-black border border-gray-800 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Account</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Owner</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-400">
                  Loading contacts...
                </td>
              </tr>
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-400">
                  No contacts found
                </td>
              </tr>
            ) : (
              filteredContacts.map((c) => (
                <tr
                  key={c._id}
                  className="border-t border-gray-800 hover:bg-gray-900"
                >
                  <td onClick={() => View(c)} className="px-4 py-3">
                    {c.firstName} {c.lastName}
                  </td>
                  <td onClick={() => View(c)} className="px-4 py-3">
                    {c.email || "-"}
                  </td>

                  <td
                    onClick={() => {
                      setSelectedAccount(c.account);
                      setShowModal("account");
                    }}
                    className="px-4 py-3 cursor-pointer hover:underline"
                  >
                    {c.account.accountName || "-"}
                  </td>
                  <td onClick={() => View(c)} className="px-4 py-3">
                    {c.phone || "-"}
                  </td>
                  <td onClick={() => View(c)} className="px-4 py-3">
                    {c.contactOwner.name || "-"}
                  </td>
                  <td className="px-4 py-3 flex gap-3">
                    <button
                      onClick={() => {
                        setShowModal("Edit");
                        setSelectedContact(c);
                      }}
                      className="text-yellow-400 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setShowModal("Delete");
                        setSelectedContact(c);
                      }}
                      className="text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal === "Add" && (
        <AddContactModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchContacts}
        />
      )}

      {showModal === "Edit" && (
        <EditContactModal
          contact={selectedContact}
          onClose={() => {
            setSelectedContact(null);
            setShowModal(null);
          }}
          onSuccess={fetchContacts}
        />
      )}

      {showModal === "Delete" && (
        <DeleteContactModal
          contact={selectedContact}
          onClose={() => {
            setSelectedContact(null);
            setShowModal(null);
          }}
          onSuccess={fetchContacts}
        />
      )}

      {showModal === "View" && (
        <ViewContactModal
          contact={selectedContact}
          onClose={() => {
            setSelectedContact(null);
            setShowModal(null);
          }}
        />
      )}

      {showModal === "account" && (
        <ViewAccountModal
          account={selectedAccount}
          onClose={() => {
            setSelectedContact(null);
            setShowModal(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminContactsPage;
