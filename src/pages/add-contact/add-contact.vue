<template>
  <view class="page">
    <view class="avatar-wrap">
      <image class="avatar" :src="avatar || '/static/mgc/geren.png'" @click="pickAvatar"></image>
      <text class="add-photo">添加照片</text>
    </view>

    <view class="form">
      <view class="label required">
        <text>*姓名</text>
      </view>
      <input class="input" placeholder="请输入姓名" v-model.trim="name" />

      <view class="label">
        <text>*微信备注</text>
      </view>
      <input class="input" placeholder="请输入联系人的微信备注" v-model.trim="wxNote" />
      <text class="hint">*需要与微信里面的备注一致</text>

      <view class="label required">
        <text>*手机号码</text>
      </view>
      <input class="input" type="number" placeholder="请输入联系人手机号码" v-model.trim="mobile" />

      <view class="label">
        <text>分组</text>
      </view>
      <picker 
        mode="selector" 
        :range="groupOptions" 
        :value="groupIndex"
        @change="onGroupChange"
      >
        <view class="picker-view">
          {{ groupOptions[groupIndex] }}
        </view>
      </picker>
    </view>

    <view class="actions">
      <button class="btn cancel" @click="onCancel">取消</button>
      <button class="btn save" @click="onSave">保存</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return { 
      avatar: '', 
      name: '', 
      wxNote: '', 
      mobile: '',
      group: 'other',
      groupOptions: ['家人', '朋友', '医生', '其他'],
      groupIndex: 3,
      isEdit: false,
      editContactIndex: -1
    }
  },
  onLoad(options) {
    // 如果是编辑模式
    if (options.edit === '1' && options.name && options.mobile) {
      this.isEdit = true;
      this.loadContactForEdit(decodeURIComponent(options.name), options.mobile);
    }
  },
  methods: {
    pickAvatar() {
      uni.chooseImage({ 
        count: 1, 
        success: (res) => { 
          this.avatar = res.tempFilePaths[0] 
        } 
      })
    },
    onCancel() {
      uni.navigateBack()
    },
    onGroupChange(e) {
      this.groupIndex = parseInt(e.detail.value);
      const groupMap = ['family', 'friend', 'doctor', 'other'];
      this.group = groupMap[this.groupIndex];
    },
    loadContactForEdit(name, mobile) {
      const contacts = uni.getStorageSync('contacts') || [];
      const contact = contacts.find(c => c.name === name && c.mobile === mobile);
      if (contact) {
        this.name = contact.name;
        this.wxNote = contact.wxNote || '';
        this.mobile = contact.mobile;
        this.avatar = contact.icon || '';
        const groupMap = { 'family': 0, 'friend': 1, 'doctor': 2, 'other': 3 };
        this.groupIndex = groupMap[contact.group || 'other'] || 3;
        this.group = contact.group || 'other';
        this.editContactIndex = contacts.findIndex(c => c.name === name && c.mobile === mobile);
      }
    },
    onSave() {
      if (!this.name) { 
        return uni.showToast({ title: '请输入名字', icon: 'none' }) 
      }
      if (!/^1\d{10}$/.test(this.mobile)) { 
        return uni.showToast({ title: '请输入有效手机号', icon: 'none' }) 
      }

      let contacts = uni.getStorageSync('contacts') || [];
      
      if (this.isEdit && this.editContactIndex !== -1) {
        // 编辑模式
        contacts[this.editContactIndex] = {
          name: this.name,
          wxNote: this.wxNote || this.name, 
          mobile: this.mobile,
          icon: this.avatar || '/static/mgc/geren.png',
          group: this.group
        };
      } else {
        // 新增模式
        contacts.push({
          name: this.name,
          wxNote: this.wxNote || this.name, 
          mobile: this.mobile,
          icon: this.avatar || '/static/mgc/geren.png',
          group: this.group
        });
      }
      
      uni.setStorageSync('contacts', contacts);

      uni.showToast({ title: '已保存', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 500)
      
      // 同步到云端（异步执行，不阻塞保存流程）
      this.syncContactsToCloud(contacts);
    },
    async syncContactsToCloud(contacts) {
      try {
        const apiUtils = await import('@/utils/api.js');
        await apiUtils.default.api.syncContacts(contacts, true); // 静默模式，后台同步
      } catch (error) {
        console.error('同步联系人失败:', error);
        // 静默失败，不影响保存
      }
    }
  }
}
</script>

<style>
@charset "utf-8";

.page {
  padding: 16px;
  background: #fff;
  min-height: 100vh;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'SimHei', '微软雅黑', Arial, sans-serif;
  font-size: 16px;
}

.top {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.import-btn {
  background: #1ebd5a;
  color: #fff;
  padding: 8px 16px;
  border-radius: 28px;
  font-size: 18px;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'SimHei', '微软雅黑', Arial, sans-serif;
  border: none;
}

.avatar-wrap {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar {
  width: 160px;
  height: 160px;
  border-radius: 80px;
  background: #ffe6c7;
}

.add-photo {
  margin-top: 10px;
  color: #1ebd5a;
  font-size: 22px;
  font-weight: 700;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'SimHei', '微软雅黑', Arial, sans-serif;
}

.form {
  margin-top: 24px;
}

.label {
  display: flex;
  align-items: center;
  margin: 12px 0 8px;
  font-size: 22px;
  font-weight: 700;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'SimHei', '微软雅黑', Arial, sans-serif;
}

.label.required text {
  color: #000;
}

.input {
  height: 88rpx;
  background: #f2f7fb;
  border-radius: 12px;
  padding: 0 16px;
  font-size: 18px;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'SimHei', '微软雅黑', Arial, sans-serif;
}

.hint {
  color: #ff3b30;
  font-size: 16px;
  margin-top: 8px;
  display: block;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'SimHei', '微软雅黑', Arial, sans-serif;
}

.picker-view {
  height: 88rpx;
  background: #f2f7fb;
  border-radius: 12px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  font-size: 18px;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'SimHei', '微软雅黑', Arial, sans-serif;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 28px;
}

.btn {
  width: 45%;
  height: 96rpx;
  border-radius: 12px;
  font-size: 22px;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'SimHei', '微软雅黑', Arial, sans-serif;
  border: none;
}

.cancel {
  background: #eee;
  color: #333;
}

.save {
  background: #1ebd5a;
  color: #fff;
}
</style>
