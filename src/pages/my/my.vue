<template>
  <view class="my-page">
    <view class="header">
      <image class="avatar" src="/static/mgc/Guard.png"></image>
      <text class="username">用户名</text>
    </view>
    
    <view class="menu-list">
      <view class="menu-item" v-for="item in menus" :key="item.name">
        <image class="menu-icon" :src="item.icon"></image>
        <text class="menu-text">{{item.name}}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      menus: [
        { name: '我的收藏', icon: '/static/mgc/Add.png' },
        { name: '设置', icon: '/static/mgc/Information.png' },
        { name: '关于我们', icon: '/static/mgc/Alipay.png' }
      ]
    }
  }
}
</script>

<style>
.my-page {
  padding: 30rpx;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  margin-right: 30rpx;
}

.username {
  font-size: 36rpx;
  font-weight: bold;
}

.menu-list {
  border-top: 1rpx solid #eee;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #eee;
}

.menu-icon {
  width: 50rpx;
  height: 50rpx;
  margin-right: 30rpx;
}

.menu-text {
  font-size: 32rpx;
}
</style>
