import { useCallback, useEffect, useState } from "react";

import CreateInvoiceModal from "../components/admin/CreateInvoiceModal";
import EditInvoiceModal from "../components/admin/EditInvoiceModal";
import IssueInvoiceModal from "../components/admin/IssueInvoiceModal";
import CancelInvoiceModal from "../components/admin/CancelInvoiceModal";
import DeleteInvoiceModal from "../components/admin/DeleteInvoiceModal";
import ViewInvoiceModal from "../components/admin/ViewInvoiceModal";

const AdminInvoicePage = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [modal, setModal] = useState(null);

  const token = sessionStorage.getItem("token");

  const fetchInvoices = useCallback(async () => {
    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}invoice/get`, {
      headers: { authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setInvoices(data.data || []);
  }, [token]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const statusBadge = (status) => {
    if (status === "Issued") return "bg-green-600/20 text-green-400";
    if (status === "Cancelled") return "bg-red-600/20 text-red-400";
    return "bg-yellow-600/20 text-yellow-400"; // Draft
  };

  return (
    <div className="p-6 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Invoices</h1>

        <button
          onClick={() => setModal("create")}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
        >
          + New Invoice
        </button>
      </div>

      {/* Table */}
      <div className="bg-black border border-gray-800 rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              <th className="p-3 text-left">Invoice #</th>
              <th className="p-3">Status</th>
              <th className="p-3">Customer PO</th>
              <th className="p-3">Created</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-400">
                  No invoices found
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr
                  key={inv._id}
                  className="border-t border-gray-800 hover:bg-gray-900"
                >
                  <td
                    onClick={() => {
                      setSelectedInvoice(inv);
                      setModal("View");
                    }}
                    className="p-3"
                  >
                    {inv.invoiceNumber}
                  </td>

                  <td
                    onClick={() => {
                      setSelectedInvoice(inv);
                      setModal("View");
                    }}
                    className="p-3"
                  >
                    <span
                      className={`px-2 py-1 rounded text-xs ${statusBadge(
                        inv.status
                      )}`}
                    >
                      {inv.status}
                    </span>
                  </td>

                  <td
                    onClick={() => {
                      setSelectedInvoice(inv);
                      setModal("View");
                    }}
                    className="p-3"
                  >
                    {inv.customerRefNo || "-"}
                  </td>

                  <td
                    onClick={() => {
                      setSelectedInvoice(inv);
                      setModal("View");
                    }}
                    className="p-3"
                  >
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-3 text-right space-x-3">
                    {inv.status === "Draft" && (
                      <button
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setModal("edit");
                        }}
                        className="text-blue-400 hover:underline"
                      >
                        Edit
                      </button>
                    )}

                    {inv.status === "Draft" && (
                      <button
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setModal("issue");
                        }}
                        className="text-green-400 hover:underline"
                      >
                        Issue
                      </button>
                    )}

                    {inv.status !== "Cancelled" ? (
                      <>
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setModal("cancel");
                          }}
                          className="text-yellow-400 hover:underline"
                        >
                          Cancel
                        </button>

                        <a
                          href={`${process.env.REACT_APP_BACKEND_URL}invoice/${inv._id}/pdf`}
                          className="text-green-400 hover:underline"
                        >
                          {" "}
                          Download
                        </a>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setModal("delete");
                          }}
                          className="text-red-400 hover:underline"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {modal === "create" && (
        <CreateInvoiceModal
          onClose={() => setModal(null)}
          onSuccess={fetchInvoices}
        />
      )}

      {modal === "View" && (
        <ViewInvoiceModal
          onClose={() => setModal(null)}
          invoice={selectedInvoice}
        />
      )}

      {modal === "edit" && selectedInvoice && (
        <EditInvoiceModal
          invoice={selectedInvoice}
          onClose={() => setModal(null)}
          onSuccess={fetchInvoices}
        />
      )}

      {modal === "issue" && selectedInvoice && (
        <IssueInvoiceModal
          invoice={selectedInvoice}
          onClose={() => setModal(null)}
          onSuccess={fetchInvoices}
        />
      )}

      {modal === "cancel" && selectedInvoice && (
        <CancelInvoiceModal
          invoice={selectedInvoice}
          onClose={() => setModal(null)}
          onSuccess={fetchInvoices}
        />
      )}

      {modal === "delete" && selectedInvoice && (
        <DeleteInvoiceModal
          invoice={selectedInvoice}
          onClose={() => setModal(null)}
          onSuccess={fetchInvoices}
        />
      )}
    </div>
  );
};

export default AdminInvoicePage;
