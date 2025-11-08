<template>
  <view class="guardian-page">
    <view class="header">
      <image class="back-btn" src="/static/mgc/fanhui.png" @click="goBack"></image>
      <text class="header-title">桌面守护</text>
    </view>

    <scroll-view scroll-y class="content">
      <view class="section-title">系统权限管理</view>
      <view class="permission-list">
        <view 
          class="permission-item" 
          v-for="permission in permissions" 
          :key="permission.key"
          @click="openPermissionSettings(permission)"
        >
          <view class="permission-info">
            <view class="permission-title">{{ permission.name }}</view>
            <view class="permission-desc">{{ permission.description }}</view>
          </view>
          <view class="permission-status">
            <text class="status-text" :class="{ 'granted': permission.granted }">
              {{ permission.granted ? '已开启' : '未开启' }}
            </text>
            <text class="arrow">></text>
          </view>
        </view>
      </view>

      <view class="tip-box">
        <text class="tip-title">温馨提示</text>
        <text class="tip-content">请确保所有权限都已开启，以确保应用正常运行。点击权限项可跳转到系统设置页面开启权限。</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      permissions: [
        {
          key: 'location',
          name: '位置信息',
          description: '用于获取当前位置和天气信息',
          granted: false,
          setting: 'android.settings.LOCATION_SOURCE_SETTINGS'
        },
        {
          key: 'camera',
          name: '相机权限',
          description: '用于拍照和头像上传功能',
          granted: false,
          permission: 'android.permission.CAMERA'
        },
        {
          key: 'storage',
          name: '存储权限',
          description: '用于保存联系人数据和图片',
          granted: false,
          permission: 'android.permission.WRITE_EXTERNAL_STORAGE'
        },
        {
          key: 'phone',
          name: '电话权限',
          description: '用于拨打联系人电话',
          granted: false,
          permission: 'android.permission.CALL_PHONE'
        },
        {
          key: 'audio',
          name: '音频权限',
          description: '用于设置免提和音量调节',
          granted: false,
          permission: 'android.permission.MODIFY_AUDIO_SETTINGS'
        },
        {
          key: 'accessibility',
          name: '辅助功能权限',
          description: '用于自动化操作（微信视频/语音通话）',
          granted: false,
          setting: 'android.settings.ACCESSIBILITY_SETTINGS'
        },
        {
          key: 'overlay',
          name: '悬浮窗权限',
          description: '用于显示悬浮操作按钮',
          granted: false,
          setting: 'android.settings.action.MANAGE_OVERLAY_PERMISSION'
        },
        {
          key: 'install',
          name: '安装应用权限',
          description: '用于安装和更新应用',
          granted: false,
          permission: 'android.permission.REQUEST_INSTALL_PACKAGES'
        },
        {
          key: 'query',
          name: '查询应用权限',
          description: '用于获取已安装应用列表',
          granted: false,
          permission: 'android.permission.QUERY_ALL_PACKAGES'
        },
        {
          key: 'wifi',
          name: 'WiFi权限',
          description: '用于检测网络连接状态',
          granted: false,
          permission: 'android.permission.ACCESS_WIFI_STATE'
        },
        {
          key: 'network',
          name: '网络权限',
          description: '用于访问网络和API请求',
          granted: false,
          permission: 'android.permission.INTERNET'
        },
        {
          key: 'bluetooth',
          name: '蓝牙权限',
          description: '用于蓝牙免提功能',
          granted: false,
          permission: 'android.permission.BLUETOOTH'
        }
      ]
    }
  },
  onShow() {
    this.checkPermissions();
  },
  onResume() {
    // 从设置页面返回时刷新权限状态
    this.checkPermissions();
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    // 检查权限状态
    checkPermissions() {
      // #ifdef APP-PLUS
      if (plus && plus.android) {
        try {
          const main = plus.android.runtimeMainActivity();
          const Context = plus.android.importClass('android.content.Context');
          const PackageManager = plus.android.importClass('android.content.pm.PackageManager');
          
          this.permissions.forEach(perm => {
            try {
              if (perm.key === 'location') {
                // 检查位置权限
                const fineLocation = main.checkSelfPermission('android.permission.ACCESS_FINE_LOCATION');
                const coarseLocation = main.checkSelfPermission('android.permission.ACCESS_COARSE_LOCATION');
                perm.granted = (fineLocation === PackageManager.PERMISSION_GRANTED || 
                               coarseLocation === PackageManager.PERMISSION_GRANTED);
              } else if (perm.key === 'accessibility') {
                // 检查辅助功能权限
                const accessibilityManager = main.getSystemService(Context.ACCESSIBILITY_SERVICE);
                perm.granted = accessibilityManager.isEnabled();
              } else if (perm.key === 'overlay') {
                // 检查悬浮窗权限
                const Settings = plus.android.importClass('android.provider.Settings');
                const version = plus.android.osVersion;
                if (version >= 23) {
                  perm.granted = Settings.canDrawOverlays(main);
                } else {
                  perm.granted = true; // Android 6.0以下不需要此权限
                }
              } else if (perm.permission) {
                // 检查运行时权限（Android 6.0+）
                const version = plus.android.osVersion;
                if (version >= 23) {
                  const result = main.checkSelfPermission(perm.permission);
                  perm.granted = (result === PackageManager.PERMISSION_GRANTED);
                } else {
                  // Android 6.0以下，通过PackageManager检查
                  const packageManager = main.getPackageManager();
                  const packageName = main.getPackageName();
                  const result = packageManager.checkPermission(perm.permission, packageName);
                  perm.granted = (result === PackageManager.PERMISSION_GRANTED);
                }
              } else {
                // 其他权限默认未开启
                perm.granted = false;
              }
            } catch (e) {
              console.log('检查权限失败:', perm.key, e);
              perm.granted = false;
            }
          });
        } catch (e) {
          console.log('权限检查初始化失败:', e);
          // 如果检查失败，默认显示未开启
          this.permissions.forEach(perm => {
            perm.granted = false;
          });
        }
      } else {
        // 非Android平台，默认显示未开启
        this.permissions.forEach(perm => {
          perm.granted = false;
        });
      }
      // #endif
      
      // #ifdef H5
      // H5平台无法检查权限，默认显示未开启
      this.permissions.forEach(perm => {
        perm.granted = false;
      });
      // #endif
    },
    // 打开权限设置页面
    openPermissionSettings(permission) {
      // #ifdef APP-PLUS
      if (plus && plus.android) {
        try {
          const main = plus.android.runtimeMainActivity();
          const Intent = plus.android.importClass('android.content.Intent');
          const Settings = plus.android.importClass('android.provider.Settings');
          const Uri = plus.android.importClass('android.net.Uri');
          const Context = plus.android.importClass('android.content.Context');
          const PackageManager = plus.android.importClass('android.content.pm.PackageManager');
          
          let intent = null;
          
          if (permission.setting) {
            // 打开系统设置页面
            if (permission.setting === 'android.settings.ACCESSIBILITY_SETTINGS') {
              intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
            } else if (permission.setting === 'android.settings.LOCATION_SOURCE_SETTINGS') {
              intent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
            } else if (permission.setting === 'android.settings.action.MANAGE_OVERLAY_PERMISSION') {
              intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION);
              const packageName = main.getPackageName();
              intent.setData(Uri.parse('package:' + packageName));
            } else {
              intent = new Intent(permission.setting);
            }
          } else if (permission.permission) {
            // 请求运行时权限
            const version = plus.android.osVersion;
            if (version >= 23) {
              // Android 6.0+ 使用运行时权限请求
              const currentResult = main.checkSelfPermission(permission.permission);
              if (currentResult !== PackageManager.PERMISSION_GRANTED) {
                // 请求权限
                main.requestPermissions([permission.permission], 100);
                uni.showToast({ 
                  title: '请在弹窗中允许' + permission.name, 
                  icon: 'none',
                  duration: 2000
                });
                // 延迟刷新权限状态
                setTimeout(() => {
                  this.checkPermissions();
                }, 1000);
                return;
              } else {
                // 已授予权限，但仍然打开应用设置页面以便用户查看
                intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                const packageName = main.getPackageName();
                intent.setData(Uri.parse('package:' + packageName));
              }
            } else {
              // Android 6.0以下，直接打开应用设置页面
              intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
              const packageName = main.getPackageName();
              intent.setData(Uri.parse('package:' + packageName));
            }
          }
          
          if (intent) {
            main.startActivity(intent);
            uni.showToast({ 
              title: '请开启' + permission.name, 
              icon: 'none',
              duration: 2000
            });
          }
        } catch (e) {
          console.log('打开设置失败:', e);
          uni.showToast({ 
            title: '无法打开设置，请手动前往系统设置开启权限', 
            icon: 'none',
            duration: 3000
          });
        }
      }
      // #endif
      
      // #ifdef H5
      uni.showToast({ 
        title: '请在手机设置中开启' + permission.name, 
        icon: 'none',
        duration: 2000
      });
      // #endif
    }
  }
}
</script>

