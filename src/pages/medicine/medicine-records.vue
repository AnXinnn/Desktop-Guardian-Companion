<template>
  <view class="medicine-records-page">
    <view class="header">
      <image class="back-btn" src="/static/mgc/fanhui.png" @click="goBack"></image>
      <text class="header-title">用药记录</text>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-section">
      <view class="stat-card">
        <text class="stat-value">{{ stats.total }}</text>
        <text class="stat-label">总记录</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ stats.onTime }}</text>
        <text class="stat-label">按时用药</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ stats.late }}</text>
        <text class="stat-label">延迟用药</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ stats.missed }}</text>
        <text class="stat-label">漏服</text>
      </view>
    </view>

    <!-- 筛选 -->
    <view class="filter-section">
      <picker 
        mode="selector" 
        :range="medicineOptions" 
        :value="selectedMedicineIndex"
        @change="onMedicineChange"
      >
        <view class="filter-item">
          <text>{{ selectedMedicine || '全部药品' }}</text>
          <text>▼</text>
        </view>
      </picker>
      <picker 
        mode="date" 
        :value="startDate"
        @change="onStartDateChange"
      >
        <view class="filter-item">
          <text>{{ startDate || '开始日期' }}</text>
          <text>▼</text>
        </view>
      </picker>
      <picker 
        mode="date" 
        :value="endDate"
        @change="onEndDateChange"
      >
        <view class="filter-item">
          <text>{{ endDate || '结束日期' }}</text>
          <text>▼</text>
        </view>
      </picker>
    </view>

    <!-- 记录列表 -->
    <scroll-view scroll-y class="records-list">
      <view 
        class="record-item" 
        v-for="(record, index) in filteredRecords" 
        :key="index"
      >
        <view class="record-header">
          <image class="record-medicine-icon" :src="record.medicineImage || '/static/mgc/geren.png'"></image>
          <view class="record-info">
            <text class="record-medicine-name">{{ record.medicineName }}</text>
            <text class="record-time">{{ record.remindTime }}</text>
          </view>
          <view class="record-status" :class="'status-' + record.status">
            {{ getStatusText(record.status) }}
          </view>
        </view>
        <view class="record-details">
          <text class="record-dosage">{{ record.dailyDosage || '未设置用量' }}</text>
          <text class="record-actual-time" v-if="record.actualTime">
            实际用药时间：{{ record.actualTime }}
          </text>
        </view>
      </view>

      <view v-if="filteredRecords.length === 0" class="empty-tip">
        <text>暂无用药记录</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      records: [],
      selectedMedicine: '',
      selectedMedicineIndex: 0,
      medicineOptions: ['全部药品'],
      startDate: '',
      endDate: '',
      medicineList: []
    }
  },
  computed: {
    stats() {
      const total = this.records.length;
      const onTime = this.records.filter(r => r.status === 'onTime').length;
      const late = this.records.filter(r => r.status === 'late').length;
      const missed = this.records.filter(r => r.status === 'missed').length;
      return { total, onTime, late, missed };
    },
    filteredRecords() {
      let result = this.records;
      
      // 按药品筛选
      if (this.selectedMedicine && this.selectedMedicine !== '全部药品') {
        result = result.filter(r => r.medicineName === this.selectedMedicine);
      }
      
      // 按日期筛选
      if (this.startDate) {
        result = result.filter(r => r.date >= this.startDate);
      }
      if (this.endDate) {
        result = result.filter(r => r.date <= this.endDate);
      }
      
      // 按时间倒序排列
      return result.sort((a, b) => {
        return new Date(b.date + ' ' + b.remindTime) - new Date(a.date + ' ' + a.remindTime);
      });
    }
  },
  onLoad() {
    this.loadRecords();
    this.loadMedicineList();
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    loadMedicineList() {
      this.medicineList = uni.getStorageSync('medicineList') || [];
      this.medicineOptions = ['全部药品', ...this.medicineList.map(m => m.name)];
    },
    loadRecords() {
      this.records = uni.getStorageSync('medicineRecords') || [];
    },
    onMedicineChange(e) {
      this.selectedMedicineIndex = parseInt(e.detail.value);
      this.selectedMedicine = this.medicineOptions[this.selectedMedicineIndex];
    },
    onStartDateChange(e) {
      this.startDate = e.detail.value;
    },
    onEndDateChange(e) {
      this.endDate = e.detail.value;
    },
    getStatusText(status) {
      const map = {
        'onTime': '按时',
        'late': '延迟',
        'missed': '漏服'
      };
      return map[status] || '未知';
    }
  }
}
</script>

<style>
.medicine-records-page {
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

.stats-section {
  display: flex;
  padding: 16px;
  gap: 12px;
  background: #fff;
  margin-bottom: 8px;
}

.stat-card {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
}

.stat-card:nth-child(2) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card:nth-child(3) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card:nth-child(4) {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
}

.filter-section {
  background: #fff;
  padding: 12px 16px;
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.filter-item {
  flex: 1;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.records-list {
  height: calc(100vh - 300px);
  padding: 8px 0;
}

.record-item {
  background: #fff;
  padding: 16px;
  margin-bottom: 8px;
  border-radius: 8px;
}

.record-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.record-medicine-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  margin-right: 12px;
}

.record-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.record-medicine-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.record-time {
  font-size: 14px;
  color: #999;
}

.record-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.record-status.status-onTime {
  background: #e8f5e9;
  color: #388e3c;
}

.record-status.status-late {
  background: #fff3e0;
  color: #f57c00;
}

.record-status.status-missed {
  background: #ffebee;
  color: #d32f2f;
}

.record-details {
  padding-left: 60px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.record-dosage {
  font-size: 14px;
  color: #666;
}

.record-actual-time {
  font-size: 12px;
  color: #999;
}

.empty-tip {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 14px;
}
</style>

