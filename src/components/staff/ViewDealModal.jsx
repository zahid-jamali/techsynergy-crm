const ViewDealModal = ({ deal, onClose }) => {
  if (!deal) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="flex justify-center px-4 py-8">
        <div className="bg-black border border-gray-800 rounded-lg w-full max-w-xl text-white">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-red-500">Deal Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-3 text-sm">
            <InfoRow label="Deal Name" value={deal.dealName} />
            <InfoRow label="Account" value={deal.account?.accountName} />
            <InfoRow
              label="Contact"
              value={`${deal.contact?.firstName || ""} ${
                deal.contact?.lastName || ""
              }`}
            />
            <InfoRow label="Stage" value={deal.stage} />
            <InfoRow label="Previous Step" value={deal.previousStep || "-"} />
            <InfoRow label="Next Step" value={deal.nextStep || "-"} />
            <InfoRow label="Amount" value={deal.amount?.toLocaleString()} />
            <InfoRow label="Probability" value={`${deal.probability || 0}%`} />
            <InfoRow
              label="Expected Revenue"
              value={deal.expectedRevenue?.toLocaleString()}
            />
            <InfoRow
              label="Closing Date"
              value={
                deal.closingDate
                  ? new Date(deal.closingDate).toLocaleDateString()
                  : "-"
              }
            />
            <InfoRow label="Description" value={deal.description || "-"} />
          </div>
        </div>
      </div>
    </div>
  );
};

/* 🔹 Small reusable row */
const InfoRow = ({ label, value }) => (
  <div className="flex justify-between border-b border-gray-800 pb-1">
    <span className="text-gray-400">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

export default ViewDealModal;
