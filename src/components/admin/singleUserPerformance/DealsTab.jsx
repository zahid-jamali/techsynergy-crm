import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { useState } from "react";
import ViewDealModal from "../../staff/deals/ViewDealModal";
import DealsAnalyticsModal from "../../staff/charts/DealsAnalyticsModal";

const COLORS = ["#ef4444", "#dc2626", "#b91c1c", "#7f1d1d"];

const DealsTab = ({ filteredDeals, dealsByAmount, dealsByStage }) => {
  const [showModal, setShowModal] = useState("");
  const [selectedDeal, setSelectedDeal] = useState({});

  const totalAmount = filteredDeals.reduce(
    (sum, d) => sum + (d.amount || 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* HEADER */}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Deals Performance
          </h2>
          <p className="text-sm text-gray-400">
            Pipeline insights and deal analytics
          </p>
        </div>

        <div className="text-sm text-gray-400">
          {filteredDeals.length} Deals • PKR {totalAmount.toLocaleString()}
        </div>
      </div>

      {/* CHARTS */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <ChartCard title="Deal Amount Trend">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={dealsByAmount}>
              <CartesianGrid stroke="#1f1f1f" />
              <XAxis dataKey="dealName" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Deal Stage Distribution">
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Tooltip />
              <Pie
                data={dealsByStage}
                dataKey="value"
                outerRadius={110}
                innerRadius={60}
              >
                {dealsByStage.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* TABLE */}

      <div className="bg-[#0c0c0c] border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm tracking-wide">
            Deals List
          </h3>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              Showing {filteredDeals.length} deals
            </span>

            <button
              onClick={() => setShowModal("Analytics")}
              className="flex items-center gap-2 text-sm px-3 py-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-md text-gray-300 hover:text-white transition"
            >
              Show Analytics
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-sm">
            <thead className="bg-black text-gray-400 uppercase text-xs tracking-wider sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left">Deal</th>
                <th className="px-6 py-3 text-left">Account</th>
                <th className="px-6 py-3 text-left">Stage</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-left">POS</th>
                <th className="px-6 py-3 text-left">Close Date</th>
                <th className="px-6 py-3 text-left">Probability</th>
                <th className="px-6 py-3 text-left">Owner</th>
                {/* <th className="px-6 py-3 text-right">Actions</th> */}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800">
              {filteredDeals.map((deal) => (
                <tr
                  key={deal._id}
                  className="hover:bg-[#151515] transition group cursor-pointer"
                  onClick={() => {
                    setSelectedDeal(deal);
                    setShowModal("View");
                  }}
                >
                  <td className="px-6 py-4 font-medium text-white">
                    {deal.dealName}
                  </td>

                  <td className="px-6 py-4 text-gray-300">
                    {deal.account?.accountName}
                  </td>

                  <td className="px-6 py-4">
                    <StageBadge stage={deal.stage} />
                  </td>

                  <td className="px-6 py-4 text-right font-semibold">
                    {deal.amount?.toLocaleString() || 0} {deal.currency}
                  </td>

                  <td className="px-6 py-4 text-gray-300">
                    {deal.contact?.firstName} {deal.contact?.lastName}
                  </td>

                  <td className="px-6 py-4 text-gray-300">
                    {new Date(deal.closingDate).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4 text-gray-300">
                    {deal.probability}%
                  </td>

                  <td className="px-6 py-4 text-gray-300">
                    {deal.dealOwner?.name}
                  </td>

                  {/* ACTIONS */}

                  {/* <td
                    className="px-6 py-4 text-right space-x-3 opacity-0 group-hover:opacity-100 transition"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onView(deal)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      onClick={() => onPipeline(deal)}
                      className="text-purple-400 hover:text-purple-300"
                    >
                      <Workflow size={16} />
                    </button>

                    <button
                      onClick={() => onEdit(deal)}
                      className="text-yellow-400 hover:text-yellow-300"
                    >
                      <Pencil size={16} />
                    </button>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showModal === "View" && (
        <ViewDealModal
          deal={selectedDeal}
          onClose={() => {
            setShowModal("");
            setSelectedDeal(null);
          }}
        />
      )}
      {showModal === "Analytics" && (
        <DealsAnalyticsModal
          deals={filteredDeals}
          onClose={() => setShowModal("")}
        />
      )}
    </div>
  );
};

export default DealsTab;

const ChartCard = ({ title, children }) => (
  <div className="bg-[#111] border border-white/10 rounded-xl p-6">
    <h3 className="text-white font-semibold mb-5">{title}</h3>
    {children}
  </div>
);

const StageBadge = ({ stage }) => {
  const colors = {
    Qualification: "bg-blue-500/10 text-blue-400",
    Proposal: "bg-yellow-500/10 text-yellow-400",
    Negotiation: "bg-purple-500/10 text-purple-400",
    "Closed Won": "bg-green-500/10 text-green-400",
    "Closed Lost": "bg-red-500/10 text-red-400",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        colors[stage] || "bg-gray-700 text-gray-300"
      }`}
    >
      {stage}
    </span>
  );
};
