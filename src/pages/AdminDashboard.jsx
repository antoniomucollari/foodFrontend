import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation, Outlet, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import ThemeToggle from "../components/ThemeToggle";
import {
  Home,
  RotateCcw,
  Package,
  List,
  ChefHat,
  BarChart3,
  Users,
  Truck,
  LogOut,
  Menu as MenuIcon,
  X,
} from "lucide-react";

const AdminDashboard = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: Home,
      path: "/admin/dashboard",
    },
    {
      id: "live-orders",
      name: "Live Orders",
      icon: RotateCcw,
      path: "/admin/live-orders",
    },
    {
      id: "all-orders",
      name: "All Orders",
      icon: Package,
      path: "/admin/all-orders",
    },
    {
      id: "categories",
      name: "Categories",
      icon: Package,
      path: "/admin/categories",
    },
    {
      id: "menu-items",
      name: "Menu Items",
      icon: ChefHat,
      path: "/admin/menuItems",
    },
    {
      id: "customers",
      name: "Customers",
      icon: Users,
      path: "/admin/customers",
    },
    {
      id: "delivery",
      name: "Delivery",
      icon: Truck,
      path: "/admin/delivery",
    },
    {
      id: "graphs",
      name: "More Graphs",
      icon: BarChart3,
      path: "/admin/graphs",
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-background text-foreground w-full">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-card"
        >
          {isMobileMenuOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <MenuIcon className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex w-full">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } lg:static lg:inset-0 lg:fixed`}
        >
          <div className="flex flex-col h-screen overflow-hidden">
            {/* Logo */}
            <div className="flex items-center justify-center h-16 border-b border-border flex-shrink-0">
              <ChefHat className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold">FoodApp Admin</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* User section - Fixed at bottom */}
            <div className="flex-shrink-0 p-4 border-t border-border">
              <div className="flex items-center justify-between">
                <ThemeToggle />
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main content - Account for fixed sidebar */}
        <div className="flex-1 w-full lg:ml-64">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
