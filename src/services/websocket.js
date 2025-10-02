import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useEffect, useState } from "react";

// Polyfill for global variable (required by STOMP.js in browser)
if (typeof global === 'undefined') {
  window.global = window;
}

class WebSocketService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.listeners = new Map();
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
        onConnect: () => {
          console.log("WebSocket connected");
          this.isConnected = true;
          this.notifyListeners("connect", {});
        },
        onDisconnect: () => {
          console.log("WebSocket disconnected");
          this.isConnected = false;
          this.notifyListeners("disconnect", {});
        },
        onStompError: (frame) => {
          console.error("STOMP Error:", frame);
          this.notifyListeners("error", frame);
        },
        onWebSocketError: (error) => {
          console.error("WebSocket Error:", error);
          this.notifyListeners("error", error);
        },
      });

      this.client.activate();
      return this.client;
    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
      this.notifyListeners("error", error);
      return null;
    }
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
    }
  }

  subscribe(destination, callback) {
    if (!this.client) {
      this.connect();
    }

    // Wait for connection before subscribing
    if (!this.isConnected) {
      const originalOnConnect = this.client.onConnect;
      this.client.onConnect = (frame) => {
        originalOnConnect(frame);
        this.subscribeToDestination(destination, callback);
      };
    } else {
      this.subscribeToDestination(destination, callback);
    }

    // Store listener for cleanup
    if (!this.listeners.has(destination)) {
      this.listeners.set(destination, []);
    }
    this.listeners.get(destination).push(callback);
  }

  subscribeToDestination(destination, callback) {
    this.client.subscribe(destination, (message) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
        callback(message.body);
      }
    });
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
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  // Cleanup all listeners
  cleanup() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
      this.listeners.clear();
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

