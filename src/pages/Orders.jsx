import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck,
  ArrowLeft,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Orders = () => {
  const { data: ordersData, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderAPI.getMyOrders(),
  });

  const getOrderStatusIcon = (status) => {
    switch (status) {
      case 'INITIALIZED':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'ON_THE_WAY':
        return <Truck className="h-4 w-4 text-purple-500" />;
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'INITIALIZED':
        return 'bg-gray-100 text-gray-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'ON_THE_WAY':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canReview = (order) => {
    return order.orderStatus === 'DELIVERED';
  };

  const handleReviewClick = (menuItem, orderId) => {
    // Open menu item detail page in new tab for review
    window.open(`/menu/${menuItem.id}`, '_blank');
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
        <p className="text-red-500 text-lg">Error loading orders</p>
      </div>
    );
  }

  const orders = ordersData?.data?.data || [];

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center space-x-4">
          <Button variant="outline" asChild>
            <Link to="/menu">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Menu
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        </div>

        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet. Start by browsing our menu!
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
      <div className="flex items-center space-x-4">
        <Button variant="outline" asChild>
          <Link to="/menu">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Menu
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    Order #{order.id}
                  </CardTitle>
                  <CardDescription>
                    Placed on {formatDate(order.orderDate)}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-2">
                    {getOrderStatusIcon(order.orderStatus)}
                    <div className="space-y-1">
                      <Badge className={getOrderStatusColor(order.orderStatus)}>
                        Order: {order.orderStatus?.replace('_', ' ')}
                      </Badge>
                      <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                        Payment: {order.paymentStatus?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-lg font-semibold">
                    ${order.totalAmount?.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Order Items:</h4>
                <div className="space-y-2">
                  {order.orderItems?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.menu?.imageUrl || '/placeholder-food.jpg'}
                          alt={item.menu?.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium">{item.menu?.name}</p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold">
                          ${item.subTotal?.toFixed(2)}
                        </p>
                        {canReview(order) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReviewClick(item.menu, order.id)}
                            className="flex items-center space-x-1"
                          >
                            <Star className="h-4 w-4" />
                            <span>Review</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Payment Status: 
                    <Badge 
                      variant="outline" 
                      className={`ml-2 ${
                        order.paymentStatus === 'PAID' 
                          ? 'text-green-600 border-green-600' 
                          : 'text-yellow-600 border-yellow-600'
                      }`}
                    >
                      {order.paymentStatus}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-xl font-bold">
                      ${order.totalAmount?.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Orders;
