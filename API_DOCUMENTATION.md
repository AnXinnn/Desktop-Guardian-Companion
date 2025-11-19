# API 接口文档

## 快速参考

**生产环境地址**: `https://ummbivlfynon.sealosbja.site/`

**API基础路径**: `/api`

**完整API地址**: `https://ummbivlfynon.sealosbja.site/api`

---

## 基础信息

### 基础URL
```
开发环境: http://localhost:3000/api
生产环境: https://ummbivlfynon.sealosbja.site/api
```

**生产环境根地址**: `https://ummbivlfynon.sealosbja.site/`

**注意**: 
- 开发环境用于本地测试
- 生产环境用于正式部署
- 所有接口路径都需要加上 `/api` 前缀

### 请求头（Headers）
所有接口请求都需要包含以下请求头：

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| Content-Type | String | 是 | application/json | application/json |
| User-Id | String | 是* | 用户ID（从请求头获取，用于用户身份识别） | 13800138000 |

*注：登录接口和健康检查接口不需要 User-Id 请求头

### 统一响应格式

#### 成功响应
```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    // 具体数据
  }
}
```

#### 失败响应
```json
{
  "success": false,
  "message": "错误信息",
  "error": "详细错误信息（开发环境）"
}
```

### HTTP状态码
- `200`: 请求成功
- `400`: 请求参数错误
- `401`: 未授权（用户未登录）
- `404`: 接口不存在
- `500`: 服务器内部错误

---

## 接口列表

### 1. 健康检查

**接口说明**: 检查服务器是否正常运行

**请求方式**: `GET`

**接口路径**: `/api/health`

**请求头**: 无需特殊请求头

**请求参数**: 无

**请求示例**:
```bash
# 开发环境
curl -X GET http://localhost:3000/api/health

# 生产环境
curl -X GET https://ummbivlfynon.sealosbja.site/api/health
```

**成功响应** (HTTP 200):
```json
{
  "status": "ok",
  "message": "服务器运行正常"
}
```

**失败响应**: 无（此接口不会失败）

---

### 2. 用户登录/注册

**接口说明**: 用户登录或注册，返回用户ID和token

**请求方式**: `POST`

**接口路径**: `/api/auth/login`

**请求头**: 
```
Content-Type: application/json
```

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| mobile | String | 是 | 手机号码（11位数字） | "13800138000" |
| code | String | 是 | 验证码（6位数字） | "123456" |

**请求示例**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "13800138000",
    "code": "123456"
  }'
```

**JavaScript/TypeScript 示例**:
```javascript
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    mobile: '13800138000',
    code: '123456'
  })
});

const result = await response.json();
```

**成功响应** (HTTP 200):
```json
{
  "success": true,
  "data": {
    "userId": "13800138000",
    "token": "token_13800138000_1234567890"
  }
}
```

**失败响应** (HTTP 400):
```json
{
  "success": false,
  "message": "手机号和验证码不能为空"
}
```

```json
{
  "success": false,
  "message": "手机号格式错误"
}
```

```json
{
  "success": false,
  "message": "验证码格式错误"
}
```

---

### 3. 联系人相关接口

#### 3.1 同步联系人

**接口说明**: 将本地联系人数据同步到云端

**请求方式**: `POST`

**接口路径**: `/api/contacts/sync`

**请求头**: 
```
Content-Type: application/json
User-Id: 13800138000
```

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| contacts | Array | 是 | 联系人数组 |

**联系人对象结构**:

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| name | String | 是 | 联系人姓名 | "张三" |
| wxNote | String | 否 | 微信备注（需要与微信里面的备注一致） | "张三" |
| mobile | String | 是 | 手机号码（11位数字） | "13800138000" |
| icon | String | 否 | 头像URL（本地路径或网络URL） | "/static/mgc/geren.png" |
| group | String | 否 | 分组（family: 家人, friend: 朋友, doctor: 医生, other: 其他） | "family" |

**请求示例**:
```bash
curl -X POST http://localhost:3000/api/contacts/sync \
  -H "Content-Type: application/json" \
  -H "User-Id: 13800138000" \
  -d '{
    "contacts": [
      {
        "name": "张三",
        "wxNote": "张三",
        "mobile": "13800138000",
        "icon": "/static/mgc/geren.png",
        "group": "family"
      },
      {
        "name": "李四",
        "wxNote": "李四医生",
        "mobile": "13900139000",
        "icon": "",
        "group": "doctor"
      }
    ]
  }'
