<template>
  <view class="desktop">
    <!-- Top Section (1/3) -->
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
    <!-- Middle Section (1/2) -->
    <view class="middle-section">
      <view class="app-grid">
        <view class="app-item" v-for="app in apps" :key="app.name">
          <image class="app-icon" :src="app.icon" @error="handleImageError(app)"></image>
          <text class="app-name">{{ app.name }}</text>
        </view>
      </view>
    </view>

    <!-- Bottom Section (1/6) -->
    <view class="bottom-section">
      <view class="dock">
        <view class="dock-item" v-for="app in dockApps" :key="app.name">
          <image class="dock-icon" :src="app.icon" @error="handleImageError(app)"></image>
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
      currentTime: '12:30',
      ampm: '上午',
      currentDate: '2023年10月6日',
      weekday: '星期五',
      lunarDate: '农历八月廿二',
      city: "定位中",
      weather: "未知",
      temperature: "0",
      apps: [
        { name: '电话', icon: '/static/mgc/telephone.png' },
        { name: '微信', icon: '/static/mgc/WeChat.png' },
        { name: '抖音', icon: '/static/mgc/tiktok.png' },
        { name: '支付宝', icon: '/static/mgc/Alipay.png' },
        { name: '相机', icon: '/static/mgc/Camera.png' },
        { name: '客服', icon: '/static/mgc/kefu.png' },
        { name: '个人中心', icon: '/static/mgc/geren.png' }
      ],
      dockApps: [
        { name: '电话', icon: '/static/mgc/telephone.png' },
        { name: '信息', icon: '/static/mgc/Information.png' },
        { name: '微信', icon: '/static/mgc/WeChat.png' },
        { name: '抖音', icon: '/static/mgc/tiktok.png' }
      ]
    }
  },
  onLoad() {
    this.updateTime();
    setInterval(this.updateTime, 1000);
    
    let _this = this;
			uni.getLocation({
				type: 'wgs84', //中国定位格式
				geocode: true, // 启用地理编码提高精度
				isHighAccuracy: true, // 启用高精度模式
				timeout: 10000, // 10秒超时
				maximumAge: 30000, // 30秒内缓存位置
				success: function(res) {
					// 定位成功处理
					// console.log('当前位置的经度：' + res.longitude);
					// console.log('当前位置的纬度：' + res.latitude);
					let long = res.longitude; //经度
					let lat = res.latitude; //维度
					let key = '3bef76ab67ff3a02d5567db5f6ce2bbb';

					// 使用实际获取的位置
					uni.request({
						url: `https://restapi.amap.com/v3/geocode/regeo?key=${key}&location=${long},${lat}&poitype=&radius=&extensions=all&roadlevel=0`,
						success: (res) => {
							// 修正: res.data.regeocode
							_this.city = res.data.regeocode.addressComponent.city;
							let adcode = res.data.regeocode.addressComponent.adcode;

							// 请求天气API 
							uni.request({
								url: `https://restapi.amap.com/v3/weather/weatherInfo?key=${key}&city=${adcode}`,
								success: (res) => {
									// console.log(res.data.lives[0].weather);
									// console.log(res.data.lives[0].temperature);
									_this.weather = res.data.lives[0].weather;
									_this.temperature = res.data.lives[0]
										.temperature;

								}
							});
						}
					});
				},
				fail: (err) => {
					console.error('定位失败，尝试重新获取', err);
					// 失败后3秒重试一次
					setTimeout(() => {
						uni.getLocation({
							type: 'wgs84',
							geocode: true,
							isHighAccuracy: true,
							success: function(res) {
								_this.processLocation(res);
							},
							fail: (err) => {
								console.error('重试定位失败', err);
								_this.city = "定位失败";
							}
						});
					}, 3000);
				}
			});

		},
  methods: {
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
      const lunar = LunarCalendar.solarToLunar(
        solarDate.getFullYear(),
        solarDate.getMonth() + 1,
        solarDate.getDate()
      );
      return `农历${lunar.month}月${lunar.day}`;
    }
  },
}
</script>

<style>
.desktop {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: url('/static/mgc/background.jpg') no-repeat center center;
  background-size: cover;
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

.bottom-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 20rpx;
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30rpx;
}

.app-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.app-icon {
  width: 100rpx;
  height: 100rpx;
  margin-bottom: 10rpx;
  display: block;
}

.dock {
  display: flex;
  justify-content: center;
  padding: 20rpx 0;
  width: 100%;
  border-radius: 40rpx 40rpx 0 0;
}

.dock-item {
  margin: 0 20rpx;  
}

.dock-icon {
  width: 130rpx;
  height: 130rpx;
  display: block;
}

.app-name, .dock-name {
  font-size: 24rpx;
  color: #333;
  margin-top: 10rpx;
  text-align: center;
}
</style>
