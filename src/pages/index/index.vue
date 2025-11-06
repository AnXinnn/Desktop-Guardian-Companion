<template>
  <view class="desktop">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <!-- 主体轮播：第一页（现有主页），第二页（应用网格，可下滑） -->
    <swiper class="main-swiper" :current="currentPage" @change="onSwiperChange" circular :indicator-dots="false">
      <!-- 第1页：原主页 -->
      <swiper-item>
        <view class="page page-home">
          <!-- Top Section -->
          <view class="top-section">
            <view class="left-info">
              <view class="time-display">
              <text class="time">{{ currentTime }}</text>
              <text class="am-pm">{{ ampm }}</text>
              </view>
              <text class="date">{{ currentDate }} {{ weekday }}</text>
              <text class="lunar-date">{{ lunarDate }}</text>
            </view>
            
            <view class="right-info">
              <view class="weather-info">
                <text class="weather">{{ weather }}</text>
                <text class="temperature">{{ temperature }}°C</text>
              </view>
              <text class="location">{{ city }}</text>
            </view>
          </view>
          <!-- Middle Section -->
          <view class="middle-section">
            <view class="card-grid">
              <view class="card" @click="openGuardian">
                <image class="card-icon" src="/static/mgc/Guard.png" @error="handleImageError({icon: '/static/mgc/Guard.png'})"></image>
                <text class="card-title">桌面守护</text>
              </view>
              <view class="card" @click="openRemoteHelp">
                <view class="code-wrap">
                  <text class="code">{{ userCode }}</text>
                  <text class="code-sub">用户码</text>
                </view>
                <text class="assist">远程协助</text>
              </view>
              <view class="card" @click="openService">
                <image class="card-icon" src="/static/mgc/kefu.png" @error="handleImageError({icon: '/static/mgc/kefu.png'})"></image>
                <text class="card-title">客服</text>
              </view>
              <view class="card" @click="addShortcut">
                <text class="plus">＋</text>
              </view>
              <!-- 联系人卡片 -->
              <view class="card" v-for="contact in contacts" :key="contact.name" @click="showContactModal(contact)">
                <image class="card-icon" :src="contact.icon" @error="handleImageError({icon: contact.icon})"></image>
                <text class="card-title">{{ contact.wxNote || contact.name }}</text>
              </view>
            </view>
          </view>
        </view>
      </swiper-item>

      <!-- 第2页：应用网格（可下滑） -->
      <swiper-item>
        <view class="page page-apps">
          <scroll-view class="apps-scroll" scroll-y>
            <view class="apps-grid">
              <view class="apps-card" v-for="app in appsPage" :key="app.name" @click="openApp(app)">
                <image class="apps-icon" :src="app.icon" @error="handleImageError(app)"></image>
                <text class="apps-name">{{ app.name }}</text>
              </view>
            </view>
          </scroll-view>
        </view>
      </swiper-item>

      <!-- 第3页：更多功能（可下滑） -->
      <swiper-item>
        <view class="page page-apps">
          <scroll-view class="apps-scroll" scroll-y>
            <view class="apps-grid">
              <view class="apps-card" v-for="app in appsPage2" :key="app.name" @click="openApp(app)">
                <image class="apps-icon" :src="app.icon" @error="handleImageError(app)"></image>
                <text class="apps-name">{{ app.name }}</text>
              </view>
            </view>
          </scroll-view>
        </view>
      </swiper-item>
    </swiper>

    <!-- 自定义分页指示点 -->
    <view class="pager">
      <view class="dot" :class="{ active: currentPage === 0 }"></view>
      <view class="dot" :class="{ active: currentPage === 1 }"></view>
      <view class="dot" :class="{ active: currentPage === 2 }"></view>
    </view>

    <!-- Bottom Section -->
    <view class="bottom-section">
      <view class="dock">
        <view class="dock-item" v-for="app in dockApps" :key="app.name">
          <view class="dock-icon-wrap">
            <image class="dock-icon" :src="app.icon" @error="handleImageError(app)"></image>
          </view>
          <text class="dock-name">{{ app.name }}</text>
        </view>
      </view>
    </view>

    <!-- 联系人详情弹窗 -->
    <view class="contact-modal" v-if="currentContact" @click.self="closeContactModal">
      <view class="contact-modal-content" @click.stop>
        <!-- 顶部操作栏 -->
        <view class="modal-header">
          <text class="modal-icon edit-icon" @click="editContact">{{ isEditMode ? '取消' : '✏️' }}</text>
          <text class="modal-icon close-icon" @click="closeContactModal">✕</text>
        </view>
        
        <!-- 详情模式 -->
        <view v-if="!isEditMode">
          <!-- 头像和姓名 -->
          <view class="contact-avatar-section">
            <image class="contact-avatar" :src="currentContact.icon || '/static/mgc/geren.png'"></image>
            <text class="contact-name">{{ currentContact.name }}</text>
          </view>

          <!-- 操作按钮 -->
          <view class="contact-actions">
            <!-- 微信视频 -->
            <view class="action-btn wechat-video" @click="makeVideoCall">
              <view class="vip-badge">VIP</view>
              <view class="action-content">
                <image class="action-icon" src="/static/mgc/Camera.png"></image>
                <view class="action-text-wrap">
                  <text class="action-text">微信视频</text>
                  <text class="action-sub">{{ currentContact.wxNote || currentContact.name }}</text>
                </view>
              </view>
            </view>
            
            <!-- 微信语音 -->
            <view class="action-btn wechat-voice" @click="makeVoiceCall">
              <view class="vip-badge">VIP</view>
              <view class="action-content">
                <image class="action-icon" src="/static/mgc/telephone.png"></image>
                <view class="action-text-wrap">
                  <text class="action-text">微信语音</text>
                  <text class="action-sub">{{ currentContact.wxNote || currentContact.name }}</text>
                </view>
              </view>
            </view>
            
            <!-- 手机电话 -->
            <view class="action-btn phone-call" @click="makePhoneCall">
              <view class="action-content">
                <image class="action-icon" src="/static/mgc/telephone.png"></image>
                <view class="action-text-wrap">
                  <text class="action-text">手机电话</text>
                  <text class="action-sub phone-number">{{ currentContact.mobile }}</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 底部操作 -->
          <view class="modal-footer">
            <text class="footer-action delete-contact" @click="showDeleteConfirm">删除联系人</text>
            <text class="footer-action repair-contact" @click="repairContact">一键修复</text>
          </view>
        </view>

        <!-- 编辑模式 -->
        <view v-else class="edit-mode">
          <scroll-view scroll-y class="edit-scroll">
            <!-- 头像编辑 -->
            <view class="edit-avatar-section">
              <image class="edit-avatar" :src="editForm.icon || '/static/mgc/geren.png'" @click="pickEditAvatar"></image>
              <text class="edit-avatar-hint">点击更换头像</text>
            </view>

            <!-- 编辑表单 -->
            <view class="edit-form">
              <view class="edit-item">
                <text class="edit-label required">*名字</text>
                <input class="edit-input" placeholder="请输入名字" v-model.trim="editForm.name" />
              </view>

              <view class="edit-item">
                <text class="edit-label">微信备注</text>
                <input class="edit-input" placeholder="请输入联系人的微信备注" v-model.trim="editForm.wxNote" />
                <text class="edit-hint">*需要与微信里面的备注一致！</text>
              </view>

              <view class="edit-item">
                <text class="edit-label required">*手机号码</text>
                <input class="edit-input" type="number" placeholder="请输入联系人的手机号码" v-model.trim="editForm.mobile" />
              </view>
            </view>

            <!-- 保存按钮 -->
            <view class="edit-actions">
              <button class="edit-save-btn" @click="saveEditContact">保存</button>
            </view>
          </scroll-view>
        </view>
      </view>
      
      <!-- 确认删除提示框 -->
      <view class="delete-confirm-modal" v-if="showDeleteConfirmFlag" @click.stop>
        <view class="delete-confirm-content">
          <text class="delete-confirm-title">确认删除</text>
          <text class="delete-confirm-text">确定要删除联系人"{{ currentContact.name }}"吗？</text>
          <view class="delete-confirm-buttons">
            <button class="delete-btn cancel-btn" @click="cancelDelete">否</button>
            <button class="delete-btn confirm-btn" @click="confirmDelete">是</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import LunarCalendar from 'lunar-calendar';

