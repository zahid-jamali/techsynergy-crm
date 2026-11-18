import { Route, Routes, Navigate } from "react-router-dom";
import FinanceDashboard from "../finance/FinanceDashboard";
import FinanceQueuePage from "../finance/FinanceQueuePage";
import FinanceInvoicesPage from "../finance/FinanceInvoicesPage";
import FinanceReportsPage from "../finance/FinanceReportsPage";
import CalendarPage from "../workspace/CalendarPage";
import TodosPage from "../workspace/TodosPage";
import NotebooksPage from "../workspace/NotebooksPage";
import FinanceLedgerPage from "../finance/FinanceLedgerPage";
import FinancePaymentsPage from "../finance/FinancePaymentsPage";
import FinanceVendorBillsPage from "../finance/FinanceVendorBillsPage";
import FinancePostingRepairPage from "../finance/FinancePostingRepairPage";
import FinanceInvoiceDetailPage from "../finance/FinanceInvoiceDetailPage";
import FinanceFbrPage from "../finance/FinanceFbrPage";
import AdminSellOrderPage from "../admin/AdminSellOrderPage";
import ProfilePage from "../pages/ProfilePage";

export default function FinanceApp() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" />} />
      <Route path="dashboard" element={<FinanceDashboard />} />
      <Route path="orders" element={<AdminSellOrderPage />} />
      <Route path="queue" element={<FinanceQueuePage />} />
      <Route path="invoices" element={<FinanceInvoicesPage />} />
      <Route path="invoices/:id" element={<FinanceInvoiceDetailPage />} />
      <Route path="fbr" element={<FinanceFbrPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="reports" element={<FinanceReportsPage />} />
      <Route path="ledger" element={<FinanceLedgerPage />} />
      <Route path="payments" element={<FinancePaymentsPage />} />
      <Route path="vendor-bills" element={<FinanceVendorBillsPage />} />
      <Route path="posting-repair" element={<FinancePostingRepairPage />} />
      <Route path="calendar" element={<CalendarPage />} />
      <Route path="todos" element={<TodosPage />} />
      <Route path="notebooks" element={<NotebooksPage />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}
