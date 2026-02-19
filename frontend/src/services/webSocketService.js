// src/services/websocketService.js

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectInterval = 5000;
    this.reconnectTimer = null;
    this.listeners = new Map();
  }

  connect(url = 'ws://localhost:3000') {
    return new Promise((resolve, reject) => {
      try {
        console.log('🔌 Connecting to WebSocket:', url);
        
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected');
          
          // Clear reconnect timer
          if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
          }
          
          // Request initial data
          this.send({
            action: 'get_initial_data'
          });
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📨 WebSocket message:', data);
            
            // Notify all listeners
            this.notifyListeners(data);
            
          } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('🔌 WebSocket disconnected');
          
          // Attempt to reconnect
          this.reconnect(url);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  reconnect(url) {
    if (this.reconnectTimer) return;
    
    console.log(`🔄 Reconnecting in ${this.reconnectInterval / 1000}s...`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect(url).catch(err => {
        console.error('❌ Reconnect failed:', err);
      });
    }, this.reconnectInterval);
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
      console.log('📤 Sent:', data);
    } else {
      console.warn('⚠️ WebSocket not connected');
    }
  }

  // Subscribe to specific message types
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  notifyListeners(data) {
    const eventType = data.type;
    
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).forEach(callback => {
        callback(data);
      });
    }
    
    // Also notify 'all' listeners
    if (this.listeners.has('all')) {
      this.listeners.get('all').forEach(callback => {
        callback(data);
      });
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    console.log('🔌 WebSocket disconnected manually');
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
export default new WebSocketService();