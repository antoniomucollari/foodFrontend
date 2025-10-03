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
import { cartAPI } from "../services/api";

const Menu = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [cartItems, setCartItems] = useState({});
  const searchInputRef = useRef(null);
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();

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
  const { data: cartData, refetch: refetchCart } = useQuery({
    queryKey: ["cart"],
    queryFn: () => cartAPI.getShoppingCart(),
    enabled: isAuthenticated(),
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
      refetchCart();
      showSuccess("Item added to cart successfully!");
    } catch (error) {
      // Error is handled by global error handler
      console.error("Error adding to cart:", error);
    }
  };

  const handleIncrement = async (menuId, event) => {
    event.stopPropagation(); // Prevent card click from firing
    try {
      await cartAPI.incrementItem(menuId);
      refetchCart();
    } catch (error) {
      console.error("Error incrementing item:", error);
    }
  };

  const handleDecrement = async (menuId, event) => {
    event.stopPropagation(); // Prevent card click from firing
    try {
      await cartAPI.decrementItem(menuId);
      refetchCart();
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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">Our Menu</h1>
        <p className="text-lg text-muted-foreground">
          Discover delicious food from our carefully curated menu
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              ref={searchInputRef}
              placeholder="Search for dishes..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
              autoFocus
            />
            {searchTerm !== debouncedSearchTerm && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            size="sm"
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              size="sm"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => {
          const cartQuantity = getCartQuantity(item.id);
          return (
            <Card
              key={item.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => window.open(`/menu/${item.id}`, "_blank")}
            >
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={item.imageUrl || "/placeholder-food.jpg"}
                  alt={item.name}
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{item.name}</CardTitle>
                  <Badge variant="secondary">${item.price?.toFixed(2)}</Badge>
                </div>
                <CardDescription className="text-sm">
                  {item.description}
                </CardDescription>
                <div className="mt-2">
                  <span className="text-xs text-blue-600 font-medium">
                    Click to view details & reviews →
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">
                      {averageRatings?.[item.id]
                        ? averageRatings[item.id].toFixed(1)
                        : "No rating"}
                    </span>
                  </div>

                  {isAuthenticated() ? (
                    <div className="flex items-center space-x-2">
                      {cartQuantity > 0 ? (
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleDecrement(item.id, e)}
                            className="transition-all duration-200 hover:scale-110 active:scale-95"
                          >
                            <Minus className="h-4 w-4 transition-transform duration-200" />
                          </Button>
                          <span className="text-sm font-medium">
                            {cartQuantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleIncrement(item.id, e)}
                            className="transition-all duration-200 hover:scale-110 active:scale-95"
                          >
                            <Plus className="h-4 w-4 transition-transform duration-200" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={(e) => handleAddToCart(item.id, e)}
                          className="transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2 transition-transform duration-200" />
                          Add to Cart
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        showError("Please login to add items to cart");
                      }}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {menuItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No menu items found</p>
        </div>
      )}
    </div>
  );
};

export default Menu;