export default {
  data() {
    return {
      statusBarHeight: 0,
      currentPage: 0,
      currentTime: '12:30',
      ampm: '上午',
      currentDate: '2023年10月6日',
      weekday: '星期五',
      lunarDate: '农历八月廿二',
      city: "定位中",
      weather: "未知",
      temperature: "0",
      userCode: '5090922',
      contacts: [],
      currentContact: null,
      showDeleteConfirmFlag: false,
      isEditMode: false,
      editForm: {
        name: '',
        wxNote: '',
        mobile: '',
        icon: ''
      },
      originalContact: null, // 保存原始联系人信息，用于取消编辑时恢复
      appsPage: [
        { name: '用药提醒', icon: '/static/mgc/Guard.png', type: 'medicine' },
        { name: '在线问诊', icon: '/static/mgc/kefu.png', type: 'consultation' },
        { name: '通讯录', icon: '/static/mgc/WeChat.png' },
        { name: '短信', icon: '/static/mgc/Information.png' },
        { name: '付款码', icon: '/static/mgc/Alipay.png' },
        { name: '扫一扫', icon: '/static/mgc/Camera.png' },
        { name: '相册', icon: '/static/mgc/geren.png' },
        { name: '计算器', icon: '/static/mgc/Information.png' },
        { name: '天气', icon: '/static/mgc/Guard.png' },
        { name: '日历', icon: '/static/mgc/Information.png' },
        { name: '设置', icon: '/static/mgc/Guard.png' },
        { name: '爱肌肤', icon: '/static/mgc/geren.png' },
        { name: '华为', icon: '/static/mgc/WeChat.png' },
        { name: '钉钉', icon: '/static/mgc/Information.png' },
        { name: '微信', icon: '/static/mgc/WeChat.png' },
        { name: '醒图', icon: '/static/mgc/Guard.png' },
        { name: '学习通', icon: '/static/mgc/Information.png' },
        { name: '校园', icon: '/static/mgc/Guard.png' },
        { name: '支付宝', icon: '/static/mgc/Alipay.png' },
        { name: '添加', icon: '/static/mgc/Add.png' }
      ],
      appsPage2: [
        { name: '悬浮球', icon: '/static/mgc/Guard.png' },
        { name: '拍照朗读', icon: '/static/mgc/Camera.png' },
        { name: '远程协助', icon: '/static/mgc/Information.png' },
        { name: '语音设置', icon: '/static/mgc/Information.png' },
        { name: '呼叫设置', icon: '/static/mgc/telephone.png' },
        { name: '个人中心', icon: '/static/mgc/geren.png' },
        { name: '教程中心', icon: '/static/mgc/Information.png' },
        { name: '亲友管理', icon: '/static/mgc/Information.png' },
        { name: '语音点读', icon: '/static/mgc/Information.png' },
        { name: '骚扰拦截', icon: '/static/mgc/Information.png' },
        { name: '用机守护', icon: '/static/mgc/Guard.png' }
      ],
      dockApps: [
        { name: '电话', icon: '/static/mgc/telephone.png' },
        { name: '相机', icon: '/static/mgc/Camera.png' },
        { name: '微信', icon: '/static/mgc/WeChat.png' }
      ]
    }
  },
  onLoad(options) {
    const sys = uni.getSystemInfoSync();
    this.statusBarHeight = sys.statusBarHeight || 0;
    this.updateTime();
    setInterval(this.updateTime, 1000);
    
    // 初始化时清空联系人列表，确保没有多余的联系人卡片
    // 联系人列表只在从添加联系人页面返回时（onShow）才会更新
    this.contacts = [];
    
    if (options.page) {
      this.currentPage = parseInt(options.page) || 0;
    }
    
    let _this = this;
			uni.getLocation({
				type: 'gcj02', // 高德坐标系
				isHighAccuracy: true, // 高精度模式
				highAccuracyExpireTime: 8000,
				altitude: true,
				timeout: 12000,
				maximumAge: 15000,
				success: function(res) {
					// 定位成功处理
					let long = res.longitude; // 经度
					let lat = res.latitude; // 纬度
					let key = '3bef76ab67ff3a02d5567db5f6ce2bbb';

					// 逆地理解析获取城市与 adcode
					uni.request({
						url: `https://restapi.amap.com/v3/geocode/regeo?key=${key}&location=${long},${lat}&extensions=all&radius=100&roadlevel=0`,
						success: (res) => {
							const comp = res.data.regeocode && res.data.regeocode.addressComponent ? res.data.regeocode.addressComponent : {};
							_this.city = comp.city || comp.district || comp.province || '定位中';
							let adcode = comp.adcode || comp.citycode;

							// 请求天气API 
							uni.request({
								url: `https://restapi.amap.com/v3/weather/weatherInfo?key=${key}&city=${adcode}`,
								success: (res) => {
									_this.weather = res.data.lives && res.data.lives[0] ? res.data.lives[0].weather : '未知';
									_this.temperature = res.data.lives && res.data.lives[0] ? res.data.lives[0].temperature : '0';

								}
							});
						}
					});
				},
				fail: (err) => {
					console.error('定位失败，尝试IP定位兜底', err);
					// 使用IP定位兜底
					uni.request({
						url: `https://restapi.amap.com/v3/ip?key=3bef76ab67ff3a02d5567db5f6ce2bbb`,
						success: (res) => {
							const adcode = res.data && res.data.adcode;
							_this.city = res.data && res.data.city ? res.data.city : '未知';
							if (adcode) {
								uni.request({
									url: `https://restapi.amap.com/v3/weather/weatherInfo?key=3bef76ab67ff3a02d5567db5f6ce2bbb&city=${adcode}`,
									success: (w) => {
										_this.weather = w.data.lives && w.data.lives[0] ? w.data.lives[0].weather : '未知';
										_this.temperature = w.data.lives && w.data.lives[0] ? w.data.lives[0].temperature : '0';
									}
								});
							}
						}
					});
				},
			});

		},
  onShow() {
    // 只在页面显示时刷新联系人列表（从添加联系人页面返回时）
    // 这样确保只有通过保存新联系人后才会显示新模块
    this.contacts = uni.getStorageSync('contacts') || [];
    
    // 处理返回页面逻辑
    const returnPage = uni.getStorageSync('returnToPage');
    if (returnPage !== undefined) {
      this.currentPage = returnPage;
      uni.removeStorageSync('returnToPage');
    }
  },
  methods: {
    onSwiperChange(e) {
      this.currentPage = e.detail.current || 0;
    },
    openApp(app) {
      if (app.name === '个人中心') {
        this.navigateToMy();
        return;
      }
      
      // 处理医疗功能
      if (app.type === 'medicine') {
        uni.navigateTo({ url: '/pages/medicine/medicine-reminder' });
        return;
      }
      if (app.type === 'consultation') {
        uni.navigateTo({ url: '/pages/medicine/online-consultation' });
        return;
      }
      
      // 其他应用处理
      if (app.packageName) {
        // #ifdef APP-PLUS
        if (plus && plus.runtime) {
          plus.runtime.launchApplication({ pname: app.packageName }, (e) => {
            uni.showToast({ title: '打开失败: ' + e.message, icon: 'none' });
          });
        }
        // #endif
      } else {
        uni.showToast({ title: app.name, icon: 'none' });
      }
    },
    navigateToMy() {
      uni.navigateTo({
        url: '/pages/my/my'
      });
    },
    handleImageError(app) {
      console.error('图片加载失败:', app.icon);
      // 可以在这里添加默认图片或错误处理逻辑
    },
    updateTime() {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      this.currentTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      this.ampm = hours >= 12 ? '下午' : '上午';
      
      const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      this.weekday = weekdays[now.getDay()];
      
      this.currentDate = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
      
      // 计算农历日期
      this.lunarDate = this.getLunarDate(now);
    },
    getLunarDate(solarDate) {
      try {
        if (!LunarCalendar || typeof LunarCalendar.solarToLunar !== 'function') {
          return '农历未知';
        }
        const lunar = LunarCalendar.solarToLunar(
          solarDate.getFullYear(),
          solarDate.getMonth() + 1,
          solarDate.getDate()
        );

        if (!lunar || lunar.error) return '农历未知';

        // 优先使用库提供的可读名称字段（lunarMonthName / lunarDayName），
        // 否则回退到数值字段（lunarMonth / lunarDay）或通用字段。
        const monthCn = lunar.lunarMonthName || lunar.monthCn || (lunar.lunarMonth ? `${lunar.lunarMonth}月` : '');
        const dayCn = lunar.lunarDayName || lunar.dayCn || (lunar.lunarDay ? `${lunar.lunarDay}` : '');

        if (!monthCn && !dayCn) return '农历未知';
        return `农历${monthCn}${dayCn}`;
      } catch (e) {
        console.error('计算农历失败：', e);
        return '农历未知';
      }
    },
    openGuardian() {
      // 跳转到桌面守护页面
      uni.navigateTo({ url: '/pages/guardian/guardian' });
    },
    openRemoteHelp() {
      // 复制用户码，或进入远程协助页
      uni.setClipboardData({ data: this.userCode });
      uni.showToast({ title: '用户码已复制', icon: 'none' });
    },
    openService() {
      uni.navigateTo({ url: '/pages/customer-service/customer-service' });
    },
    addShortcut() {
      uni.navigateTo({ url: '/pages/add-contact/add-contact' });
    },
    showContactModal(contact) {
      this.currentContact = contact;
      this.isEditMode = false;
      // 深拷贝联系人信息到编辑表单
      this.editForm = {
        name: contact.name || '',
        wxNote: contact.wxNote || '',
        mobile: contact.mobile || '',
        icon: contact.icon || ''
      };
      this.originalContact = JSON.parse(JSON.stringify(contact));
    },
    closeContactModal() {
      this.currentContact = null;
      this.showDeleteConfirmFlag = false;
      this.isEditMode = false;
      this.editForm = {
        name: '',
        wxNote: '',
        mobile: '',
        icon: ''
      };
      this.originalContact = null;
    },
    editContact() {
      if (this.isEditMode) {
        // 取消编辑，恢复原始数据
        this.isEditMode = false;
        if (this.originalContact) {
          this.currentContact = JSON.parse(JSON.stringify(this.originalContact));
        }
      } else {
        // 进入编辑模式
        this.isEditMode = true;
        // 初始化编辑表单
        this.editForm = {
          name: this.currentContact.name || '',
          wxNote: this.currentContact.wxNote || '',
          mobile: this.currentContact.mobile || '',
          icon: this.currentContact.icon || ''
        };
      }
    },
    pickEditAvatar() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          this.editForm.icon = res.tempFilePaths[0];
        }
      });
    },
    saveEditContact() {
      // 验证输入
      if (!this.editForm.name || !this.editForm.name.trim()) {
        uni.showToast({ title: '请输入名字', icon: 'none' });
        return;
      }
      if (!this.editForm.mobile || !/^1\d{10}$/.test(this.editForm.mobile)) {
        uni.showToast({ title: '请输入有效手机号', icon: 'none' });
        return;
      }

      // 更新本地存储中的联系人
      let contacts = uni.getStorageSync('contacts') || [];
      
      // 找到要更新的联系人（通过原始信息匹配）
      const index = contacts.findIndex(c => {
        if (this.originalContact.mobile && c.mobile) {
          return c.name === this.originalContact.name && 
                 c.mobile === this.originalContact.mobile;
        }
        return c.name === this.originalContact.name;
      });

      if (index !== -1) {
        // 更新联系人信息
        contacts[index] = {
          name: this.editForm.name.trim(),
          wxNote: this.editForm.wxNote.trim() || this.editForm.name.trim(),
          mobile: this.editForm.mobile.trim(),
          icon: this.editForm.icon || '/static/mgc/geren.png'
        };
        
        uni.setStorageSync('contacts', contacts);
        
        // 更新当前页面的联系人列表
        this.contacts = contacts;
        
        // 更新当前显示的联系人
        this.currentContact = contacts[index];
        this.originalContact = JSON.parse(JSON.stringify(contacts[index]));
        
        // 退出编辑模式
        this.isEditMode = false;
        
        // 显示保存成功提示
        uni.showToast({ 
          title: '保存成功', 
          icon: 'success',
          duration: 2000
        });
      } else {
        uni.showToast({ 
          title: '保存失败，未找到联系人', 
          icon: 'none',
          duration: 2000
        });
      }
    },
    makeVideoCall() {
      if (!this.currentContact) {
        return;
      }
      
      // 获取微信备注或名字
      const wxName = this.currentContact.wxNote || this.currentContact.name;
      
      // 设置免提和音量（Android）
      this.setSpeakerphoneAndVolume();
      
      // 启动自动化流程
      this.startWeChatAutomation(wxName, 'video');
    },
    makeVoiceCall() {
      if (!this.currentContact) {
        return;
      }
      
      // 获取微信备注或名字
      const wxName = this.currentContact.wxNote || this.currentContact.name;
      
      // 设置免提和音量（Android）
      this.setSpeakerphoneAndVolume();
      
      // 启动自动化流程
      this.startWeChatAutomation(wxName, 'voice');
    },
    // 启动微信自动化流程
    startWeChatAutomation(wxName, callType) {
      // #ifdef APP-PLUS
      if (plus && plus.runtime) {
        uni.showLoading({ title: '正在打开微信...' });
        
        // 第一步：打开微信应用
        plus.runtime.launchApplication({
          pname: 'com.tencent.mm',
          action: 'android.intent.action.VIEW'
        }, (e) => {
          if (e && e.code === 0) {
            uni.hideLoading();
            uni.showToast({ title: '微信未安装', icon: 'none' });
            return;
          }
          
          // 延迟等待微信完全启动
          setTimeout(() => {
            uni.hideLoading();
            // 第二步：尝试打开聊天窗口
            this.openWeChatChat(wxName, callType);
          }, 2000);
        });
      }
      // #endif
      
      // #ifdef H5
      uni.showToast({ 
        title: '请手动打开微信，搜索"' + wxName + '"并拨打' + (callType === 'video' ? '视频' : '语音') + '通话', 
        icon: 'none',
        duration: 3000
      });
      // #endif
    },
    // 打开微信聊天窗口并执行自动化操作
    openWeChatChat(wxName, callType) {
      // #ifdef APP-PLUS
      if (plus && plus.runtime) {
        // 先尝试使用URL Scheme打开聊天窗口
        const url = `weixin://dl/chat?username=${encodeURIComponent(wxName)}`;
        plus.runtime.openURL(url, (err) => {
          // URL Scheme打开后，延迟执行自动化点击
          setTimeout(() => {
            this.performAutomationClick(callType);
          }, 2000);
        });
      }
      // #endif
    },
    // 执行自动化点击操作
    performAutomationClick(callType) {
      // #ifdef APP-PLUS
      if (plus && plus.android) {
        try {
          const main = plus.android.runtimeMainActivity();
          const AccessibilityManager = plus.android.importClass('android.view.accessibility.AccessibilityManager');
          const AccessibilityNodeInfo = plus.android.importClass('android.view.accessibility.AccessibilityNodeInfo');
          const AccessibilityEvent = plus.android.importClass('android.view.accessibility.AccessibilityEvent');
          const Context = plus.android.importClass('android.content.Context');
          const DisplayMetrics = plus.android.importClass('android.util.DisplayMetrics');
          const WindowManager = plus.android.importClass('android.view.WindowManager');
          
          // 获取屏幕尺寸
          const windowManager = main.getSystemService(Context.WINDOW_SERVICE);
          const display = windowManager.getDefaultDisplay();
          const metrics = new DisplayMetrics();
          display.getMetrics(metrics);
          const screenWidth = metrics.widthPixels;
          const screenHeight = metrics.heightPixels;
          
          // 检查是否有辅助功能权限
          const accessibilityManager = main.getSystemService(Context.ACCESSIBILITY_SERVICE);
          const isEnabled = accessibilityManager.isEnabled();
          
          if (!isEnabled) {
            // 没有辅助功能权限，提示用户手动点击
            uni.showToast({ 
              title: '请在设置中开启辅助功能权限以使用自动化功能', 
              icon: 'none',
              duration: 3000
            });
            
            // 尝试使用模拟点击（需要root或系统权限）
            this.trySimulateClick(screenWidth, screenHeight, callType);
            return;
          }
          
          // 使用辅助功能服务进行自动化（需要配置AccessibilityService）
          // 这里我们先尝试使用坐标点击作为备选方案
          this.trySimulateClick(screenWidth, screenHeight, callType);
          
        } catch (e) {
          console.log('自动化点击失败:', e);
          uni.showToast({ 
            title: '自动化操作失败，请手动点击' + (callType === 'video' ? '视频' : '语音') + '按钮', 
            icon: 'none',
            duration: 3000
          });
        }
      }
      // #endif
    },
    // 尝试模拟点击（使用adb命令或Gesture）
    trySimulateClick(screenWidth, screenHeight, callType) {
      // #ifdef APP-PLUS
      try {
        const main = plus.android.runtimeMainActivity();
        const Runtime = plus.android.importClass('java.lang.Runtime');
        const Process = plus.android.importClass('java.lang.Process');
        
        // 计算点击坐标
        // 微信界面中，视频/语音按钮通常在输入框右侧
        // 视频按钮：屏幕宽度约85%，高度约92%
        // 语音按钮：屏幕宽度约75%，高度约92%
        let clickX, clickY;
        
        if (callType === 'video') {
          clickX = Math.floor(screenWidth * 0.85);
          clickY = Math.floor(screenHeight * 0.92);
        } else {
          clickX = Math.floor(screenWidth * 0.75);
          clickY = Math.floor(screenHeight * 0.92);
        }
        
        // 方法1：尝试使用adb命令执行点击（需要root或adb调试）
        try {
          const runtime = Runtime.getRuntime();
          // 使用input tap命令
          const cmd = `input tap ${clickX} ${clickY}`;
          const process = runtime.exec(cmd);
          process.waitFor();
          
          uni.showToast({ 
            title: '正在拨打' + (callType === 'video' ? '视频' : '语音') + '通话...', 
            icon: 'none',
            duration: 2000
          });
          
          // 确保免提和音量已设置
          setTimeout(() => {
            this.setSpeakerphoneAndVolume();
          }, 500);
          
          return;
        } catch (e) {
          console.log('adb命令执行失败:', e);
        }
        
        // 方法2：如果adb失败，使用Gesture执行点击
        try {
          const GestureDetector = plus.android.importClass('android.view.GestureDetector');
          const Gesture = plus.android.importClass('android.gesture.Gesture');
          const GestureStroke = plus.android.importClass('android.gesture.GestureStroke');
          const Path = plus.android.importClass('android.graphics.Path');
          
          // 创建点击手势
          const path = new Path();
          path.moveTo(clickX, clickY);
          path.lineTo(clickX, clickY);
          
          const stroke = new GestureStroke(path);
          const gesture = new Gesture();
          gesture.addStroke(stroke);
          
          // 注意：Gesture需要特定的权限和实现方式
          // 这里作为备选方案提示用户
          uni.showToast({ 
            title: '请手动点击微信中的' + (callType === 'video' ? '视频' : '语音') + '按钮', 
            icon: 'none',
            duration: 3000
          });
        } catch (e2) {
          console.log('Gesture执行失败:', e2);
          // 最终提示用户手动操作
          uni.showToast({ 
            title: '请手动点击微信中的' + (callType === 'video' ? '视频' : '语音') + '按钮', 
            icon: 'none',
            duration: 3000
          });
        }
      } catch (e) {
        console.log('模拟点击失败:', e);
        uni.showToast({ 
          title: '请手动点击微信中的' + (callType === 'video' ? '视频' : '语音') + '按钮', 
          icon: 'none',
          duration: 3000
        });
      }
      // #endif
    },
    // 设置免提和音量（Android原生API）
    setSpeakerphoneAndVolume() {
      // #ifdef APP-PLUS
      if (plus && plus.android) {
        try {
          const main = plus.android.runtimeMainActivity();
          const AudioManager = plus.android.importClass('android.media.AudioManager');
          const Context = plus.android.importClass('android.content.Context');
          
          const audioManager = main.getSystemService(Context.AUDIO_SERVICE);
          
          // 打开免提（扬声器）
          audioManager.setMode(AudioManager.MODE_IN_COMMUNICATION);
          audioManager.setSpeakerphoneOn(true);
          
          // 设置通话音量最大
          const maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_VOICE_CALL);
          audioManager.setStreamVolume(AudioManager.STREAM_VOICE_CALL, maxVolume, 0);
          
          // 设置媒体音量最大（用于视频通话）
          const maxMediaVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
          audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, maxMediaVolume, 0);
          
          console.log('免提和音量设置成功');
        } catch (e) {
          console.log('设置免提和音量失败:', e);
          // 如果原生API失败，尝试使用uni-app的API
          try {
            if (plus.device) {
              plus.device.setVolume(1.0);
            }
          } catch (e2) {
            console.log('使用uni-app API设置音量也失败:', e2);
          }
        }
      }
      // #endif
    },
    makePhoneCall() {
      if (this.currentContact && this.currentContact.mobile) {
        uni.makePhoneCall({
          phoneNumber: this.currentContact.mobile,
          fail: (err) => {
            uni.showToast({ title: '拨号失败', icon: 'none' });
          }
        });
      }
    },
    showDeleteConfirm() {
      this.showDeleteConfirmFlag = true;
    },
    cancelDelete() {
      this.showDeleteConfirmFlag = false;
    },
    confirmDelete() {
      if (!this.currentContact) {
        return;
      }
      
      // 从本地存储中删除联系人
      let contacts = uni.getStorageSync('contacts') || [];
      
      // 使用更可靠的删除方式：通过名字和手机号匹配（防止同名）
      const beforeLength = contacts.length;
      contacts = contacts.filter(c => {
        // 如果手机号存在，则同时匹配名字和手机号
        if (this.currentContact.mobile && c.mobile) {
          return !(c.name === this.currentContact.name && 
                  c.mobile === this.currentContact.mobile);
        }
        // 否则只匹配名字
        return c.name !== this.currentContact.name;
      });
      
      // 检查是否真的删除了
      if (contacts.length < beforeLength) {
        uni.setStorageSync('contacts', contacts);
        
        // 更新当前页面的联系人列表
        this.contacts = contacts;
        
        // 关闭确认删除弹窗
        this.showDeleteConfirmFlag = false;
        
        // 关闭联系人详情弹窗
        this.closeContactModal();
        
        // 显示删除成功提示
        uni.showToast({ 
          title: '删除成功', 
          icon: 'success',
          duration: 2000
        });
      } else {
        // 如果没找到要删除的联系人，也关闭弹窗
        this.showDeleteConfirmFlag = false;
        this.closeContactModal();
        uni.showToast({ 
          title: '删除失败，未找到联系人', 
          icon: 'none',
          duration: 2000
        });
      }
    },
    repairContact() {
      uni.showToast({ title: '一键修复', icon: 'none' });
    }
  },
}
</script>

