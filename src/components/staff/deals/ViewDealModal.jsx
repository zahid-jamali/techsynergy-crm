const ViewDealModal = ({ deal, onClose }) => {
  if (!deal) return null;

  const stageColor = (stage) => {
    switch (stage) {
      case "Closed Won":
        return "bg-emerald-50 text-emerald-700 border-green-500/30";
      case "Closed Lost":
        return "bg-red-50 text-red-400 border-brand/20";
      case "Proposal/Price Quote":
        return "bg-gray-100 text-bodyText border-purple-500/30";
      case "Qualification":
        return "bg-brand/10 text-brand border-blue-500/30";
      default:
        return "bg-gray-100/30 text-bodyText border-gray-200";
    }
  };

  return (
    <div className="fixed inset-0 bg-heading/40 backdrop-blur-md z-50 overflow-y-auto">
      <div className="flex justify-center px-6 py-10">
        <div className="bg-card border border-gray-200 rounded-2xl w-full max-w-5xl text-heading shadow-2xl overflow-hidden">
          {/* ================= HEADER ================= */}
          <div className="px-8 py-6 border-b border-gray-200 bg-surface">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold">{deal.dealName}</h2>

                <p className="text-sm text-bodyText mt-1">
                  {deal.account?.accountName || "No Account"}
                </p>

                <div className="flex items-center gap-4 mt-4">
                  <span
                    className={`px-3 py-1 text-xs rounded-full border ${stageColor(
                      deal.stage
                    )}`}
                  >
                    {deal.stage}
                  </span>

                  {/* Probability Progress */}
                  <div className="flex items-center gap-3">
                    <div className="w-40 bg-surface h-2 rounded-full">
                      <div
                        className="bg-brand h-2 rounded-full transition-all"
                        style={{ width: `${deal.probability || 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-bodyText">
                      {deal.probability || 0}%
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="text-bodyText hover:text-heading transition text-lg"
              >
                ✕
              </button>
            </div>
          </div>

          {/* ================= BODY ================= */}
          <div className="p-8 space-y-8">
            {/* OWNERSHIP TRANSFER MESSAGE */}
            {deal.ownershipMessage && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 flex items-start gap-3 text-sm shadow-sm">
                <span className="text-xl leading-none">ℹ️</span>
                <div className="flex-1">
                  <p className="font-semibold text-amber-950">Ownership Handover Record</p>
                  <p className="mt-1 text-amber-800 leading-relaxed font-medium">
                    {deal.ownershipMessage}
                  </p>
                </div>
              </div>
            )}

            {/* KPI SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <KpiCard
                label="Deal Amount"
                value={`${
                  deal.currency || ""
                } ${deal.amount?.toLocaleString()}`}
              />
              <KpiCard
                label="Expected Revenue"
                value={`${
                  deal.currency || ""
                } ${deal.expectedRevenue?.toLocaleString()}`}
              />
              <KpiCard
                label="Closing Date"
                value={
                  deal.closingDate
                    ? new Date(deal.closingDate).toLocaleDateString()
                    : "-"
                }
              />
            </div>

            {/* DETAILS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* LEFT COLUMN */}
              <div className="space-y-6">
                <SectionTitle title="Contact Information" />

                <InfoBlock label="Contact Name">
                  {deal.contact
                    ? `${deal.contact.firstName || ""} ${
                        deal.contact.lastName || ""
                      }`
                    : "-"}
                </InfoBlock>

                <InfoBlock label="Previous Step">
                  {deal.previousStep || "-"}
                </InfoBlock>

                <InfoBlock label="Next Step">{deal.nextStep || "-"}</InfoBlock>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-6">
                <SectionTitle title="Deal Insights" />

                <InfoBlock label="Probability">
                  {deal.probability || 0}%
                </InfoBlock>

                <InfoBlock label="Expected Revenue">
                  {deal.currency || ""} {deal.expectedRevenue?.toLocaleString()}
                </InfoBlock>

                <InfoBlock label="Deal Owner">
                  {deal.dealOwner?.name || deal.dealOwner?.email || "Unassigned"}
                </InfoBlock>
                <InfoBlock label="Stage">{deal.stage}</InfoBlock>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <SectionTitle title="Description" />

              <div className="bg-card/60 border border-gray-200 rounded-xl p-6 text-sm text-bodyText leading-relaxed">
                {deal.description || "No additional details provided."}
              </div>
            </div>

            {/* OWNERSHIP HISTORY */}
            {deal.ownershipHistory?.length > 0 && (
              <div>
                <SectionTitle title="Ownership Handover Log" />
                <div className="space-y-2 mt-4">
                  {deal.ownershipHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-surface border border-gray-200 rounded-xl p-3.5 text-xs flex justify-between items-start gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-heading">
                            {item.fromUserName || "Staff"}
                          </span>
                          <span className="text-bodyText">→</span>
                          <span className="font-semibold text-brand">
                            {item.toUserName || "Staff"}
                          </span>
                        </div>
                        <p className="text-bodyText mt-1 text-[13px] leading-relaxed">
                          {item.message}
                        </p>
                      </div>
                      <span className="text-bodyText text-[11px] whitespace-nowrap bg-card px-2 py-1 rounded border border-gray-200">
                        {item.transferredAt ? new Date(item.transferredAt).toLocaleDateString() : "-"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= COMPONENTS ================= */

const KpiCard = ({ label, value }) => (
  <div className="bg-card/60 border border-gray-200 rounded-xl p-6 hover:border-brand/20 transition">
    <p className="text-xs text-bodyText uppercase tracking-wider">{label}</p>
    <p className="text-2xl font-bold mt-3">{value || "-"}</p>
  </div>
);

const InfoBlock = ({ label, children }) => (
  <div>
    <p className="text-xs text-bodyText uppercase tracking-wider mb-1">
      {label}
    </p>
    <p className="text-sm font-medium">{children || "-"}</p>
  </div>
);

const SectionTitle = ({ title }) => (
  <h3 className="text-sm font-semibold text-bodyText uppercase tracking-wider border-b border-gray-200 pb-2">
    {title}
  </h3>
);

export default ViewDealModal;
