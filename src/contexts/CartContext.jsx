import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cartAPI } from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItemCount, setCartItemCount] = useState(0);

  // Fetch cart data to get item count
  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartAPI.getShoppingCart(),
    enabled: !!localStorage.getItem('token'), // Only fetch if user is authenticated
  });

  // Update cart item count when cart data changes
  useEffect(() => {
    if (cartData?.data?.data?.cartItems) {
      const totalItems = cartData.data.data.cartItems.reduce((total, item) => total + item.quantity, 0);
      setCartItemCount(totalItems);
    } else {
      setCartItemCount(0);
    }
  }, [cartData]);

  // Reset cart count when user logs out
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setCartItemCount(0);
    }
  }, []);

  const value = {
    cartItemCount,
    setCartItemCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
