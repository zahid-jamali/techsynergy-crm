import { useEffect, useState, useCallback, useMemo } from "react";
import AddAccountModal from "../components/staff/account/AddAccountModal";
import EditAccountModal from "../components/staff/account/EditAccountModal";
import DeleteAccountModal from "../components/staff/account/DeleteAccountModal";
import ViewAccountModal from "../components/staff/account/ViewAccountModal";
import ViewContactModal from "../components/staff/contact/ViewContactModal";

const AdminAccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedOwner, setSelectedOwner] = useState("all");

  const token = sessionStorage.getItem("token");

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const url = process.env.REACT_APP_BACKEND_URL;
      const res = await fetch(`${url}account/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Failed to fetch users");
      }

      setAccounts(data);
    } catch (err) {
      // setError(err.message);
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const View = (account) => {
    setShowModal("View");
    setSelectedAccount(account);
  };

  const uniqueTypes = useMemo(() => {
    return [...new Set(accounts.map((a) => a.accountType).filter(Boolean))];
  }, [accounts]);

  const uniqueIndustries = useMemo(() => {
    return [...new Set(accounts.map((a) => a.industry).filter(Boolean))];
  }, [accounts]);

  const uniqueOwners = useMemo(() => {
    return [
      ...new Map(
        accounts
          .filter((a) => a.accountOwner?._id)
          .map((a) => [a.accountOwner._id, a.accountOwner])
      ).values(),
    ];
  }, [accounts]);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      const searchValue = search.toLowerCase().trim();

      if (searchValue) {
        const searchableText = `
          ${account.accountName || ""}
          ${account.accountType || ""}
          ${account.industry || ""}
          ${account.phone || ""}
          ${account.accountOwner?.name || ""}
        `.toLowerCase();

        if (!searchableText.includes(searchValue)) return false;
      }

      if (selectedType !== "all" && account.accountType !== selectedType)
        return false;

      if (selectedIndustry !== "all" && account.industry !== selectedIndustry)
        return false;

      if (
        selectedOwner !== "all" &&
        account.accountOwner?._id !== selectedOwner
      )
        return false;

      return true;
    });
  }, [accounts, search, selectedType, selectedIndustry, selectedOwner]);

  return (
    <div className="p-6 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-red-500">Accounts</h1>
        <button
          onClick={() => setShowModal("Add")}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-semibold"
        >
          + Add Account
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6 space-y-4">
        {/* Search Row */}
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-black border border-gray-700 px-4 py-2 rounded-lg focus:outline-none focus:border-red-500"
          />

          <button
            onClick={() => {
              setSearch("");
              setSelectedType("all");
              setSelectedIndustry("all");
              setSelectedOwner("all");
            }}
            className="text-sm text-gray-400 hover:text-red-400"
          >
            Reset Filters
          </button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-black border border-gray-700 px-4 py-2 rounded-lg"
          >
            <option value="all">All Types</option>
            {uniqueTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="bg-black border border-gray-700 px-4 py-2 rounded-lg"
          >
            <option value="all">All Industries</option>
            {uniqueIndustries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>

          <select
            value={selectedOwner}
            onChange={(e) => setSelectedOwner(e.target.value)}
            className="bg-black border border-gray-700 px-4 py-2 rounded-lg"
          >
            <option value="all">All Owners</option>
            {uniqueOwners.map((owner) => (
              <option key={owner._id} value={owner._id}>
                {owner.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-400">
          Showing {filteredAccounts.length} of {accounts.length} accounts
        </div>
      </div>

      {/* Table */}
      <div className="bg-black rounded-lg border border-gray-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-300">
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
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-400">
                  Loading accounts...
                </td>
              </tr>
            ) : accounts.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-400">
                  No accounts found
                </td>
              </tr>
            ) : (
              filteredAccounts.map((account) => (
                <tr
                  key={account._id}
                  className="border-t border-gray-800 hover:bg-gray-900"
                >
                  <td onClick={() => View(account)} className="px-4 py-3">
                    {account.accountName}
                  </td>
                  <td onClick={() => View(account)} className="px-4 py-3">
                    {account.accountType}
                  </td>
                  <td onClick={() => View(account)} className="px-4 py-3">
                    {account.industry || "-"}
                  </td>
                  <td onClick={() => View(account)} className="px-4 py-3">
                    {account.ownership || "-"}
                  </td>
                  <td className="px-4 py-3 ">
                    {account.contacts.map((c) => (
                      <span
                        onClick={() => {
                          setShowModal("contact");
                          setSelectedContact(c);
                        }}
                        className="px-2 cursor-pointer hover:underline "
                      >
                        {c.firstName} {c.lastName}
                      </span>
                    )) || "-"}
                  </td>
                  <td onClick={() => View(account)} className="px-4 py-3">
                    {account.phone || "-"}
                  </td>
                  <td onClick={() => View(account)} className="px-4 py-3">
                    {account.accountOwner.name || "-"}
                  </td>
                  <td className="px-4 py-3 flex gap-3">
                    {/* <button
                      onClick={}}
                      className="text-blue-400 hover:underline"
                    >
                      View
                    </button> */}
                    <button
                      onClick={() => {
                        setShowModal("Edit");
                        setSelectedAccount(account);
                      }}
                      className="text-yellow-400 hover:underline"
                    >
                      Edit
                    </button>
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
      </div>

      {/* Modal */}
      {showModal === "Add" && (
        <AddAccountModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchAccounts}
        />
      )}

      {showModal === "Edit" && (
        <EditAccountModal
          account={selectedAccount}
          onClose={() => {
            setShowModal(null);
            setSelectedAccount(null);
          }}
          onSuccess={fetchAccounts}
        />
      )}

      {showModal === "View" && (
        <ViewAccountModal
          account={selectedAccount}
          onClose={() => {
            setShowModal(null);
            setSelectedAccount(null);
          }}
        />
      )}

      {showModal === "Delete" && (
        <DeleteAccountModal
          account={selectedAccount}
          onClose={() => {
            setShowModal(null);
            setSelectedAccount(null);
          }}
          onSuccess={fetchAccounts}
        />
      )}
      {showModal === "contact" && (
        <ViewContactModal
          contact={selectedContact}
          onClose={() => {
            setShowModal(null);
            setSelectedContact(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminAccountsPage;
