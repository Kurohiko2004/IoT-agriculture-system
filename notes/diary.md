# 23/02/2026
- connect DB using MYSQL in XAMMP:
  - turn off mysql service in Task Manager/Services
  - if using server.js to connect to DB, /models/index.js will run the else branch, read dataa in config/config.json and connect to DB (no password)
- connect DB using MYSQL in MYSQL workbench server
  - turn on mysql service in Task Manager/Services
  - connect using config/connectDB.js

# 26/02/2026
- DROP DATABASE iot_agriculture: thay vì tạo bảng trong CSDL từ đầu, tạo các models bằng sequelize rồi tiến hành migration. Lúc này, ta quản lý 
các bảng trong CSDL thông qua sequelize
- Chạy lệnh: `npx sequelize-cli model:generate --name Device --attributes name:string, type:string`, lệnh này sẽ tạo 2 file:
  - tạo model `device.js` trong `/models`
  - tạo file `XXXXXXXXXXXXXX-create-user.js` trong `/migrations`
- bổ sung các attribute còn thiếu thủ công vào file tương ứng trong /models. 
- Lưu ý:
  - không đưa id vào lệnh trên và vào trong /models; vì sau khi chạy, sẽ tạo các file trong /migrations, trong này chứa sẵn id 
  - không mô tả kỹ attribute vào /models; nếu cần thì mô tả vào trong /migrations (vd: primaryKey, allowNull,...)

# 20/03/2026:
- Query parameter: "Hãy tìm kiếm theo điều kiện này" `GET /users?role=admin&page=2&limit=10`
- Path parameter: "Tôi muốn tài nguyên cụ thể này" `GET /users/:userId`
- Body parameter: "Hãy xử lý dữ liệu này". Dùng khi upload file, đăng ký/cập nhật

```json
 POST /api/users
{
  "name": "Nguyễn Văn A",
  "email": "nguyenvana@example.com",
  "department": "Phòng phát triển",
  "skills": ["JavaScript", "Python", "Go"]
}
```