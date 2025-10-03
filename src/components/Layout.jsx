import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useCartAnimation } from "../hooks/useCartAnimation";
import { useCartToast } from "../contexts/CartToastContext";
import { Button } from "./ui/button";
import ThemeToggle from "./ThemeToggle";
import CartToast from "./CartToast";
import {
  ShoppingCart,
  User,
  LogOut,
  Menu as MenuIcon,
  X,
  Home,
  ChefHat,
  Settings,
  UserCircle,
} from "lucide-react";

const Layout = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { cartItemCount } = useCart();
  const isCartAnimating = useCartAnimation(cartItemCount);
  const { cartToast, hideCartToast } = useCartToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Menu", href: "/menu", icon: ChefHat },
  ];

  if (isAuthenticated()) {
    navigation.push({ name: "Orders", href: "/orders", icon: User });
  }

  // Admin users will access dashboard directly via URL
  // if (isAdmin()) {
  //   navigation.push({ name: 'Admin', href: '/admin', icon: Settings });
  // }

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <ChefHat className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-foreground">
                  FoodApp
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:text-primary hover:bg-accent"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle />
              {isAuthenticated() ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">
                    Welcome, {user?.name || user?.email}
                  </span>
                  {/* Profile Icon */}
                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors text-foreground hover:text-primary hover:bg-accent"
                    title="Profile"
                  >
                    <UserCircle className="h-4 w-4" />
                  </Link>
                  {/* Cart Icon with Count - Only show for authenticated users */}
                  {isAuthenticated() && (
                    <div className="relative">
                      <Link
                        to="/cart"
                        className="relative flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 text-foreground hover:text-primary hover:bg-accent hover:scale-105"
                      >
                        <ShoppingCart
                          className={`h-4 w-4 transition-transform duration-200 ${
                            isCartAnimating ? "animate-bounce" : ""
                          }`}
                        />
                        {cartItemCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                            {cartItemCount}
                          </span>
                        )}
                      </Link>
                      <CartToast
                        isVisible={cartToast.isVisible}
                        onClose={hideCartToast}
                        message={cartToast.message}
                      />
                    </div>
                  )}
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" asChild>
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/register">Register</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <MenuIcon className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-card border-t border-border">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:text-primary hover:bg-accent"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {isAuthenticated() ? (
                <div className="pt-4 border-t border-border">
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Welcome, {user?.name || user?.email}
                  </div>
                  {/* Profile Link */}
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors text-foreground hover:text-primary hover:bg-accent"
                  >
                    <UserCircle className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                  {/* Cart Link with Count - Only show for authenticated users */}
                  {isAuthenticated() && (
                    <Link
                      to="/cart"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-all duration-200 text-foreground hover:text-primary hover:bg-accent relative hover:scale-105"
                    >
                      <ShoppingCart
                        className={`h-5 w-5 transition-transform duration-200 ${
                          isCartAnimating ? "animate-bounce" : ""
                        }`}
                      />
                      <span>Cart</span>
                      {cartItemCount > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                          {cartItemCount}
                        </span>
                      )}
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    className="w-full justify-start mt-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="pt-4 border-t border-border space-y-2">
                  <div className="flex justify-center mb-2">
                    <ThemeToggle />
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
