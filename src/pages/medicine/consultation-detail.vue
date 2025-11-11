<template>
  <view class="consultation-detail-page">
    <view class="header">
      <image class="back-btn" src="/static/mgc/fanhui.png" @click="goBack"></image>
      <text class="header-title">问诊详情</text>
    </view>

    <scroll-view scroll-y class="content">
      <!-- 问诊基本信息 -->
      <view class="info-section">
        <view class="info-item">
          <text class="info-label">问诊类型</text>
          <text class="info-value">{{ consultation.type }}问诊</text>
        </view>
        <view class="info-item">
          <text class="info-label">问诊时间</text>
          <text class="info-value">{{ consultation.time }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">状态</text>
          <text class="info-value status" :class="'status-' + consultation.status">
            {{ getStatusText(consultation.status) }}
          </text>
        </view>
        <view class="info-item" v-if="consultation.doctor">
          <text class="info-label">接诊医生</text>
          <text class="info-value">{{ consultation.doctor }}</text>
        </view>
      </view>

      <!-- 患者信息 -->
      <view class="section">
        <text class="section-title">患者信息</text>
        <view class="info-item">
          <text class="info-label">年龄</text>
          <text class="info-value">{{ consultation.age || '未填写' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">性别</text>
          <text class="info-value">{{ consultation.gender === 'male' ? '男' : consultation.gender === 'female' ? '女' : '未填写' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">联系方式</text>
          <text class="info-value">{{ consultation.phone || '未填写' }}</text>
        </view>
      </view>

      <!-- 症状描述 -->
      <view class="section">
        <text class="section-title">症状描述</text>
        <view class="symptoms-content">
          <text>{{ consultation.symptoms || '无' }}</text>
        </view>
        <image 
          v-if="consultation.image" 
          class="symptom-image" 
          :src="consultation.image" 
          mode="aspectFit"
          @click="previewImage"
        ></image>
      </view>

      <!-- 对话记录 -->
      <view class="section" v-if="consultation.messages && consultation.messages.length > 0">
        <text class="section-title">对话记录</text>
        <view class="messages-list">
          <view 
            class="message-item" 
            :class="msg.role === 'user' ? 'message-user' : 'message-doctor'"
            v-for="(msg, index) in consultation.messages" 
            :key="index"
          >
            <view class="message-avatar">
              <image 
                :src="msg.role === 'user' ? '/static/mgc/geren.png' : '/static/mgc/kefu.png'"
              ></image>
            </view>
            <view class="message-content">
              <text class="message-text">{{ msg.content }}</text>
              <text class="message-time">{{ msg.time }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 医生建议 -->
      <view class="section" v-if="consultation.advice">
        <text class="section-title">医生建议</text>
        <view class="advice-content">
          <text>{{ consultation.advice }}</text>
        </view>
      </view>

      <!-- 处方 -->
      <view class="section" v-if="consultation.prescription && consultation.prescription.length > 0">
        <text class="section-title">电子处方</text>
        <view class="prescription-list">
          <view 
            class="prescription-item" 
            v-for="(item, index) in consultation.prescription" 
            :key="index"
          >
            <text class="prescription-name">{{ item.name }}</text>
            <text class="prescription-dosage">{{ item.dosage }}</text>
            <text class="prescription-usage">{{ item.usage }}</text>
          </view>
        </view>
      </view>

      <!-- 评价 -->
      <view class="section" v-if="consultation.rating">
        <text class="section-title">我的评价</text>
        <view class="rating-content">
          <text class="rating-stars">{{ getRatingStars(consultation.rating) }}</text>
          <text class="rating-comment" v-if="consultation.comment">{{ consultation.comment }}</text>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="actions-section" v-if="consultation.status === 'completed' && !consultation.rating">
        <button class="action-btn rate-btn" @click="showRatingModal">评价医生</button>
      </view>
    </scroll-view>

    <!-- 评价弹窗 -->
    <view class="rating-modal" v-if="showRating" @click.self="closeRating">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">评价医生</text>
          <text class="modal-close" @click="closeRating">?</text>
        </view>
        <view class="rating-body">
          <view class="stars-selector">
            <text 
              class="star" 
              v-for="i in 5" 
              :key="i"
              @click="selectRating(i)"
            >
              {{ i <= ratingValue ? '?' : '☆' }}
            </text>
          </view>
          <textarea 
            class="rating-comment-input" 
            placeholder="请输入评价内容（可选）"
            v-model.trim="ratingComment"
            maxlength="200"
          ></textarea>
          <button class="submit-rating-btn" @click="submitRating">提交评价</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      consultation: {},
      showRating: false,
      ratingValue: 5,
      ratingComment: ''
    }
  },
  onLoad(options) {
    if (options.index !== undefined) {
      this.loadConsultation(parseInt(options.index));
    }
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    loadConsultation(index) {
      const history = uni.getStorageSync('consultationHistory') || [];
      if (history[index]) {
        this.consultation = history[index];
      } else {
        uni.showToast({ title: '问诊记录不存在', icon: 'none' });
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      }
    },
    getStatusText(status) {
      const map = {
        'pending': '待接诊',
        'inProgress': '进行中',
        'completed': '已完成',
        'cancelled': '已取消'
      };
      return map[status] || '未知';
    },
    previewImage() {
      if (this.consultation.image) {
        uni.previewImage({
          urls: [this.consultation.image],
          current: this.consultation.image
        });
      }
    },
    getRatingStars(rating) {
      return '?'.repeat(rating) + '☆'.repeat(5 - rating);
    },
    showRatingModal() {
      this.showRating = true;
      this.ratingValue = 5;
      this.ratingComment = '';
    },
    closeRating() {
      this.showRating = false;
    },
    selectRating(value) {
      this.ratingValue = value;
    },
    submitRating() {
      // 更新问诊记录
      const history = uni.getStorageSync('consultationHistory') || [];
      const index = history.findIndex(c => 
        c.time === this.consultation.time && 
        c.type === this.consultation.type
      );
      
      if (index !== -1) {
        history[index].rating = this.ratingValue;
        history[index].comment = this.ratingComment;
        uni.setStorageSync('consultationHistory', history);
        this.consultation.rating = this.ratingValue;
        this.consultation.comment = this.ratingComment;
        this.closeRating();
        uni.showToast({ title: '评价成功', icon: 'success' });
      }
    }
  }
}
</script>

<style>
.consultation-detail-page {
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

.content {
  height: calc(100vh - 60px);
  padding: 16px;
}

.info-section,
.section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  display: block;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  color: #999;
}

.info-value {
  font-size: 14px;
  color: #333;
}

.info-value.status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.info-value.status-pending {
  background: #fff3e0;
  color: #f57c00;
}

.info-value.status-inProgress {
  background: #e3f2fd;
  color: #1976d2;
}

.info-value.status-completed {
  background: #e8f5e9;
  color: #388e3c;
}

.symptoms-content {
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 12px;
}

.symptom-image {
  width: 100%;
  max-height: 300px;
  border-radius: 8px;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  display: flex;
  gap: 12px;
}

.message-user {
  flex-direction: row-reverse;
}

.message-avatar image {
  width: 40px;
  height: 40px;
  border-radius: 20px;
}

.message-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-user .message-content {
  align-items: flex-end;
}

.message-text {
  padding: 10px 14px;
  background: #f0f0f0;
  border-radius: 12px;
  font-size: 14px;
  color: #333;
  max-width: 70%;
}

.message-user .message-text {
  background: #28c266;
  color: #fff;
}

.message-time {
  font-size: 12px;
  color: #999;
}

.advice-content,
.rating-content {
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

.prescription-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.prescription-item {
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.prescription-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.prescription-dosage {
  font-size: 14px;
  color: #666;
}

.prescription-usage {
  font-size: 14px;
  color: #999;
}

.rating-stars {
  font-size: 20px;
  margin-bottom: 8px;
}

.rating-comment {
  font-size: 14px;
  color: #666;
}

.actions-section {
  margin-top: 12px;
}

.action-btn {
  width: 100%;
  padding: 14px;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  color: #fff;
}

.rate-btn {
  background: #28c266;
}

.rating-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
}

.modal-header {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
}

.modal-close {
  font-size: 20px;
  color: #999;
}

.rating-body {
  padding: 24px;
}

.stars-selector {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

.star {
  font-size: 32px;
  cursor: pointer;
}

.rating-comment-input {
  width: 100%;
  min-height: 100px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
}

.submit-rating-btn {
  width: 100%;
  padding: 12px;
  background: #28c266;
  color: #fff;
  border-radius: 8px;
  border: none;
  font-size: 16px;
}
</style>

