import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { orderAPI } from "../../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  DollarSign,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  Filter,
  Search,
  MoreVertical,
  Eye,
} from "lucide-react";
import OrderStatusChart from "./OrderStatusChart";
import OrderDetailModal from "./OrderDetailModal";

const DashboardHome = () => {
  const navigate = useNavigate();
  const [orderFilters, setOrderFilters] = useState({
    orderStatus: "",
    paymentStatus: "",
    searchId: "",
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch dashboard statistics
  const { data: totalRevenueResponse } = useQuery({
    queryKey: ["dashboard-total-revenue"],
    queryFn: () => orderAPI.getTotalRevenue(),
  });

  const { data: totalOrdersData } = useQuery({
    queryKey: ["dashboard-total-orders"],
    queryFn: () => orderAPI.getTotalOrders(),
  });

  const { data: uniqueCustomersData } = useQuery({
    queryKey: ["dashboard-unique-customers"],
    queryFn: () => orderAPI.countUniqueCustomers(),
  });

  const { data: ordersData } = useQuery({
    queryKey: ["dashboard-orders", orderFilters],
    queryFn: () =>
      orderAPI.getAllOrders({
        ...orderFilters,
        page: 0,
        size: 10,
      }),
  });

  const { data: mostPopularData } = useQuery({
    queryKey: ["dashboard-most-popular"],
    queryFn: () => orderAPI.getMostPopularItems(3),
  });

  const totalRevenueData = totalRevenueResponse?.data?.data || {};
  const totalRevenue = totalRevenueData?.totalRevenue || 0;
  const currentMonthDifference = totalRevenueData?.currentMonth || 0;
  const previousMonthRevenue = totalRevenueData?.previousMonth || 0;
  const percentageChange = totalRevenueData?.percentageChange || 0;
  const totalOrders = totalOrdersData?.data?.data || 0;
  const uniqueCustomers = uniqueCustomersData?.data?.data || 0;
  const orders = ordersData?.data?.data?.content || [];
  const mostPopularItems = mostPopularData?.data?.data || [];

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (percentage) => {
    const sign = percentage >= 0 ? "+" : "";
    return `${sign}${percentage.toFixed(1)}%`;
  };

  const getPercentageColor = (percentage) => {
    return percentage >= 0 ? "text-green-500" : "text-red-500";
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

  const handleFilterChange = (key, value) => {
    setOrderFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-6 p-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
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
        {/* Total Revenue */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalRevenue)}
                </p>
                <div className="flex items-center mt-2">
                  {percentageChange >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span
                    className={`text-sm ${getPercentageColor(
                      percentageChange
                    )}`}
                  >
                    {formatPercentage(percentageChange)} from last month
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Orders
                </p>
                <p className="text-2xl font-bold">
                  {totalOrders.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-500">-12.40%</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Customers */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Customers
                </p>
                <p className="text-2xl font-bold">
                  {uniqueCustomers.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+2.40%</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Report */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order Report</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/admin/all-orders")}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
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
                    {orders.map((order) => (
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
                            className={
                              order.orderStatus === "DELIVERED"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : order.orderStatus === "CANCELLED"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                : order.orderStatus === "CONFIRMED"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : order.orderStatus === "ON_THE_WAY"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            }
                          >
                            {order.orderStatus?.replace("_", " ") || "Unknown"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-muted-foreground">
                            {order.orderDate
                              ? new Date(order.orderDate).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
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
                {orders.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No recent orders found
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Most Ordered */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Most Ordered</CardTitle>
                <div className="flex items-center space-x-2">
                  <select className="px-3 py-1 border border-border rounded-lg bg-background text-foreground text-sm shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer">
                    <option>Today</option>
                    <option>This Month</option>
                    <option>This Year</option>
                    <option>All time</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mostPopularItems.length > 0 ? (
                  mostPopularItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {item.menuItemName ||
                            item.name ||
                            `Item ${index + 1}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.totalQuantity || item.quantity || 0} dishes
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">
                      No popular items data available
                    </p>
                  </div>
                )}
                <Button variant="outline" size="sm" className="w-full">
                  View All
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Order Status Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order Status</CardTitle>
                <select className="px-3 py-1 border border-border rounded-lg bg-background text-foreground text-sm shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer">
                  <option>Today</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <OrderStatusChart />
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

export default DashboardHome;
