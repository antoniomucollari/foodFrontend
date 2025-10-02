import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import { ToastProvider } from "./contexts/ToastContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Menu from "./pages/Menu";
import MenuItemDetail from "./pages/MenuItemDetail";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import NewOrders from "./pages/NewOrders";
import ProtectedRoute from "./components/ProtectedRoute";
// Import admin components
import DashboardHome from "./components/admin/DashboardHome";
import LiveOrders from "./components/admin/LiveOrders";
import AllOrders from "./components/admin/AllOrders";
import CategoriesManagement from "./components/admin/CategoriesManagement";
import MenuItemsManagement from "./components/admin/MenuItemsManagement";
import GraphsSection from "./components/admin/GraphsSection";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <Router>
            <div className="min-h-screen bg-background text-foreground">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardHome />} />
                  <Route path="live-orders" element={<LiveOrders />} />
                  <Route path="all-orders" element={<AllOrders />} />
                  <Route path="categories" element={<CategoriesManagement />} />
                  <Route path="menuItems" element={<MenuItemsManagement />} />
                  <Route path="graphs" element={<GraphsSection />} />
                </Route>
                <Route path="/" element={<Layout />}>
                  <Route
                    index
                    element={
                      <ProtectedRoute restrictAdmin>
                        <Home />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="menu"
                    element={
                      <ProtectedRoute restrictAdmin>
                        <Menu />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="menu/:id"
                    element={
                      <ProtectedRoute restrictAdmin>
                        <MenuItemDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="cart"
                    element={
                      <ProtectedRoute restrictAdmin>
                        <Cart />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="orders"
                    element={
                      <ProtectedRoute restrictAdmin>
                        <Orders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="profile"
                    element={
                      <ProtectedRoute restrictAdmin>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="new-orders"
                    element={
                      <ProtectedRoute requireAdmin>
                        <NewOrders />
                      </ProtectedRoute>
                    }
                  />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
              </Router>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
