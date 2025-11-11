/**
 * API工具类 - 用于与后端服务通信
 */

const API_BASE_URL = 'http://localhost:3000/api'; // 开发环境，生产环境需要修改

// 获取用户ID（从本地存储）
function getUserId() {
  const users = uni.getStorageSync('users') || {};
  return users.mobile || 'default';
}

// 通用请求方法
function request(options) {
  return new Promise((resolve, reject) => {
    const userId = getUserId();
    
    uni.request({
      url: API_BASE_URL + options.url,
      method: options.method || 'GET',
      header: {
        'Content-Type': 'application/json',
        'User-Id': userId,
        ...options.header
      },
      data: options.data || {},
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          resolve(res.data);
        } else {
          reject(new Error(res.data.message || '请求失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

// API接口
const api = {
  // 健康检查
  healthCheck() {
    return request({ url: '/health' });
  },

  // 用户登录
  login(mobile, code) {
    return request({
      url: '/auth/login',
      method: 'POST',
      data: { mobile, code }
    });
  },

  // 联系人相关
  syncContacts(contacts) {
    return request({
      url: '/contacts/sync',
      method: 'POST',
      data: { contacts }
    });
  },

  getContacts() {
    return request({ url: '/contacts' });
  },

  // 用药提醒相关
  syncMedicines(medicines) {
    return request({
      url: '/medicines/sync',
      method: 'POST',
      data: { medicines }
    });
  },

  getMedicines() {
    return request({ url: '/medicines' });
  },

  // 用药记录相关
  syncMedicineRecords(records) {
    return request({
      url: '/medicine-records/sync',
      method: 'POST',
      data: { records }
    });
  },

  // 问诊相关
  syncConsultations(consultations) {
    return request({
      url: '/consultations/sync',
      method: 'POST',
      data: { consultations }
    });
  },

  getConsultations() {
    return request({ url: '/consultations' });
  },

  // 通话记录相关
  syncCallRecords(records) {
    return request({
      url: '/call-records/sync',
      method: 'POST',
      data: { records }
    });
  },

  getCallRecords() {
    return request({ url: '/call-records' });
  },

  // 数据备份
  backup(data) {
    return request({
      url: '/backup',
      method: 'POST',
      data
    });
  },

  // 数据恢复
  restore() {
    return request({ url: '/restore' });
  }
};

// 数据同步工具类
const syncUtils = {
  // 同步所有数据到云端
  async syncAll() {
    try {
      const contacts = uni.getStorageSync('contacts') || [];
      const medicines = uni.getStorageSync('medicineList') || [];
      const consultations = uni.getStorageSync('consultationHistory') || [];
      const callRecords = uni.getStorageSync('callRecords') || [];
      const medicineRecords = uni.getStorageSync('medicineRecords') || [];

      await Promise.all([
        api.syncContacts(contacts),
        api.syncMedicines(medicines),
        api.syncConsultations(consultations),
        api.syncCallRecords(callRecords),
        api.syncMedicineRecords(medicineRecords)
      ]);

      uni.showToast({ title: '数据同步成功', icon: 'success' });
      return true;
    } catch (error) {
      console.error('数据同步失败:', error);
      uni.showToast({ title: '数据同步失败', icon: 'none' });
      return false;
    }
  },

  // 从云端恢复数据
  async restoreAll() {
    try {
      const result = await api.restore();
      const { contacts, medicines, consultations, callRecords } = result.data;

      if (contacts) uni.setStorageSync('contacts', contacts);
      if (medicines) uni.setStorageSync('medicineList', medicines);
      if (consultations) uni.setStorageSync('consultationHistory', consultations);
      if (callRecords) uni.setStorageSync('callRecords', callRecords);

      uni.showToast({ title: '数据恢复成功', icon: 'success' });
      return true;
    } catch (error) {
      console.error('数据恢复失败:', error);
      uni.showToast({ title: '数据恢复失败', icon: 'none' });
      return false;
    }
  },

  // 备份数据
  async backup() {
    try {
      const data = {
        contacts: uni.getStorageSync('contacts') || [],
        medicines: uni.getStorageSync('medicineList') || [],
        consultations: uni.getStorageSync('consultationHistory') || [],
        callRecords: uni.getStorageSync('callRecords') || []
      };

      await api.backup(data);
      uni.showToast({ title: '数据备份成功', icon: 'success' });
      return true;
    } catch (error) {
      console.error('数据备份失败:', error);
      uni.showToast({ title: '数据备份失败', icon: 'none' });
      return false;
    }
  }
};

export default {
  api,
  syncUtils
};

