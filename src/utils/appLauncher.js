/**
 * 应用启动器工具类 - 用于获取和管理已安装应用
 */

// 应用分类映射
const APP_CATEGORIES = {
  '社交': ['微信', 'QQ', '微博', '抖音', '快手', '小红书', '知乎', '贴吧', '陌陌', '探探'],
  '工具': ['设置', '文件管理', '下载', '浏览器', '应用商店', '安全中心', '清理', '优化'],
  '娱乐': ['音乐', '视频', '游戏', '阅读', '直播', 'K歌', '相机', '美图'],
  '购物': ['淘宝', '京东', '拼多多', '美团', '饿了么', '支付宝', '微信支付'],
  '出行': ['地图', '导航', '打车', '公交', '火车', '飞机', '酒店'],
  '教育': ['学习', '课程', '考试', '词典', '翻译', '作业'],
  '健康': ['运动', '健身', '医疗', '医院', '药店', '健康'],
  '金融': ['银行', '理财', '股票', '基金', '保险', '贷款'],
  '系统': ['设置', '电话', '短信', '联系人', '日历', '时钟', '相机', '图库', '文件管理']
};

/**
 * 根据应用名称判断分类
 */
function getAppCategory(appName) {
  for (const [category, keywords] of Object.entries(APP_CATEGORIES)) {
    for (const keyword of keywords) {
      if (appName.includes(keyword)) {
        return category;
      }
    }
  }
  return '其他';
}

/**
 * 获取已安装应用列表
 * @returns {Promise<Array>} 应用列表
 */
export function getInstalledApps() {
  return new Promise((resolve, reject) => {
    // #ifdef APP-PLUS
    try {
      const main = plus.android.runtimeMainActivity();
      const PackageManager = plus.android.importClass('android.content.pm.PackageManager');
      const Intent = plus.android.importClass('android.content.Intent');
      const ResolveInfo = plus.android.importClass('android.content.pm.ResolveInfo');
      const ApplicationInfo = plus.android.importClass('android.content.pm.ApplicationInfo');
      
      const pm = main.getPackageManager();
      const intent = new Intent(Intent.ACTION_MAIN, null);
      intent.addCategory(Intent.CATEGORY_LAUNCHER);
      
      const resolveList = pm.queryIntentActivities(intent, PackageManager.MATCH_DEFAULT_ONLY);
      const apps = [];
      
      for (let i = 0; i < resolveList.size(); i++) {
        try {
          const resolveInfo = resolveList.get(i);
          const activityInfo = resolveInfo.activityInfo;
          const packageName = activityInfo.packageName;
          const applicationInfo = activityInfo.applicationInfo;
          
          // 获取应用名称
          const appName = resolveInfo.loadLabel(pm).toString();
          
          // 获取应用图标
          // 注意：uni-app中直接获取Android Drawable图标比较复杂
          // 这里暂时返回null，前端会使用默认图标
          // 后续可以通过native插件或服务端API获取图标
          let icon = null;
          
          // 判断是否为系统应用
          const isSystemApp = (applicationInfo.flags & ApplicationInfo.FLAG_SYSTEM) !== 0;
          
          // 获取应用分类
          const category = getAppCategory(appName);
          
          apps.push({
            packageName: packageName,
            name: appName,
            icon: icon, // 暂时为null，后续优化
            category: category,
            isSystemApp: isSystemApp,
            launchIntent: activityInfo.name,
            className: activityInfo.name
          });
        } catch (e) {
          console.log('处理应用信息失败:', e);
          continue;
        }
      }
      
      // 按名称排序
      apps.sort((a, b) => {
        return a.name.localeCompare(b.name, 'zh-CN');
      });
      
      // 保存到本地存储（用于离线使用）
      uni.setStorageSync('installedApps', apps);
      
      resolve(apps);
    } catch (e) {
      console.error('获取应用列表失败:', e);
      // 如果获取失败，尝试从本地存储读取
      const cachedApps = uni.getStorageSync('installedApps') || [];
      if (cachedApps.length > 0) {
        resolve(cachedApps);
      } else {
        reject(e);
      }
    }
    // #endif
    
    // #ifndef APP-PLUS
    // H5或其他平台，返回空数组或模拟数据
    console.warn('当前平台不支持获取应用列表');
    resolve([]);
    // #endif
  });
}

