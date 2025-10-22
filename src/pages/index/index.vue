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
      appsPage: [
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
  methods: {
    onSwiperChange(e) {
      this.currentPage = e.detail.current || 0;
    },
    openApp(app) {
      if (app.name === '个人中心') {
        this.navigateToMy();
        return;
      }
      uni.showToast({ title: app.name, icon: 'none' });
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
      // 这里可以跳转到守护设置页
      uni.showToast({ title: '桌面守护', icon: 'none' });
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
</style>
