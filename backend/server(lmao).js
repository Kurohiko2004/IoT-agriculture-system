// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mqtt = require('mqtt');
const mysql = require('mysql2/promise');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection pool
const dbPool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'iot_smart_farm',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// MQTT Client
const mqttClient = mqtt.connect('mqtt://broker.hivemq.com:1883');

// Store active WebSocket connections
const activeConnections = new Set();

// ==================== MQTT SETUP ====================

mqttClient.on('connect', () => {
  console.log('✅ MQTT Broker connected');
  
  // Subscribe to all sensor topics
  mqttClient.subscribe('sensor/#', (err) => {
    if (err) console.error('❌ MQTT Subscribe error:', err);
    else console.log('📡 Subscribed to sensor topics');
  });
  
  // Subscribe to all control status topics
  mqttClient.subscribe('control/+/status', (err) => {
    if (err) console.error('❌ MQTT Subscribe error:', err);
    else console.log('📡 Subscribed to control status topics');
  });
  
  // Subscribe to device sync topic
  mqttClient.subscribe('device/state/sync', (err) => {
    if (err) console.error('❌ MQTT Subscribe error:', err);
    else console.log('📡 Subscribed to device sync topic');
  });
});

// Handle incoming MQTT messages
mqttClient.on('message', async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    console.log(`📨 MQTT message: ${topic} ->`, data);
    
    // ==================== SENSOR DATA ====================
    if (topic.startsWith('sensor/')) {
      const sensorType = topic.split('/')[1]; // temperature, humidity, etc.
      
      // Save to database
      await dbPool.query(`
        INSERT INTO sensor_data (value, measured_at, type, sensor_id)
        VALUES (?, NOW(), ?, (SELECT id FROM sensor WHERE name = ? LIMIT 1))
      `, [data.value, sensorType, sensorType]);
      
      // Broadcast to all connected WebSocket clients
      broadcastToClients({
        type: 'sensor_update',
        sensor: sensorType,
        value: data.value,
        timestamp: data.time || new Date().toISOString()
      });
    }
    
    // ==================== DEVICE STATUS CONFIRMATION ====================
    else if (topic.includes('/status')) {
      const deviceName = topic.split('/')[1]; // cooling-fan, water-pump, etc.
      
      // Update action_history
      if (data.action_id) {
        await dbPool.query(`
          UPDATE action_history
          SET status = ?, interacted_at = NOW()
          WHERE id = ?
        `, [data.status, data.action_id]);
        
        console.log(`✅ Updated action ${data.action_id} to status: ${data.status}`);
      }
      
      // Broadcast to clients
      broadcastToClients({
        type: 'device_status',
        device: deviceName,
        status: data.status,
        action_id: data.action_id,
        success: data.success
      });
    }
    
    // ==================== DEVICE STATE SYNC ====================
    else if (topic === 'device/state/sync') {
      console.log('🔄 Device state sync received:', data);
      
      // Log all devices that are OFF due to safety mode
      const devices = ['cooling_fan', 'water_pump', 'misting', 'light'];
      
      for (const device of devices) {
        if (data[device] === 'off') {
          await dbPool.query(`
            INSERT INTO action_history (action, status, device_id, interacted_at)
            VALUES ('auto_off', 'off', (SELECT id FROM device WHERE name = ?), NOW())
          `, [device.replace('_', ' ')]);
        }
      }
      
      // Broadcast sync to all clients
      broadcastToClients({
        type: 'device_sync',
        states: data,
        message: 'Hardware reconnected - all devices synchronized'
      });
    }
    
  } catch (error) {
    console.error('❌ Error processing MQTT message:', error);
  }
});

// ==================== WEBSOCKET SETUP ====================

wss.on('connection', (ws, req) => {
  console.log('🔌 New WebSocket connection from:', req.socket.remoteAddress);
  
  // Add to active connections
  activeConnections.add(ws);
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connection',
    message: 'WebSocket connected successfully',
    timestamp: new Date().toISOString()
  }));
  
  // Handle incoming messages from client
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('📩 WebSocket message from client:', data);
      
      // Client can request initial data
      if (data.action === 'get_initial_data') {
        const initialData = await getInitialDashboardData();
        ws.send(JSON.stringify({
          type: 'initial_data',
          data: initialData
        }));
      }
      
    } catch (error) {
      console.error('❌ Error handling WebSocket message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: error.message
      }));
    }
  });
  
  // Handle client disconnect
  ws.on('close', () => {
    console.log('🔌 WebSocket connection closed');
    activeConnections.delete(ws);
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
    activeConnections.delete(ws);
  });
});

