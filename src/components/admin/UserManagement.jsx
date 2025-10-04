import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { userAPI } from "../../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Users,
  Truck,
  Search,
  Mail,
  Phone,
  MapPin,
  UserCheck,
  UserX,
  Settings,
  Shield,
  ShieldOff,
  RefreshCw,
  AlertTriangle,
  Package,
} from "lucide-react";

const UserManagement = ({ role, title, description, icon: Icon }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: userData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [`admin-${role.toLowerCase()}`, searchTerm],
    queryFn: () => userAPI.getAllUsers(role, searchTerm),
  });

  const users = userData?.data?.data || [];

  // Change role mutation
  const changeRoleMutation = useMutation({
    mutationFn: ({ id, newRole }) => userAPI.changeRole(id, newRole),
    onSuccess: () => {
      queryClient.invalidateQueries([`admin-${role.toLowerCase()}`]);
      queryClient.invalidateQueries(["admin-customers"]);
      queryClient.invalidateQueries(["admin-delivery"]);
      setShowRoleModal(false);
      setSelectedUser(null);
    },
  });

  // Toggle account status mutation (activate/deactivate)
  const toggleAccountMutation = useMutation({
    mutationFn: (id) => userAPI.deactivateAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries([`admin-${role.toLowerCase()}`]);
      queryClient.invalidateQueries(["admin-customers"]);
      queryClient.invalidateQueries(["admin-delivery"]);
    },
  });

  const getRoleBadgeColor = (roles) => {
    if (roles?.some((roleItem) => roleItem.name === "ADMIN")) {
      return "bg-red-100 text-red-800";
    }
    if (roles?.some((roleItem) => roleItem.name === "DELIVERY")) {
      return "bg-blue-100 text-blue-800";
    }
    if (roles?.some((roleItem) => roleItem.name === "CUSTOMER")) {
      return "bg-green-100 text-green-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  const getStatusBadgeColor = (active) => {
    return active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleChangeRole = (userId, currentRole) => {
    setSelectedUser({ id: userId, currentRole });
    setShowRoleModal(true);
  };

  const handleRoleChange = (newRole) => {
    if (selectedUser) {
      changeRoleMutation.mutate({
        id: selectedUser.id,
        newRole,
      });
    }
  };

  const handleToggleAccount = (userId, isActive) => {
    const action = isActive ? "deactivate" : "activate";
    setSelectedUser({ id: userId, active: isActive });
    setConfirmAction({ type: "toggleAccount", action });
    setShowConfirmModal(true);
  };

  const handleConfirmAction = () => {
    if (confirmAction && selectedUser) {
      if (confirmAction.type === "toggleAccount") {
        toggleAccountMutation.mutate(selectedUser.id);
      }
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
    setSelectedUser(null);
  };

  const handleViewCustomerOrders = (customerId) => {
    navigate(`/admin/all-orders?customerId=${customerId}&size=20`);
  };

  // Available roles (excluding ADMIN)
  const availableRoles = [
    {
      value: "CUSTOMER",
      label: "Customer",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "DELIVERY",
      label: "Delivery",
      color: "bg-blue-100 text-blue-800",
    },
  ];

  return (
    <div className="space-y-6 p-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {users.length} {role.toLowerCase()} personnel
          </span>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icon className="h-5 w-5 mr-2" />
            All {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${role.toLowerCase()} by name or email...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading {role.toLowerCase()}...</span>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md">
              Error loading {role.toLowerCase()}: {error.message}
            </div>
          )}

          {!isLoading && !error && users.length === 0 && (
            <div className="text-center py-8">
              <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm
                  ? `No ${role.toLowerCase()} found matching your search`
                  : `No ${role.toLowerCase()} found`}
              </p>
            </div>
          )}

          {!isLoading && !error && users.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      User
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      Contact
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      Role
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      Joined
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-border hover:bg-muted/50"
                    >
                      {/* User Info */}
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              role === "DELIVERY"
                                ? "bg-blue-100"
                                : "bg-primary/10"
                            }`}
                          >
                            <Icon
                              className={`h-5 w-5 ${
                                role === "DELIVERY"
                                  ? "text-blue-600"
                                  : "text-primary"
                              }`}
                            />
                          </div>
                          <div>
                            <div className="font-medium">
                              {user.name || "No Name"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground truncate max-w-[200px]">
                              {user.email}
                            </span>
                          </div>
                          {user.phoneNumber && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {user.phoneNumber}
                              </span>
                            </div>
                          )}
                          {user.address && (
                            <div className="flex items-start space-x-2 text-sm">
                              <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground line-clamp-1 max-w-[200px]">
                                {user.address}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-4">
                        <Badge
                          className={`${getRoleBadgeColor(
                            user.roles
                          )} cursor-default`}
                        >
                          {user.roles
                            ?.map((roleItem) => roleItem.name)
                            .join(", ") || "Unknown"}
                        </Badge>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          {user.active ? (
                            <UserCheck className="h-4 w-4 text-green-600" />
                          ) : (
                            <UserX className="h-4 w-4 text-red-600" />
                          )}
                          <Badge
                            className={`${getStatusBadgeColor(
                              user.active
                            )} cursor-default`}
                          >
                            {user.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </td>

                      {/* Join Date */}
                      <td className="p-4">
                        <div className="text-sm text-muted-foreground">
                          {user.createdAt ? formatDate(user.createdAt) : "N/A"}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          {/* View Orders Button - Only for customers */}
                          {role === "CUSTOMER" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewCustomerOrders(user.id)}
                              title={`View all orders for ${
                                user.name || "this customer"
                              }`}
                            >
                              <Package className="h-4 w-4" />
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleChangeRole(user.id, user.roles?.[0]?.name)
                            }
                            disabled={changeRoleMutation.isPending}
                            title="Change Role"
                          >
                            <RefreshCw
                              className={`h-4 w-4 ${
                                changeRoleMutation.isPending
                                  ? "animate-spin"
                                  : ""
                              }`}
                            />
                          </Button>

                          <Button
                            variant={user.active ? "destructive" : "default"}
                            size="sm"
                            onClick={() =>
                              handleToggleAccount(user.id, user.active)
                            }
                            disabled={toggleAccountMutation.isPending}
                            title={
                              user.active
                                ? "Deactivate Account"
                                : "Activate Account"
                            }
                          >
                            {user.active ? (
                              <ShieldOff className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Change Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Change User Role
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Select a new role for this user:
              </p>

              <div className="space-y-2">
                {availableRoles.map((roleOption) => (
                  <Button
                    key={roleOption.value}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleRoleChange(roleOption.value)}
                    disabled={changeRoleMutation.isPending}
                  >
                    <Badge className={`mr-2 ${roleOption.color}`}>
                      {roleOption.label}
                    </Badge>
                    {roleOption.label}
                  </Button>
                ))}
              </div>

              <div className="flex space-x-2 mt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowRoleModal(false);
                    setSelectedUser(null);
                  }}
                  disabled={changeRoleMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle className="flex items-center text-destructive">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Confirm Action
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Are you sure you want to{" "}
                <span className="font-semibold text-foreground">
                  {confirmAction?.action}
                </span>{" "}
                this account?
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                This action cannot be undone.
              </p>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowConfirmModal(false);
                    setConfirmAction(null);
                    setSelectedUser(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleConfirmAction}
                  disabled={toggleAccountMutation.isPending}
                >
                  {toggleAccountMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Confirm
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
