import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import ThemeToggle from "../components/ThemeToggle";
import {
  Home,
  RotateCcw,
  Package,
  List,
  ChefHat,
  BarChart3,
  LogOut,
  Menu as MenuIcon,
  X,
} from "lucide-react";

// Import dashboard components
import DashboardHome from "../components/admin/DashboardHome";
import LiveOrders from "../components/admin/LiveOrders";
import AllOrders from "../components/admin/AllOrders";
import CategoriesManagement from "../components/admin/CategoriesManagement";
import MenuItemsManagement from "../components/admin/MenuItemsManagement";
import GraphsSection from "../components/admin/GraphsSection";

const AdminDashboard = () => {
  const { logout } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: "dashboard", name: "Dashboard", icon: Home },
    { id: "live-orders", name: "Live Orders", icon: RotateCcw },
    { id: "all-orders", name: "All Orders", icon: Package },
    { id: "categories", name: "Categories", icon: Package },
    { id: "menu-items", name: "Menu Items", icon: ChefHat },
    { id: "graphs", name: "More Graphs", icon: BarChart3 },
  ];

  const handleLogout = () => {
    logout();
  };

  const renderContent = () => {
    try {
      switch (activeSection) {
        case "dashboard":
          return <DashboardHome setActiveSection={setActiveSection} />;
        case "live-orders":
          return <LiveOrders />;
        case "all-orders":
          return <AllOrders />;
        case "categories":
          return <CategoriesManagement />;
        case "menu-items":
          return <MenuItemsManagement />;
        case "graphs":
          return <GraphsSection />;
        default:
          return <DashboardHome setActiveSection={setActiveSection} />;
      }
    } catch (error) {
      console.error("Error rendering content:", error);
      return (
        <div className="p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Dashboard
          </h1>
          <p className="text-red-500">
            There was an error loading the dashboard content.
          </p>
          <p className="text-sm text-gray-500 mt-2">Error: {error.message}</p>
        </div>
      );
    }
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
          } lg:static lg:inset-0`}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-center h-16 border-b border-border">
              <ChefHat className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold">FoodApp Admin</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </button>
                );
              })}
            </nav>

            {/* User section */}
            <div className="p-4 border-t border-border">
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

        {/* Main content - Full width */}
        <div className="flex-1 w-full">{renderContent()}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
