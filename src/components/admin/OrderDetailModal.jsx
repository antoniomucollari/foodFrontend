import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { User, Calendar, DollarSign, Package, MapPin } from "lucide-react";

const OrderDetailModal = ({ order, isOpen, onClose }) => {
  if (!order) return null;

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
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const calculateItemTotal = (item) => {
    const price =
      item.menu?.price || item.menuItem?.price || item.pricePerUnit || 0;
    return item.quantity * price;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details - #{order.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={getOrderStatusColor(order.orderStatus)}>
                  {order.orderStatus?.replace("_", " ") || "Unknown"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Payment Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                  {order.paymentStatus?.replace("_", " ") || "Unknown"}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center">
                <User className="h-4 w-4 mr-2" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">
                    {order.user?.name ||
                      (order.user?.firstName && order.user?.lastName
                        ? `${order.user.firstName} ${order.user.lastName}`
                        : order.user?.firstName ||
                          order.user?.lastName ||
                          "N/A")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{order.user?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-medium">{order.user?.id || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-medium">{formatDate(order.orderDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-medium text-lg">
                    ${order.totalAmount?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.orderItems?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    {/* Menu Item Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={
                          item.menu?.imageUrl ||
                          item.menuItem?.imageUrl ||
                          "/placeholder-food.jpg"
                        }
                        alt={
                          item.menu?.name ||
                          item.menuItem?.name ||
                          `Item ${index + 1}`
                        }
                        className="w-20 h-20 object-cover rounded-lg border border-border"
                        onError={(e) => {
                          e.target.src = "/placeholder-food.jpg";
                        }}
                      />
                    </div>

                    {/* Menu Item Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-lg mb-1">
                        {item.menu?.name ||
                          item.menuItem?.name ||
                          `Item ${index + 1}`}
                      </h4>
                      {item.menu?.description || item.menuItem?.description ? (
                        <p
                          className="text-sm text-muted-foreground mb-2 overflow-hidden"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {item.menu?.description || item.menuItem?.description}
                        </p>
                      ) : null}

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <span className="font-medium">Qty:</span>
                          <span className="ml-1 font-semibold text-foreground">
                            {item.quantity}
                          </span>
                        </span>
                        <span className="flex items-center">
                          <span className="font-medium">Price:</span>
                          <span className="ml-1 font-semibold text-foreground">
                            $
                            {(
                              item.menu?.price ||
                              item.menuItem?.price ||
                              item.pricePerUnit ||
                              0
                            ).toFixed(2)}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Total Price */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-lg font-bold text-primary">
                        ${calculateItemTotal(item).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                  </div>
                ))}

                {/* Order Summary */}
                {order.orderItems && order.orderItems.length > 0 && (
                  <div className="border-t border-border pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">
                        Order Total:
                      </span>
                      <span className="text-xl font-bold text-primary">
                        ${order.totalAmount?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground mt-1">
                      <span>
                        {order.orderItems.length} item
                        {order.orderItems.length !== 1 ? "s" : ""}
                      </span>
                      <span>
                        {order.orderItems.reduce(
                          (total, item) => total + item.quantity,
                          0
                        )}{" "}
                        total quantity
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          {order.deliveryAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">
                    {order.deliveryAddress.street || "N/A"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.deliveryAddress.city}, {order.deliveryAddress.state}{" "}
                    {order.deliveryAddress.zipCode}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.deliveryAddress.country}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Order Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailModal;
