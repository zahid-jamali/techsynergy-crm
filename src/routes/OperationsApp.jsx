import { Route, Routes, Navigate } from "react-router-dom";
import OperationsDashboard from "../operations/OperationsDashboard";
import OperationsOrdersPage from "../operations/OperationsOrdersPage";
import OperationsDeliveriesPage from "../operations/OperationsDeliveriesPage";
import AdminPOToVendorPage from "../admin/AdminPOToVendorPage";
import AdminVendorsPage from "../admin/AdminVendorsPage";
import CalendarPage from "../workspace/CalendarPage";
import TodosPage from "../workspace/TodosPage";
import NotebooksPage from "../workspace/NotebooksPage";
import PriceQueriesPage from "../pages/PriceQueriesPage";

export default function OperationsApp() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" />} />
      <Route path="dashboard" element={<OperationsDashboard />} />
      <Route path="price-queries" element={<PriceQueriesPage />} />
      <Route path="orders" element={<OperationsOrdersPage />} />
      <Route path="deliveries" element={<OperationsDeliveriesPage />} />
      <Route path="purchase-orders" element={<AdminPOToVendorPage />} />
      <Route path="vendors" element={<AdminVendorsPage />} />
      <Route path="calendar" element={<CalendarPage />} />
      <Route path="todos" element={<TodosPage />} />
      <Route path="notebooks" element={<NotebooksPage />} />
    </Routes>
  );
}
