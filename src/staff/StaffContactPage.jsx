import { useState } from "react";
import ViewAccountModal from "../components/staff/account/ViewAccountModal";
import AddContactModal from "../components/staff/contact/AddContactModal";
import DeleteContactModal from "../components/staff/contact/DeleteContactModal";
import EditContactModal from "../components/staff/contact/EditContactModal";
import ViewContactModal from "../components/staff/contact/ViewContactModal";
import { usePagedList } from "../hooks/usePagedList";
import ListToolbar from "../components/lists/ListToolbar";
import PaginationBar from "../components/lists/PaginationBar";
import ArchiveButton from "../components/lists/ArchiveButton";
import { contactName } from "../lib/crm";

const StaffContactsPage = () => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const list = usePagedList("contact/my");

  return (
    <div className="p-6 text-heading">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand">Contacts</h1>
          <p className="text-sm text-bodyText mt-1">
            Search your contacts and archive people you no longer need in the active list.
          </p>
        </div>
        <button
          onClick={() => setShowModal("Add")}
          className="bg-brand hover:bg-brand/90 px-4 py-2 rounded text-sm font-semibold text-white"
        >
          + Add Contact
        </button>
      </div>

      <ListToolbar
        search={list.searchInput}
        onSearch={list.setSearchInput}
        searchPlaceholder="Search name, email, phone or designation..."
        archived={list.archived}
        onArchivedChange={list.setArchived}
        onReset={() => list.setSearchInput("")}
      />

      <div className="bg-card border border-gray-200 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-card text-bodyText">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Account</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.loading ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-bodyText">
                  Loading contacts...
                </td>
              </tr>
            ) : list.items.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-bodyText">
                  No contacts found
                </td>
              </tr>
            ) : (
              list.items.map((c) => (
                <tr key={c._id} className="border-t border-gray-200 hover:bg-surface">
                  <td className="px-4 py-3">{contactName(c)}</td>
                  <td className="px-4 py-3">{c.email || "-"}</td>
                  <td className="px-4 py-3">{c.phone || c.mobile || "-"}</td>
                  <td
                    onClick={() => {
                      if (!c.account) return;
                      setShowModal("account");
                      setSelectedAccount(c.account);
                    }}
                    className="px-4 py-3 hover:underline cursor-pointer"
                  >
                    {c.account?.accountName || "-"}
                  </td>
                  <td className="px-4 py-3 flex gap-3">
                    <button
                      onClick={() => {
                        setShowModal("Edit");
                        setSelectedContact(c);
                      }}
                      className="text-amber-700 hover:underline"
                    >
                      Edit
                    </button>
                    <ArchiveButton
                      path={`contact/${c._id}/archive`}
                      archived={c.isArchived}
                      onDone={list.reload}
                    />
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
        <PaginationBar
          page={list.page}
          pages={list.pagination.pages}
          total={list.pagination.total}
          limit={list.limit}
          onPage={list.setPage}
          onLimit={list.setLimit}
        />
      </div>

      {showModal === "Add" && (
        <AddContactModal onClose={() => setShowModal("")} onSuccess={list.reload} />
      )}
      {showModal === "Edit" && (
        <EditContactModal
          contact={selectedContact}
          onClose={() => setShowModal("")}
          onSuccess={list.reload}
        />
      )}
      {showModal === "View" && (
        <ViewContactModal contact={selectedContact} onClose={() => setShowModal("")} />
      )}
      {showModal === "Delete" && (
        <DeleteContactModal
          contact={selectedContact}
          onClose={() => setShowModal("")}
          onSuccess={list.reload}
        />
      )}
      {showModal === "account" && (
        <ViewAccountModal
          account={selectedAccount}
          onClose={() => {
            setShowModal("");
            setSelectedAccount(null);
          }}
        />
      )}
    </div>
  );
};

export default StaffContactsPage;
