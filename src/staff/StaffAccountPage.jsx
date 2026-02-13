import { useEffect, useState } from "react";
import AddAccountModal from "../components/staff/account/AddAccountModal";
import EditAccountModal from "../components/staff/account/EditAccountModal";
import DeleteAccountModal from "../components/staff/account/DeleteAccountModal";
import ViewAccountModal from "../components/staff/account/ViewAccountModal";

const StaffAccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showModal, setShowModal] = useState("");

  const token = sessionStorage.getItem("token");
  const users = sessionStorage.getItem("user");

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const url = process.env.REACT_APP_BACKEND_URL;
      const res = await fetch(`${url}account/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Failed to fetch users");
      }

      setAccounts(data);
      console.log(users);
    } catch (err) {
      // setError(err.message);
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const View = (account) => {
    setShowModal("Edit");
    setSelectedAccount(account);
  };
  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-red-500">Accounts</h1>
        <button
          onClick={() => setShowModal("Add")}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-semibold"
        >
          + Add Account
        </button>
      </div>

      <div className="bg-black rounded-lg border border-gray-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">Account Name</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Industry</th>
              <th className="px-4 py-3 text-left">Phone</th>
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
              accounts.map((account) => (
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
                    {account.phone || "-"}
                  </td>
                  <td className="px-4 py-3 flex gap-3">
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
          onClose={() => setShowModal("")}
          onSuccess={fetchAccounts}
        />
      )}

      {showModal === "Edit" && (
        <EditAccountModal
          account={selectedAccount}
          onClose={() => {
            setShowModal("");
            setSelectedAccount(null);
          }}
          onSuccess={fetchAccounts}
        />
      )}

      {showModal === "View" && (
        <ViewAccountModal
          account={selectedAccount}
          onClose={() => {
            setShowModal("");
            setSelectedAccount(null);
          }}
        />
      )}

      {showModal === "Delete" && (
        <DeleteAccountModal
          account={selectedAccount}
          onClose={() => {
            setShowModal("");
            setSelectedAccount(null);
          }}
          onSuccess={fetchAccounts}
        />
      )}
    </div>
  );
};

export default StaffAccountsPage;
