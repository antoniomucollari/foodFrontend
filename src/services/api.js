import axios from "axios";
import { handleApiError } from "./errorHandler";

const API_BASE_URL = "http://localhost:8080/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(
      "Making API request:",
      config.method?.toUpperCase(),
      config.url,
      config.params
    );
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration and global error handling
api.interceptors.response.use(
  (response) => {
    console.log(
      "API response:",
      response.config.url,
      response.status,
      response.data
    );
    return response;
  },
  (error) => {
    console.error(
      "API error:",
      error.config?.url,
      error.response?.status,
      error.response?.data
    );

    // Handle 401 errors (token expiration)
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Handle all other errors with global error handler
    handleApiError(error);

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
};

// User API
export const userAPI = {
  getAllUsers: (role = "CUSTOMER", searchString = "") => {
    const params = new URLSearchParams({ role });
    if (searchString) {
      params.append("searchString", searchString);
    }
    return api.get(`/users/all?${params.toString()}`);
  },
  changeRole: (id, changeTo) =>
    api.get(`/users/change-role?id=${id}&changeTo=${changeTo}`),
  deactivateAccount: (id) => api.delete(`/users/deactivate?id=${id}`),
  updateOwnAccount: (userData) => {
    const formData = new FormData();
    Object.keys(userData).forEach((key) => {
      if (userData[key] !== null && userData[key] !== undefined) {
        formData.append(key, userData[key]);
      }
    });
    return api.put("/users/update", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deactivateOwnAccount: () => api.delete("/users/deactivate-any"),
  getOwnAccountDetails: () => api.get("/users/account"),
};

// Category API
export const categoryAPI = {
  getAllCategories: () => api.get("/categories"),
  getCategoryById: (id) => api.get(`/categories/${id}`),
  addCategory: (categoryData) => api.post("/categories", categoryData),
  updateCategory: (categoryData) => api.put("/categories", categoryData),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

// Menu API
export const menuAPI = {
  getMenus: (params = {}) => api.get("/menu", { params }),
  getMenuById: (id) => api.get(`/menu/${id}`),
  createMenu: (formData) => {
    return api.post("/menu", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  updateMenu: (formData) => {
    return api.put("/menu", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deleteMenu: (id) => api.delete(`/menu/${id}`),
};

// Cart API
export const cartAPI = {
  getShoppingCart: () => api.get("/cart/items"),
  addToCart: (cartData) => api.post("/cart/add/items", cartData),
  incrementItem: (menuId) => api.post(`/cart/items/increment/${menuId}`),
  decrementItem: (menuId) => api.post(`/cart/items/decrement/${menuId}`),
  removeItem: (cartItemId) => api.delete(`/cart/items/remove/${cartItemId}`),
  clearCart: () => api.delete("/cart"),
};

// Order API
export const orderAPI = {
  checkout: () => api.post("/orders/checkout"),
  getMyOrders: (params = {}) => api.get("/orders/me", { params }),
  getOrderById: (id) => api.get(`/orders/get-by-id/${id}`),
  getOrderItemById: (orderItemId) =>
    api.get(`/orders/order-item/${orderItemId}`),
  getAllOrders: (params = {}) => {
    // Map searchId to orderId parameter for the API and clean up empty values
    const apiParams = {};

    // Only include non-empty values
    if (params.orderStatus && params.orderStatus !== "") {
      apiParams.orderStatus = params.orderStatus;
    }
    if (params.paymentStatus && params.paymentStatus !== "") {
      apiParams.paymentStatus = params.paymentStatus;
    }
    if (params.searchId && params.searchId !== "") {
      apiParams.orderId = params.searchId;
    }
    if (params.customerId && params.customerId !== "") {
      apiParams.customerId = parseInt(params.customerId);
    }
    if (params.deliveryId && params.deliveryId !== "") {
      apiParams.deliveryId = parseInt(params.deliveryId);
    }
    if (params.page !== undefined && params.page !== null) {
      apiParams.page = params.page;
    }
    if (params.size !== undefined && params.size !== null) {
      apiParams.size = params.size;
    }

    console.log("API call - getAllOrders with params:", apiParams);
    console.log(
      "Full URL will be:",
      `/orders/all?${new URLSearchParams(apiParams).toString()}`
    );
    return api.get("/orders/all", { params: apiParams });
  },
  getNewOrders: (params = {}) =>
    api.get("/orders/all", {
      params: {
        ...params,
        // Filter for orders that are not delivered and payment not completed
        excludeDelivered: true,
        excludeCompletedPayment: true,
      },
    }),
  getIncompleteOrders: (params = {}) =>
    api.get("/orders/incomplete-orders", { params }),
  updateOrderStatus: (orderData) => api.put("/orders/update-status", orderData),
  countUniqueCustomers: () => api.get("/orders/unique-customers"),

  // Dashboard statistics
  getTotalOrders: () => api.get("/orders/stats/total-orders"),
  getTotalRevenue: () => api.get("/orders/stats/total-revenue"),
  getMonthlyRevenue: (year) => {
    console.log("API call - getMonthlyRevenue with year:", year);
    return api.get("/orders/stats/monthly-revenue", { params: { year } });
  },
  getDailyRevenueForMonth: (year, month) =>
    api.get("/orders/stats/daily-revenue-for-month", {
      params: { year, month },
    }),
  getOrderStatusDistribution: () =>
    api.get("/orders/stats/status-distribution"),
  getMostPopularItems: (limit = 5) =>
    api.get("/orders/stats/most-popular-items", {
      params: { limit },
    }),

  // Delivery-specific methods (these endpoints will need to be implemented in the backend)
  getDeliveryStats: (deliveryId) =>
    api.get(`/orders/delivery/stats/${deliveryId}`),
  getDeliveryOrders: (deliveryId, params = {}) => {
    const apiParams = {
      deliveryId,
      ...params,
    };
    return api.get("/orders/delivery/orders", { params: apiParams });
  },
  getDeliveryIncompleteOrders: (deliveryId, params = {}) => {
    const apiParams = {
      deliveryId,
      ...params,
    };
    return api.get("/orders/delivery/incomplete-orders", { params: apiParams });
  },
};

// Review API
export const reviewAPI = {
  getReviewsForMenu: (menuId) => api.get("/reviews", { params: { menuId } }),
  createReview: (reviewData) => api.post("/reviews", reviewData),
  getAverageRating: (menuId) => api.get(`/reviews/menu-item/${menuId}`),
};

// Role API
export const roleAPI = {
  getAllRoles: () => api.get("/roles"),
  createRole: (roleData) => api.post("/roles", roleData),
  updateRole: (roleData) => api.put("/roles", roleData),
  deleteRole: (id) => api.delete(`/roles/${id}`),
};

export default api;
