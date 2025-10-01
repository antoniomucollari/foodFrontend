import { io } from "socket.io-client";
import { useEffect, useState } from "react";

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io("http://localhost:8080", {
      transports: ["websocket"],
      autoConnect: true,
    });

    this.socket.on("connect", () => {
      console.log("WebSocket connected:", this.socket.id);
    });

    this.socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribe(event, callback) {
    if (!this.socket) {
      this.connect();
    }

    this.socket.on(event, callback);

    // Store listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  unsubscribe(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }

    // Remove from listeners map
    if (this.listeners.has(event)) {
      const eventListeners = this.listeners.get(event);
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  // Specific methods for order updates
  subscribeToNewOrders(callback) {
    this.subscribe("newOrder", callback);
  }

  subscribeToOrderUpdates(callback) {
    this.subscribe("orderUpdated", callback);
  }

  unsubscribeFromNewOrders(callback) {
    this.unsubscribe("newOrder", callback);
  }

  unsubscribeFromOrderUpdates(callback) {
    this.unsubscribe("orderUpdated", callback);
  }

  // Cleanup all listeners
  cleanup() {
    if (this.socket) {
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach((callback) => {
          this.socket.off(event, callback);
        });
      });
      this.listeners.clear();
    }
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

// React hook for using WebSocket
export const useWebSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const wsSocket = webSocketService.connect();
    setSocket(wsSocket);

    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    wsSocket.on("connect", handleConnect);
    wsSocket.on("disconnect", handleDisconnect);

    // Set initial connection state
    setIsConnected(wsSocket.connected);

    return () => {
      wsSocket.off("connect", handleConnect);
      wsSocket.off("disconnect", handleDisconnect);
    };
  }, []);

  return {
    socket,
    isConnected,
    subscribe: webSocketService.subscribe.bind(webSocketService),
    unsubscribe: webSocketService.unsubscribe.bind(webSocketService),
    emit: webSocketService.emit.bind(webSocketService),
  };
};

export default webSocketService;
