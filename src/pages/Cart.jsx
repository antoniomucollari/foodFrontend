import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { cartAPI, orderAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard,
  ArrowLeft,
  CheckCircle,
  Truck,
  Wallet
} from 'lucide-react';
import { useState } from 'react';

const Cart = () => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('delivery'); // 'delivery' or 'card'
  const queryClient = useQueryClient();
  const { showSuccess, showError, showConfirm } = useToast();

  // Fetch cart data
  const { data: cartData, isLoading, error } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartAPI.getShoppingCart(),
  });

  // Mutations
  const incrementMutation = useMutation({
    mutationFn: (menuId) => cartAPI.incrementItem(menuId),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
    },
  });

  const decrementMutation = useMutation({
    mutationFn: (menuId) => cartAPI.decrementItem(menuId),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (cartItemId) => cartAPI.removeItem(cartItemId),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: () => cartAPI.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: () => orderAPI.checkout(),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
      queryClient.invalidateQueries(['orders']);
      setIsCheckingOut(false);
      showSuccess('Order placed successfully!');
    },
    onError: (error) => {
      // Error is handled by global error handler
      console.error('Checkout error:', error);
      setIsCheckingOut(false);
    },
  });

  const handleIncrement = (menuId) => {
    incrementMutation.mutate(menuId);
  };

  const handleDecrement = (menuId) => {
    decrementMutation.mutate(menuId);
  };

  const handleRemoveItem = async (cartItemId) => {
    const confirmed = await showConfirm(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      {
        confirmText: 'Remove',
        cancelText: 'Cancel',
        type: 'warning'
      }
    );
    
    if (confirmed) {
      removeItemMutation.mutate(cartItemId);
    }
  };

  const handleClearCart = async () => {
    const confirmed = await showConfirm(
      'Clear Cart',
      'Are you sure you want to clear your cart? This will remove all items.',
      {
        confirmText: 'Clear Cart',
        cancelText: 'Cancel',
        type: 'warning'
      }
    );
    
    if (confirmed) {
      clearCartMutation.mutate();
    }
  };

  const handleCheckout = () => {
    if (paymentMethod === 'delivery') {
      // Continue with normal checkout for pay on delivery
      setIsCheckingOut(true);
      checkoutMutation.mutate();
    } else if (paymentMethod === 'card') {
      // Disable checkout for card payment (to be implemented by user)
      showError('Card payment integration will be implemented separately. Please select "Pay on Delivery" for now.');
      return;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg">Error loading cart</p>
      </div>
    );
  }

  const cart = cartData?.data?.data;
  const cartItems = cart?.cartItems || [];
  const totalAmount = cart?.totalAmount || 0;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center space-x-4">
          <Button variant="outline" asChild>
            <Link to="/menu">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Menu
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        </div>

        <Card className="text-center py-12">
          <CardContent>
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Button asChild>
              <Link to="/menu">Browse Menu</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" asChild>
            <Link to="/menu">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Menu
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        </div>
        <Button
          variant="outline"
          onClick={handleClearCart}
          disabled={clearCartMutation.isPending}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.menu?.imageUrl || '/placeholder-food.jpg'}
                    alt={item.menu?.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{item.menu?.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {item.menu?.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDecrement(item.menu?.id)}
                          disabled={decrementMutation.isPending}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleIncrement(item.menu?.id)}
                          disabled={incrementMutation.isPending}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">
                          ${item.subTotal?.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          ${item.pricePerUnit?.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={removeItemMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Items ({cartItems.length})</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>$0.00</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900">Payment Method</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="delivery"
                      checked={paymentMethod === 'delivery'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <Truck className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">Pay on Delivery</div>
                      <div className="text-xs text-gray-500">Pay when your order arrives</div>
                    </div>
                    <CheckCircle className={`h-5 w-5 ${paymentMethod === 'delivery' ? 'text-green-500' : 'text-gray-300'}`} />
                  </label>

                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <Wallet className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">Pay with Card</div>
                      <div className="text-xs text-gray-500">Credit/Debit card payment</div>
                    </div>
                    <CheckCircle className={`h-5 w-5 ${paymentMethod === 'card' ? 'text-green-500' : 'text-gray-300'}`} />
                  </label>
                </div>
              </div>
              
              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={isCheckingOut || checkoutMutation.isPending}
              >
                {isCheckingOut || checkoutMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {paymentMethod === 'delivery' ? (
                      <>
                        <Truck className="h-4 w-4 mr-2" />
                        Checkout - Pay on Delivery
                      </>
                    ) : (
                      <>
                        <Wallet className="h-4 w-4 mr-2" />
                        Checkout - Pay with Card
                      </>
                    )}
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                {paymentMethod === 'delivery' 
                  ? 'You will be redirected to complete your order' 
                  : 'Card payment integration coming soon - please select "Pay on Delivery" for now'
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
