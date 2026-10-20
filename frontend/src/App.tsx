import {  BrowserRouter, Navigate, Route, Routes, } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { ProductsPage } from './pages/ProductsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public login page */}
          <Route
            path="/login"
            element={<LoginPage />}
          />

          {/* Protected employee pages */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={<DashboardPage />}
            />

            {/* Admin and Cashier can view products */}
            <Route
              path="/products"
              element={<ProductsPage />}
            />

            {/* Admin-only pages */}
            <Route
              element={<ProtectedRoute role="ADMIN" />}
            >
              <Route
                path="/admin"
                element={<AdminPage />}
              />
            </Route>
          </Route>

          {/* Redirect unknown routes */}
          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}