```

**JavaScript/TypeScript 示例**:
```javascript
const syncContacts = async (contacts, userId) => {
  const response = await fetch('http://localhost:3000/api/contacts/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Id': userId
    },
    body: JSON.stringify({ contacts })
  });
  
  const result = await response.json();
  return result;
};
```

**成功响应** (HTTP 200):
```json
{
  "success": true,
  "message": "联系人同步成功",
  "data": {
    "count": 2
  }
}
```

**失败响应** (HTTP 400):
```json
{
  "success": false,
  "message": "联系人数据格式错误"
}
```

```json
{
  "success": false,
  "message": "联系人数据格式错误：姓名和手机号不能为空"
}
```

---

#### 3.2 获取联系人

**接口说明**: 从云端获取用户的所有联系人数据

**请求方式**: `GET`

**接口路径**: `/api/contacts`

**请求头**: 
```
User-Id: 13800138000
```

**请求参数**: 无

**请求示例**:
```bash
curl -X GET http://localhost:3000/api/contacts \
  -H "User-Id: 13800138000"
```

**JavaScript/TypeScript 示例**:
```javascript
const getContacts = async (userId) => {
  const response = await fetch('http://localhost:3000/api/contacts', {
    method: 'GET',
    headers: {
      'User-Id': userId
    }
  });
  
  const result = await response.json();
  return result.data;
};
```

**成功响应** (HTTP 200):
```json
{
  "success": true,
  "data": [
    {
      "name": "张三",
      "wxNote": "张三",
      "mobile": "13800138000",
      "icon": "/static/mgc/geren.png",
      "group": "family"
    },
    {
      "name": "李四",
      "wxNote": "李四医生",
      "mobile": "13900139000",
      "icon": "",
      "group": "doctor"
    }
  ]
}
```

**失败响应**: 无（如果用户没有联系人，返回空数组）

---

### 4. 用药提醒相关接口

#### 4.1 同步用药提醒

**接口说明**: 将本地用药提醒数据同步到云端

**请求方式**: `POST`

**接口路径**: `/api/medicines/sync`

**请求头**: 
```
Content-Type: application/json
User-Id: 13800138000
```

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| medicines | Array | 是 | 用药提醒数组 |

**用药提醒对象结构**:

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| name | String | 是 | 药品名称 | "阿莫西林" |
| dosage | String | 是 | 用药剂量 | "0.5g" |
| dailyDosage | String | 否 | 每日用量备注 | "早晚各一次" |
| frequency | String | 是 | 用药频率（如：每天1次、每天2次等） | "每天2次" |
| time | String | 是 | 用药时间（如：08:00） | "08:00" |
| nextTime | String | 是 | 下次用药时间（ISO格式字符串） | "2024-01-15T08:00:00.000Z" |
| image | String | 否 | 药品图片URL | "/static/temp/medicine_123.jpg" |
| createdAt | String | 否 | 创建时间（ISO格式字符串） | "2024-01-14T10:00:00.000Z" |

**请求示例**:
```bash
curl -X POST http://localhost:3000/api/medicines/sync \
  -H "Content-Type: application/json" \
  -H "User-Id: 13800138000" \
  -d '{
    "medicines": [
      {
        "name": "阿莫西林",
        "dosage": "0.5g",
        "dailyDosage": "早晚各一次",
        "frequency": "每天2次",
        "time": "08:00",
        "nextTime": "2024-01-15T08:00:00.000Z",
        "image": "/static/temp/medicine_123.jpg",
        "createdAt": "2024-01-14T10:00:00.000Z"
      }
    ]
  }'
