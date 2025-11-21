function getApiEnv() {
  try {
    const manualEnv = uni.getStorageSync('apiEnv');
    if (manualEnv === 'dev') {
      return 'dev';
    } else if (manualEnv === 'prod') {
      return 'prod';
    }
  } catch (e) {
    console.warn('获取API环境设置失败:', e);
  }

  // #ifdef H5
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'dev';
    }
  }
  // #endif

  return 'prod';
}

let _isDev = null;
let _API_BASE_URL = null;

function initApiConfig() {
  if (_isDev !== null) {
    return;
  }

  try {
    const env = getApiEnv();
    _isDev = env === 'dev';
    _API_BASE_URL = _isDev
      ? 'http://localhost:3000/api'
      : 'https://nrrnwtcqsyif.sealosbja.site/api';

    console.log('API_BASE_URL:', _API_BASE_URL, 'isDev:', _isDev);
  } catch (e) {
    console.error('初始化API配置失败:', e);
    _isDev = false;
    _API_BASE_URL = 'https://nrrnwtcqsyif.sealosbja.site/api';
  }
}

function _getApiBaseUrlInternal() {
  if (_API_BASE_URL === null) {
    initApiConfig();
  }
  return _API_BASE_URL;
}

try {
  initApiConfig();
} catch (e) {
  console.warn('API配置初始化失败，使用默认配置:', e);
  _isDev = false;
  _API_BASE_URL = 'https://nrrnwtcqsyif.sealosbja.site/api';
}

const API_BASE_URL = _getApiBaseUrlInternal();

function getUserId() {
  const users = uni.getStorageSync('users') || {};
  const userId = uni.getStorageSync('userId');
  return userId || users.mobile || 'default';
}

function request(options) {
  return new Promise((resolve, reject) => {
    const userId = getUserId();
    const needUserId = !options.skipAuth && options.url !== '/health' && options.url !== '/auth/login';

    const headers = {
      'Content-Type': 'application/json',
      ...options.header
    };

    if (needUserId) {
      headers['User-Id'] = userId;
    }

    const baseUrl = _getApiBaseUrlInternal();
    const fullUrl = baseUrl + options.url;
    console.log(`[API请求] ${options.method || 'GET'} ${fullUrl}`, options.data || '');

    uni.request({
      url: fullUrl,
      method: options.method || 'GET',
      header: headers,
      data: options.data || {},
      timeout: options.timeout || 30000,
      success: (res) => {
        console.log(`[API响应] ${fullUrl}`, res.statusCode, res.data);

        if (res.statusCode === 200) {
          if (res.data.success !== undefined) {
            if (res.data.success) {
              resolve(res.data);
            } else {
              reject(new Error(res.data.message || '请求失败'));
            }
          } else {
            resolve(res.data);
          }
        } else if (res.statusCode === 400) {
          reject(new Error(res.data.message || '请求参数错误'));
        } else if (res.statusCode === 401) {
          reject(new Error(res.data.message || '未授权，请重新登录'));
        } else if (res.statusCode === 404) {
          const errorMsg = res.data && res.data.message
            ? res.data.message
            : `接口不存在: ${fullUrl}`;
          console.error('[404错误]', errorMsg);
          reject(new Error(errorMsg));
        } else if (res.statusCode >= 500) {
          reject(new Error(res.data.message || '服务器内部错误'));
        } else {
          reject(new Error(res.data.message || `请求失败 (${res.statusCode})`));
        }
      },
      fail: (err) => {
        console.error('[API请求失败]', fullUrl, err);

        if (err.errMsg && (err.errMsg.includes('timeout') || err.errMsg.includes('超时') || err.errMsg.includes('time out'))) {
          const timeoutMsg = options.silent
            ? '连接超时'
            : `连接服务器超时，请检查网络连接或稍后重试\n${fullUrl}`;
          reject(new Error(timeoutMsg));
          return;
        }

        if (err.errMsg && err.errMsg.includes('404')) {
          reject(new Error(`接口不存在: ${fullUrl}\n请检查后端服务是否正常运行`));
        } else if (err.errMsg && err.errMsg.includes('fail')) {
          const networkMsg = options.silent
            ? '网络连接失败'
            : `网络连接失败，请检查网络设置\n${err.errMsg}`;
          reject(new Error(networkMsg));
        } else {
          reject(new Error(err.errMsg || '网络请求失败，请检查网络连接'));
        }
      }
    });
  });
}

