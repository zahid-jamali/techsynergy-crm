import { useEffect, useState } from "react";
import { Package, ShoppingCart, Truck, Send, ClipboardCheck } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";

const OperationsDashboard = () => {
  const token = sessionStorage.getItem("token");
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}deliveries/dashboard`,
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
    {
      title: "Ready for operations",
      value: data.kpis.readyForOps,
      icon: ShoppingCart,
    },
    { title: "PO created", value: data.kpis.poCreated, icon: Truck },
    { title: "In delivery", value: data.kpis.inDelivery, icon: Package },
    {
      title: "Delivered — ready to forward",
      value: data.kpis.delivered,
      icon: ClipboardCheck,
    },
    { title: "With finance", value: data.kpis.forwarded, icon: Send },
  ];

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Operations Dashboard</h1>
        <p className="page-subtitle">
          Approved sell orders move through procurement, delivery and finance
          handoff
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
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
          Recent deliveries
        </h2>
        {data.recentDeliveries?.length ? (
          <div className="divide-y divide-gray-100">
            {data.recentDeliveries.map((item) => (
              <div
                key={item._id}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-medium text-heading">
                    {item.deliveryNumber}
                  </p>
                  <p className="text-xs text-bodyText">
                    {item.order?.orderNumber} ·{" "}
                    {item.order?.finalQuote?.account?.accountName || "Account"}
                  </p>
                </div>
                <StatusBadge value={item.status} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-bodyText">No deliveries yet.</p>
        )}
      </div>
    </div>
  );
};

export default OperationsDashboard;
