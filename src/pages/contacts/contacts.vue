<template>
  <view class="contacts-page">
    <view class="header">
      <image class="back-btn" src="/static/mgc/fanhui.png" @click="goBack"></image>
      <text class="header-title">联系人</text>
      <view class="header-right">
        <text class="add-btn" @click="addContact">+</text>
        <text class="menu-btn" @click="showMenu">⋮</text>
      </view>
    </view>
    
    <!-- 功能菜单 -->
    <view class="action-menu" v-if="showActionMenu" @click.self="closeMenu">
      <view class="menu-content" @click.stop>
        <view class="menu-item" @click="importFromSystem">
          <text class="menu-icon">📥</text>
          <text class="menu-text">从通讯录导入</text>
        </view>
        <view class="menu-item" @click="exportContacts">
          <text class="menu-icon">📤</text>
          <text class="menu-text">导出备份</text>
        </view>
        <view class="menu-item" @click="mergeDuplicates">
          <text class="menu-icon">🔗</text>
          <text class="menu-text">合并重复联系人</text>
        </view>
        <view class="menu-item" @click="repairContacts">
          <text class="menu-icon">🔧</text>
          <text class="menu-text">一键修复</text>
        </view>
        <view class="menu-item cancel" @click="closeMenu">
          <text>取消</text>
        </view>
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
import {
  importFromSystemContacts,
  exportContacts,
  detectAndMergeDuplicates,
  repairContacts
} from '@/utils/contactHelper.js';
import apiUtils from '@/utils/api.js';

