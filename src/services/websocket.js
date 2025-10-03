import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useEffect, useState } from "react";

// Polyfill for global variable (required by STOMP.js in browser)
if (typeof global === "undefined") {
  window.global = window;
}

class WebSocketService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.pendingSubscriptions = new Map(); // Store subscriptions that need to be re-established
  }

  connect() {
    if (this.client?.connected) {
      return this.client;
    }

    try {
      // Create SockJS connection
      const socket = new SockJS("http://localhost:8080/ws");

      // Create STOMP client
      this.client = new Client({
        webSocketFactory: () => socket,
        debug: (str) => {
          console.log("STOMP Debug:", str);
        },
        onConnect: (frame) => {
          console.log("WebSocket connected");
          this.isConnected = true;
          this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
          this.reconnectDelay = 1000; // Reset delay
          this.notifyListeners("connect", frame);
          this.reestablishSubscriptions();
        },
        onDisconnect: () => {
          console.log("WebSocket disconnected");
          this.isConnected = false;
          this.notifyListeners("disconnect", {});
          this.attemptReconnect();
        },
        onStompError: (frame) => {
          console.error("STOMP Error:", frame);
          this.isConnected = false;
          this.notifyListeners("error", frame);
          this.attemptReconnect();
        },
        onWebSocketError: (error) => {
          console.error("WebSocket Error:", error);
          this.isConnected = false;
          this.notifyListeners("error", error);
          this.attemptReconnect();
        },
      });

      this.client.activate();
      return this.client;
    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
      this.notifyListeners("error", error);
      this.attemptReconnect();
      return null;
    }
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${this.reconnectDelay}ms`
    );

    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay);

    // Exponential backoff
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000); // Max 30 seconds
  }

  reestablishSubscriptions() {
    // Re-establish all pending subscriptions
    for (const [destination, callbacks] of this.pendingSubscriptions) {
      callbacks.forEach((callback) => {
        this.subscribeToDestination(destination, callback);
      });
    }
  }

  subscribe(destination, callback) {
    // Store listener for cleanup
    if (!this.listeners.has(destination)) {
      this.listeners.set(destination, []);
    }
    this.listeners.get(destination).push(callback);

    // Store for reconnection
    if (!this.pendingSubscriptions.has(destination)) {
      this.pendingSubscriptions.set(destination, []);
    }
    this.pendingSubscriptions.get(destination).push(callback);

    // If already connected, subscribe immediately
    if (this.client && this.isConnected) {
      this.subscribeToDestination(destination, callback);
      return;
    }

    // If no client exists, create one
    if (!this.client) {
      this.connect();
    }

    // Wait for connection before subscribing
    if (!this.isConnected) {
      const originalOnConnect = this.client.onConnect;
      this.client.onConnect = (frame) => {
        if (originalOnConnect) {
          originalOnConnect(frame);
        }
        this.subscribeToDestination(destination, callback);
      };
    }
  }

  subscribeToDestination(destination, callback) {
    if (!this.client || !this.isConnected) {
      console.warn("Cannot subscribe: WebSocket not connected");
      return;
    }

    try {
      this.client.subscribe(destination, (message) => {
        try {
          const data = JSON.parse(message.body);
          callback(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
          callback(message.body);
        }
      });
    } catch (error) {
      console.error("Error subscribing to destination:", error);
    }
  }

  unsubscribe(destination, callback) {
    if (this.client && this.isConnected) {
      // Note: STOMP doesn't provide easy unsubscribe by callback
      // We'll handle this in the cleanup method
    }

    // Remove from listeners map
    if (this.listeners.has(destination)) {
      const eventListeners = this.listeners.get(destination);
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }

    // Remove from pending subscriptions
    if (this.pendingSubscriptions.has(destination)) {
      const pendingCallbacks = this.pendingSubscriptions.get(destination);
      const index = pendingCallbacks.indexOf(callback);
      if (index > -1) {
        pendingCallbacks.splice(index, 1);
      }
      // If no more callbacks for this destination, remove the destination
      if (pendingCallbacks.length === 0) {
        this.pendingSubscriptions.delete(destination);
      }
    }
  }

  emit(destination, data) {
    if (this.client && this.isConnected) {
      this.client.publish({
        destination: destination,
        body: JSON.stringify(data),
      });
    }
  }

  // Specific methods for order updates
  subscribeToNewOrders(callback) {
    this.subscribe("/topic/incompleteOrders", callback);
  }

  subscribeToOrderUpdates(callback) {
    this.subscribe("/topic/orderUpdates", callback);
  }

  unsubscribeFromNewOrders(callback) {
    this.unsubscribe("/topic/incompleteOrders", callback);
  }

  unsubscribeFromOrderUpdates(callback) {
    this.unsubscribe("/topic/orderUpdates", callback);
  }

  // Notify listeners of connection events
  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => callback(data));
    }
  }

  // Cleanup all listeners
  cleanup() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
      this.listeners.clear();
      this.pendingSubscriptions.clear();
      this.reconnectAttempts = 0;
    }
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

// React hook for using WebSocket
export const useWebSocket = () => {
  const [client, setClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const wsClient = webSocketService.connect();
    setClient(wsClient);

    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleError = (error) => {
      console.error("WebSocket error:", error);
    };

    // Subscribe to connection events
    webSocketService.subscribe("connect", handleConnect);
    webSocketService.subscribe("disconnect", handleDisconnect);
    webSocketService.subscribe("error", handleError);

    // Set initial connection state
    setIsConnected(webSocketService.isConnected);

    return () => {
      webSocketService.unsubscribe("connect", handleConnect);
      webSocketService.unsubscribe("disconnect", handleDisconnect);
      webSocketService.unsubscribe("error", handleError);
    };
  }, []);

  return {
    client,
    isConnected,
    subscribe: webSocketService.subscribe.bind(webSocketService),
    unsubscribe: webSocketService.unsubscribe.bind(webSocketService),
    emit: webSocketService.emit.bind(webSocketService),
  };
};

export default webSocketService;
