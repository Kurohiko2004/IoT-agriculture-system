// src/components/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import websocketService from '../services/websocketService';

const Dashboard = () => {
  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    soilMoisture: 0,
    lightIntensity: 0
  });

  const [devices, setDevices] = useState({
    coolingFan: false,
    waterPump: false,
    mistingSystem: false,
    ventilationFan: false,
    light: false
  });

  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [notifications, setNotifications] = useState([]);

  // ==================== INITIALIZE ====================
  
  useEffect(() => {
    // Fetch initial data from REST API
    fetchInitialData();
    
    // Connect to WebSocket
    connectWebSocket();
    
    // Cleanup on unmount
    return () => {
      websocketService.disconnect();
    };
  }, []);

  const fetchInitialData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/dashboard');
      
      // Process sensor data
      response.data.sensors.forEach(sensor => {
        updateSensorValue(sensor.sensor_name, sensor.value);
      });
      
      // Process device status
      response.data.devices.forEach(device => {
        updateDeviceStatus(device.name, device.current_status === 'on');
      });
      
    } catch (error) {
      console.error('Error fetching initial data:', error);
      addNotification('error', 'Failed to load dashboard data');
    }
  };

  const connectWebSocket = async () => {
    try {
      setConnectionStatus('connecting');
      
      await websocketService.connect('ws://localhost:3000');
      
      setConnectionStatus('connected');
      addNotification('success', 'Real-time connection established');
      
      // Subscribe to WebSocket events
      setupWebSocketListeners();
      
    } catch (error) {
      console.error('WebSocket connection error:', error);
      setConnectionStatus('error');
      addNotification('error', 'Connection failed');
    }
  };

  // ==================== WEBSOCKET LISTENERS ====================
  
  const setupWebSocketListeners = () => {
    
    // Listen for sensor updates
    websocketService.on('sensor_update', (data) => {
      console.log('🌡️ Sensor update:', data);
      updateSensorValue(data.sensor, data.value);
      addNotification('info', `${data.sensor} updated: ${data.value}`);
    });
    
    // Listen for device status changes
    websocketService.on('device_status', (data) => {
      console.log('💡 Device status:', data);
      updateDeviceStatus(data.device, data.status === 'on');
      
      if (data.success) {
        addNotification('success', `${data.device} turned ${data.status}`);
      }
    });
    
    // Listen for device errors
    websocketService.on('device_error', (data) => {
      console.log('❌ Device error:', data);
      updateDeviceStatus(data.device, false);
      addNotification('error', `${data.device}: ${data.error}`);
    });
    
    // Listen for device sync
    websocketService.on('device_sync', (data) => {
      console.log('🔄 Device sync:', data);
      
      Object.entries(data.states).forEach(([device, status]) => {
        if (device !== 'event') {
          updateDeviceStatus(device, status === 'on');
        }
      });
      
      addNotification('warning', data.message);
    });
    
    // Listen for initial data
    websocketService.on('initial_data', (data) => {
      console.log('📊 Initial data received:', data);
      
      data.data.sensors.forEach(sensor => {
        updateSensorValue(sensor.sensor_name, sensor.value);
      });
      
      data.data.devices.forEach(device => {
        updateDeviceStatus(device.name, device.current_status === 'on');
      });
    });
  };

  // ==================== UPDATE FUNCTIONS ====================
  
  const updateSensorValue = (sensorName, value) => {
    const sensorMap = {
      'temperature': 'temperature',
      'humidity': 'humidity',
      'soil-moisture': 'soilMoisture',
      'soil_moisture': 'soilMoisture',
      'light-intensity': 'lightIntensity',
      'light_intensity': 'lightIntensity'
    };
    
    const key = sensorMap[sensorName] || sensorName;
    
    setSensorData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateDeviceStatus = (deviceName, isOn) => {
    const deviceMap = {
      'cooling-fan': 'coolingFan',
      'cooling_fan': 'coolingFan',
      'water-pump': 'waterPump',
      'water_pump': 'waterPump',
      'misting-system': 'mistingSystem',
      'misting': 'mistingSystem',
      'ventilation-fan': 'ventilationFan',
      'ventilation': 'ventilationFan',
      'light': 'light'
    };
    
    const key = deviceMap[deviceName] || deviceName;
    
    setDevices(prev => ({
      ...prev,
      [key]: isOn
    }));
  };

  const addNotification = (type, message) => {
    const notification = {
      id: Date.now(),
      type, // 'success', 'error', 'warning', 'info'
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  // ==================== CONTROL FUNCTIONS ====================
  
  const handleDeviceToggle = async (deviceName, deviceId) => {
    const currentStatus = devices[deviceName];
    const action = currentStatus ? 'turn_off' : 'turn_on';
    
    // Optimistic update
    updateDeviceStatus(deviceName, !currentStatus);
    
    try {
      const response = await axios.post(
        `http://localhost:3000/api/control/${deviceId}`,
        { action }
      );
      
      if (!response.data.success) {
        // Revert on error
        updateDeviceStatus(deviceName, currentStatus);
        addNotification('error', response.data.error || 'Control failed');
      }
      
    } catch (error) {
      console.error('Control error:', error);
      // Revert on error
      updateDeviceStatus(deviceName, currentStatus);
      addNotification('error', 'Failed to control device');
    }
  };

  // ==================== RENDER ====================
  
  return (
    <div className="dashboard">
      {/* Connection Status */}
      <div className="connection-status">
        <span className={`status-indicator ${connectionStatus}`}></span>
        <span>{connectionStatus === 'connected' ? 'Live' : 'Connecting...'}</span>
      </div>

      {/* Notifications */}
      <div className="notifications">
        {notifications.map(notif => (
          <div key={notif.id} className={`notification ${notif.type}`}>
            <span>{notif.message}</span>
            <small>{notif.timestamp}</small>
          </div>
        ))}
      </div>

      {/* Sensor Data */}
      <div className="sensor-grid">
        <div className="sensor-card">
          <h3>Temperature</h3>
          <div className="sensor-value">{sensorData.temperature}°C</div>
        </div>
        
        <div className="sensor-card">
          <h3>Humidity</h3>
          <div className="sensor-value">{sensorData.humidity}%</div>
        </div>
        
        <div className="sensor-card">
          <h3>Soil Moisture</h3>
          <div className="sensor-value">{sensorData.soilMoisture}%</div>
        </div>
        
        <div className="sensor-card">
          <h3>Light Intensity</h3>
          <div className="sensor-value">{sensorData.lightIntensity} Lux</div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="control-panel">
        <h2>Control Panel</h2>
        
        <div className="device-controls">
          <div className="device-item">
            <span>Cooling Fan</span>
            <button
              className={`toggle ${devices.coolingFan ? 'on' : 'off'}`}
              onClick={() => handleDeviceToggle('coolingFan', 1)}
            >
              {devices.coolingFan ? 'ON' : 'OFF'}
            </button>
          </div>
          
          <div className="device-item">
            <span>Water Pump</span>
            <button
              className={`toggle ${devices.waterPump ? 'on' : 'off'}`}
              onClick={() => handleDeviceToggle('waterPump', 2)}
            >
              {devices.waterPump ? 'ON' : 'OFF'}
            </button>
          </div>
          
          {/* Add more devices... */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;