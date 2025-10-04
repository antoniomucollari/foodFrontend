// Global error handler for API responses
let toastContext = null;

export const setToastContext = (context) => {
  toastContext = context;
};

export const handleApiError = (error) => {
  if (!toastContext) {
    console.error("Toast context not available for error handling");
    return;
  }

  const { showError, showWarning } = toastContext;

  // Check if it's an API error with response
  if (error.response) {
    const { status, data, config } = error.response;
    const statusCode = data?.statusCode || status;
    const message = data?.message || "An error occurred";
    const url = config?.url || "";

    // Skip error handling for cart-related 404 errors (new users don't have carts yet)
    if (statusCode === 404 && url.includes("/cart/items")) {
      console.log("Cart not found - skipping error display for new users");
      return;
    }

    // Handle different status codes
    if (statusCode >= 400 && statusCode < 500) {
      // Client errors (400-499)
      if (statusCode === 400) {
        showError(message, { title: "Bad Request" });
      } else if (statusCode === 401) {
        showError("Unauthorized. Please log in again.", {
          title: "Authentication Required",
        });
      } else if (statusCode === 403) {
        showError("You do not have permission to perform this action.", {
          title: "Access Denied",
        });
      } else if (statusCode === 404) {
        showError("The requested resource was not found.", {
          title: "Not Found",
        });
      } else if (statusCode === 409) {
        showWarning(message, { title: "Conflict" });
      } else if (statusCode === 422) {
        showError(message, { title: "Validation Error" });
      } else {
        showError(message, { title: `Error ${statusCode}` });
      }
    } else if (statusCode >= 500) {
      // Server errors (500+)
      showError("Server error. Please try again later.", {
        title: "Server Error",
      });
    } else {
      // Other errors
      showError(message, { title: "Error" });
    }
  } else if (error.request) {
    // Network error
    showError("Network error. Please check your connection.", {
      title: "Connection Error",
    });
  } else {
    // Other errors
    showError(error.message || "An unexpected error occurred.", {
      title: "Error",
    });
  }
};

