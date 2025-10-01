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
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Menu from "./pages/Menu";
import MenuItemDetail from "./pages/MenuItemDetail";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import AdminDashboard from "./pages/AdminDashboard";
import NewOrders from "./pages/NewOrders";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
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
                />
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
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
