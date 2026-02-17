import { Route, Routes, Navigate } from "react-router-dom";
import StaffAccountsPage from "../staff/StaffAccountPage";
import StaffContactsPage from "../staff/StaffContactPage";
import StaffDashbaord from "../staff/StaffDashboard";
import StaffDealsPage from "../staff/StaffDealsPage";
import StaffQuotePage from "../staff/StaffQuotesPage";
import StaffSellOrderPage from "../staff/StaffSellOrderPage";
import StaffUpdateProfile from "../staff/StaffUpdateProfile";

export default function StaffApp() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<StaffDashbaord />} />
        <Route path="profile" element={<StaffUpdateProfile />} />
        <Route path="account" element={<StaffAccountsPage />} />
        <Route path="contacts" element={<StaffContactsPage />} />
        <Route path="deals" element={<StaffDealsPage />} />
        <Route path="quotes" element={<StaffQuotePage />} />
        <Route path="s-order" element={<StaffSellOrderPage />} />
      </Routes>
    </>
  );
}
