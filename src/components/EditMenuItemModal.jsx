import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { menuAPI, categoryAPI } from "../services/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { X } from "lucide-react";

const EditMenuItemModal = ({ isOpen, onClose, menuItem }) => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    price: "",
    categoryId: "",
    imageFile: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  // Fetch categories for dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryAPI.getAllCategories(),
  });

  useEffect(() => {
    if (menuItem) {
      setFormData({
        id: menuItem.id,
        name: menuItem.name || "",
        description: menuItem.description || "",
        price: menuItem.price?.toString() || "",
        categoryId: menuItem.categoryId?.toString() || "",
        imageFile: null, // Don't pre-populate image file
      });
    }
  }, [menuItem]);

  const updateMenuItemMutation = useMutation({
    mutationFn: (menuData) => {
      const formDataToSend = new FormData();
      formDataToSend.append("id", menuData.id);
      formDataToSend.append("name", menuData.name);
      formDataToSend.append("description", menuData.description);
      formDataToSend.append("price", menuData.price);
      formDataToSend.append("categoryId", menuData.categoryId);
      if (menuData.imageFile) {
        formDataToSend.append("imageFile", menuData.imageFile);
      }
      return menuAPI.updateMenu(formDataToSend);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-menu"]);
      queryClient.invalidateQueries(["menu"]);
      onClose();
      setFormData({
        id: "",
        name: "",
        description: "",
        price: "",
        categoryId: "",
        imageFile: null,
      });
      setError("");
    },
    onError: (err) => {
      setError(err.response?.data?.message || "Failed to update menu item");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price || !formData.categoryId) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError("");
    updateMenuItemMutation.mutate(formData);
    setIsLoading(false);
  };

  const handleChange = (e) => {
    if (e.target.name === "imageFile") {
      setFormData({
        ...formData,
        imageFile: e.target.files[0],
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const categories = categoriesData?.data?.data || [];

  if (!isOpen || !menuItem) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Edit Menu Item</CardTitle>
              <CardDescription>Update menu item information</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter item name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter item description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Category *</Label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageFile">New Image (optional)</Label>
              <Input
                id="imageFile"
                name="imageFile"
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {menuItem.imageUrl && (
                <div className="text-sm text-gray-600">
                  Current image:{" "}
                  <img
                    src={menuItem.imageUrl}
                    alt="Current"
                    className="w-16 h-16 object-cover rounded mt-1"
                  />
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || updateMenuItemMutation.isPending}
                className="flex-1"
              >
                {isLoading || updateMenuItemMutation.isPending
                  ? "Updating..."
                  : "Update Item"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditMenuItemModal;
