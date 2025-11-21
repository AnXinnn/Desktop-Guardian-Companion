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
      const defaultLauncher = pm.resolveActivity(intent, PackageManager.MATCH_DEFAULT_ONLY);

      if (defaultLauncher && defaultLauncher.activityInfo) {
        const defaultPackageName = defaultLauncher.activityInfo.packageName;
        resolve(defaultPackageName === currentPackageName);
      } else {
        if (resolveInfos && resolveInfos.size() > 1) {
          resolve(false);
        } else {
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

export function openLauncherChooser() {
  // #ifdef APP-PLUS
  try {
    const main = plus.android.runtimeMainActivity();
    const Intent = plus.android.importClass('android.content.Intent');
    const ComponentName = plus.android.importClass('android.content.ComponentName');

    const intent = new Intent(Intent.ACTION_MAIN);
    intent.addCategory(Intent.CATEGORY_HOME);
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

export function shouldShowLauncherTip() {
  const hasShownTip = uni.getStorageSync('hasShownLauncherTip');
  const isDefault = uni.getStorageSync('isDefaultLauncher');

  if (hasShownTip || isDefault) {
    return false;
  }

  return true;
}

export function markLauncherTipShown() {
  uni.setStorageSync('hasShownLauncherTip', true);
}

export function saveDefaultLauncherStatus(isDefault) {
  uni.setStorageSync('isDefaultLauncher', isDefault);
}

