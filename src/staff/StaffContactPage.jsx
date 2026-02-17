import { useCallback, useEffect, useState } from "react";
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

      {/* Table */}
      <div className="bg-black border border-gray-800 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-300">
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
              contacts.map((c) => (
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
                  <td onClick={() => View(c)} className="px-4 py-3">
                    {c.phone || "-"}
                  </td>
                  <td onClick={() => View(c)} className="px-4 py-3">
                    {c.account?.accountName || "-"}
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
    </div>
  );
};

export default StaffContactsPage;
