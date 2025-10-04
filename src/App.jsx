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
import { CartToastProvider } from "./contexts/CartToastContext";
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
import DeliveryDashboard from "./pages/DeliveryDashboard";
import NewOrders from "./pages/NewOrders";
import ProtectedRoute from "./components/ProtectedRoute";
// Import admin components
import DashboardHome from "./components/admin/DashboardHome";
import LiveOrders from "./components/admin/LiveOrders";
import AllOrders from "./components/admin/AllOrders";
import CategoriesManagement from "./components/admin/CategoriesManagement";
import MenuItemsManagement from "./components/admin/MenuItemsManagement";
import CustomersManagement from "./components/admin/CustomersManagement";
import DeliveryManagement from "./components/admin/DeliveryManagement";
import GraphsSection from "./components/admin/GraphsSection";
// Import delivery components
import DeliveryDashboardHome from "./components/delivery/DeliveryDashboardHome";
import DeliveryLiveOrders from "./components/delivery/DeliveryLiveOrders";
import DeliveryAllOrders from "./components/delivery/DeliveryAllOrders";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <CartToastProvider>
                <Router>
                  <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
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
                        <Route
                          index
                          element={<Navigate to="dashboard" replace />}
                        />
                        <Route path="dashboard" element={<DashboardHome />} />
                        <Route path="live-orders" element={<LiveOrders />} />
                        <Route path="all-orders" element={<AllOrders />} />
                        <Route
                          path="categories"
                          element={<CategoriesManagement />}
                        />
                        <Route
                          path="menuItems"
                          element={<MenuItemsManagement />}
                        />
                        <Route
                          path="customers"
                          element={<CustomersManagement />}
                        />
                        <Route
                          path="delivery"
                          element={<DeliveryManagement />}
                        />
                        <Route path="graphs" element={<GraphsSection />} />
                      </Route>
                      <Route
                        path="delivery-panel"
                        element={
                          <ProtectedRoute requireDelivery>
                            <DeliveryDashboard />
                          </ProtectedRoute>
                        }
                      >
                        <Route
                          index
                          element={<Navigate to="dashboard" replace />}
                        />
                        <Route
                          path="dashboard"
                          element={<DeliveryDashboardHome />}
                        />
                        <Route
                          path="live-orders"
                          element={<DeliveryLiveOrders />}
                        />
                        <Route
                          path="all-orders"
                          element={<DeliveryAllOrders />}
                        />
                      </Route>
                      <Route
                        path="/"
                        element={
                          <ProtectedRoute>
                            <Layout />
                          </ProtectedRoute>
                        }
                      >
                        <Route index element={<Home />} />
                        <Route path="menu" element={<Menu />} />
                        <Route path="menu/:id" element={<MenuItemDetail />} />
                        <Route
                          path="cart"
                          element={
                            <ProtectedRoute requireAuth>
                              <Cart />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="orders"
                          element={
                            <ProtectedRoute requireAuth>
                              <Orders />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="profile"
                          element={
                            <ProtectedRoute requireAuth>
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
              </CartToastProvider>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