// Broadcast message to all connected WebSocket clients
function broadcastToClients(data) {
  const message = JSON.stringify(data);
  let sentCount = 0;
  
  activeConnections.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
      sentCount++;
    }
  });
  
  console.log(`📢 Broadcasted to ${sentCount} clients:`, data.type);
}

// Get initial dashboard data
async function getInitialDashboardData() {
  // Get latest sensor data
  const [sensorData] = await dbPool.query(`
    SELECT sd.*, s.name as sensor_name
    FROM sensor_data sd
    INNER JOIN sensor s ON sd.sensor_id = s.id
    WHERE sd.measured_at IN (
      SELECT MAX(measured_at)
      FROM sensor_data
      GROUP BY sensor_id
    )
  `);
  
  // Get all devices with current status
  const [devices] = await dbPool.query(`
    SELECT d.*, ah.status as current_status
    FROM device d
    LEFT JOIN action_history ah ON d.id = ah.device_id
    WHERE ah.interacted_at = (
      SELECT MAX(interacted_at)
      FROM action_history
      WHERE device_id = d.id
    )
  `);
  
  return {
    sensors: sensorData,
    devices: devices
  };
}

// ==================== REST API ENDPOINTS ====================

// Get dashboard data
app.get('/api/dashboard', async (req, res) => {
  try {
    const data = await getInitialDashboardData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Control device
app.post('/api/control/:device_id', async (req, res) => {
  const { device_id } = req.params;
  const { action } = req.body; // 'turn_on' or 'turn_off'
  
  try {
    // Get device info
    const [device] = await dbPool.query(
      'SELECT * FROM device WHERE id = ?',
      [device_id]
    );
    
    if (device.length === 0) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    // Insert action with status='waiting'
    const [result] = await dbPool.query(`
      INSERT INTO action_history (action, status, device_id, interacted_at)
      VALUES (?, 'waiting', ?, NOW())
    `, [action, device_id]);
    
    const actionId = result.insertId;
    
    // Publish to MQTT
    const deviceName = device[0].name.toLowerCase().replace(' ', '-');
    const command = action === 'turn_on' ? 'ON' : 'OFF';
    
    mqttClient.publish(`control/${deviceName}`, JSON.stringify({
      command: command,
      action_id: actionId,
      device_id: device_id
    }));
    
    console.log(`📤 Published control command: ${deviceName} -> ${command}`);
    
    // Wait for confirmation or timeout (10 seconds)
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => resolve({ type: 'timeout' }), 10000);
    });
    
    const confirmationPromise = waitForConfirmation(actionId);
    
    const result2 = await Promise.race([confirmationPromise, timeoutPromise]);
    
    if (result2.type === 'timeout') {
      // Timeout - device didn't respond
      console.log(`⏰ TIMEOUT for action ${actionId}`);
      
      // Insert auto_off record
      await dbPool.query(`
        INSERT INTO action_history (action, status, device_id, interacted_at)
        VALUES ('auto_off', 'off', ?, NOW())
      `, [device_id]);
      
      // Broadcast timeout
      broadcastToClients({
        type: 'device_error',
        device: deviceName,
        status: 'off',
        error: 'Device timeout after 10 seconds',
        action_id: actionId
      });
      
      return res.status(408).json({
        success: false,
        error: 'Device timeout',
        status: 'off',
        action_id: actionId
      });
      
    } else {
      // Success - received confirmation
      return res.status(200).json({
        success: true,
        status: result2.status,
        action_id: actionId
      });
    }
    
  } catch (error) {
    console.error('❌ Error in control endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// Wait for MQTT confirmation
function waitForConfirmation(actionId) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      mqttClient.off('message', handler);
      resolve({ type: 'timeout' });
    }, 11000);
    
    const handler = (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.action_id === actionId && topic.includes('/status')) {
          clearTimeout(timeout);
          mqttClient.off('message', handler);
          
          resolve({
            type: 'confirmation',
            status: data.status,
            success: data.success
          });
        }
      } catch (err) {
        // Ignore parse errors
      }
    };
    
    mqttClient.on('message', handler);
  });
}

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server running on ws://localhost:${PORT}`);
});