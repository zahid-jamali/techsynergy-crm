import { useCallback, useEffect, useState } from "react";
import Loading from "../components/Loading";
import ViewAccountModal from "../components/staff/account/ViewAccountModal";
// import AddAccountModal from "../components/staff/AddAccountModal";
import AddContactModal from "../components/staff/contact/AddContactModal";
import DeleteContactModal from "../components/staff/contact/DeleteContactModal";
import EditContactModal from "../components/staff/contact/EditContactModal";
import ViewContactModal from "../components/staff/contact/ViewContactModal";

const StaffContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(false);

  const token = sessionStorage.getItem("token");

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}contact/my`,
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

  const View = (c) => {
    setShowModal("View");
    setSelectedContact(c);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loading />
      </div>
    );
  }

  return (
    <div className="p-6 text-heading">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-brand">Contacts</h1>
        <button
          onClick={() => setShowModal("Add")}
          className="bg-brand hover:bg-brand/90 px-4 py-2 rounded text-sm font-semibold"
        >
          + Add Contact
        </button>
      </div>

      {/* Table */}
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
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-bodyText">
                  Loading contacts...
                </td>
              </tr>
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-bodyText">
                  No contacts found
                </td>
              </tr>
            ) : (
              contacts.map((c) => (
                <tr
                  key={c._id}
                  className="border-t border-gray-200 hover:bg-surface"
                >
                  <td onClick={() => View(c)} className="px-4 py-3">
                    {c.firstName} {c.lastName}
                  </td>
                  <td onClick={() => View(c)} className="px-4 py-3">
                    {c.email || "-"}
                  </td>
                  <td onClick={() => View(c)} className="px-4 py-3">
                    {c.phone || "-"}
                  </td>
                  <td
                    onClick={() => {
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
          onClose={() => setShowModal(false)}
          onSuccess={fetchContacts}
        />
      )}

      {showModal === "View" && (
        <ViewContactModal
          contact={selectedContact}
          onClose={() => setShowModal(false)}
        />
      )}

      {showModal === "Delete" && (
        <DeleteContactModal
          contact={selectedContact}
          onClose={() => setShowModal(false)}
          onSuccess={fetchContacts}
        />
      )}

      {showModal === "account" && (
        <ViewAccountModal
          account={selectedAccount}
          onClose={() => {
            setShowModal(null);
            setSelectedAccount(null);
          }}
        />
      )}
    </div>
  );
};

export default StaffContactsPage;
