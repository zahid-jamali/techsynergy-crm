import { useEffect, useMemo, useState } from "react";
import AddAccountModal from "../components/staff/account/AddAccountModal";
import EditAccountModal from "../components/staff/account/EditAccountModal";
import DeleteAccountModal from "../components/staff/account/DeleteAccountModal";
import ViewAccountModal from "../components/staff/account/ViewAccountModal";
import ViewContactModal from "../components/staff/contact/ViewContactModal";
import { Link } from "react-router-dom";
import { usePagedList } from "../hooks/usePagedList";
import ListToolbar from "../components/lists/ListToolbar";
import PaginationBar from "../components/lists/PaginationBar";
import ArchiveButton from "../components/lists/ArchiveButton";
import { ACCOUNT_TYPES, INDUSTRIES, contactName } from "../lib/crm";
import { api } from "../lib/api";

const AdminAccountsPage = () => {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedOwner, setSelectedOwner] = useState("all");
  const [owners, setOwners] = useState([]);

  const extraFilters = useMemo(
    () => ({
      accountType: selectedType,
      industry: selectedIndustry,
      owner: selectedOwner,
    }),
    [selectedType, selectedIndustry, selectedOwner]
  );
  const list = usePagedList("account/all", extraFilters);

  useEffect(() => {
    api("user/all")
      .then((data) => setOwners(Array.isArray(data) ? data : data.data || []))
      .catch(() => setOwners([]));
  }, []);

  return (
    <div className="p-6 text-heading">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand">Accounts</h1>
          <p className="text-sm text-bodyText mt-1">
            Team-wide accounts with search, filters, pagination and archive.
          </p>
        </div>
        <button
          onClick={() => setShowModal("Add")}
          className="bg-brand hover:bg-brand/90 px-4 py-2 rounded text-sm font-semibold text-white"
        >
          + Add Account
        </button>
      </div>

      <ListToolbar
        search={list.searchInput}
        onSearch={list.setSearchInput}
        searchPlaceholder="Search account name, phone or industry..."
        archived={list.archived}
        onArchivedChange={list.setArchived}
        onReset={() => {
          list.setSearchInput("");
          setSelectedType("all");
          setSelectedIndustry("all");
          setSelectedOwner("all");
        }}
        filters={[
          {
            name: "type",
            allLabel: "All types",
            value: selectedType,
            onChange: setSelectedType,
            options: ACCOUNT_TYPES,
          },
          {
            name: "industry",
            allLabel: "All industries",
            value: selectedIndustry,
            onChange: setSelectedIndustry,
            options: INDUSTRIES,
          },
          {
            name: "owner",
            allLabel: "All owners",
            value: selectedOwner,
            onChange: setSelectedOwner,
            options: owners.map((u) => ({ value: u._id, label: u.name || u.email })),
          },
        ]}
      />

      <div className="bg-card border border-gray-200 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface text-bodyText">
            <tr>
              <th className="px-4 py-3 text-left">Account Name</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Industry</th>
              <th className="px-4 py-3 text-left">Ownership</th>
              <th className="px-4 py-3 text-left">POC</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">A/Owner</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.loading ? (
              <tr>
                <td colSpan="8" className="text-center py-6 text-bodyText">
                  Loading accounts...
                </td>
              </tr>
            ) : list.items.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-6 text-bodyText">
                  No accounts found
                </td>
              </tr>
            ) : (
              list.items.map((account) => (
                <tr key={account._id} className="border-t border-gray-200 hover:bg-surface">
                  <td className="px-4 py-3">{account.accountName}</td>
                  <td className="px-4 py-3">{account.accountType}</td>
                  <td className="px-4 py-3">{account.industry || "-"}</td>
                  <td className="px-4 py-3">{account.ownership || "-"}</td>
                  <td className="px-4 py-3">
                    {(account.contacts || []).length === 0
                      ? "-"
                      : (account.contacts || []).map((c) => (
                          <span
                            key={c._id}
                            onClick={() => {
                              setShowModal("contact");
                              setSelectedContact(c);
                            }}
                            className="px-2 cursor-pointer hover:underline hover:text-blue-600"
                          >
                            {contactName(c)}
                          </span>
                        ))}
                  </td>
                  <td className="px-4 py-3">{account.phone || "-"}</td>
                  <td className="px-4 py-3">
                    {account.accountOwner?._id ? (
                      <Link
                        to={`/admin/singleUserPerformance/${account.accountOwner._id}`}
                        className="hover:underline hover:text-blue-600"
                      >
                        {account.accountOwner.name || "-"}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3 flex gap-3">
                    <button
                      onClick={() => {
                        setShowModal("Edit");
                        setSelectedAccount(account);
                      }}
                      className="text-amber-700 hover:underline"
                    >
                      Edit
                    </button>
                    <ArchiveButton
                      path={`account/${account._id}/archive`}
                      archived={account.isArchived}
                      onDone={list.reload}
                    />
                    <button
                      onClick={() => {
                        setShowModal("Delete");
                        setSelectedAccount(account);
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
        <AddAccountModal onClose={() => setShowModal("")} onSuccess={list.reload} />
      )}
      {showModal === "Edit" && (
        <EditAccountModal
          account={selectedAccount}
          onClose={() => setShowModal("")}
          onSuccess={list.reload}
        />
      )}
      {showModal === "View" && (
        <ViewAccountModal account={selectedAccount} onClose={() => setShowModal("")} />
      )}
      {showModal === "Delete" && (
        <DeleteAccountModal
          account={selectedAccount}
          onClose={() => setShowModal("")}
          onSuccess={list.reload}
        />
      )}
      {showModal === "contact" && (
        <ViewContactModal contact={selectedContact} onClose={() => setShowModal("")} />
      )}
    </div>
  );
};

export default AdminAccountsPage;
