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
          const appName = resolveInfo.loadLabel(pm).toString();
          let icon = null;
          const isSystemApp = (applicationInfo.flags & ApplicationInfo.FLAG_SYSTEM) !== 0;
          const category = getAppCategory(appName);

          apps.push({
            packageName: packageName,
            name: appName,
            icon: icon,
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

      apps.sort((a, b) => {
        return a.name.localeCompare(b.name, 'zh-CN');
      });

      uni.setStorageSync('installedApps', apps);

      resolve(apps);
    } catch (e) {
      console.error('获取应用列表失败:', e);
      const cachedApps = uni.getStorageSync('installedApps') || [];
      if (cachedApps.length > 0) {
        resolve(cachedApps);
      } else {
        reject(e);
      }
    }
    // #endif

    // #ifndef APP-PLUS
    console.warn('当前平台不支持获取应用列表');
    resolve([]);
    // #endif
  });
}

export function launchApp(packageName, className = null) {
  return new Promise((resolve, reject) => {
    // #ifdef APP-PLUS
    try {
      recordRecentApp(packageName);

      const launchOptions = {
        pname: packageName
      };

      plus.runtime.launchApplication(launchOptions, (e) => {
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
    uni.showToast({
      title: '当前平台不支持启动应用',
      icon: 'none'
    });
    reject(new Error('当前平台不支持启动应用'));
    // #endif
  });
}

function recordRecentApp(packageName) {
  let recentApps = uni.getStorageSync('recentApps') || [];
  recentApps = recentApps.filter(app => app.packageName !== packageName);
  recentApps.unshift({
    packageName: packageName,
    timestamp: Date.now()
  });

  if (recentApps.length > 20) {
    recentApps = recentApps.slice(0, 20);
  }

  uni.setStorageSync('recentApps', recentApps);
}

export function getRecentApps(limit = 10) {
  const recentApps = uni.getStorageSync('recentApps') || [];
  const installedApps = uni.getStorageSync('installedApps') || [];
  const appMap = {};
  installedApps.forEach(app => {
    appMap[app.packageName] = app;
  });

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

export function getAppsByCategory(category = null, excludeSystemApp = false) {
  const apps = uni.getStorageSync('installedApps') || [];
  let filteredApps = apps;

  if (excludeSystemApp) {
    filteredApps = filteredApps.filter(app => !app.isSystemApp);
  }

  if (category && category !== '全部') {
    filteredApps = filteredApps.filter(app => app.category === category);
  }

  return filteredApps;
}

export function searchApps(keyword) {
  const apps = uni.getStorageSync('installedApps') || [];
  const lowerKeyword = keyword.toLowerCase();

  return apps.filter(app => {
    return app.name.toLowerCase().includes(lowerKeyword) ||
      app.packageName.toLowerCase().includes(lowerKeyword);
  });
}

export function getAllCategories() {
  const apps = uni.getStorageSync('installedApps') || [];
  const categories = new Set();

  apps.forEach(app => {
    categories.add(app.category);
  });

  return ['全部', ...Array.from(categories).sort()];
}

