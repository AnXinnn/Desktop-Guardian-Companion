<template>
  <view class="consultation-page">
    <view class="header">
      <image class="back-btn" src="/static/mgc/fanhui.png" @click="goBack"></image>
      <text class="header-title">在线问诊</text>
    </view>

    <scroll-view scroll-y class="content">
      <view class="banner">
        <text class="banner-title">专业医生在线服务</text>
        <text class="banner-desc">7×24小时在线，为您提供专业医疗咨询</text>
      </view>

      <view class="service-list">
        <view class="service-card" @click="startConsultation('图文')">
          <view class="service-icon">?</view>
          <view class="service-info">
            <text class="service-name">图文问诊</text>
            <text class="service-desc">文字描述病情，医生在线回复</text>
          </view>
          <text class="service-price">?29起</text>
        </view>

        <view class="service-card" @click="startConsultation('语音')">
          <view class="service-icon">?</view>
          <view class="service-info">
            <text class="service-name">语音问诊</text>
            <text class="service-desc">与医生语音通话，详细沟通</text>
          </view>
          <text class="service-price">?49起</text>
        </view>

        <view class="service-card" @click="startConsultation('视频')">
          <view class="service-icon">?</view>
          <view class="service-info">
            <text class="service-name">视频问诊</text>
            <text class="service-desc">面对面视频咨询，更直观</text>
          </view>
          <text class="service-price">?69起</text>
        </view>
      </view>

      <view class="section-title">历史问诊</view>
      <view class="history-list">
        <view 
          class="history-item" 
          v-for="(record, index) in consultationHistory" 
          :key="index"
          @click="viewConsultationDetail(record)"
        >
          <view class="history-info">
            <text class="history-type">{{ record.type }}问诊</text>
            <text class="history-time">{{ record.time }}</text>
            <text class="history-status" :class="'status-' + record.status">
              {{ getStatusText(record.status) }}
            </text>
          </view>
          <text class="history-arrow">></text>
        </view>

        <view v-if="consultationHistory.length === 0" class="empty-tip">
          <text>暂无问诊记录</text>
        </view>
      </view>
    </scroll-view>

    <!-- 问诊表单弹窗 -->
    <view class="consultation-modal" v-if="showModal" @click.self="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ consultationType }}问诊</text>
          <text class="modal-close" @click="closeModal">?</text>
        </view>

        <scroll-view scroll-y class="modal-body">
          <view class="form-item">
            <text class="form-label required">*症状描述</text>
            <textarea 
              class="form-textarea" 
              placeholder="请详细描述您的症状、持续时间和相关情况" 
              v-model.trim="consultationForm.symptoms"
              maxlength="500"
            ></textarea>
          </view>

          <view class="form-item">
            <text class="form-label">年龄</text>
            <input 
              class="form-input" 
              type="number" 
              placeholder="请输入年龄" 
              v-model.trim="consultationForm.age" 
            />
          </view>

          <view class="form-item">
            <text class="form-label">性别</text>
            <view class="radio-group">
              <label class="radio-label">
                <radio value="male" :checked="consultationForm.gender === 'male'" @click="consultationForm.gender = 'male'" />
                <text>男</text>
              </label>
              <label class="radio-label">
                <radio value="female" :checked="consultationForm.gender === 'female'" @click="consultationForm.gender = 'female'" />
                <text>女</text>
              </label>
            </view>
          </view>

          <view class="form-item">
            <text class="form-label">联系方式</text>
            <input 
              class="form-input" 
              type="number" 
              placeholder="请输入手机号码" 
              v-model.trim="consultationForm.phone" 
            />
          </view>

          <view class="form-item">
            <text class="form-label">附件（可选）</text>
            <view class="upload-area" @click="uploadImage">
              <image 
                v-if="consultationForm.image" 
                class="uploaded-image" 
                :src="consultationForm.image" 
                mode="aspectFit"
              ></image>
              <text v-else class="upload-hint">+ 上传照片（检查报告、症状图片等）</text>
            </view>
          </view>
        </scroll-view>

        <view class="modal-footer">
          <button class="modal-btn cancel-btn" @click="closeModal">取消</button>
          <button class="modal-btn submit-btn" @click="submitConsultation">提交问诊</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import apiUtils from '@/utils/api.js';