```

**JavaScript/TypeScript 示例**:
```javascript
const syncMedicines = async (medicines, userId) => {
  const response = await fetch('http://localhost:3000/api/medicines/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Id': userId
    },
    body: JSON.stringify({ medicines })
  });
  
  const result = await response.json();
  return result;
};
```

**成功响应** (HTTP 200):
```json
{
  "success": true,
  "message": "用药提醒同步成功",
  "data": {
    "count": 1
  }
}
```

**失败响应** (HTTP 400):
```json
{
  "success": false,
  "message": "用药提醒数据格式错误"
}
```

```json
{
  "success": false,
  "message": "用药提醒数据格式错误：必填字段不能为空"
}
```

---

#### 4.2 获取用药提醒

**接口说明**: 从云端获取用户的所有用药提醒数据

**请求方式**: `GET`

**接口路径**: `/api/medicines`

**请求头**: 
```
User-Id: 13800138000
```

**请求参数**: 无

**请求示例**:
```bash
curl -X GET http://localhost:3000/api/medicines \
  -H "User-Id: 13800138000"
```

**JavaScript/TypeScript 示例**:
```javascript
const getMedicines = async (userId) => {
  const response = await fetch('http://localhost:3000/api/medicines', {
    method: 'GET',
    headers: {
      'User-Id': userId
    }
  });
  
  const result = await response.json();
  return result.data;
};
```

**成功响应** (HTTP 200):
```json
{
  "success": true,
  "data": [
    {
      "name": "阿莫西林",
      "dosage": "0.5g",
      "dailyDosage": "早晚各一次",
      "frequency": "每天2次",
      "time": "08:00",
      "nextTime": "2024-01-15T08:00:00.000Z",
      "image": "/static/temp/medicine_123.jpg",
      "createdAt": "2024-01-14T10:00:00.000Z"
    }
  ]
}
```

**失败响应**: 无（如果用户没有用药提醒，返回空数组）

---

### 5. 用药记录相关接口

#### 5.1 同步用药记录

**接口说明**: 将本地用药记录数据同步到云端

**请求方式**: `POST`

**接口路径**: `/api/medicine-records/sync`

**请求头**: 
```
Content-Type: application/json
User-Id: 13800138000
```

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| records | Array | 是 | 用药记录数组 |

**用药记录对象结构**:

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| medicineName | String | 是 | 药品名称 | "阿莫西林" |
| dosage | String | 是 | 用药剂量 | "0.5g" |
| scheduledTime | String | 是 | 计划用药时间（ISO格式字符串） | "2024-01-15T08:00:00.000Z" |
| actualTime | String | 否 | 实际用药时间（ISO格式字符串，未用药则为空） | "2024-01-15T08:05:00.000Z" |
| status | String | 是 | 状态（taken: 已服用, skipped: 已跳过, pending: 待服用） | "taken" |
| createdAt | String | 否 | 创建时间（ISO格式字符串） | "2024-01-15T08:05:00.000Z" |

**请求示例**:
```bash
curl -X POST http://localhost:3000/api/medicine-records/sync \
  -H "Content-Type: application/json" \
  -H "User-Id: 13800138000" \
  -d '{
    "records": [
      {
        "medicineName": "阿莫西林",
        "dosage": "0.5g",
        "scheduledTime": "2024-01-15T08:00:00.000Z",
        "actualTime": "2024-01-15T08:05:00.000Z",
        "status": "taken",
        "createdAt": "2024-01-15T08:05:00.000Z"
      }
    ]
  }'
