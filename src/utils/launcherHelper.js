/**
 * 桌面启动器辅助工具类
 * 用于处理默认桌面设置、Home键拦截等功能
 */

/**
 * 检查当前应用是否为默认桌面
 * @returns {Promise<Boolean>}
 */
export function isDefaultLauncher() {
  return new Promise((resolve) => {
    // #ifdef APP-PLUS
    try {
      const main = plus.android.runtimeMainActivity();
      const PackageManager = plus.android.importClass('android.content.pm.PackageManager');
      const Intent = plus.android.importClass('android.content.Intent');
      
      const pm = main.getPackageManager();
      const intent = new Intent(Intent.ACTION_MAIN);
      intent.addCategory(Intent.CATEGORY_HOME);
      
      const resolveInfos = pm.queryIntentActivities(intent, PackageManager.MATCH_DEFAULT_ONLY);
      const currentPackageName = main.getPackageName();
      
      // 获取系统默认桌面
      const defaultLauncher = pm.resolveActivity(intent, PackageManager.MATCH_DEFAULT_ONLY);
      
      if (defaultLauncher && defaultLauncher.activityInfo) {
        const defaultPackageName = defaultLauncher.activityInfo.packageName;
        resolve(defaultPackageName === currentPackageName);
      } else {
        // 如果没有默认桌面，检查是否有多个桌面应用
        if (resolveInfos && resolveInfos.size() > 1) {
          // 有多个桌面应用，需要用户选择
          resolve(false);
        } else {
          // 只有一个桌面应用，可能是当前应用
          resolve(true);
        }
      }
    } catch (e) {
      console.error('检查默认桌面失败:', e);
      resolve(false);
    }
    // #endif
    
    // #ifndef APP-PLUS
    resolve(false);
    // #endif
  });
}

/**
 * 打开系统桌面选择器
 */
export function openLauncherChooser() {
  // #ifdef APP-PLUS
  try {
    const main = plus.android.runtimeMainActivity();
    const Intent = plus.android.importClass('android.content.Intent');
    const ComponentName = plus.android.importClass('android.content.ComponentName');
    
    const intent = new Intent(Intent.ACTION_MAIN);
    intent.addCategory(Intent.CATEGORY_HOME);
    
    // 创建选择器Intent
    const chooserIntent = Intent.createChooser(intent, '选择桌面应用');
    
    main.startActivity(chooserIntent);
  } catch (e) {
    console.error('打开桌面选择器失败:', e);
    uni.showToast({
      title: '打开桌面设置失败',
      icon: 'none'
    });
  }
  // #endif
  
  // #ifndef APP-PLUS
  uni.showToast({
    title: '当前平台不支持此功能',
    icon: 'none'
  });
  // #endif
}

/**
 * 跳转到应用设置页面
 */
export function openAppSettings() {
  // #ifdef APP-PLUS
  try {
    const main = plus.android.runtimeMainActivity();
    const Intent = plus.android.importClass('android.content.Intent');
    const Settings = plus.android.importClass('android.provider.Settings');
    const Uri = plus.android.importClass('android.net.Uri');
    
    const intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
    const uri = Uri.fromParts('package', main.getPackageName(), null);
    intent.setData(uri);
    
    main.startActivity(intent);
  } catch (e) {
    console.error('打开应用设置失败:', e);
    uni.showToast({
      title: '打开设置失败',
      icon: 'none'
    });
  }
  // #endif
  
  // #ifndef APP-PLUS
  uni.showToast({
    title: '当前平台不支持此功能',
    icon: 'none'
  });
  // #endif
}

/**
 * 检查是否应该显示桌面选择提示
 * @returns {Boolean}
 */
export function shouldShowLauncherTip() {
  const hasShownTip = uni.getStorageSync('hasShownLauncherTip');
  const isDefault = uni.getStorageSync('isDefaultLauncher');
  
  // 如果已经显示过提示，或者已经是默认桌面，则不显示
  if (hasShownTip || isDefault) {
    return false;
  }
  
  return true;
}

/**
 * 标记已显示桌面选择提示
 */
export function markLauncherTipShown() {
  uni.setStorageSync('hasShownLauncherTip', true);
}

/**
 * 保存默认桌面状态
 * @param {Boolean} isDefault 
 */
export function saveDefaultLauncherStatus(isDefault) {
  uni.setStorageSync('isDefaultLauncher', isDefault);
}

