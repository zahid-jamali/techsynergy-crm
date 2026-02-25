const ViewContactModal = ({ contact, onClose }) => {
  if (!contact) return null;

  const formatDate = (date) => new Date(date).toLocaleString();

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="flex justify-center px-4 py-8">
        <div className="bg-black border border-gray-800 rounded-lg w-full max-w-2xl text-white">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-red-500">
              Contact Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-8 text-sm max-h-[80vh] overflow-y-auto">
            {/* BASIC INFO */}
            <div>
              <h3 className="section-title">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="First Name" value={contact.firstName} />
                <Field label="Last Name" value={contact.lastName} />
                <Field label="Email" value={contact.email} />
                <Field label="Phone" value={contact.phone} />
                <Field label="Mobile" value={contact.mobile} />
                <Field label="Designation" value={contact.designation || "-"} />
                <Field
                  label="Status"
                  value={contact.isActive ? "Active" : "Inactive"}
                  highlight={contact.isActive}
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            {contact.description && (
              <div>
                <h3 className="section-title">Description</h3>
                <div className="bg-gray-900 border border-gray-800 p-4 rounded">
                  {contact.description}
                </div>
              </div>
            )}

            {/* META */}
            {contact.meta && Object.keys(contact.meta).length > 0 && (
              <div>
                <h3 className="section-title">Meta Data</h3>
                <pre className="bg-gray-900 border border-gray-800 p-4 rounded text-xs overflow-x-auto">
                  {JSON.stringify(contact.meta, null, 2)}
                </pre>
              </div>
            )}

            {/* SYSTEM INFO */}
            <div>
              <h3 className="section-title">System Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="Created At"
                  value={formatDate(contact.createdAt)}
                />
                <Field
                  label="Last Updated"
                  value={formatDate(contact.updatedAt)}
                />
              </div>
            </div>

            {/* ACTION */}
            <div className="flex justify-end pt-4 border-t border-gray-800">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Shared Styles */}
      <style jsx>{`
        .section-title {
          font-size: 12px;
          color: #9ca3af;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
};

const Field = ({ label, value, highlight }) => (
  <div className="bg-gray-900 border border-gray-800 rounded p-3">
    <div className="text-gray-400 text-xs mb-1">{label}</div>
    <div
      className={`font-medium ${highlight ? "text-green-400" : "text-white"}`}
    >
      {value || "-"}
    </div>
  </div>
);

export default ViewContactModal;
