<template>
	<view class="my-page">
		<!-- 顶部栏 -->
		<view class="headerBox">
			<image class="back-btn" src="/static/mgc/fanhui.png" @click="goBack"></image>
		</view>

		<!-- 会员卡片 -->
		<view class="vip-card">
			<image class="avatarImg" :src="users.a ? users.a : '/static/mgc/geren.png'"></image>
			<view class="vip-info">
				<view class="vip-name">{{ users.name || '温暖的希望' }}</view>
				<view class="vip-code">号：{{ userCode }}</view>
			</view>
			<button class="loginbtn" v-if="!users.name" @click="gologin">点击登录</button>
		</view>

		<!-- 内容滚动区 -->
		<scroll-view scroll-y class="content">
			<view class="section-title">已绑定家人 <text class="link" @click="manageRelatives">绑定管理 ></text></view>
			<view class="placeholder">暂时没有家人联系人信息哦</view>

			<view class="section-title">安全桌面</view>
			<view class="three-cards">
				<view class="small-card" @click="goForce">
					<text>强制桌面</text>
					<switch :checked="settings.force" @change="onToggle('force',$event)" />
				</view>
				<view class="small-card" @click="goLock">
					<text>锁定桌面</text>
					<switch :checked="settings.lock" @change="onToggle('lock',$event)" />
				</view>
				<view class="small-card" @click="goStable">
					<text>稳定桌面</text>
					<switch :checked="settings.stable" @change="onToggle('stable',$event)" />
				</view>
			</view>

			<view class="section-title">功能设置</view>
			<view class="settings-list">
				<view class="setting-item">
					<image class="icon" src="/static/mgc/Guard.png"></image>
					<text>骚扰防护</text>
					<switch checked @change="toggleHarass" />
				</view>
				<view class="setting-item">
					<image class="icon" src="/src/static/mgc/gengxin.png"></image>
					<text>升级版本</text>
					<text class="arrow">></text>
				</view>
			</view>

			<view class="footer">
				<view class="version">当前版本: Huawei V1.0.5</view>
				<view class="support">客服电话: 1800517878-29A</view>
				<view class="links">
					<text @click="openUserAgreement">用户协议</text>
					<text @click="openPrivacyPolicy">隐私政策</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			userCode: '5090922',
			users: {
				a: "",
				name: ""
			},
			settings: { force: false, lock: false, stable: true }
		}
	},
	onShow() {
		const storedUsers = uni.getStorageSync("users")
		if (storedUsers && typeof storedUsers === 'object') {
			this.users = storedUsers
		}
		const st = uni.getStorageSync('deskSettings')
		if (st) this.settings = st
	},
	methods: {
		gologin() {
			uni.navigateTo({
				url: '/pages/login/login',
			});
		},
		goCustomerService() {
			uni.navigateTo({
				url: '/pages/customer-service/customer-service'
			});
		},
		goBack() {
			uni.redirectTo({
					url: '/pages/index/index?page=2'
				});
		},
		onToggle(key, e){
			this.settings[key] = e.detail.value
			uni.setStorageSync('deskSettings', this.settings)
		},
		goForce(){ uni.navigateTo({ url: '/pages/desk/force' }) },
		goLock(){ uni.navigateTo({ url: '/pages/desk/lock' }) },
		goStable(){ uni.navigateTo({ url: '/pages/desk/stable' }) },
		toggleHarass(e) {
			// 骚扰防护开关逻辑
			uni.showToast({ title: e.detail.value ? '已开启骚扰防护' : '已关闭骚扰防护', icon: 'none' });
		},
		
		openUserAgreement() {
			uni.showToast({ title: '打开用户协议', icon: 'none' });
		},
		openPrivacyPolicy() {
			uni.showToast({ title: '打开隐私政策', icon: 'none' });
		},
		manageRelatives() {
			uni.showToast({ title: '绑定管理', icon: 'none' });
		}
	}
}
</script>

<style>
.my-page { height: 100vh; background: #f6f7f9; }
.headerBox {
	width: 100%;
	height: 88px;
	background-color: #28c266;
	padding-top: var(--status-bar-height);
	display: flex;
	align-items: center;
	justify-content: space-between;
	position: relative;
}
.back-btn { width: 24px; height: 24px; margin-left: 16px; }
.avatarImg {
	width: 72px;
	height: 72px;
	margin-right: 16px;
	border-radius: 50%;
}

.loginbtn {
	padding: 8px 20px;
	background-color: #ff7a00;
	color: #fff;
	border-radius: 20px;
}

.user-name {
	font-size: 18px;
	font-weight: bold;
}
	
.customer-service {
	position: absolute;
	right: 20px;
	top: calc(var(--status-bar-height) + 16px);
	width: 30px;
	height: 30px;
}

.vip-card {
	margin: -20px 16px 12px;
	background: linear-gradient(90deg,#ffe0a8,#ffd39b);
	border-radius: 12px;
	padding: 16px;
	display: flex;
	align-items: center;
}
.vip-info { flex: 1; color: #8a5a00; }
.vip-name { font-size: 22px; font-weight: 700; }
.vip-code { margin-top: 6px; font-size: 16px; }

.content { height: calc(100vh - 200px); padding: 0 16px 24px; }
.section-title { margin: 14px 0; font-size: 20px; font-weight: 700; }
.link { color: #28c266; font-size: 16px; margin-left: 8px; }
.placeholder { height: 140px; color:#999; background:#fff; border-radius:12px; display:flex; align-items:center; justify-content:center; }
.three-cards { display:flex; gap:12px; }
.small-card { flex:1; background:#fff; border-radius:12px; height:120px; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:700; }

.settings-list { display: flex; flex-direction: column; gap: 12px; }
.setting-item { background: #fff; border-radius: 12px; padding: 16px; display: flex; align-items: center; }
.icon { width: 48px; height: 48px; margin-right: 16px; }
.arrow { margin-left: auto; color: #999; }

.footer { margin-top: 24px; text-align: center; color: #999; font-size: 14px; }
.version { margin-bottom: 8px; }
.support { margin-bottom: 8px; }
.links { display: flex; justify-content: center; gap: 20px; }
</style>