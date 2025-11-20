<template>
  <view class="medicine-page">
    <view class="header">
      <image class="back-btn" src="/static/mgc/fanhui.png" @click="goBack"></image>
      <text class="header-title">用药提醒</text>
    </view>

    <scroll-view scroll-y class="content">
      <view class="add-btn-wrap">
        <button class="add-btn" @click="addMedicine">+ 添加用药提醒</button>
        <button class="records-btn" @click="viewRecords">📊 用药记录</button>
      </view>

      <view class="medicine-list">
        <view 
          class="medicine-item" 
          v-for="(medicine, index) in medicineList" 
          :key="index"
        >
          <image 
            class="medicine-image" 
            :src="medicine.image || '/static/mgc/geren.png'" 
            mode="aspectFill"
          ></image>
          <view class="medicine-info">
            <view class="medicine-name">{{ medicine.name }}</view>
            <view class="medicine-desc">{{ medicine.dailyDosage || '每日用量未设置' }}</view>
            <view class="medicine-time">下次提醒：{{ medicine.nextTime }}</view>
          </view>
          <view class="medicine-actions">
            <image class="action-icon" src="/static/mgc/Information.png" @click="editMedicine(medicine, index)"></image>
            <image class="action-icon" src="/static/mgc/Information.png" @click="deleteMedicine(index)"></image>
          </view>
        </view>

        <view v-if="medicineList.length === 0" class="empty-tip">
          <text>暂无用药提醒</text>
          <text class="empty-hint">点击上方按钮添加用药提醒</text>
        </view>
      </view>
    </scroll-view>

    <!-- 添加/编辑用药提醒弹窗 -->
    <view class="medicine-modal" v-if="showModal" @click.self="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ editingIndex !== null ? '编辑用药提醒' : '添加用药提醒' }}</text>
          <text class="modal-close" @click="closeModal">?</text>
        </view>

        <scroll-view scroll-y class="modal-body">
          <!-- 药品图片上传 -->
          <view class="form-item">
            <text class="form-label required">*药品图片</text>
            <view class="image-upload-area" @click="takeMedicinePhoto">
              <image 
                v-if="medicineForm.image" 
                class="uploaded-medicine-image" 
                :src="medicineForm.image" 
                mode="aspectFit"
              ></image>
              <view v-else class="upload-placeholder">
                <image class="camera-icon" src="/static/mgc/Camera.png"></image>
                <text class="upload-hint">点击拍照上传药品图片</text>
              </view>
            </view>
          </view>

          <view class="form-item">
            <text class="form-label required">*药品名称</text>
            <input 
              class="form-input" 
              placeholder="请输入药品名称" 
              v-model.trim="medicineForm.name" 
            />
          </view>

          <view class="form-item">
            <text class="form-label required">*每日用量</text>
            <textarea 
              class="form-textarea daily-dosage" 
              placeholder="请输入每日用量备注，例如：早饭后1片，午饭后1片，晚饭后1片" 
              v-model.trim="medicineForm.dailyDosage"
              maxlength="200"
            ></textarea>
          </view>

          <view class="form-item">
            <text class="form-label required">*用药频率</text>
            <picker 
              mode="selector" 
              :range="frequencyOptions" 
              :value="frequencyIndex"
              @change="onFrequencyChange"
            >
              <view class="picker-view">
                {{ medicineForm.frequency || '请选择用药频率' }}
              </view>
            </picker>
          </view>

          <view class="form-item">
            <text class="form-label required">*提醒时间</text>
            <picker 
              mode="time" 
              :value="medicineForm.time"
              @change="onTimeChange"
            >
              <view class="picker-view">
                {{ medicineForm.time || '请选择提醒时间' }}
              </view>
            </picker>
          </view>

          <view class="form-item">
            <text class="form-label">开始日期</text>
            <picker 
              mode="date" 
              :value="medicineForm.startDate"
              @change="onStartDateChange"
            >
              <view class="picker-view">
                {{ medicineForm.startDate || '请选择开始日期' }}
              </view>
            </picker>
          </view>

          <view class="form-item">
            <text class="form-label">结束日期</text>
            <picker 
              mode="date" 
              :value="medicineForm.endDate"
              @change="onEndDateChange"
            >
              <view class="picker-view">
                {{ medicineForm.endDate || '请选择结束日期（可选）' }}
              </view>
            </picker>
          </view>

          <view class="form-item">
            <text class="form-label">备注</text>
            <textarea 
              class="form-textarea" 
              placeholder="请输入备注信息（可选）" 
              v-model.trim="medicineForm.note"
              maxlength="200"
            ></textarea>
          </view>
        </scroll-view>

        <view class="modal-footer">
          <button class="modal-btn cancel-btn" @click="closeModal">取消</button>
          <button class="modal-btn save-btn" @click="saveMedicine">保存</button>
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
      medicineList: [],
      showModal: false,
      editingIndex: null,
      frequencyIndex: 0,
      frequencyOptions: [
        '每天1次',
        '每天2次',
        '每天3次',
        '每天4次',
        '每2天1次',
        '每周1次',
        '按需服用'
      ],
      medicineForm: {
        name: '',
        image: '',
        dailyDosage: '',
        dosage: '',
        frequency: '',
        time: '',
        startDate: '',
        endDate: '',
        note: ''
      }
    }
  },
  async onLoad() {
    this.loadMedicineList();
    // 尝试从云端恢复用药提醒数据
    await this.loadMedicinesFromCloud();
  },
  methods: {
    goBack() {
      uni.redirectTo({
					url: '/pages/index/index?page=1'
				});
    },
    viewRecords() {
      uni.navigateTo({
        url: '/pages/medicine/medicine-records'
      });
    },
    loadMedicineList() {
      const list = uni.getStorageSync('medicineList') || [];
      this.medicineList = list.map(med => {
        // 计算下次提醒时间
        if (med.time && med.frequency) {
          med.nextTime = this.calculateNextTime(med.time, med.frequency);
        } else {
          med.nextTime = '未设置';
        }
        return med;
      });
    },
    // 从云端加载用药提醒
    async loadMedicinesFromCloud() {
      try {
        const result = await apiUtils.api.getMedicines(true); // 静默模式
        if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
          const localMedicines = uni.getStorageSync('medicineList') || [];
          // 如果本地没有数据，使用云端数据
          if (localMedicines.length === 0 && result.data.length > 0) {
            uni.setStorageSync('medicineList', result.data);
            this.loadMedicineList();
            console.log('已从云端恢复用药提醒数据');
          }
        }
      } catch (error) {
        // 静默失败，不影响本地数据使用
        console.log('从云端加载用药提醒失败（使用本地数据）:', error.message);
      }
    },
    // 同步用药提醒到云端
    async syncMedicinesToCloud() {
      try {
        const medicines = uni.getStorageSync('medicineList') || [];
        if (medicines.length > 0) {
          await apiUtils.api.syncMedicines(medicines, true); // 静默模式，后台同步
          console.log('用药提醒已同步到云端');
        }
      } catch (error) {
        // 静默失败，404错误不显示（后端服务可能未启动）
        if (error.message && !error.message.includes('404')) {
          console.error('同步用药提醒到云端失败:', error);
        }
      }
    },
    calculateNextTime(time, frequency) {
      const now = new Date();
      const [hours, minutes] = time.split(':').map(Number);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
      
      if (now < today) {
        // 今天的提醒时间还没到
        return `今天 ${time}`;
      } else {
        // 今天的提醒时间已过，返回明天
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return `明天 ${time}`;
      }
    },
    addMedicine() {
      this.editingIndex = null;
      this.resetForm();
      this.showModal = true;
    },
    editMedicine(medicine, index) {
      this.editingIndex = index;
      this.medicineForm = { ...medicine };
      this.frequencyIndex = this.frequencyOptions.indexOf(medicine.frequency) || 0;
      this.showModal = true;
    },
    async deleteMedicine(index) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这个用药提醒吗？',
        success: async (res) => {
          if (res.confirm) {
            this.medicineList.splice(index, 1);
            uni.setStorageSync('medicineList', this.medicineList);
            
            // 同步到云端
            await this.syncMedicinesToCloud();
            
            uni.showToast({ title: '已删除', icon: 'success' });
          }
        }
      });
    },
    resetForm() {
      this.medicineForm = {
        name: '',
        image: '',
        dailyDosage: '',
        dosage: '',
        frequency: '',
        time: '',
        startDate: '',
        endDate: '',
        note: ''
      };
      this.frequencyIndex = 0;
    },
    takeMedicinePhoto() {
      // 提供选择菜单：拍照或从相册选择
      uni.showActionSheet({
        itemList: ['拍照', '从相册选择'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 拍照
            uni.chooseImage({
              count: 1,
              sourceType: ['camera'],
              camera: 'back',
              success: (res) => {
                this.medicineForm.image = res.tempFilePaths[0];
              },
              fail: (err) => {
                console.log('拍照失败:', err);
                uni.showToast({ title: '拍照失败，请检查相机权限', icon: 'none' });
              }
            });
          } else {
            // 从相册选择
            uni.chooseImage({
              count: 1,
              sourceType: ['album'],
              success: (res) => {
                this.medicineForm.image = res.tempFilePaths[0];
              },
              fail: (err) => {
                console.log('选择图片失败:', err);
                uni.showToast({ title: '请检查相册权限', icon: 'none' });
              }
            });
          }
        }
      });
    },
    closeModal() {
      this.showModal = false;
      this.resetForm();
      this.editingIndex = null;
    },
    onFrequencyChange(e) {
      this.frequencyIndex = e.detail.value;
      this.medicineForm.frequency = this.frequencyOptions[e.detail.value];
    },
    onTimeChange(e) {
      this.medicineForm.time = e.detail.value;
    },
    onStartDateChange(e) {
      this.medicineForm.startDate = e.detail.value;
    },
    onEndDateChange(e) {
      this.medicineForm.endDate = e.detail.value;
    },
    async saveMedicine() {
      // 验证必填项
      if (!this.medicineForm.image) {
        return uni.showToast({ title: '请拍照上传药品图片', icon: 'none' });
      }
      if (!this.medicineForm.name) {
        return uni.showToast({ title: '请输入药品名称', icon: 'none' });
      }
      if (!this.medicineForm.dailyDosage) {
        return uni.showToast({ title: '请输入每日用量备注', icon: 'none' });
      }
      if (!this.medicineForm.frequency) {
        return uni.showToast({ title: '请选择用药频率', icon: 'none' });
      }
      if (!this.medicineForm.time) {
        return uni.showToast({ title: '请选择提醒时间', icon: 'none' });
      }

      // 如果没有设置开始日期，默认今天
      if (!this.medicineForm.startDate) {
        const today = new Date();
        this.medicineForm.startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      }

      // 计算下次提醒时间
      const medicine = {
        ...this.medicineForm,
        nextTime: this.calculateNextTime(this.medicineForm.time, this.medicineForm.frequency)
      };

      if (this.editingIndex !== null) {
        // 编辑
        this.medicineList[this.editingIndex] = medicine;
      } else {
        // 新增
        this.medicineList.push(medicine);
      }

      uni.setStorageSync('medicineList', this.medicineList);
      this.loadMedicineList();
      
      // 同步到云端
      await this.syncMedicinesToCloud();
      
      uni.showToast({ title: '保存成功', icon: 'success' });
      this.closeModal();
    }
  }
}
</script>

