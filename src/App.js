import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import AdminApp from "./routes/AdminApp";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import StaffApp from "./routes/StaffApp";
import OperationsApp from "./routes/OperationsApp";
import FinanceApp from "./routes/FinanceApp";
import RequireRole from "./components/RequireRole";
import AdminLayout from "./layouts/AdminLayout";
import StaffLayout from "./layouts/StaffLayout";
import OperationsLayout from "./layouts/OperationsLayout";
import FinanceLayout from "./layouts/FinanceLayout";

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

        <Route
          path="/operations/*"
          element={
            <RequireRole role="operations">
              <OperationsLayout>
                <OperationsApp />
              </OperationsLayout>
            </RequireRole>
          }
        />

        <Route
          path="/finance/*"
          element={
            <RequireRole role="finance">
              <FinanceLayout>
                <FinanceApp />
              </FinanceLayout>
            </RequireRole>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
