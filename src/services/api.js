import axios from "axios";

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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
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
  getAllUsers: () => api.get("/users/all"),
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
  deactivateOwnAccount: () => api.delete("/users/deactivate"),
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
  getAllOrders: (params = {}) => api.get("/orders/all", { params }),
  getNewOrders: (params = {}) =>
    api.get("/orders/all", {
      params: {
        ...params,
        // Filter for orders that are not delivered and payment not completed
        excludeDelivered: true,
        excludeCompletedPayment: true,
      },
    }),
  updateOrderStatus: (orderData) => api.put("/orders/update-status", orderData),
  countUniqueCustomers: () => api.get("/orders/unique-customers"),

  // Dashboard statistics
  getTotalOrders: () => api.get("/orders/stats/total-orders"),
  getTotalRevenue: () => api.get("/orders/stats/total-revenue"),
  getMonthlyRevenue: (year) =>
    api.get("/orders/stats/monthly-revenue", { params: { year } }),
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