<style>
@charset "utf-8";

.medicine-page {
  min-height: 100vh;
  background: #f6f7f9;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'SimHei', '微软雅黑', Arial, sans-serif;
}

.medicine-page * {
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

.add-btn-wrap {
  margin-bottom: 24rpx;
  display: flex;
  gap: 12rpx;
}

.add-btn {
  flex: 1;
  height: 88rpx;
  background: #28c266;
  color: #fff;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: 700;
  border: none;
  display: flex;
  align-items: center;
}

.records-btn {
  flex: 1;
  height: 88rpx;
  background: #007AFF;
  color: #fff;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 700;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.medicine-list {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.medicine-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.medicine-item:last-child {
  border-bottom: none;
}

.medicine-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  margin-right: 24rpx;
  background: #f5f5f5;
  flex-shrink: 0;
}

.medicine-info {
  flex: 1;
}

.medicine-name {
  font-size: 32rpx;
  font-weight: 700;
  color: #222;
  margin-bottom: 8rpx;
}

.medicine-desc {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.medicine-time {
  font-size: 24rpx;
  color: #999;
}

.medicine-actions {
  display: flex;
  gap: 24rpx;
  align-items: center;
}

.action-icon {
  width: 48rpx;
  height: 48rpx;
}

.empty-tip {
  padding: 80rpx 24rpx;
  text-align: center;
  color: #999;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.empty-hint {
  font-size: 24rpx;
  color: #ccc;
}

/* 弹窗样式 */
.medicine-modal {
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

.picker-view {
  height: 88rpx;
  background: #f2f7fb;
  border-radius: 12rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  font-size: 28rpx;
  color: #222;
}

.form-textarea {
  width: 100%;
  min-height: 160rpx;
  background: #f2f7fb;
  border-radius: 12rpx;
  padding: 24rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.form-textarea.daily-dosage {
  min-height: 120rpx;
}

/* 图片上传区域 */
.image-upload-area {
  width: 100%;
  min-height: 300rpx;
  background: #f2f7fb;
  border-radius: 12rpx;
  border: 2rpx dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
  box-sizing: border-box;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.camera-icon {
  width: 80rpx;
  height: 80rpx;
  opacity: 0.5;
}

.upload-hint {
  font-size: 26rpx;
  color: #999;
}

.uploaded-medicine-image {
  width: 100%;
  max-height: 500rpx;
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

.save-btn {
  background: #28c266;
  color: #fff;
}
</style>

