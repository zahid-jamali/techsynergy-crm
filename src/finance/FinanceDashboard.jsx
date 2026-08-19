import { useEffect, useState } from "react";
import { Inbox, FileText, BadgeCheck, Wallet } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";

const FinanceDashboard = () => {
  const token = sessionStorage.getItem("token");
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}finance/dashboard`,
        { headers: { authorization: `Bearer ${token}` } }
      );
      const json = await res.json();
      setData(json.data);
    };
    load();
  }, [token]);

  if (!data) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loading />
      </div>
    );
  }

  const cards = [
    { title: "Handoff queue", value: data.kpis.queueCount, icon: Inbox },
    { title: "Draft invoices", value: data.kpis.draftCount, icon: FileText },
    { title: "Issued invoices", value: data.kpis.issuedCount, icon: BadgeCheck },
    {
      title: "Revenue this month",
      value: data.kpis.monthlyRevenue?.toLocaleString(),
      icon: Wallet,
    },
  ];

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Finance Dashboard</h1>
        <p className="page-subtitle">
          Invoices are created only after operations forwards a delivered order
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.title} className="kpi-card">
            <div className="flex items-center justify-between">
              <p className="text-sm text-bodyText">{card.title}</p>
              <card.icon size={16} className="text-brand" />
            </div>
            <p className="text-2xl font-semibold text-brand mt-2">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h2 className="text-base font-semibold text-heading mb-4">
          Recent invoices
        </h2>
        {data.recentInvoices?.length ? (
          <div className="divide-y divide-gray-100">
            {data.recentInvoices.map((inv) => (
              <div
                key={inv._id}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-medium text-heading">{inv.invoiceNumber}</p>
                  <p className="text-xs text-bodyText">
                    {inv.order?.orderNumber} · {inv.currency}{" "}
                    {inv.grandTotal?.toLocaleString()}
                  </p>
                </div>
                <StatusBadge value={inv.status} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-bodyText">No invoices yet.</p>
        )}
      </div>
    </div>
  );
};

export default FinanceDashboard;
