<template>
  <view class="login-container">
    <view class="logo">
      <image src="/static/logo.png"></image>
    </view>
    
    <view class="form-container">
      <view class="input-group">
        <text class="label">用户名</text>
        <input class="input" type="text" placeholder="请输入用户名" v-model="username">
      </view>
      
      <view class="input-group">
        <text class="label">密码</text>
        <input class="input" type="password" placeholder="请输入密码" v-model="password">
      </view>
      
      <button class="login-btn" @click="handleLogin">登录</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    handleLogin() {
      // 登录逻辑
      uni.navigateTo({
        url: '/pages/index/index'
      })
    }
  }
}
</script>

<style>
.login-container {
  padding: 40rpx;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 80rpx;
}

.logo {
  width: 200rpx;
  height: 200rpx;
}

.input-group {
  margin-bottom: 40rpx;
}

.label {
  display: block;
  margin-bottom: 10rpx;
  font-size: 28rpx;
  color: #666;
}

.input {
  border: 1rpx solid #ddd;
  padding: 20rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.login-btn {
  background-color: #007aff;
  color: white;
  padding: 20rpx;
  border-radius: 8rpx;
  text-align: center;
  margin-top: 40rpx;
}
</style>