<style>
.desktop {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: url('/static/mgc/background.JPG') no-repeat center center;
  background-size: cover;
  position: relative;
}

.status-bar {
  width: 100%;
}

.main-swiper {
  flex: 1;
}

.page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.top-section {
  flex: 1;
  padding: 40rpx;
  display: flex;
  justify-content: space-between;
}

.left-info {
  display: flex;
  flex-direction: column;
}

.right-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.weather-info {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.weather {
  font-size: 32rpx;
  color: white;
  margin-right: 15rpx;
}

.temperature {
  font-size: 32rpx;
  color: white;
}

.location {
  font-size: 28rpx;
  color: white;
}

.time {
  font-size: 80rpx;
  color: white;
  margin-right: 10rpx;
}

.am-pm {
  font-size: 36rpx;
  color: white;
  margin-left: -5rpx;
}

.date {
  font-size: 32rpx;
  color: white;
  margin-bottom: 10rpx;
}

.lunar-date {
  font-size: 28rpx;
  color: white;
}

.middle-section {
  flex: 2;
  padding: 20rpx;
}
.page-apps .apps-scroll {
  height: 100%;
}

.apps-grid {
  padding: 24rpx 24rpx 240rpx; /* 预留更多底部空间避免被指示点遮挡 */
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 360rpx;
  gap: 24rpx;
}

.apps-card {
  background: rgba(255,255,255,0.96);
  border-radius: 24rpx;
  box-shadow: 0 10rpx 28rpx rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.apps-icon {
  width: 220rpx;
  height: 220rpx;
}

.apps-name {
  margin-top: 14rpx;
  font-size: 44rpx;
  font-weight: 700;
  color: #222;
}

.pager {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 220rpx; /* 位于底部导航上方一点 */
  height: 40rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.dot {
  width: 32rpx;
  height: 12rpx;
  border-radius: 12rpx;
  background: rgba(0,0,0,0.2);
  margin: 0 10rpx;
}

.dot.active {
  background: rgba(0,0,0,0.5);
}

.bottom-section {
  height: 200rpx; /* 固定底部导航高度，避免占用过多中间空间 */
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 20rpx;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 220rpx;
  gap: 30rpx;
}

.card {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.08);
}

.card-icon {
  width: 96rpx;
  height: 96rpx;
  margin-bottom: 14rpx;
  display: block;
}

.card-title {
  font-size: 36rpx;
  color: #222;
}

.code-wrap {
  align-items: center;
  display: flex;
  flex-direction: column;
}

.code {
  font-size: 44rpx;
  font-weight: 700;
  color: #2b4a7b;
}

.code-sub {
  font-size: 28rpx;
  color: #2b4a7b;
  margin-top: 8rpx;
}

.assist {
  margin-top: 16rpx;
  font-size: 36rpx;
  color: #ff7a00;
  font-weight: 600;
}

.plus {
  font-size: 120rpx;
  color: #ff7a00;
  line-height: 1;
}

.dock {
  display: flex;
  justify-content: center;
  padding: 20rpx 0;
  width: 100%;
  border-radius: 40rpx 40rpx 0 0;
}

.dock-item {
  margin: 0 40rpx;  
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dock-icon {
  width: 130rpx;
  height: 130rpx;
  display: block;
}

.dock-icon-wrap {
  width: 150rpx;
  height: 150rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-name, .dock-name {
  font-size: 24rpx;
  color: #333;
  margin-top: 10rpx;
  text-align: center;
}

/* 联系人详情弹窗 */
.contact-modal {
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

.contact-modal-content {
  background: #fff;
  border-radius: 32rpx;
  width: 680rpx;
  max-height: 90vh;
  padding: 60rpx 40rpx 40rpx;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  position: absolute;
  top: 30rpx;
  left: 30rpx;
  right: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-icon {
  font-size: 48rpx;
  cursor: pointer;
  user-select: none;
}

.edit-icon {
  color: #ff9800;
  font-weight: 700;
}

.close-icon {
  color: #000;
  font-weight: 700;
}

.contact-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 40rpx;
  margin-bottom: 60rpx;
}

.contact-avatar {
  width: 200rpx;
  height: 200rpx;
  border-radius: 100rpx;
  background: #ffe6c7;
  margin-bottom: 24rpx;
}

.contact-name {
  font-size: 44rpx;
  font-weight: 700;
  color: #222;
}

.contact-actions {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-bottom: 60rpx;
}

.action-btn {
  position: relative;
  min-height: 160rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.wechat-video {
  background: #07c160;
}

.wechat-voice {
  background: #ff9800;
}

.phone-call {
  background: #007aff;
}

.vip-badge {
  position: absolute;
  left: 32rpx;
  top: 24rpx;
  background: #ffd700;
  color: #222;
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-weight: 700;
  line-height: 1.2;
}

.action-content {
  display: flex;
  align-items: center;
  flex: 1;
  margin-left: 80rpx;
}

.action-btn:not(.wechat-video):not(.wechat-voice) .action-content {
  margin-left: 0;
}

.action-icon {
  width: 80rpx;
  height: 80rpx;
  margin-right: 24rpx;
}

.action-text-wrap {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.action-text {
  font-size: 36rpx;
  font-weight: 700;
  color: #fff;
  line-height: 1.4;
}

.action-sub {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 8rpx;
  line-height: 1.3;
}

.phone-number {
  font-size: 32rpx;
  font-weight: 600;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  padding-top: 40rpx;
  border-top: 1rpx solid #eee;
}

.footer-action {
  font-size: 32rpx;
  color: #999;
}

.delete-contact {
  color: #ff3b30;
}

.repair-contact {
  color: #007aff;
}

/* 确认删除弹窗 */
.delete-confirm-modal {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.delete-confirm-content {
  background: #fff;
  border-radius: 24rpx;
  width: 560rpx;
  padding: 60rpx 40rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.delete-confirm-title {
  font-size: 44rpx;
  font-weight: 700;
  color: #222;
  margin-bottom: 30rpx;
}

.delete-confirm-text {
  font-size: 32rpx;
  color: #666;
  text-align: center;
  margin-bottom: 60rpx;
  line-height: 1.6;
}

.delete-confirm-buttons {
  display: flex;
  width: 100%;
  gap: 24rpx;
}

.delete-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 12rpx;
  font-size: 32rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background: #ff3b30;
  color: #fff;
}

/* 编辑模式样式 */
.edit-mode {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-top: 20rpx;
}

.edit-scroll {
  flex: 1;
  overflow-y: auto;
}

.edit-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 40rpx;
  margin-bottom: 40rpx;
}

.edit-avatar {
  width: 200rpx;
  height: 200rpx;
  border-radius: 100rpx;
  background: #ffe6c7;
  margin-bottom: 16rpx;
}

.edit-avatar-hint {
  font-size: 28rpx;
  color: #1ebd5a;
  font-weight: 700;
}

.edit-form {
  padding: 0 40rpx;
}

.edit-item {
  margin-bottom: 40rpx;
}

.edit-label {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #222;
  margin-bottom: 16rpx;
}

.edit-label.required {
  color: #000;
}

.edit-input {
  width: 100%;
  height: 88rpx;
  background: #f2f7fb;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 32rpx;
  box-sizing: border-box;
}

.edit-hint {
  display: block;
  color: #ff3b30;
  font-size: 28rpx;
  margin-top: 12rpx;
}

.edit-actions {
  padding: 40rpx;
  margin-top: 40rpx;
}

.edit-save-btn {
  width: 100%;
  height: 96rpx;
  background: #1ebd5a;
  color: #fff;
  border-radius: 12rpx;
  font-size: 36rpx;
  font-weight: 700;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
