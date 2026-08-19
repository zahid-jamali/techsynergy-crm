import { Route, Routes, Navigate } from "react-router-dom";
import FinanceDashboard from "../finance/FinanceDashboard";
import FinanceQueuePage from "../finance/FinanceQueuePage";
import FinanceInvoicesPage from "../finance/FinanceInvoicesPage";
import FinanceReportsPage from "../finance/FinanceReportsPage";
import CalendarPage from "../workspace/CalendarPage";
import TodosPage from "../workspace/TodosPage";
import NotebooksPage from "../workspace/NotebooksPage";

export default function FinanceApp() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" />} />
      <Route path="dashboard" element={<FinanceDashboard />} />
      <Route path="queue" element={<FinanceQueuePage />} />
      <Route path="invoices" element={<FinanceInvoicesPage />} />
      <Route path="reports" element={<FinanceReportsPage />} />
      <Route path="calendar" element={<CalendarPage />} />
      <Route path="todos" element={<TodosPage />} />
      <Route path="notebooks" element={<NotebooksPage />} />
    </Routes>
  );
}