/**
 * 启动应用
 * @param {String} packageName 应用包名
 * @param {String} className 可选，Activity类名
 * @returns {Promise}
 */
export function launchApp(packageName, className = null) {
  return new Promise((resolve, reject) => {
    // #ifdef APP-PLUS
    try {
      // 记录最近使用（先记录，即使启动失败也不影响）
      recordRecentApp(packageName);
      
      const launchOptions = {
        pname: packageName
      };
      
      // 使用plus.runtime.launchApplication启动应用
      plus.runtime.launchApplication(launchOptions, (e) => {
        // 注意：plus.runtime.launchApplication的回调中，e为null表示成功
        if (e) {
          console.error('启动应用失败:', e);
          const errorMsg = e.message || (e.code ? `错误代码: ${e.code}` : '启动应用失败');
          reject(new Error(errorMsg));
        } else {
          console.log('应用启动成功:', packageName);
          resolve();
        }
      });
    } catch (e) {
      console.error('启动应用异常:', e);
      reject(e);
    }
    // #endif
    
    // #ifndef APP-PLUS
    // H5或其他平台，显示提示
    uni.showToast({
      title: '当前平台不支持启动应用',
      icon: 'none'
    });
    reject(new Error('当前平台不支持启动应用'));
    // #endif
  });
}

/**
 * 记录最近使用的应用
 */
function recordRecentApp(packageName) {
  let recentApps = uni.getStorageSync('recentApps') || [];
  
  // 移除已存在的记录
  recentApps = recentApps.filter(app => app.packageName !== packageName);
  
  // 添加到最前面
  recentApps.unshift({
    packageName: packageName,
    timestamp: Date.now()
  });
  
  // 只保留最近20个
  if (recentApps.length > 20) {
    recentApps = recentApps.slice(0, 20);
  }
  
  uni.setStorageSync('recentApps', recentApps);
}

/**
 * 获取最近使用的应用列表
 * @param {Number} limit 返回数量限制
 * @returns {Array}
 */
export function getRecentApps(limit = 10) {
  const recentApps = uni.getStorageSync('recentApps') || [];
  const installedApps = uni.getStorageSync('installedApps') || [];
  
  // 创建包名到应用的映射
  const appMap = {};
  installedApps.forEach(app => {
    appMap[app.packageName] = app;
  });
  
  // 获取最近使用的应用信息
  const recentAppsWithInfo = recentApps
    .slice(0, limit)
    .map(recent => {
      const app = appMap[recent.packageName];
      if (app) {
        return {
          ...app,
          lastUsed: recent.timestamp
        };
      }
      return null;
    })
    .filter(app => app !== null);
  
  return recentAppsWithInfo;
}

/**
 * 按分类获取应用
 * @param {String} category 分类名称，null表示全部
 * @param {Boolean} excludeSystemApp 是否排除系统应用
 * @returns {Array}
 */
export function getAppsByCategory(category = null, excludeSystemApp = false) {
  const apps = uni.getStorageSync('installedApps') || [];
  
  let filteredApps = apps;
  
  // 过滤系统应用
  if (excludeSystemApp) {
    filteredApps = filteredApps.filter(app => !app.isSystemApp);
  }
  
  // 按分类过滤
  if (category && category !== '全部') {
    filteredApps = filteredApps.filter(app => app.category === category);
  }
  
  return filteredApps;
}

/**
 * 搜索应用
 * @param {String} keyword 搜索关键词
 * @returns {Array}
 */
export function searchApps(keyword) {
  const apps = uni.getStorageSync('installedApps') || [];
  const lowerKeyword = keyword.toLowerCase();
  
  return apps.filter(app => {
    return app.name.toLowerCase().includes(lowerKeyword) ||
           app.packageName.toLowerCase().includes(lowerKeyword);
  });
}

/**
 * 获取所有分类
 * @returns {Array}
 */
export function getAllCategories() {
  const apps = uni.getStorageSync('installedApps') || [];
  const categories = new Set();
  
  apps.forEach(app => {
    categories.add(app.category);
  });
  
  return ['全部', ...Array.from(categories).sort()];
}

