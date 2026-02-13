import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DealsAnalyticsModal = ({ deals, onClose }) => {
  if (!deals) return null;

  // KPI Calculations
  const totalDeals = deals.length;
  const totalAmount = deals.reduce((acc, d) => acc + (d.amount || 0), 0);
  const totalExpected = deals.reduce(
    (acc, d) => acc + (d.expectedRevenue || 0),
    0
  );

  // Stage Distribution
  const stageMap = {};
  deals.forEach((d) => {
    stageMap[d.stage] = (stageMap[d.stage] || 0) + 1;
  });

  const stageData = Object.keys(stageMap).map((stage) => ({
    stage,
    count: stageMap[stage],
  }));

  // Amount by Stage
  const amountMap = {};
  deals.forEach((d) => {
    amountMap[d.stage] = (amountMap[d.stage] || 0) + (d.amount || 0);
  });

  const amountData = Object.keys(amountMap).map((stage) => ({
    stage,
    amount: amountMap[stage],
  }));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex justify-center items-center px-6 py-10">
      <div className="bg-[#0b0f19] border border-gray-800 rounded-2xl w-full max-w-6xl text-white shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-red-500">
              Deals Analytics
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Overview of pipeline performance & stage distribution
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 overflow-y-auto space-y-10">
          {/* KPI CARDS */}
          <div className="grid grid-cols-3 gap-6">
            <KpiCard
              label="Total Deals"
              value={totalDeals}
              accent="text-blue-400"
            />
            <KpiCard
              label="Pipeline Value"
              value={totalAmount.toLocaleString()}
              accent="text-purple-400"
            />
            <KpiCard
              label="Expected Revenue"
              value={totalExpected.toLocaleString()}
              accent="text-red-400"
            />
          </div>

          {/* STAGE DISTRIBUTION */}
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
            <h3 className="section-title">Deals by Stage</h3>

            <div className="h-80 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageData}>
                  <XAxis
                    dataKey="stage"
                    stroke="#9CA3AF"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="#ef4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AMOUNT COMPARISON */}
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
            <h3 className="section-title">Amount by Stage</h3>

            <div className="h-80 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={amountData}>
                  <XAxis
                    dataKey="stage"
                    stroke="#9CA3AF"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="amount" fill="#9333ea" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: #d1d5db;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
};

const KpiCard = ({ label, value, accent }) => (
  <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 flex flex-col justify-between shadow-inner">
    <div className="text-xs text-gray-400 uppercase tracking-wide">{label}</div>
    <div className={`text-2xl font-semibold mt-3 ${accent}`}>{value}</div>
  </div>
);

export default DealsAnalyticsModal;
