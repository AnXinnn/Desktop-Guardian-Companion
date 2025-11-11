<template>
  <view class="contacts-page">
    <view class="header">
      <image class="back-btn" src="/static/mgc/fanhui.png" @click="goBack"></image>
      <text class="header-title">联系人</text>
      <view class="header-right">
        <text class="add-btn" @click="addContact">+</text>
      </view>
    </view>

    <!-- 搜索框 -->
    <view class="search-bar">
      <input 
        class="search-input" 
        placeholder="搜索联系人" 
        v-model.trim="searchKeyword"
        @input="handleSearch"
      />
      <text class="search-icon">?</text>
    </view>

    <!-- 分组标签 -->
    <view class="group-tabs">
      <view 
        class="group-tab" 
        :class="{ active: currentGroup === 'all' }"
        @click="switchGroup('all')"
      >
        全部
      </view>
      <view 
        class="group-tab" 
        :class="{ active: currentGroup === 'family' }"
        @click="switchGroup('family')"
      >
        家人
      </view>
      <view 
        class="group-tab" 
        :class="{ active: currentGroup === 'friend' }"
        @click="switchGroup('friend')"
      >
        朋友
      </view>
      <view 
        class="group-tab" 
        :class="{ active: currentGroup === 'doctor' }"
        @click="switchGroup('doctor')"
      >
        医生
      </view>
      <view 
        class="group-tab" 
        :class="{ active: currentGroup === 'other' }"
        @click="switchGroup('other')"
      >
        其他
      </view>
    </view>

    <!-- 联系人列表 -->
    <scroll-view scroll-y class="contacts-list">
      <view 
        class="contact-item" 
        v-for="(contact, index) in filteredContacts" 
        :key="index"
        @click="showContactDetail(contact)"
      >
        <image class="contact-avatar" :src="contact.icon || '/static/mgc/geren.png'"></image>
        <view class="contact-info">
          <text class="contact-name">{{ contact.wxNote || contact.name }}</text>
          <text class="contact-phone">{{ contact.mobile }}</text>
        </view>
        <view class="contact-group-tag" :class="'group-' + (contact.group || 'other')">
          {{ getGroupName(contact.group || 'other') }}
        </view>
      </view>

      <view v-if="filteredContacts.length === 0" class="empty-tip">
        <text>{{ searchKeyword ? '未找到匹配的联系人' : '暂无联系人' }}</text>
      </view>
    </scroll-view>

    <!-- 联系人详情弹窗 -->
    <view class="contact-detail-modal" v-if="selectedContact" @click.self="closeDetail">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">联系人详情</text>
          <text class="modal-close" @click="closeDetail">?</text>
        </view>
        
        <view class="detail-body">
          <image class="detail-avatar" :src="selectedContact.icon || '/static/mgc/geren.png'"></image>
          <text class="detail-name">{{ selectedContact.wxNote || selectedContact.name }}</text>
          <text class="detail-phone">{{ selectedContact.mobile }}</text>
          
          <view class="detail-group">
            <text class="detail-label">分组：</text>
            <picker 
              mode="selector" 
              :range="groupOptions" 
              :value="selectedGroupIndex"
              @change="onGroupChange"
            >
              <view class="group-picker">
                {{ getGroupName(selectedContact.group || 'other') }}
              </view>
            </picker>
          </view>

          <view class="detail-actions">
            <button class="action-btn call-btn" @click="makeCall">? 拨打电话</button>
            <button class="action-btn edit-btn" @click="editContact">?? 编辑</button>
            <button class="action-btn delete-btn" @click="deleteContact">?? 删除</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      contacts: [],
      searchKeyword: '',
      currentGroup: 'all',
      selectedContact: null,
      groupOptions: ['家人', '朋友', '医生', '其他'],
      selectedGroupIndex: 0
    }
  },
  computed: {
    filteredContacts() {
      let result = this.contacts;
      
      // 按分组筛选
      if (this.currentGroup !== 'all') {
        result = result.filter(c => (c.group || 'other') === this.currentGroup);
      }
      
      // 按关键词搜索
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase();
        result = result.filter(c => 
          (c.name && c.name.toLowerCase().includes(keyword)) ||
          (c.wxNote && c.wxNote.toLowerCase().includes(keyword)) ||
          (c.mobile && c.mobile.includes(keyword))
        );
      }
      
      // 按名称排序
      return result.sort((a, b) => {
        const nameA = (a.wxNote || a.name || '').toLowerCase();
        const nameB = (b.wxNote || b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
    }
  },
  onLoad() {
    this.loadContacts();
  },
  methods: {
    goBack() {
      uni.redirectTo({
        url: '/pages/index/index?page=1'
      });
    },
    loadContacts() {
      this.contacts = uni.getStorageSync('contacts') || [];
    },
    handleSearch() {
      // 搜索逻辑已在computed中处理
    },
    switchGroup(group) {
      this.currentGroup = group;
    },
    getGroupName(group) {
      const map = {
        'family': '家人',
        'friend': '朋友',
        'doctor': '医生',
        'other': '其他'
      };
      return map[group] || '其他';
    },
    showContactDetail(contact) {
      this.selectedContact = contact;
      const groupMap = { 'family': 0, 'friend': 1, 'doctor': 2, 'other': 3 };
      this.selectedGroupIndex = groupMap[contact.group || 'other'] || 3;
    },
    closeDetail() {
      this.selectedContact = null;
    },
    onGroupChange(e) {
      const index = parseInt(e.detail.value);
      const groupMap = ['family', 'friend', 'doctor', 'other'];
      const newGroup = groupMap[index];
      
      // 更新联系人分组
      const contactIndex = this.contacts.findIndex(c => 
        c.mobile === this.selectedContact.mobile && 
        c.name === this.selectedContact.name
      );
      
      if (contactIndex !== -1) {
        this.contacts[contactIndex].group = newGroup;
        uni.setStorageSync('contacts', this.contacts);
        this.selectedContact.group = newGroup;
        uni.showToast({ title: '分组已更新', icon: 'success' });
      }
    },
    addContact() {
      uni.navigateTo({
        url: '/pages/add-contact/add-contact'
      });
    },
    editContact() {
      uni.navigateTo({
        url: `/pages/add-contact/add-contact?edit=1&name=${encodeURIComponent(this.selectedContact.name)}&mobile=${this.selectedContact.mobile}`
      });
    },
    makeCall() {
      if (this.selectedContact && this.selectedContact.mobile) {
        uni.makePhoneCall({
          phoneNumber: this.selectedContact.mobile,
          success: () => {
            // 记录通话记录
            this.recordCall(this.selectedContact);
          },
          fail: () => {
            uni.showToast({ title: '拨号失败', icon: 'none' });
          }
        });
      }
    },
    recordCall(contact) {
      const callRecords = uni.getStorageSync('callRecords') || [];
      callRecords.unshift({
        name: contact.name,
        wxNote: contact.wxNote || contact.name,
        mobile: contact.mobile,
        icon: contact.icon,
        time: new Date().toLocaleString('zh-CN'),
        type: 'outgoing'
      });
      // 只保留最近100条记录
      if (callRecords.length > 100) {
        callRecords.pop();
      }
      uni.setStorageSync('callRecords', callRecords);
    },
    deleteContact() {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除联系人"${this.selectedContact.name}"吗？`,
        success: (res) => {
          if (res.confirm) {
            const index = this.contacts.findIndex(c => 
              c.mobile === this.selectedContact.mobile && 
              c.name === this.selectedContact.name
            );
            if (index !== -1) {
              this.contacts.splice(index, 1);
              uni.setStorageSync('contacts', this.contacts);
              this.closeDetail();
              uni.showToast({ title: '已删除', icon: 'success' });
            }
          }
        }
      });
    }
  },
  onShow() {
    // 从添加联系人页面返回时刷新列表
    this.loadContacts();
  }
}
</script>

<style>
.contacts-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: #fff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
}

.back-btn {
  width: 24px;
  height: 24px;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
}

.header-right {
  width: 24px;
}

.add-btn {
  font-size: 28px;
  color: #28c266;
  font-weight: 300;
}

.search-bar {
  background: #fff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  position: relative;
}

.search-input {
  flex: 1;
  height: 36px;
  background: #f5f5f5;
  border-radius: 18px;
  padding: 0 40px 0 16px;
  font-size: 14px;
}

.search-icon {
  position: absolute;
  right: 28px;
  font-size: 16px;
}

.group-tabs {
  background: #fff;
  display: flex;
  padding: 8px 16px;
  border-bottom: 1px solid #eee;
  overflow-x: auto;
}

.group-tab {
  padding: 8px 16px;
  margin-right: 8px;
  border-radius: 16px;
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

.group-tab.active {
  background: #28c266;
  color: #fff;
}

.contacts-list {
  height: calc(100vh - 200px);
  padding: 8px 0;
}

.contact-item {
  background: #fff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f5f5f5;
}

.contact-avatar {
  width: 48px;
  height: 48px;
  border-radius: 24px;
  margin-right: 12px;
}

.contact-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.contact-name {
  font-size: 16px;
  color: #333;
  margin-bottom: 4px;
}

.contact-phone {
  font-size: 14px;
  color: #999;
}

.contact-group-tag {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  background: #f0f0f0;
  color: #666;
}

.contact-group-tag.group-family {
  background: #ffe6e6;
  color: #d32f2f;
}

.contact-group-tag.group-friend {
  background: #e3f2fd;
  color: #1976d2;
}

.contact-group-tag.group-doctor {
  background: #e8f5e9;
  color: #388e3c;
}

.empty-tip {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 14px;
}

.contact-detail-modal {
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
  max-height: 80vh;
  overflow-y: auto;
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

.detail-body {
  padding: 24px;
  text-align: center;
}

.detail-avatar {
  width: 80px;
  height: 80px;
  border-radius: 40px;
  margin-bottom: 12px;
}

.detail-name {
  display: block;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

.detail-phone {
  display: block;
  font-size: 16px;
  color: #666;
  margin-bottom: 24px;
}

.detail-group {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.detail-label {
  font-size: 14px;
  color: #666;
  margin-right: 8px;
}

.group-picker {
  padding: 6px 16px;
  background: #f5f5f5;
  border-radius: 16px;
  font-size: 14px;
  color: #333;
}

.detail-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  padding: 12px;
  border-radius: 8px;
  border: none;
  font-size: 16px;
}

.call-btn {
  background: #28c266;
  color: #fff;
}

.edit-btn {
  background: #007AFF;
  color: #fff;
}

.delete-btn {
  background: #ff3b30;
  color: #fff;
}
</style>

