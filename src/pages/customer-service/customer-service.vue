<template>
  <view class="customer-service-page">
    <view class="header">
      <text class="title">客服中心</text>
    </view>
    <view class="content">
      <view class="contact-method">
        <image src="/static/mgc/telephone.png" class="icon"></image>
        <text class="text">电话客服: 400-123-4567</text>
      </view>
      <view class="contact-method">
        <image src="/static/mgc/WeChat.png" class="icon"></image>
        <text class="text">微信客服: my-customer-service</text>
      </view>
      <view class="contact-method">
        <image src="/static/mgc/kefu.png" class="icon"></image>
        <text class="text">在线客服: 点击下方按钮</text>
      </view>
      <button class="online-service-btn" @click="goToChat">联系在线客服</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {}
  },
  methods: {
    goToChat() {
      uni.navigateTo({
        url: '/pages/chat/chat'
      })
    }
  }
}
</script>

<style>
.customer-service-page {
  padding: 20px;
}

.header {
  margin-bottom: 30px;
}

.title {
  font-size: 24px;
  font-weight: bold;
}

.contact-method {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.icon {
  width: 30px;
  height: 30px;
  margin-right: 15px;
}

.text {
  font-size: 16px;
}

.online-service-btn {
  margin-top: 30px;
  background-color: #007AFF;
  color: white;
}
</style>
