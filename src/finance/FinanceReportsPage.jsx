import { useCallback, useEffect, useState } from "react";

const PERIODS = [
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "quarterly", label: "Quarterly" },
];

const FinanceReportsPage = () => {
  const token = sessionStorage.getItem("token");
  const [period, setPeriod] = useState("monthly");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}finance/reports?period=${period}`,
        { headers: { authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setReport(data.data);
    } finally {
      setLoading(false);
    }
  }, [period, token]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const downloadExcel = async () => {
    const res = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}finance/reports/excel?period=${period}`,
      { headers: { authorization: `Bearer ${token}` } }
    );
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finance-${period}-report.xlsx`;
    a.click();
    a.remove();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Finance Reports</h1>
          <p className="page-subtitle">
            Issued invoice performance by week, month or quarter
          </p>
        </div>
        <button onClick={downloadExcel} className="btn-primary">
          Download Excel
        </button>
      </div>

      <div className="flex gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              period === p.key
                ? "bg-brand text-white"
                : "bg-card border border-gray-200 text-bodyText"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading || !report ? (
        <p className="text-bodyText">Generating report...</p>
      ) : (
        <>
          <p className="text-sm text-bodyText">
            {new Date(report.start).toLocaleDateString()} —{" "}
            {new Date(report.end).toLocaleDateString()}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="kpi-card">
              <p className="text-sm text-bodyText">Invoices issued</p>
              <p className="text-2xl font-semibold text-brand mt-2">
                {report.totals.invoicesIssued}
              </p>
            </div>
            <div className="kpi-card">
              <p className="text-sm text-bodyText">Revenue</p>
              <p className="text-2xl font-semibold text-brand mt-2">
                {report.totals.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="kpi-card">
              <p className="text-sm text-bodyText">Forwarded in period</p>
              <p className="text-2xl font-semibold text-brand mt-2">
                {report.totals.forwarded}
              </p>
            </div>
            <div className="kpi-card">
              <p className="text-sm text-bodyText">Still pending invoice</p>
              <p className="text-2xl font-semibold text-brand mt-2">
                {report.totals.pendingInvoicing}
              </p>
            </div>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Order</th>
                  <th>Account</th>
                  <th>Amount</th>
                  <th>Issued</th>
                </tr>
              </thead>
              <tbody>
                {report.invoices.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-bodyText">
                      No issued invoices in this period
                    </td>
                  </tr>
                ) : (
                  report.invoices.map((inv) => (
                    <tr key={inv._id}>
                      <td className="font-medium">{inv.invoiceNumber}</td>
                      <td>{inv.order?.orderNumber || "-"}</td>
                      <td>
                        {inv.order?.finalQuote?.account?.accountName || "-"}
                      </td>
                      <td>
                        {inv.currency} {inv.grandTotal?.toLocaleString()}
                      </td>
                      <td>
                        {inv.issuedAt
                          ? new Date(inv.issuedAt).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default FinanceReportsPage;
