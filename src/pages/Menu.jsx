import React, { useState, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { categoryAPI, menuAPI, reviewAPI } from "../services/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Search, Star, Plus, Minus, ShoppingCart } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useCartToast } from "../contexts/CartToastContext";
import { useQueryClient } from "@tanstack/react-query";
import { cartAPI } from "../services/api";

const Menu = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [cartItems, setCartItems] = useState({});
  const searchInputRef = useRef(null);
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const { showCartToast } = useCartToast();
  const queryClient = useQueryClient();

  // Debounce search term to prevent excessive API calls
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle search input change
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Focus search input when component mounts or when needed
  React.useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryAPI.getAllCategories(),
  });

  // Fetch menu items
  const { data: menuData, isLoading: menuLoading } = useQuery({
    queryKey: ["menu", selectedCategory, debouncedSearchTerm],
    queryFn: () =>
      menuAPI.getMenus({
        categoryId: selectedCategory,
        searchTerm: debouncedSearchTerm || undefined,
      }),
  });

  // Fetch cart
  const { data: cartData } = useQuery({
    queryKey: ["cart"],
    queryFn: () => cartAPI.getShoppingCart(),
    enabled: isAuthenticated(),
    retry: (failureCount, error) => {
      // Don't retry if it's a 404 (cart doesn't exist) or 401 (unauthorized)
      if (error?.response?.status === 404 || error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    onError: (error) => {
      // Silently handle cart errors for new users
      if (error?.response?.status === 404) {
        console.log("Cart not found - user likely doesn't have a cart yet");
      }
    },
  });

  const categories = categoriesData?.data?.data || [];
  const menuItems = menuData?.data?.data || [];

  const handleAddToCart = async (menuId, event) => {
    event.stopPropagation(); // Prevent card click from firing
    if (!isAuthenticated()) {
      showError("Please login to add items to cart");
      return;
    }

    try {
      await cartAPI.addToCart({
        menuId,
        quantity: 1,
      });
      queryClient.invalidateQueries(["cart"]);
      showCartToast("Item added to cart!");
    } catch (error) {
      // Error is handled by global error handler
      console.error("Error adding to cart:", error);
    }
  };

  const handleIncrement = async (menuId, event) => {
    event.stopPropagation(); // Prevent card click from firing
    try {
      await cartAPI.incrementItem(menuId);
      queryClient.invalidateQueries(["cart"]);
    } catch (error) {
      console.error("Error incrementing item:", error);
    }
  };

  const handleDecrement = async (menuId, event) => {
    event.stopPropagation(); // Prevent card click from firing
    try {
      await cartAPI.decrementItem(menuId);
      queryClient.invalidateQueries(["cart"]);
    } catch (error) {
      console.error("Error decrementing item:", error);
    }
  };

  const getCartQuantity = (menuId) => {
    if (!cartData?.data?.data?.cartItems) return 0;
    const cartItem = cartData.data.data.cartItems.find(
      (item) => item.menu?.id === menuId
    );
    return cartItem?.quantity || 0;
  };

  // Get average rating for a menu item
  const { data: averageRatings } = useQuery({
    queryKey: ["average-ratings", menuItems.map((item) => item.id)],
    queryFn: async () => {
      const ratings = {};
      for (const item of menuItems) {
        try {
          const response = await reviewAPI.getAverageRating(item.id);
          ratings[item.id] = response.data?.data || 0;
        } catch (error) {
          ratings[item.id] = 0;
        }
      }
      return ratings;
    },
    enabled: menuItems.length > 0,
  });

  if (categoriesLoading || menuLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        {/*<div className="text-center mb-12">*/}
        {/*  <h1 className="text-5xl font-bold text-foreground mb-4">*/}
        {/*    Our Menu*/}
        {/*  </h1>*/}
        {/*  <p className="text-xl text-muted-foreground max-w-2xl mx-auto">*/}
        {/*    Discover our carefully crafted dishes made with the finest ingredients*/}
        {/*  </p>*/}
        {/*</div>*/}

        {/* Search and Filters */}
        <div className="mb-12">
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                ref={searchInputRef}
                placeholder="Search for your favorite dishes..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-12 pr-4 py-6 text-lg border-2 border-border rounded-2xl focus:border-primary focus:ring-0 bg-card shadow-lg"
                autoFocus
              />
              {searchTerm !== debouncedSearchTerm && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                </div>
              )}
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              size="lg"
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === null
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                  : "bg-card hover:bg-accent border-2 border-border"
              }`}
            >
              All Items
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
                }
                onClick={() => setSelectedCategory(category.id)}
                size="lg"
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                    : "bg-card hover:bg-accent border-2 border-border"
                }`}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {menuItems.map((item) => {
            const cartQuantity = getCartQuantity(item.id);
            return (
              <div
                key={item.id}
                className="group bg-card rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer transform hover:-translate-y-2 border border-border"
                onClick={() => window.open(`/menu/${item.id}`, "_blank")}
              >
                {/* Image Container */}
                <div className="relative h-48 bg-muted/30 flex items-center justify-center p-4">
                  <div className="relative w-48 h-48 rounded-full bg-background flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-500 dark:shadow-lg dark:shadow-black/40 -mb-8">
                    <img
                      src={item.imageUrl || "/placeholder-food.jpg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Price Badge */}
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                    ${item.price?.toFixed(2)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 pt-12">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                      {item.name}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-muted-foreground">
                        {averageRatings?.[item.id]
                          ? averageRatings[item.id].toFixed(1)
                          : "New"}
                      </span>
                    </div>
                    {/*<span className="text-xs text-primary font-medium">*/}
                    {/*  View Details →*/}
                    {/*</span>*/}
                  </div>

                  {/* Add to Cart */}
                  <div className="flex items-center justify-center">
                    {isAuthenticated() ? (
                      <div className="w-full">
                        {cartQuantity > 0 ? (
                          <div className="flex items-center justify-center space-x-3 bg-muted rounded-2xl p-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => handleDecrement(item.id, e)}
                              className="w-10 h-10 rounded-full border-2 border-border hover:border-primary hover:bg-accent transition-all duration-200"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-lg font-bold text-foreground min-w-[2rem] text-center">
                              {cartQuantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => handleIncrement(item.id, e)}
                              className="w-10 h-10 rounded-full border-2 border-border hover:border-primary hover:bg-accent transition-all duration-200"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={(e) => handleAddToCart(item.id, e)}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          >
                            <ShoppingCart className="h-5 w-5 mr-2" />
                            Add to Cart
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          showError("Please login to add items to cart");
                        }}
                        className="w-full border-2 border-border text-foreground hover:bg-accent font-bold py-3 rounded-2xl transition-all duration-300"
                      >
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Add to Cart
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {menuItems.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-card rounded-3xl p-12 shadow-lg max-w-md mx-auto border border-border">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                No items found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
