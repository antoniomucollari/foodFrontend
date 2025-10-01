import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { orderAPI } from "../../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  RotateCcw,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
} from "lucide-react";
import { useWebSocket } from "../../services/websocket";
import OrderDetailModal from "./OrderDetailModal";

const LiveOrders = () => {
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [searchId, setSearchId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: ordersData,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["live-orders", orderStatus, paymentStatus, searchId],
    queryFn: () =>
      orderAPI.getNewOrders({
        orderStatus: orderStatus || undefined,
        paymentStatus: paymentStatus || undefined,
        searchId: searchId || undefined,
        page: 0,
        size: 20,
      }),
    refetchInterval: 5000, // Refetch every 5 seconds as backup
  });

  // WebSocket connection for real-time updates
  const { socket, isConnected } = useWebSocket();

  useEffect(() => {
    if (socket && isConnected) {
      // Listen for new orders
      socket.on("newOrder", (order) => {
        console.log("New order received:", order);
        refetch();
      });

      // Listen for order updates
      socket.on("orderUpdated", (order) => {
        console.log("Order updated:", order);
        refetch();
      });

      return () => {
        socket.off("newOrder");
        socket.off("orderUpdated");
      };
    }
  }, [socket, isConnected, refetch]);

  const orders = ordersData?.data?.data?.content || [];

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
        <div className="flex items-center space-x-3">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <h1 className="text-2xl font-semibold text-foreground">
            Live Orders
          </h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg">
        <select
          value={orderStatus}
          onChange={(e) => setOrderStatus(e.target.value)}
          className="px-3 py-2 border border-border rounded bg-background text-foreground text-sm h-9"
        >
          <option value="">All Active Orders</option>
          <option value="INITIALIZED">Initialized</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="ON_THE_WAY">On The Way</option>
        </select>

        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="px-3 py-2 border border-border rounded bg-background text-foreground text-sm h-9"
        >
          <option value="">Incomplete Payments</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="REJECTED">Rejected</option>
          <option value="FAILED">Failed</option>
        </select>

        <input
          type="text"
          placeholder="Order ID..."
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="px-3 py-2 border border-border rounded bg-background text-foreground text-sm h-9 flex-1 max-w-xs"
        />
      </div>

      {/* Orders List */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading...</span>
        </div>
      )}

      {!isLoading && orders.length === 0 && (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No active orders requiring attention
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Orders with incomplete payments or pending status
          </p>
        </div>
      )}

      {!isLoading && orders.length > 0 && (
        <div className="space-y-2">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-border rounded-lg p-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="font-medium text-sm">#{order.id}</h3>
                    <p className="text-xs text-muted-foreground">
                      {order.user?.email}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(order.orderDate)}
                  </div>
                  <div className="font-medium text-sm">
                    ${order.totalAmount?.toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
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
                  </select>

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
                  </select>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewOrderDetails(order)}
                    className="h-6 w-6 p-0"
                    title="View Details"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default LiveOrders;
