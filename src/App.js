import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import AdminApp from "./routes/AdminApp";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import StaffApp from "./routes/StaffApp";
import RequireRole from "./components/RequireRole";
import AdminLayout from "./layouts/AdminLayout";
import StaffLayout from "./layouts/StaffLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route
          path="/admin/*"
          element={
            <RequireRole role="admin">
              <AdminLayout>
                <AdminApp />
              </AdminLayout>
            </RequireRole>
          }
        />

        <Route
          path="/staff/*"
          element={
            <RequireRole role="staff">
              <StaffLayout>
                <StaffApp />
              </StaffLayout>
            </RequireRole>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