export default {
  data() {
    return {
      showModal: false,
      consultationType: '',
      consultationForm: {
        symptoms: '',
        age: '',
        gender: '',
        phone: '',
        image: ''
      },
      consultationHistory: []
    }
  },
  onLoad() {
    this.loadHistory();
  },
  methods: {
    goBack() {
      uni.redirectTo({
					url: '/pages/index/index?page=2'
				});
    },
    loadHistory() {
      const history = uni.getStorageSync('consultationHistory') || [];
      this.consultationHistory = history;
    },
    // 从云端加载问诊记录
    async loadConsultationsFromCloud() {
      try {
        const result = await apiUtils.api.getConsultations(true); // 静默模式
        if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
          const localConsultations = uni.getStorageSync('consultationHistory') || [];
          // 如果本地没有数据，使用云端数据
          if (localConsultations.length === 0 && result.data.length > 0) {
            uni.setStorageSync('consultationHistory', result.data);
            this.loadHistory();
            console.log('已从云端恢复问诊记录数据');
          }
        }
      } catch (error) {
        // 静默失败，不影响本地数据使用
        console.log('从云端加载问诊记录失败（使用本地数据）:', error.message);
      }
    },
    // 同步问诊记录到云端
    async syncConsultationsToCloud() {
      try {
        const consultations = uni.getStorageSync('consultationHistory') || [];
        if (consultations.length > 0) {
          await apiUtils.api.syncConsultations(consultations, true); // 静默模式，后台同步
          console.log('问诊记录已同步到云端');
        }
      } catch (error) {
        // 静默失败，404错误不显示（后端服务可能未启动）
        if (error.message && !error.message.includes('404')) {
          console.error('同步问诊记录到云端失败:', error);
        }
      }
    },
    startConsultation(type) {
      this.consultationType = type;
      this.resetForm();
      this.showModal = true;
    },
    resetForm() {
      this.consultationForm = {
        symptoms: '',
        age: '',
        gender: '',
        phone: '',
        image: ''
      };
    },
    closeModal() {
      this.showModal = false;
      this.resetForm();
    },
    uploadImage() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          this.consultationForm.image = res.tempFilePaths[0];
        }
      });
    },
    async submitConsultation() {
      if (!this.consultationForm.symptoms) {
        return uni.showToast({ title: '请输入症状描述', icon: 'none' });
      }

      const consultation = {
        type: this.consultationType,
        ...this.consultationForm,
        time: new Date().toLocaleString('zh-CN'),
        status: 'pending', // pending, processing, completed
        id: Date.now(),
        createdAt: new Date().toISOString() // 添加ISO格式时间用于API
      };

      this.consultationHistory.unshift(consultation);
      uni.setStorageSync('consultationHistory', this.consultationHistory);

      // 同步到云端
      await this.syncConsultationsToCloud();

      uni.showToast({ title: '问诊提交成功，医生会尽快回复', icon: 'success' });
      this.closeModal();
    },
    viewConsultationDetail(record) {
      const history = uni.getStorageSync('consultationHistory') || [];
      const index = history.findIndex(c => 
        c.time === record.time && 
        c.type === record.type
      );
      if (index !== -1) {
        uni.navigateTo({
          url: `/pages/medicine/consultation-detail?index=${index}`
        });
      } else {
        uni.showToast({ title: '问诊记录不存在', icon: 'none' });
      }
    },
    getStatusText(status) {
      const statusMap = {
        'pending': '待处理',
        'processing': '处理中',
        'completed': '已完成'
      };
      return statusMap[status] || '未知';
    }
  }
}
</script>

<style>
@charset "utf-8";

.consultation-page {
  min-height: 100vh;
  background: #f6f7f9;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'SimHei', '微软雅黑', Arial, sans-serif;
}

.consultation-page * {
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
}

.content {
  height: calc(100vh - 88px);
  padding: 24rpx;
}

.banner {
  background: linear-gradient(135deg, #28c266 0%, #20a855 100%);
  border-radius: 16rpx;
  padding: 48rpx 32rpx;
  color: #fff;
  margin-bottom: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.banner-title {
  font-size: 40rpx;
  font-weight: 700;
}

.banner-desc {
  font-size: 26rpx;
  opacity: 0.9;
}

.service-list {
  margin-bottom: 48rpx;
}

.service-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.service-icon {
  font-size: 64rpx;
  margin-right: 24rpx;
}

.service-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.service-name {
  font-size: 32rpx;
  font-weight: 700;
  color: #222;
}

.service-desc {
  font-size: 24rpx;
  color: #999;
}

.service-price {
  font-size: 32rpx;
  font-weight: 700;
  color: #ff7a00;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #222;
  margin-bottom: 24rpx;
}

.history-list {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.history-item:last-child {
  border-bottom: none;
}

.history-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.history-type {
  font-size: 30rpx;
  font-weight: 600;
  color: #222;
}

.history-time {
  font-size: 24rpx;
  color: #999;
}

.history-status {
  font-size: 24rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  display: inline-block;
  width: fit-content;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-processing {
  background: #d1ecf1;
  color: #0c5460;
}

.status-completed {
  background: #d4edda;
  color: #155724;
}

.history-arrow {
  font-size: 32rpx;
  color: #ccc;
}

.empty-tip {
  padding: 80rpx 24rpx;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}

/* 弹窗样式 */
.consultation-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: #fff;
  border-radius: 24rpx;
  width: 680rpx;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #222;
}

.modal-close {
  font-size: 48rpx;
  color: #999;
  line-height: 1;
}

.modal-body {
  flex: 1;
  padding: 32rpx;
  max-height: 60vh;
}

.form-item {
  margin-bottom: 32rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: #222;
  margin-bottom: 16rpx;
}

.form-label.required {
  color: #000;
}

.form-label.required::after {
  content: ' *';
  color: #ff3b30;
}

.form-input {
  width: 100%;
  height: 88rpx;
  background: #f2f7fb;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.form-textarea {
  width: 100%;
  min-height: 200rpx;
  background: #f2f7fb;
  border-radius: 12rpx;
  padding: 24rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.radio-group {
  display: flex;
  gap: 48rpx;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 28rpx;
  color: #222;
}

.upload-area {
  min-height: 200rpx;
  background: #f2f7fb;
  border-radius: 12rpx;
  border: 2rpx dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
}

.upload-hint {
  color: #999;
  font-size: 26rpx;
  text-align: center;
}

.uploaded-image {
  width: 100%;
  max-height: 400rpx;
  border-radius: 8rpx;
}

.modal-footer {
  display: flex;
  gap: 24rpx;
  padding: 32rpx;
  border-top: 1rpx solid #f0f0f0;
}

.modal-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: 700;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.submit-btn {
  background: #28c266;
  color: #fff;
}
</style>

