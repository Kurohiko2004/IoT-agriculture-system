# CHOICE OF DATABASES

For an IoT application that handles both device state management (on/off status, control commands) and high-volume sensor telemetry (temperature, humidity, etc.), a **polyglot persistence** architecture (using more than one type of database) is often the most effective approach. 

Using different databases tailored to specific tasks allows you to balance relational data, high-speed transient states, and high-frequency time-series data.

Here is a common and practical database combination for this use case:

---

### Recommended Stack: PostgreSQL (with TimescaleDB) + Redis

This combination is widely used because it covers all IoT data access patterns with minimal operational complexity.

#### 1. PostgreSQL (with TimescaleDB extension)
*   **Role for Relational Data:** PostgreSQL acts as your primary database for managing user accounts, device registries (which device belongs to which user), device configurations, and metadata.
*   **Role for Sensor Telemetry (via TimescaleDB):** TimescaleDB is an open-source extension that turns PostgreSQL into a high-performance time-series database. 
    *   **Why it works:** Sensor data is append-only and time-stamped. TimescaleDB automatically partitions data by time (hypertables), allowing you to write millions of sensor readings per second and query them quickly.
    *   **Benefit:** You do not need to manage a separate database system; your relational metadata and your time-series sensor data live in the same PostgreSQL instance, allowing you to perform standard SQL `JOIN` operations between devices and sensor logs.

#### 2. Redis (In-Memory Key-Value Store)
*   **Role for Real-time Device State:** Keeping track of whether a device is currently online/offline, active/inactive, or its latest reported state (e.g., "on" or "off").
*   **Role for Command & Control:** Facilitating the real-time "turn on/turn off" commands.
    *   **Why it works:** Reading and writing to disk for every single device heartbeat or status change can put unnecessary load on your primary database. Redis operates in memory, providing sub-millisecond latency. You can store the current state of a device as a simple key-value pair (e.g., `device:1001:status -> "ON"`) with a Time-To-Live (TTL) expiration. If the device fails to send a heartbeat within 30 seconds, the key expires, and the system instantly knows the device is offline.
    *   **Pub/Sub Capabilities:** Redis has built-in Publish/Subscribe features, which can help route control commands (like "turn off") from your backend API to the connection workers handling the devices.

---

### Alternative Stack: MongoDB + InfluxDB + Redis
If your devices are highly heterogeneous (meaning different types of sensors send completely different data structures that change frequently), a document-based approach might be preferred.

#### 1. MongoDB (Document Database)
*   **Role:** Device metadata registry. 
*   **Why it works:** Schema flexibility. If Device A has 3 sensors (temperature, light, moisture) and Device B only has 1 (switch status), MongoDB allows you to store their configurations in flexible JSON documents without running migrations.

#### 2. InfluxDB (Dedicated Time-Series Database)
*   **Role:** High-volume sensor telemetry.
*   **Why it works:** InfluxDB is built from the ground up for time-series data, offering built-in data retention policies (e.g., automatically deleting or downsampling sensor data older than 30 days) and high compression rates.

#### 3. Redis
*   **Role:** Remains the same—caching real-time "online/offline" status and handling immediate command-and-control messaging.

---

### Summary of Database Roles

| Data Category | Example Data | Performance Requirement | Recommended DB |
| :--- | :--- | :--- | :--- |
| **Metadata & Registry** | User accounts, device ownership, configurations | Strong consistency, relations | **PostgreSQL** (or MongoDB) |
| **Real-time Status** | Current on/off state, online/offline status, heartbeats | Low latency (<5ms), high write frequency | **Redis** |
| **Sensor Telemetry** | Historical temperature, humidity, light logs over time | High write throughput, time-range queries | **TimescaleDB** (or InfluxDB) |

### Additional Architecture Tip
For the actual real-time communication between the devices and your backend, it is common to use an **MQTT Broker** (such as EMQX or Mosquitto) alongside your databases. The broker handles the lightweight, bi-directional messaging, and your backend services consume those messages to update the status in **Redis** and save the historical data to **TimescaleDB/InfluxDB**.