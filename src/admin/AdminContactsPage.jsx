import { useCallback, useEffect, useState, useMemo } from "react";
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
  const [selectedStatus, setSelectedStatus] = useState("active");

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

  const uniqueAccounts = useMemo(() => {
    return [
      ...new Map(
        contacts
          .filter((c) => c.account?._id)
          .map((c) => [c.account._id, c.account])
      ).values(),
    ];
  }, [contacts]);

  const uniqueOwners = useMemo(() => {
    return [
      ...new Map(
        contacts
          .filter((c) => c.contactOwner?._id)
          .map((c) => [c.contactOwner._id, c.contactOwner])
      ).values(),
    ];
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const searchValue = search.toLowerCase().trim();

      if (searchValue) {
        const searchableText = `
          ${c.firstName || ""}
          ${c.lastName || ""}
          ${c.email || ""}
          ${c.phone || ""}
          ${c.account?.accountName || ""}
          ${c.contactOwner?.name || ""}
        `.toLowerCase();

        if (!searchableText.includes(searchValue)) return false;
      }

      if (
        selectedAccountFilter !== "all" &&
        c.account?._id !== selectedAccountFilter
      ) {
        return false;
      }

      if (
        selectedOwnerFilter !== "all" &&
        c.contactOwner?._id !== selectedOwnerFilter
      ) {
        return false;
      }

      if (selectedStatus === "active" && !c.isActive) return false;
      if (selectedStatus === "inactive" && c.isActive) return false;

      return true;
    });
  }, [
    contacts,
    search,
    selectedAccountFilter,
    selectedOwnerFilter,
    selectedStatus,
  ]);

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
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6 space-y-4">
        {/* Search */}
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-black border border-gray-700 px-4 py-2 rounded-lg focus:outline-none focus:border-red-500"
          />

          <button
            onClick={() => {
              setSearch("");
              setSelectedAccountFilter("all");
              setSelectedOwnerFilter("all");
              setSelectedStatus("active");
            }}
            className="text-sm text-gray-400 hover:text-red-400"
          >
            Reset Filters
          </button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Account */}
          <select
            value={selectedAccountFilter}
            onChange={(e) => setSelectedAccountFilter(e.target.value)}
            className="bg-black border border-gray-700 px-4 py-2 rounded-lg"
          >
            <option value="all">All Accounts</option>
            {uniqueAccounts.map((acc) => (
              <option key={acc._id} value={acc._id}>
                {acc.accountName}
              </option>
            ))}
          </select>

          {/* Owner */}
          <select
            value={selectedOwnerFilter}
            onChange={(e) => setSelectedOwnerFilter(e.target.value)}
            className="bg-black border border-gray-700 px-4 py-2 rounded-lg"
          >
            <option value="all">All Owners</option>
            {uniqueOwners.map((owner) => (
              <option key={owner._id} value={owner._id}>
                {owner.name}
              </option>
            ))}
          </select>

          {/* Status Pills */}
          <div className="flex bg-black border border-gray-700 rounded-lg overflow-hidden">
            {["active", "inactive", "all"].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 text-sm capitalize transition ${
                  selectedStatus === status
                    ? "bg-red-600 text-white"
                    : "text-gray-400 hover:bg-gray-800"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
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
