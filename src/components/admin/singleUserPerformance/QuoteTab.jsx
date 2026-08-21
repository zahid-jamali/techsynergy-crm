import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import CostingDownloadButton from "../../staff/quote/CostingDownloadButton";

const COLORS = ["#021d54", "#1e4a8a", "#3b6fb6", "#93c5fd"];

const QuoteTab = ({ filteredQuotes, quotesData }) => {
  const totalValue = filteredQuotes.reduce(
    (sum, q) => sum + (q.grandTotal || 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* ===== HEADER ===== */}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-heading">
            Quotes Performance
          </h2>
          <p className="text-sm text-bodyText">
            Quote activity and status insights
          </p>
        </div>

        <div className="text-sm text-bodyText">
          {filteredQuotes.length} Quotes • PKR {totalValue.toLocaleString()}
        </div>
      </div>

      {/* ===== CHART ===== */}

      <ChartCard title="Quote Status Distribution">
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Tooltip />

            <Pie
              data={quotesData}
              dataKey="value"
              outerRadius={110}
              innerRadius={60}
            >
              {quotesData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ===== TABLE ===== */}

      <div className="bg-card border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between">
          <h3 className="font-semibold text-heading">Quotes List</h3>
          <span className="text-sm text-bodyText">
            Showing {filteredQuotes.length} quotes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-card text-bodyText uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Quote No</th>
                <th className="px-6 py-3 text-left">Subject</th>
                <th className="px-6 py-3 text-left">Deal</th>
                <th className="px-6 py-3 text-left">Stage</th>
                <th className="px-6 py-3 text-left">POS</th>
                <th className="px-6 py-3 text-right">Total</th>
                <th className="px-6 py-3 text-left">Valid Until</th>
                <th className="px-6 py-3 text-left">Owner</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredQuotes.map((q) => (
                <tr key={q._id} className="hover:bg-surface transition">
                  <td className="px-6 py-4 font-medium text-heading">
                    {q.quoteNumber || "-"}
                  </td>

                  <td className="px-6 py-4 text-bodyText">{q.subject}</td>

                  <td className="px-6 py-4 text-bodyText">
                    {typeof q.deal === "object" ? q.deal?.dealName : q.deal}
                  </td>

                  <td className="px-6 py-4">
                    <QuoteStageBadge stage={q.quoteStage} />
                  </td>

                  <td className="px-6 py-4 text-bodyText">
                    {q.contact?.firstName} {q.contact?.lastName}
                  </td>

                  <td className="px-6 py-4 text-right font-semibold">
                    {q.grandTotal?.toLocaleString() || 0}
                  </td>

                  <td className="px-6 py-4 text-bodyText">
                    {q.validUntil
                      ? new Date(q.validUntil).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="px-6 py-4 text-bodyText">
                    {q.quoteOwner?.name}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <a
                      href={`${process.env.REACT_APP_BACKEND_URL}quotes/${q._id}/pdf`}
                      className="text-emerald-700 hover:text-green-300"
                    >
                      PDF
                    </a>
                    <CostingDownloadButton
                      quote={q}
                      className="ml-3 text-sky-700 hover:underline"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuoteTab;

const ChartCard = ({ title, children }) => (
  <div className="bg-card border border-gray-200 rounded-xl p-6">
    <h3 className="text-heading font-semibold mb-5">{title}</h3>
    {children}
  </div>
);

const QuoteStageBadge = ({ stage }) => {
  const colors = {
    Draft: "bg-gray-500/10 text-bodyText",
    Negotiation: "bg-yellow-500/10 text-amber-700",
    Delivered: "bg-blue-500/10 text-brand",
    "On Hold": "bg-purple-500/10 text-bodyText",
    Confirmed: "bg-green-500/10 text-emerald-700",
    "Closed Won": "bg-emerald-600/10 text-green-500",
    "Closed Lost": "bg-brand/10 text-red-400",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        colors[stage] || "bg-gray-100 text-bodyText"
      }`}
    >
      {stage}
    </span>
  );
};
