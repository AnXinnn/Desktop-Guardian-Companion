# 陪伴桌面守护后端服务

基于 Node.js + Express 的后端API服务，提供数据同步、备份和恢复功能。

## 功能特性

- ? 用户登录/注册
- ? 联系人数据同步
- ? 用药提醒数据同步
- ? 用药记录同步
- ? 问诊记录同步
- ? 通话记录同步
- ? 数据备份和恢复
- ? RESTful API设计

## 安装和运行

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

### 3. 启动服务

开发环境（自动重启）：
```bash
npm run dev
```

生产环境：
```bash
npm start
```

服务将在 `http://localhost:3000` 启动

## API接口文档

### 基础URL
```
http://localhost:3000/api
```

### 请求头
```
Content-Type: application/json
User-Id: {userId}  // 用户ID（简化版认证）
```

### 接口列表

#### 1. 健康检查
```
GET /api/health
```

#### 2. 用户登录
```
POST /api/auth/login
Body: {
  "mobile": "13800138000",
  "code": "123456"
}
```

#### 3. 同步联系人
```
POST /api/contacts/sync
Body: {
  "contacts": [...]
}

GET /api/contacts
```

#### 4. 同步用药提醒
```
POST /api/medicines/sync
Body: {
  "medicines": [...]
}

GET /api/medicines
```

#### 5. 同步用药记录
```
POST /api/medicine-records/sync
Body: {
  "records": [...]
}
```

#### 6. 同步问诊记录
```
POST /api/consultations/sync
Body: {
  "consultations": [...]
}

GET /api/consultations
```

#### 7. 同步通话记录
```
POST /api/call-records/sync
Body: {
  "records": [...]
}

GET /api/call-records
```

#### 8. 数据备份
```
POST /api/backup
Body: {
  "contacts": [...],
  "medicines": [...],
  "consultations": [...],
  "callRecords": [...]
}
```

#### 9. 数据恢复
```
GET /api/restore
```

## 前端集成示例

```javascript
// 同步联系人到云端
uni.request({
  url: 'http://localhost:3000/api/contacts/sync',
  method: 'POST',
  header: {
    'Content-Type': 'application/json',
    'User-Id': userId
  },
  data: {
    contacts: contactsList
  },
  success: (res) => {
    console.log('同步成功', res.data);
  }
});

// 从云端恢复数据
uni.request({
  url: 'http://localhost:3000/api/restore',
  method: 'GET',
  header: {
    'User-Id': userId
  },
  success: (res) => {
    const { contacts, medicines, consultations, callRecords } = res.data.data;
    // 恢复本地数据
    uni.setStorageSync('contacts', contacts);
    uni.setStorageSync('medicineList', medicines);
    // ...
  }
});
```

## 注意事项

1. 当前版本使用内存存储，重启服务器后数据会丢失
2. 生产环境建议使用 MongoDB 或其他数据库
3. 需要实现真正的JWT认证机制
4. 需要添加数据加密功能
5. 需要添加请求频率限制

## 后续优化

- [ ] 集成 MongoDB 数据库
- [ ] 实现 JWT 认证
- [ ] 添加数据加密
- [ ] 添加请求日志
- [ ] 添加错误监控
- [ ] 添加API文档（Swagger）

