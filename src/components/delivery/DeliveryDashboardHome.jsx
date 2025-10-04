import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { orderAPI } from "../../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  DollarSign,
  Package,
  Truck,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Eye,
  ExternalLink,
} from "lucide-react";
import OrderDetailModal from "../admin/OrderDetailModal";

const DeliveryDashboardHome = () => {
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch delivery statistics
  const { data: deliveryStatsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ["delivery-stats", user?.id],
    queryFn: () => orderAPI.getDeliveryStats(user?.id),
    enabled: !!user?.id,
  });

  // Fetch recent orders assigned to this delivery person
  const { data: recentOrdersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["delivery-recent-orders", user?.id],
    queryFn: () => orderAPI.getDeliveryOrders(user?.id, { page: 0, size: 5 }),
    enabled: !!user?.id,
  });

  const deliveryStats = deliveryStatsData?.data?.data || {};
  const recentOrders = recentOrdersData?.data?.data?.content || [];

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case "INITIALIZED":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "ON_THE_WAY":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "DELIVERED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "FAILED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleViewInAdmin = () => {
    // Navigate to admin orders with this delivery person pre-selected
    const adminUrl = `/admin-panel/all-orders?deliveryId=${user?.id}`;
    window.open(adminUrl, '_blank');
  };

  return (
    <div className="space-y-6 p-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Delivery Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || user?.email}
          </p>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Deliveries */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Deliveries
                </p>
                <p className="text-2xl font-bold">
                  {deliveryStats.totalDeliveries || 0}
                </p>
                <div className="flex items-center mt-2">
                  <Truck className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm text-blue-500">This Month</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Truck className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Orders */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Orders
                </p>
                <p className="text-2xl font-bold">
                  {deliveryStats.activeOrders || 0}
                </p>
                <div className="flex items-center mt-2">
                  <Package className="h-4 w-4 text-orange-500 mr-1" />
                  <span className="text-sm text-orange-500">In Progress</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Earnings */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Earnings
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(deliveryStats.totalEarnings || 0)}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">This Month</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <a href="/delivery-panel/all-orders">View All</a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                {isLoadingOrders && (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading orders...</span>
                  </div>
                )}

                {!isLoadingOrders && recentOrders.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No recent orders</p>
                  </div>
                )}

                {!isLoadingOrders && recentOrders.length > 0 && (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          Order ID
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          Customer
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                #{order.id}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">
                                {order.user?.name || order.user?.email || "N/A"}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold">
                              ${order.totalAmount?.toFixed(2) || "0.00"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              className={getOrderStatusColor(order.orderStatus)}
                            >
                              {order.orderStatus?.replace("_", " ") ||
                                "Unknown"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-muted-foreground">
                              {order.orderDate
                                ? formatDate(order.orderDate)
                                : "N/A"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewOrderDetails(order)}
                              className="h-8 w-8 p-0"
                              title="View Order Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" asChild>
                <a href="/delivery-panel/live-orders">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  View Live Orders
                </a>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href="/delivery-panel/all-orders">
                  <Package className="h-4 w-4 mr-2" />
                  My Orders
                </a>
              </Button>
              <Button variant="outline" className="w-full" onClick={handleViewInAdmin}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View in Admin Panel
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Completion Rate
                  </span>
                  <span className="font-semibold">
                    {deliveryStats.completionRate || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Avg. Delivery Time
                  </span>
                  <span className="font-semibold">
                    {deliveryStats.avgDeliveryTime || 0} min
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rating</span>
                  <span className="font-semibold">
                    {deliveryStats.rating || 0}/5
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default DeliveryDashboardHome;
