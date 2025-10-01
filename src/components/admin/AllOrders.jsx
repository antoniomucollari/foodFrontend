import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { orderAPI } from "../../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Search, Filter, RefreshCw, Eye } from "lucide-react";
import OrderDetailModal from "./OrderDetailModal";

const AllOrders = () => {
  const [filters, setFilters] = useState({
    orderStatus: "",
    paymentStatus: "",
    searchId: "",
    page: 0,
    size: 20,
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: ordersData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["all-orders", filters],
    queryFn: () => orderAPI.getAllOrders(filters),
  });

  const orders = ordersData?.data?.data?.content || [];
  const totalPages = ordersData?.data?.data?.totalPages || 0;
  const currentPage = ordersData?.data?.data?.number || 0;

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

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "COMPLETED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "FAILED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "REFUNDED":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
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
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 0, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
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

  const handleUpdateOrderStatus = async (orderId, newStatus, statusType) => {
    try {
      const updateData = { id: orderId };
      if (statusType === "orderStatus") {
        updateData.orderStatus = newStatus;
      } else if (statusType === "paymentStatus") {
        updateData.paymentStatus = newStatus;
      }

      await orderAPI.updateOrderStatus(updateData);
      refetch();
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  return (
    <div className="space-y-6 p-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">All Orders</h1>
          <p className="text-sm text-muted-foreground">
            Order management and status updates
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
        {/* Search by ID */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Order ID..."
            value={filters.searchId}
            onChange={(e) => handleFilterChange("searchId", e.target.value)}
            className="pl-10 h-9"
          />
        </div>

        {/* Order Status Filter */}
        <select
          value={filters.orderStatus}
          onChange={(e) => handleFilterChange("orderStatus", e.target.value)}
          className="px-3 py-2 border border-border rounded bg-background text-foreground text-sm h-9"
        >
          <option value="">All Order Status</option>
          <option value="INITIALIZED">Initialized</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="ON_THE_WAY">On The Way</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="FAILED">Failed</option>
        </select>

        {/* Payment Status Filter */}
        <select
          value={filters.paymentStatus}
          onChange={(e) => handleFilterChange("paymentStatus", e.target.value)}
          className="px-3 py-2 border border-border rounded bg-background text-foreground text-sm h-9"
        >
          <option value="">All Payment Status</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="COMPLETED">Completed</option>
          <option value="REJECTED">Rejected</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>

        {/* Results per page */}
        <select
          value={filters.size}
          onChange={(e) => handleFilterChange("size", parseInt(e.target.value))}
          className="px-3 py-2 border border-border rounded bg-background text-foreground text-sm h-9"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      {/* Orders List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Orders</h2>
          <span className="text-sm text-muted-foreground">
            {orders.length} found
          </span>
        </div>
        <div>
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Loading orders...</span>
            </div>
          )}

          {!isLoading && orders.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No orders found</p>
            </div>
          )}

          {!isLoading && orders.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">
                      Order ID
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">
                      Order Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">
                      Payment Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium text-sm">#{order.id}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">
                          {order.user?.email}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(order.orderDate)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-sm">
                          ${order.totalAmount?.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={order.orderStatus || ""}
                          onChange={(e) =>
                            handleUpdateOrderStatus(
                              order.id,
                              e.target.value,
                              "orderStatus"
                            )
                          }
                          className="text-xs px-2 py-1 border border-border rounded bg-background text-foreground min-w-[120px]"
                        >
                          <option value="INITIALIZED">Initialized</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="ON_THE_WAY">On The Way</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                          <option value="FAILED">Failed</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={order.paymentStatus || ""}
                          onChange={(e) =>
                            handleUpdateOrderStatus(
                              order.id,
                              e.target.value,
                              "paymentStatus"
                            )
                          }
                          className="text-xs px-2 py-1 border border-border rounded bg-background text-foreground min-w-[120px]"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="REJECTED">Rejected</option>
                          <option value="FAILED">Failed</option>
                          <option value="REFUNDED">Refunded</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewOrderDetails(order)}
                          className="h-6 w-6 p-0"
                          title="View Details"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Page {currentPage + 1} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="h-8 px-3 text-xs"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="h-8 px-3 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
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

export default AllOrders;
