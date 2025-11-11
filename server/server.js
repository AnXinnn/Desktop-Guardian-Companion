const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 连接MongoDB（如果没有MongoDB，可以使用内存存储）
let db = {
  users: [],
  contacts: [],
  medicines: [],
  consultations: [],
  callRecords: []
};

// 数据模型（简化版，实际应该使用MongoDB）
class DataStore {
  constructor() {
    this.data = {
      users: new Map(),
      contacts: new Map(),
      medicines: new Map(),
      consultations: new Map(),
      callRecords: new Map()
    };
  }

  // 用户相关
  saveUser(userId, userData) {
    this.data.users.set(userId, { ...userData, userId, updatedAt: new Date() });
  }

  getUser(userId) {
    return this.data.users.get(userId);
  }

  // 联系人相关
  saveContacts(userId, contacts) {
    this.data.contacts.set(userId, contacts);
  }

  getContacts(userId) {
    return this.data.contacts.get(userId) || [];
  }

  // 用药提醒相关
  saveMedicines(userId, medicines) {
    this.data.medicines.set(userId, medicines);
  }

  getMedicines(userId) {
    return this.data.medicines.get(userId) || [];
  }

  // 问诊相关
  saveConsultations(userId, consultations) {
    this.data.consultations.set(userId, consultations);
  }

  getConsultations(userId) {
    return this.data.consultations.get(userId) || [];
  }

  // 通话记录相关
  saveCallRecords(userId, records) {
    this.data.callRecords.set(userId, records);
  }

  getCallRecords(userId) {
    return this.data.callRecords.get(userId) || [];
  }
}

const dataStore = new DataStore();

// 中间件：验证用户（简化版）
const authenticateUser = (req, res, next) => {
  const userId = req.headers['user-id'] || req.body.userId || 'default';
  req.userId = userId;
  next();
};

// 路由

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '服务器运行正常' });
});

// 用户登录/注册
app.post('/api/auth/login', (req, res) => {
  const { mobile, code } = req.body;
  
  if (!mobile || !code) {
    return res.status(400).json({ success: false, message: '手机号和验证码不能为空' });
  }

  // 简化版：直接返回用户ID
  const userId = mobile;
  const userData = {
    mobile,
    userId,
    createdAt: new Date(),
    lastLoginAt: new Date()
  };
  
  dataStore.saveUser(userId, userData);
  
  res.json({
    success: true,
    data: {
      userId,
      token: `token_${userId}_${Date.now()}`
    }
  });
});

// 同步联系人
app.post('/api/contacts/sync', authenticateUser, (req, res) => {
  const { contacts } = req.body;
  const userId = req.userId;
  
  if (!Array.isArray(contacts)) {
    return res.status(400).json({ success: false, message: '联系人数据格式错误' });
  }

  dataStore.saveContacts(userId, contacts);
  
  res.json({
    success: true,
    message: '联系人同步成功',
    data: { count: contacts.length }
  });
});

app.get('/api/contacts', authenticateUser, (req, res) => {
  const userId = req.userId;
  const contacts = dataStore.getContacts(userId);
  
  res.json({
    success: true,
    data: contacts
  });
});

// 同步用药提醒
app.post('/api/medicines/sync', authenticateUser, (req, res) => {
  const { medicines } = req.body;
  const userId = req.userId;
  
  if (!Array.isArray(medicines)) {
    return res.status(400).json({ success: false, message: '用药提醒数据格式错误' });
  }

  dataStore.saveMedicines(userId, medicines);
  
  res.json({
    success: true,
    message: '用药提醒同步成功',
    data: { count: medicines.length }
  });
});

app.get('/api/medicines', authenticateUser, (req, res) => {
  const userId = req.userId;
  const medicines = dataStore.getMedicines(userId);
  
  res.json({
    success: true,
    data: medicines
  });
});

// 同步用药记录
app.post('/api/medicine-records/sync', authenticateUser, (req, res) => {
  const { records } = req.body;
  const userId = req.userId;
  
  if (!Array.isArray(records)) {
    return res.status(400).json({ success: false, message: '用药记录数据格式错误' });
  }

  // 这里可以保存到数据库
  res.json({
    success: true,
    message: '用药记录同步成功',
    data: { count: records.length }
  });
});

// 同步问诊记录
app.post('/api/consultations/sync', authenticateUser, (req, res) => {
  const { consultations } = req.body;
  const userId = req.userId;
  
  if (!Array.isArray(consultations)) {
    return res.status(400).json({ success: false, message: '问诊记录数据格式错误' });
  }

  dataStore.saveConsultations(userId, consultations);
  
  res.json({
    success: true,
    message: '问诊记录同步成功',
    data: { count: consultations.length }
  });
});

app.get('/api/consultations', authenticateUser, (req, res) => {
  const userId = req.userId;
  const consultations = dataStore.getConsultations(userId);
  
  res.json({
    success: true,
    data: consultations
  });
});

// 同步通话记录
app.post('/api/call-records/sync', authenticateUser, (req, res) => {
  const { records } = req.body;
  const userId = req.userId;
  
  if (!Array.isArray(records)) {
    return res.status(400).json({ success: false, message: '通话记录数据格式错误' });
  }

  dataStore.saveCallRecords(userId, records);
  
  res.json({
    success: true,
    message: '通话记录同步成功',
    data: { count: records.length }
  });
});

app.get('/api/call-records', authenticateUser, (req, res) => {
  const userId = req.userId;
  const records = dataStore.getCallRecords(userId);
  
  res.json({
    success: true,
    data: records
  });
});

// 数据备份
app.post('/api/backup', authenticateUser, (req, res) => {
  const userId = req.userId;
  const { contacts, medicines, consultations, callRecords } = req.body;
  
  if (contacts) dataStore.saveContacts(userId, contacts);
  if (medicines) dataStore.saveMedicines(userId, medicines);
  if (consultations) dataStore.saveConsultations(userId, consultations);
  if (callRecords) dataStore.saveCallRecords(userId, callRecords);
  
  res.json({
    success: true,
    message: '数据备份成功',
    data: {
      timestamp: new Date().toISOString()
    }
  });
});

// 数据恢复
app.get('/api/restore', authenticateUser, (req, res) => {
  const userId = req.userId;
  
  res.json({
    success: true,
    data: {
      contacts: dataStore.getContacts(userId),
      medicines: dataStore.getMedicines(userId),
      consultations: dataStore.getConsultations(userId),
      callRecords: dataStore.getCallRecords(userId)
    }
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`API文档: http://localhost:${PORT}/api/health`);
});

module.exports = app;

