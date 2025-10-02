import React from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Eye } from "lucide-react";

const OrdersTable = ({ 
  orders, 
  onUpdateOrderStatus, 
  onViewOrderDetails, 
  showStatusControls = true 
}) => {
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

  return (
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
                  {order.user?.name || order.user?.email || 'N/A'}
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
                {showStatusControls ? (
                  <select
                    value={order.orderStatus || ""}
                    onChange={(e) =>
                      onUpdateOrderStatus(
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
                ) : (
                  <Badge className={getOrderStatusColor(order.orderStatus)}>
                    {order.orderStatus}
                  </Badge>
                )}
              </td>
              <td className="py-3 px-4">
                {showStatusControls ? (
                  <select
                    value={order.paymentStatus || ""}
                    onChange={(e) =>
                      onUpdateOrderStatus(
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
                ) : (
                  <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                    {order.paymentStatus}
                  </Badge>
                )}
              </td>
              <td className="py-3 px-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewOrderDetails(order)}
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
  );
};

export default OrdersTable;