const api = {
  healthCheck() {
    return request({
      url: '/health',
      skipAuth: true
    });
  },

  login(mobile, code) {
    return request({
      url: '/auth/login',
      method: 'POST',
      data: { mobile, code },
      skipAuth: true
    });
  },

  syncContacts(contacts, silent = false) {
    return request({
      url: '/contacts/sync',
      method: 'POST',
      data: { contacts },
      silent: silent
    });
  },

  getContacts(silent = false) {
    return request({
      url: '/contacts',
      silent: silent
    });
  },

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

  syncMedicineRecords(records, silent = false) {
    return request({
      url: '/medicine-records/sync',
      method: 'POST',
      data: { records },
      silent: silent
    });
  },

  syncConsultations(consultations, silent = false) {
    return request({
      url: '/consultations/sync',
      method: 'POST',
      data: { consultations },
      silent: silent
    });
  },

  getConsultations(silent = false) {
    return request({
      url: '/consultations',
      silent: silent
    });
  },

  syncCallRecords(records, silent = false) {
    return request({
      url: '/call-records/sync',
      method: 'POST',
      data: { records },
      silent: silent
    });
  },

  getCallRecords(silent = false) {
    return request({
      url: '/call-records',
      silent: silent
    });
  },

  backup(data) {
    return request({
      url: '/backup',
      method: 'POST',
      data
    });
  },

  restore() {
    return request({ url: '/restore' });
  }
};

const syncUtils = {
  async syncAll() {
    try {
      const contacts = uni.getStorageSync('contacts') || [];
      const medicines = uni.getStorageSync('medicineList') || [];
      const consultations = uni.getStorageSync('consultationHistory') || [];
      const callRecords = uni.getStorageSync('callRecords') || [];
      const medicineRecords = uni.getStorageSync('medicineRecords') || [];

      await Promise.all([
        api.syncContacts(contacts, true).catch(e => console.warn('同步联系人失败:', e)),
        api.syncMedicines(medicines, true).catch(e => console.warn('同步药品列表失败:', e)),
        api.syncConsultations(consultations, true).catch(e => console.warn('同步咨询记录失败:', e)),
        api.syncCallRecords(callRecords, true).catch(e => console.warn('同步通话记录失败:', e)),
        api.syncMedicineRecords(medicineRecords, true).catch(e => console.warn('同步药品记录失败:', e))
      ]);

      uni.showToast({ title: '数据同步成功', icon: 'success' });
      return true;
    } catch (error) {
      console.error('数据同步失败:', error);
      if (error.message && error.message.includes('404')) {
        uni.showToast({
          title: '后端服务未启动，数据已保存在本地',
          icon: 'none',
          duration: 3000
        });
      } else {
        uni.showToast({
          title: error.message || '数据同步失败',
          icon: 'none',
          duration: 3000
        });
      }
      return false;
    }
  },

  async restoreAll() {
    try {
      const result = await api.restore();
      const { contacts, medicines, consultations, callRecords, medicineRecords } = result.data || {};

      if (contacts && Array.isArray(contacts)) {
        uni.setStorageSync('contacts', contacts);
      }
      if (medicines && Array.isArray(medicines)) {
        uni.setStorageSync('medicineList', medicines);
      }
      if (consultations && Array.isArray(consultations)) {
        uni.setStorageSync('consultationHistory', consultations);
      }
      if (callRecords && Array.isArray(callRecords)) {
        uni.setStorageSync('callRecords', callRecords);
      }
      if (medicineRecords && Array.isArray(medicineRecords)) {
        uni.setStorageSync('medicineRecords', medicineRecords);
      }

      uni.showToast({ title: '数据恢复成功', icon: 'success' });
      return true;
    } catch (error) {
      console.error('数据恢复失败:', error);
      if (error.message && error.message.includes('404')) {
        uni.showToast({
          title: '后端服务未启动或接口不存在',
          icon: 'none',
          duration: 3000
        });
      } else {
        uni.showToast({
          title: error.message || '数据恢复失败',
          icon: 'none',
          duration: 3000
        });
      }
      return false;
    }
  },

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
      if (error.message && error.message.includes('404')) {
        uni.showToast({
          title: '后端服务未启动，数据已保存在本地',
          icon: 'none',
          duration: 3000
        });
      } else {
        uni.showToast({
          title: error.message || '数据备份失败',
          icon: 'none',
          duration: 3000
        });
      }
      return false;
    }
  },

  async syncContacts(contacts) {
    try {
      await api.syncContacts(contacts);
      return true;
    } catch (error) {
      console.error('联系人同步失败:', error);
      return false;
    }
  }
};

export const getApiBaseUrl = () => {
  return _getApiBaseUrlInternal();
};

export const setApiEnv = (env) => {
  if (env === 'dev' || env === 'prod') {
    try {
      uni.setStorageSync('apiEnv', env);
      _isDev = null;
      _API_BASE_URL = null;
      initApiConfig();
      console.log('API环境已切换为:', env);
      uni.showToast({
        title: `API环境已切换为${env === 'dev' ? '开发' : '生产'}`,
        icon: 'none'
      });
    } catch (e) {
      console.error('设置API环境失败:', e);
    }
  }
};

export default {
  api,
  syncUtils
};