export default {
  data() {
    return {
      contacts: [],
      searchKeyword: '',
      currentGroup: 'all',
      selectedContact: null,
      groupOptions: ['家人', '朋友', '医生', '其他'],
      selectedGroupIndex: 0,
      showActionMenu: false
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
  async onLoad() {
    await this.loadContacts();
    
    // 监听一键修复事件（从首页跳转过来）
    uni.$on('repairContacts', () => {
      this.repairContacts();
    });
    
    // 尝试从云端恢复联系人数据
    await this.loadContactsFromCloud();
  },
  onUnload() {
    // 移除事件监听
    uni.$off('repairContacts');
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
    // 从云端加载联系人
    async loadContactsFromCloud() {
      try {
        const result = await apiUtils.api.getContacts(true); // 静默模式
        if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
          // 合并云端数据和本地数据（以本地数据为主，云端数据补充）
          const localContacts = uni.getStorageSync('contacts') || [];
          const cloudContacts = result.data;
          
          // 简单的合并策略：如果本地有数据，优先使用本地；否则使用云端
          if (localContacts.length === 0 && cloudContacts.length > 0) {
            uni.setStorageSync('contacts', cloudContacts);
            this.contacts = cloudContacts;
            console.log('已从云端恢复联系人数据');
          }
        }
      } catch (error) {
        // 静默失败，不影响本地数据使用
        // 超时或404错误都不显示，避免干扰用户
        console.log('从云端加载联系人失败（使用本地数据）:', error.message);
      }
    },
    // 保存联系人时同步到云端
    async syncContactsToCloud() {
      try {
        const contacts = uni.getStorageSync('contacts') || [];
        if (contacts.length > 0) {
          await apiUtils.api.syncContacts(contacts, true); // 静默模式，后台同步
          console.log('联系人已同步到云端');
        }
      } catch (error) {
        // 静默失败，不显示错误提示
        // 404错误说明后端服务未启动，这是正常的（开发阶段）
        if (error.message && !error.message.includes('404')) {
          console.error('同步联系人到云端失败:', error);
        }
      }
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
    async onGroupChange(e) {
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
        
        // 同步到云端
        await this.syncContactsToCloud();
        
        uni.showToast({ title: '分组已更新', icon: 'success' });
      }
    },
    addContact() {
      uni.navigateTo({
        url: '/pages/add-contact/add-contact'
      });
    },
    // 显示功能菜单
    showMenu() {
      this.showActionMenu = true;
    },
    // 关闭功能菜单
    closeMenu() {
      this.showActionMenu = false;
    },
    // 从系统通讯录导入
    async importFromSystem() {
      this.closeMenu();
      
      uni.showLoading({ title: '正在导入...' });
      
      try {
        const importedContacts = await importFromSystemContacts();
        
        if (importedContacts.length === 0) {
          uni.hideLoading();
          uni.showModal({
            title: '提示',
            content: '未找到可导入的联系人，请检查通讯录权限',
            showCancel: false
          });
          return;
        }
        
        // 显示导入确认对话框
        uni.hideLoading();
        uni.showModal({
          title: '导入确认',
          content: `找到${importedContacts.length}个联系人，是否导入？`,
          success: async (res) => {
            if (res.confirm) {
              uni.showLoading({ title: '正在导入...' });
              
              // 合并到现有联系人
              const existingContacts = uni.getStorageSync('contacts') || [];
              
              // 检测重复
              const allContacts = [...existingContacts, ...importedContacts];
              const duplicateResult = detectAndMergeDuplicates(allContacts);
              
              // 保存合并后的联系人
              uni.setStorageSync('contacts', duplicateResult.merged);
              this.loadContacts();
              
              // 同步到云端
              await this.syncContactsToCloud();
              
              uni.hideLoading();
              uni.showToast({
                title: `导入成功，合并了${duplicateResult.count}个重复项`,
                icon: 'success',
                duration: 3000
              });
            }
          }
        });
      } catch (e) {
        uni.hideLoading();
        console.error('导入失败:', e);
        uni.showModal({
          title: '导入失败',
          content: '请确保已授予通讯录访问权限',
          showCancel: false
        });
      }
    },
    // 导出联系人
    async exportContacts() {
      this.closeMenu();
      
      if (this.contacts.length === 0) {
        uni.showToast({
          title: '没有可导出的联系人',
          icon: 'none'
        });
        return;
      }
      
      uni.showLoading({ title: '正在导出...' });
      
      try {
        await exportContacts(this.contacts);
        uni.hideLoading();
      } catch (e) {
        uni.hideLoading();
        console.error('导出失败:', e);
        uni.showToast({
          title: '导出失败',
          icon: 'none'
        });
      }
    },
    // 合并重复联系人
    async mergeDuplicates() {
      this.closeMenu();
      
      if (this.contacts.length === 0) {
        uni.showToast({
          title: '没有联系人',
          icon: 'none'
        });
        return;
      }
      
      uni.showLoading({ title: '正在检测...' });
      
      try {
        const duplicateResult = detectAndMergeDuplicates(this.contacts);
        
        uni.hideLoading();
        
        if (duplicateResult.count === 0) {
          uni.showToast({
            title: '未发现重复联系人',
            icon: 'success'
          });
          return;
        }
        
        // 显示合并确认
        uni.showModal({
          title: '合并重复联系人',
          content: `发现${duplicateResult.count}个重复联系人，是否合并？`,
          success: async (res) => {
            if (res.confirm) {
              uni.setStorageSync('contacts', duplicateResult.merged);
              this.loadContacts();
              
              // 同步到云端
              await this.syncContactsToCloud();
              
              uni.showToast({
                title: `已合并${duplicateResult.count}个重复项`,
                icon: 'success'
              });
            }
          }
        });
      } catch (e) {
        uni.hideLoading();
        console.error('合并失败:', e);
        uni.showToast({
          title: '合并失败',
          icon: 'none'
        });
      }
    },
    // 一键修复
    async repairContacts() {
      this.closeMenu();
      
      uni.showLoading({ title: '正在修复...' });
      
      try {
        const result = await repairContacts();
        
        uni.hideLoading();
        
        if (result.success) {
          this.loadContacts();
          uni.showModal({
            title: '修复完成',
            content: result.message,
            showCancel: false
          });
        } else {
          uni.showModal({
            title: '修复失败',
            content: result.message,
            showCancel: false
          });
        }
      } catch (e) {
        uni.hideLoading();
        console.error('修复失败:', e);
        uni.showToast({
          title: '修复失败',
          icon: 'none'
        });
      }
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
    async deleteContact() {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除联系人"${this.selectedContact.name}"吗？`,
        success: async (res) => {
          if (res.confirm) {
            const index = this.contacts.findIndex(c => 
              c.mobile === this.selectedContact.mobile && 
              c.name === this.selectedContact.name
            );
            if (index !== -1) {
              this.contacts.splice(index, 1);
              uni.setStorageSync('contacts', this.contacts);
              
              // 同步到云端
              await this.syncContactsToCloud();
              
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
  width: 60px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.menu-btn {
  font-size: 24px;
  color: #333;
  font-weight: bold;
  padding: 4px 8px;
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

/* 功能菜单 */
.action-menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 2000;
}

.menu-content {
  background: #fff;
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 500px;
  padding: 20px 0;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f5f5f5;
}

.menu-item:active {
  background: #f5f5f5;
}

.menu-item.cancel {
  justify-content: center;
  color: #999;
  margin-top: 8px;
  border-top: 8px solid #f5f5f5;
  border-bottom: none;
}

.menu-icon {
  font-size: 24px;
  margin-right: 12px;
  width: 32px;
  text-align: center;
}

.menu-text {
  font-size: 16px;
  color: #333;
}
</style>