```

**JavaScript/TypeScript 示例**:
```javascript
const syncMedicineRecords = async (records, userId) => {
  const response = await fetch('http://localhost:3000/api/medicine-records/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Id': userId
    },
    body: JSON.stringify({ records })
  });
  
  const result = await response.json();
  return result;
};
```

**成功响应** (HTTP 200):
```json
{
  "success": true,
  "message": "用药记录同步成功",
  "data": {
    "count": 1
  }
}
```

**失败响应** (HTTP 400):
```json
{
  "success": false,
  "message": "用药记录数据格式错误"
}
```

```json
{
  "success": false,
  "message": "用药记录数据格式错误：必填字段不能为空"
}
```

---

### 6. 问诊记录相关接口

#### 6.1 同步问诊记录

**接口说明**: 将本地问诊记录数据同步到云端

**请求方式**: `POST`

**接口路径**: `/api/consultations/sync`

**请求头**: 
```
Content-Type: application/json
User-Id: 13800138000
```

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| consultations | Array | 是 | 问诊记录数组 |

**问诊记录对象结构**:

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| symptoms | String | 是 | 症状描述 | "头痛、发热" |
| doctorReply | String | 否 | 医生回复 | "建议多休息，多喝水" |
| prescription | String | 否 | 处方 | "阿莫西林 0.5g 每天2次" |
| image | String | 否 | 症状图片URL | "/static/temp/symptom_123.jpg" |
| rating | Number | 否 | 医生评分（1-5分） | 5 |
| createdAt | String | 否 | 创建时间（ISO格式字符串） | "2024-01-15T10:00:00.000Z" |

**请求示例**:
```bash
curl -X POST http://localhost:3000/api/consultations/sync \
  -H "Content-Type: application/json" \
  -H "User-Id: 13800138000" \
  -d '{
    "consultations": [
      {
        "symptoms": "头痛、发热",
        "doctorReply": "建议多休息，多喝水",
        "prescription": "阿莫西林 0.5g 每天2次",
        "image": "/static/temp/symptom_123.jpg",
        "rating": 5,
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ]
  }'
```

**JavaScript/TypeScript 示例**:
```javascript
const syncConsultations = async (consultations, userId) => {
  const response = await fetch('http://localhost:3000/api/consultations/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Id': userId
    },
    body: JSON.stringify({ consultations })
  });
  
  const result = await response.json();
  return result;
};
```

**成功响应** (HTTP 200):
```json
{
  "success": true,
  "message": "问诊记录同步成功",
  "data": {
    "count": 1
  }
}
```

**失败响应** (HTTP 400):
```json
{
  "success": false,
  "message": "问诊记录数据格式错误"
}
```

```json
{
  "success": false,
  "message": "问诊记录数据格式错误：症状描述不能为空"
}
```

---

#### 6.2 获取问诊记录

**接口说明**: 从云端获取用户的所有问诊记录数据

**请求方式**: `GET`

**接口路径**: `/api/consultations`

**请求头**: 
```
User-Id: 13800138000
```

**请求参数**: 无

**请求示例**:
```bash
curl -X GET http://localhost:3000/api/consultations \
  -H "User-Id: 13800138000"
