<template>
  <view class="call-records-page">
    <view class="header">
      <image class="back-btn" src="/static/mgc/fanhui.png" @click="goBack"></image>
      <text class="header-title">通话记录</text>
    </view>

    <scroll-view scroll-y class="records-list">
      <view 
        class="record-item" 
        v-for="(record, index) in callRecords" 
        :key="index"
        @click="callContact(record)"
      >
        <image class="record-avatar" :src="record.icon || '/static/mgc/geren.png'"></image>
        <view class="record-info">
          <text class="record-name">{{ record.wxNote || record.name }}</text>
          <text class="record-phone">{{ record.mobile }}</text>
        </view>
        <view class="record-right">
          <text class="record-time">{{ formatTime(record.time) }}</text>
          <text class="record-type" :class="'type-' + record.type">
            {{ record.type === 'outgoing' ? '?' : '?' }}
          </text>
        </view>
      </view>

      <view v-if="callRecords.length === 0" class="empty-tip">
        <text>暂无通话记录</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      callRecords: []
    }
  },
  onLoad() {
    this.loadRecords();
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    loadRecords() {
      this.callRecords = uni.getStorageSync('callRecords') || [];
    },
    formatTime(timeStr) {
      if (!timeStr) return '';
      const date = new Date(timeStr);
      const now = new Date();
      const diff = now - date;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      if (days === 0) {
        return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      } else if (days === 1) {
        return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      } else if (days < 7) {
        return days + '天前';
      } else {
        return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
      }
    },
    callContact(record) {
      if (record.mobile) {
        uni.makePhoneCall({
          phoneNumber: record.mobile,
          success: () => {
            // 更新通话记录时间
            const index = this.callRecords.findIndex(r => 
              r.mobile === record.mobile && r.name === record.name
            );
            if (index !== -1) {
              this.callRecords[index].time = new Date().toLocaleString('zh-CN');
              uni.setStorageSync('callRecords', this.callRecords);
            }
          }
        });
      }
    }
  }
}
</script>

<style>
.call-records-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: #fff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.back-btn {
  width: 24px;
  height: 24px;
  margin-right: 12px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
}

.records-list {
  height: calc(100vh - 60px);
  padding: 8px 0;
}

.record-item {
  background: #fff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f5f5f5;
}

.record-avatar {
  width: 48px;
  height: 48px;
  border-radius: 24px;
  margin-right: 12px;
}

.record-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.record-name {
  font-size: 16px;
  color: #333;
  margin-bottom: 4px;
}

.record-phone {
  font-size: 14px;
  color: #999;
}

.record-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.record-time {
  font-size: 12px;
  color: #999;
}

.record-type {
  font-size: 18px;
}

.empty-tip {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 14px;
}
</style>

