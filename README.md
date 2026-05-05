# IoT Agriculture System 🌿🚜

Hệ thống giám sát và điều khiển nông nghiệp thông minh dựa trên nền tảng IoT. Dự án tích hợp các công nghệ hiện đại để giúp người dùng theo dõi các thông số môi trường (nhiệt độ, độ ẩm, ánh sáng, độ ẩm đất) và điều khiển thiết bị ngoại vi (máy bơm, quạt, đèn) trong thời gian thực.

## Tính năng chính

- **Tính năng thời gian thực:** Cập nhật dữ liệu cảm biến real-time và điều khiển thiết bị real-time thông qua Socket.io.
- **Thống kê & Lịch sử:** Truy xuất lịch sử dữ liệu cảm biến và lịch sử tương tác của thiết bị.

## 🛠 Công nghệ sử dụng

### Frontend
- **React (Vite):** Framework phát triển giao diện nhanh và tối ưu.
- **Zustand:** Quản lý trạng thái ứng dụng một cách tối giản và hiệu quả (Store thiết bị, dữ liệu cảm biến).
- **Socket.io-client:** Kết nối và nhận dữ liệu thời gian thực từ server.
- **TanStack Query (React Query):** Quản lý việc fetch, cache và đồng bộ dữ liệu với API.
- **Recharts:** Thư viện vẽ biểu đồ mạnh mẽ, hỗ trợ hiển thị dữ liệu cảm biến động.
- **Tailwind CSS:** Framework CSS utility-first giúp xây dựng giao diện hiện đại, responsive.
- **Lucide React:** Bộ icon đẹp và đồng nhất.

### Backend
- **Node.js & Express:** Môi trường thực thi và framework web server.
- **Sequelize (MySQL):** ORM mạnh mẽ để tương tác với cơ sở dữ liệu quan hệ MySQL.
- **MQTT (Aedes/External Broker):** Giao thức truyền tin nhẹ dành cho các thiết bị IoT.
- **Socket.io:** Đẩy dữ liệu thời gian thực từ backend tới giao diện người dùng.
- **Joi:** Thư viện validate dữ liệu đầu vào.
- **Swagger UI:** Tự động tạo tài liệu cho RESTful API.

## 🚀 Hướng dẫn cài đặt

### Yêu cầu hệ thống
- **Node.js** (Phiên bản >= 16)
- **MySQL** (Đã tạo database)
- **MQTT Broker** (Có thể dùng Mosquitto hoặc các broker online như HiveMQ, EMQX)

### Cài đặt Backend
1. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
2. Cài đặt dependency:
   ```bash
   npm install
   ```
3. Cấu hình file `.env` (Dựa trên `.env.example`):
   ```
   PORT=8081
   DB_NAME=iot_agriculture
   DB_USER=root
   DB_PASSWORD=your_password
   MQTT_HOST=your_mqtt_broker
   CLIENT_URL=http://localhost:5173
   ```
4. Chạy migration và seeder (nếu có):
   ```bash
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all
   ```
5. Khởi chạy server:
   ```bash
   npm run dev
   ```

### Cài đặt Frontend
1. Di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```
2. Cài đặt dependency:
   ```bash
   npm install
   ```
3. Khởi chạy ứng dụng:
   ```bash
   npm run dev
   ```

## 📈 Cấu trúc thư mục chính

```text
├── backend/
│   ├── config/          # Cấu hình DB, MQTT
│   ├── controllers/     # Xử lý logic API
│   ├── models/          # Định nghĩa schema database (Sequelize)
│   ├── services/        # Xử lý MQTT event, Socket logistics
│   ├── routers/         # Định tuyến API
│   └── server.js        # Entry point của backend
├── frontend/
│   ├── src/
│   │   ├── components/  # Các component dùng chung
│   │   ├── pages/       # Các trang chính (Dashboard, Stats, ...)
│   │   ├── store/       # Zustand stores
│   │   └── hooks/       # Custom hooks (React Query)
└── openapi.yaml         # Đặc tả API Swagger
```

