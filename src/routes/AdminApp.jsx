import { Route, Routes, Navigate } from "react-router-dom";
import AdminAccountsPage from "../admin/AdminAccountsPage";
import AdminContactsPage from "../admin/AdminContactsPage";
import AdminDashbaord from "../admin/AdminDashbaord";
import AdminDealsPage from "../admin/AdminDealsPage";
import AdminInvoicePage from "../admin/AdminInvoicePage";
import AdminPOToVendorPage from "../admin/AdminPOToVendorPage";
import AdminProductsPage from "../admin/AdminProductsPage";
import AdminQuotesPage from "../admin/AdminQuotesPage";
import SalesTargetPage from "../admin/AdminSalesTargetPage";
import AdminSellOrderPage from "../admin/AdminSellOrderPage";
import AdminUserPerformance from "../admin/AdminUserPerformance";
import AdminUsers from "../admin/AdminUsers";
import AdminVendorsPage from "../admin/AdminVendorsPage";

export default function AdminApp() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" />} />
      <Route path="dashboard" element={<AdminDashbaord />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="contacts" element={<AdminContactsPage />} />
      <Route path="accounts" element={<AdminAccountsPage />} />
      <Route path="deals" element={<AdminDealsPage />} />
      <Route path="quotes" element={<AdminQuotesPage />} />
      <Route path="sell-order" element={<AdminSellOrderPage />} />
      <Route path="products" element={<AdminProductsPage />} />
      <Route path="vendors" element={<AdminVendorsPage />} />
      <Route path="poToVendor" element={<AdminPOToVendorPage />} />
      <Route path="invoice" element={<AdminInvoicePage />} />
      <Route path="sales-target" element={<SalesTargetPage />} />
      <Route path="performance" element={<AdminUserPerformance />} />
    </Routes>
  );
}
