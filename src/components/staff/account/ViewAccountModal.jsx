import AccountWrapperModal from "./AccountWrapperModal";

const ViewAccountModal = ({ account, onClose }) => {
  if (!account) return null;

  const formatDate = (date) => new Date(date).toLocaleString();

  return (
    <AccountWrapperModal title="Account Details" onClose={onClose}>
      <div className="p-6 max-h-[80vh] overflow-y-auto space-y-8 text-sm">
        {/* BASIC INFORMATION */}
        <div>
          <h3 className="section-title">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Account Name" value={account.accountName} />
            <Field label="Account Site" value={account.accountSite} />
            <Field label="Phone" value={account.phone} />
            <Field label="Website" value={account.website} />
          </div>
        </div>

        {/* CLASSIFICATION */}
        <div>
          <h3 className="section-title">Classification</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Type" value={account.accountType} />
            <Field label="Industry" value={account.industry} />
            <Field label="Rating" value={account.rating} />
            <Field label="Ownership" value={account.ownership} />
            <Field
              label="Annual Revenue"
              value={
                account.annualRevenue
                  ? `PKR ${account.annualRevenue.toLocaleString()}`
                  : "-"
              }
            />
            <Field
              label="Status"
              value={account.isActive ? "Active" : "Inactive"}
              highlight={account.isActive}
            />
          </div>
        </div>

        {/* ADDRESSES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AddressCard
            title="Billing Address"
            address={account.billingAddress}
          />
          <AddressCard
            title="Shipping Address"
            address={account.shippingAddress}
          />
        </div>

        {/* DESCRIPTION */}
        {account.description && (
          <div>
            <h3 className="section-title">Description</h3>
            <div className="bg-gray-900 border border-gray-800 p-4 rounded">
              {account.description}
            </div>
          </div>
        )}

        {/* META */}
        {account.meta && Object.keys(account.meta).length > 0 && (
          <div>
            <h3 className="section-title">Meta Data</h3>
            <pre className="bg-gray-900 border border-gray-800 p-4 rounded text-xs overflow-x-auto">
              {JSON.stringify(account.meta, null, 2)}
            </pre>
          </div>
        )}

        {/* TIMESTAMPS */}
        <div>
          <h3 className="section-title">System Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Created At" value={formatDate(account.createdAt)} />
            <Field label="Last Updated" value={formatDate(account.updatedAt)} />
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
    </AccountWrapperModal>
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

const AddressCard = ({ title, address }) => (
  <div>
    <h3 className="section-title">{title}</h3>
    <div className="bg-gray-900 border border-gray-800 p-4 rounded space-y-1">
      <div>{address?.street || "-"}</div>
      <div>{address?.city || "-"}</div>
      <div>{address?.state || "-"}</div>
      <div>{address?.postalCode || "-"}</div>
      <div>{address?.country || "-"}</div>
    </div>
  </div>
);

export default ViewAccountModal;