```

**JavaScript/TypeScript 示例**:
```javascript
const getConsultations = async (userId) => {
  const response = await fetch('http://localhost:3000/api/consultations', {
    method: 'GET',
    headers: {
      'User-Id': userId
    }
  });
  
  const result = await response.json();
  return result.data;
};
```

**成功响应** (HTTP 200):
```json
{
  "success": true,
  "data": [
    {
      "symptoms": "头痛、发热",
      "doctorReply": "建议多休息，多喝水",
      "prescription": "阿莫西林 0.5g 每天2次",
      "image": "/static/temp/symptom_123.jpg",
      "rating": 5,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

**失败响应**: 无（如果用户没有问诊记录，返回空数组）

---

### 7. 通话记录相关接口

#### 7.1 同步通话记录

**接口说明**: 将本地通话记录数据同步到云端

**请求方式**: `POST`

**接口路径**: `/api/call-records/sync`

**请求头**: 
```
Content-Type: application/json
User-Id: 13800138000
```

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| records | Array | 是 | 通话记录数组 |

**通话记录对象结构**:

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| name | String | 是 | 联系人姓名 | "张三" |
| wxNote | String | 否 | 微信备注 | "张三" |
| mobile | String | 是 | 手机号码 | "13800138000" |
| icon | String | 否 | 头像URL | "/static/mgc/geren.png" |
| time | String | 是 | 通话时间（本地化字符串，如：2024/1/15 10:30:00） | "2024/1/15 10:30:00" |
| type | String | 是 | 通话类型（outgoing: 拨出, incoming: 来电, missed: 未接） | "outgoing" |

**请求示例**:
```bash
curl -X POST http://localhost:3000/api/call-records/sync \
  -H "Content-Type: application/json" \
  -H "User-Id: 13800138000" \
  -d '{
    "records": [
      {
        "name": "张三",
        "wxNote": "张三",
        "mobile": "13800138000",
        "icon": "/static/mgc/geren.png",
        "time": "2024/1/15 10:30:00",
        "type": "outgoing"
      }
    ]
  }'
```

**JavaScript/TypeScript 示例**:
```javascript
const syncCallRecords = async (records, userId) => {
  const response = await fetch('http://localhost:3000/api/call-records/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Id': userId
    },
    body: JSON.stringify({ records })
  });
  
  const result = await response.json();
  return result;
};
```

**成功响应** (HTTP 200):
```json
{
  "success": true,
  "message": "通话记录同步成功",
  "data": {
    "count": 1
  }
}
```

**失败响应** (HTTP 400):
```json
{
  "success": false,
  "message": "通话记录数据格式错误"
}
```

```json
{
  "success": false,
  "message": "通话记录数据格式错误：必填字段不能为空"
}
```

---

#### 7.2 获取通话记录

**接口说明**: 从云端获取用户的所有通话记录数据

**请求方式**: `GET`

**接口路径**: `/api/call-records`

**请求头**: 
```
User-Id: 13800138000
```

**请求参数**: 无

**请求示例**:
```bash
curl -X GET http://localhost:3000/api/call-records \
  -H "User-Id: 13800138000"
```

**JavaScript/TypeScript 示例**:
```javascript
const getCallRecords = async (userId) => {
  const response = await fetch('http://localhost:3000/api/call-records', {
    method: 'GET',
    headers: {
      'User-Id': userId
    }
  });
  
  const result = await response.json();
  return result.data;
};
```

**成功响应** (HTTP 200):
```json
{
  "success": true,
  "data": [
    {
      "name": "张三",
      "wxNote": "张三",
      "mobile": "13800138000",
      "icon": "/static/mgc/geren.png",
      "time": "2024/1/15 10:30:00",
      "type": "outgoing"
    }
  ]
}
```

**失败响应**: 无（如果用户没有通话记录，返回空数组）

---

### 8. 数据备份接口

**接口说明**: 一次性备份用户的所有数据到云端

**请求方式**: `POST`

**接口路径**: `/api/backup`

**请求头**: 
```
Content-Type: application/json
User-Id: 13800138000
```

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| contacts | Array | 否 | 联系人数组（可选） |
| medicines | Array | 否 | 用药提醒数组（可选） |
| consultations | Array | 否 | 问诊记录数组（可选） |
| callRecords | Array | 否 | 通话记录数组（可选） |

**请求示例**:
```bash
curl -X POST http://localhost:3000/api/backup \
  -H "Content-Type: application/json" \
  -H "User-Id: 13800138000" \
  -d '{
    "contacts": [
      {
        "name": "张三",
        "mobile": "13800138000",
        "wxNote": "张三",
        "icon": "/static/mgc/geren.png",
        "group": "family"
      }
    ],
    "medicines": [
      {
        "name": "阿莫西林",
        "dosage": "0.5g",
        "frequency": "每天2次",
        "time": "08:00",
        "nextTime": "2024-01-15T08:00:00.000Z"
      }
    ],
    "consultations": [],
    "callRecords": []
  }'
```

**JavaScript/TypeScript 示例**:
```javascript
const backupData = async (data, userId) => {
  const response = await fetch('http://localhost:3000/api/backup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Id': userId
    },
    body: JSON.stringify(data)
  });
  
  const result = await response.json();
  return result;
};
```

**成功响应** (HTTP 200):
```json
{
  "success": true,
  "message": "数据备份成功",
  "data": {
    "timestamp": "2024-01-15T10:00:00.000Z"
  }
}
```

**失败响应**: 通常不会失败，如果失败会返回服务器错误

---

### 9. 数据恢复接口

**接口说明**: 从云端恢复用户的所有数据

**请求方式**: `GET`

**接口路径**: `/api/restore`

**请求头**: 
```
User-Id: 13800138000
```

**请求参数**: 无

**请求示例**:
```bash
curl -X GET http://localhost:3000/api/restore \
  -H "User-Id: 13800138000"
```

**JavaScript/TypeScript 示例**:
```javascript
const restoreData = async (userId) => {
  const response = await fetch('http://localhost:3000/api/restore', {
    method: 'GET',
    headers: {
      'User-Id': userId
    }
  });
  
  const result = await response.json();
  return result.data;
};
```

**成功响应** (HTTP 200):
```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "name": "张三",
        "mobile": "13800138000",
        "wxNote": "张三",
        "icon": "/static/mgc/geren.png",
        "group": "family"
      }
    ],
    "medicines": [
      {
        "name": "阿莫西林",
        "dosage": "0.5g",
        "frequency": "每天2次",
        "time": "08:00",
        "nextTime": "2024-01-15T08:00:00.000Z"
      }
    ],
    "consultations": [
      {
        "symptoms": "头痛、发热",
        "doctorReply": "建议多休息",
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "callRecords": [
      {
        "name": "张三",
        "mobile": "13800138000",
        "time": "2024/1/15 10:30:00",
        "type": "outgoing"
      }
    ]
  }
}
```

**失败响应**: 通常不会失败，如果失败会返回服务器错误

---

## 错误码说明

### 常见错误响应

#### 400 Bad Request - 请求参数错误
```json
{
  "success": false,
  "message": "参数错误",
  "error": "详细错误信息（开发环境）"
}
```

常见原因：
- 缺少必填参数
- 参数格式错误
- 数据类型不匹配

#### 401 Unauthorized - 未授权
```json
{
  "success": false,
  "message": "未授权",
  "error": "用户未登录或token无效"
}
```

常见原因：
- 缺少 User-Id 请求头
- Token 过期或无效

#### 404 Not Found - 接口不存在
```json
{
  "success": false,
  "message": "接口不存在"
}
```

常见原因：
- 接口路径错误
- HTTP 方法错误（GET/POST）

#### 500 Internal Server Error - 服务器内部错误
```json
{
  "success": false,
  "message": "服务器内部错误",
  "error": "详细错误信息（开发环境）"
}
```

常见原因：
- 数据库连接失败
- 服务器内部异常

---

## 前端对接示例代码

### 完整的 API 封装示例

```javascript
// api.js - API 封装文件

// 根据环境变量自动切换API地址
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://ummbivlfynon.sealosbja.site/api'
  : 'http://localhost:3000/api';

// 或者手动配置（推荐）
// const API_BASE_URL = 'https://ummbivlfynon.sealosbja.site/api'; // 生产环境
// const API_BASE_URL = 'http://localhost:3000/api'; // 开发环境

// 获取用户ID（从本地存储或登录信息中获取）
const getUserId = () => {
  return localStorage.getItem('userId') || 'default';
};

// 通用请求方法
const request = async (url, options = {}) => {
  const userId = getUserId();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'User-Id': userId
  };
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || '请求失败');
    }
    
    return result;
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
  }
};

// 1. 用户登录
export const login = async (mobile, code) => {
  return request('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
      // 注意：登录接口不需要 User-Id
    },
    body: JSON.stringify({ mobile, code })
  });
};

// 2. 联系人相关
export const syncContacts = async (contacts) => {
  return request('/contacts/sync', {
    method: 'POST',
    body: JSON.stringify({ contacts })
  });
};

export const getContacts = async () => {
  const result = await request('/contacts', {
    method: 'GET'
  });
  return result.data;
};

// 3. 用药提醒相关
export const syncMedicines = async (medicines) => {
  return request('/medicines/sync', {
    method: 'POST',
    body: JSON.stringify({ medicines })
  });
};

export const getMedicines = async () => {
  const result = await request('/medicines', {
    method: 'GET'
  });
  return result.data;
};

// 4. 用药记录相关
export const syncMedicineRecords = async (records) => {
  return request('/medicine-records/sync', {
    method: 'POST',
    body: JSON.stringify({ records })
  });
};

// 5. 问诊记录相关
export const syncConsultations = async (consultations) => {
  return request('/consultations/sync', {
    method: 'POST',
    body: JSON.stringify({ consultations })
  });
};

export const getConsultations = async () => {
  const result = await request('/consultations', {
    method: 'GET'
  });
  return result.data;
};

// 6. 通话记录相关
export const syncCallRecords = async (records) => {
  return request('/call-records/sync', {
    method: 'POST',
    body: JSON.stringify({ records })
  });
};

export const getCallRecords = async () => {
  const result = await request('/call-records', {
    method: 'GET'
  });
  return result.data;
};

// 7. 数据备份和恢复
export const backupData = async (data) => {
  return request('/backup', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const restoreData = async () => {
  const result = await request('/restore', {
    method: 'GET'
  });
  return result.data;
};

// 8. 健康检查
export const healthCheck = async () => {
  return fetch(`${API_BASE_URL}/health`).then(res => res.json());
};
```

### 使用示例

```javascript
// 在组件中使用
import { login, syncContacts, getContacts, backupData } from './api';

// 登录
try {
  const loginResult = await login('13800138000', '123456');
  localStorage.setItem('userId', loginResult.data.userId);
  localStorage.setItem('token', loginResult.data.token);
  console.log('登录成功', loginResult);
} catch (error) {
  console.error('登录失败', error.message);
}

// 同步联系人
try {
  const contacts = [
    { name: '张三', mobile: '13800138000', group: 'family' }
  ];
  const result = await syncContacts(contacts);
  console.log('同步成功', result);
} catch (error) {
  console.error('同步失败', error.message);
}

// 获取联系人
try {
  const contacts = await getContacts();
  console.log('联系人列表', contacts);
} catch (error) {
  console.error('获取失败', error.message);
}

// 数据备份
try {
  const backupResult = await backupData({
    contacts: [...],
    medicines: [...],
    consultations: [...],
    callRecords: [...]
  });
  console.log('备份成功', backupResult);
} catch (error) {
  console.error('备份失败', error.message);
}
```

---

## 注意事项

1. **User-Id 请求头**：
   - 除了登录接口和健康检查接口外，所有接口都需要在请求头中包含 `User-Id`
   - `User-Id` 通常是用户手机号，登录后从响应中获取

2. **数据同步策略**：
   - 同步接口会先删除用户的所有现有数据，然后插入新数据
   - 联系人同步使用 upsert 操作，避免重复数据
   - 建议在同步前先调用获取接口，进行数据合并

3. **时间格式**：
   - 所有时间字段使用 ISO 8601 格式：`2024-01-15T08:00:00.000Z`
   - 通话记录的时间字段使用本地化字符串格式：`2024/1/15 10:30:00`

4. **错误处理**：
   - 所有接口都应该进行 try-catch 错误处理
   - 检查响应的 `success` 字段判断是否成功
   - 根据 HTTP 状态码和错误信息进行相应处理

5. **数据验证**：
   - 前端应该进行基本的数据验证后再发送请求
   - 手机号必须是11位数字
   - 验证码必须是6位数字
   - 必填字段不能为空

---

## 更新日志

- 2024-01-15: 初始版本，包含所有基础接口

---

## 联系方式

如有疑问，请联系后端开发团队。