<style>
@charset "utf-8";

.guardian-page {
  min-height: 100vh;
  background: #f6f7f9;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'SimHei', '微软雅黑', Arial, sans-serif;
}

.guardian-page * {
  font-family: 'PingFang SC', 'Microsoft YaHei', 'SimHei', '微软雅黑', Arial, sans-serif;
}

.header {
  height: 88px;
  background: #28c266;
  display: flex;
  align-items: center;
  padding: 0 16px;
  position: relative;
}

.back-btn {
  width: 44px;
  height: 44px;
  position: absolute;
  left: 16px;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
  font-weight: 700;
  color: #fff;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'SimHei', '微软雅黑', Arial, sans-serif;
}

.content {
  height: calc(100vh - 88px);
  padding: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #222;
  margin-bottom: 24rpx;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'SimHei', '微软雅黑', Arial, sans-serif;
}

.permission-list {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
}

.permission-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.permission-item:last-child {
  border-bottom: none;
}

.permission-info {
  flex: 1;
  margin-right: 24rpx;
}

.permission-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #222;
  margin-bottom: 8rpx;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'SimHei', '微软雅黑', Arial, sans-serif;
}

.permission-desc {
  font-size: 26rpx;
  color: #999;
  line-height: 1.5;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'SimHei', '微软雅黑', Arial, sans-serif;
}

.permission-status {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.status-text {
  font-size: 28rpx;
  color: #ff3b30;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'SimHei', '微软雅黑', Arial, sans-serif;
}

.status-text.granted {
  color: #28c266;
}

.arrow {
  font-size: 32rpx;
  color: #ccc;
}

.tip-box {
  background: #fff3cd;
  border-radius: 16rpx;
  padding: 24rpx;
  border-left: 4rpx solid #ffc107;
}

.tip-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: #856404;
  margin-bottom: 12rpx;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'SimHei', '微软雅黑', Arial, sans-serif;
}

.tip-content {
  display: block;
  font-size: 26rpx;
  color: #856404;
  line-height: 1.6;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'SimHei', '微软雅黑', Arial, sans-serif;
}
</style>

