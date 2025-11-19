<template>
	<view class="my-page">
		<!-- 顶部栏 -->
		<view class="headerBox">
			<image class="back-btn" src="/static/mgc/fanhui.png" @click="goBack"></image>
		</view>

		<!-- 会员卡片 -->
		<view class="vip-card">
			<image class="avatarImg" :src="users.a || '/static/mgc/geren.png'"></image>
			<view class="vip-info">
				<view class="vip-name" v-if="users.name">{{ users.name }}</view>
				<view class="vip-name-placeholder" v-else>未登录</view>
				<view class="vip-code" v-if="isLoggedIn">用户号：{{ users.userCode || userCode }}</view>
				<view class="vip-desc" v-else>登录后享受更多服务</view>
			</view>
			<button class="loginbtn" v-if="!isLoggedIn" @click="gologin">点击登录</button>
			<view class="logout-btn" v-else @click="logout">
				<text>退出</text>
			</view>
		</view>

		<!-- 内容滚动区 -->
		<scroll-view scroll-y class="content">
			<view class="section-title">
				已绑定家人 
				<text class="link" @click="manageRelatives" v-if="isLoggedIn">绑定管理 ></text>
			</view>
			<view class="placeholder" v-if="isLoggedIn">暂时没有家人联系人信息哦</view>
			<view class="placeholder login-tip" v-else>
				<text>请先登录后查看</text>
			</view>

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
				<view class="setting-item" @click="goCustomerService">
					<image class="icon" src="/static/mgc/Guard.png"></image>
					<text>客服中心</text>
					<text class="arrow">></text>
				</view>
				<view class="setting-item">
					<image class="icon" src="/static/mgc/Guard.png"></image>
					<text>骚扰防护</text>
					<switch :checked="harassProtection" @change="toggleHarass" />
				</view>
				<view class="setting-item">
					<image class="icon" src="/static/mgc/gengxin.png"></image>
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
				name: "",
				mobile: "",
				userCode: ""
			},
			settings: { force: false, lock: false, stable: true },
			harassProtection: true
		}
	},
	computed: {
		isLoggedIn() {
			return !!(this.users && this.users.mobile);
		}
	},
	onShow() {
		this.loadUserInfo();
		const st = uni.getStorageSync('deskSettings')
		if (st) this.settings = st
		const harass = uni.getStorageSync('harassProtection')
		if (harass !== undefined) this.harassProtection = harass
	},
	methods: {
		loadUserInfo() {
			const storedUsers = uni.getStorageSync("users")
			if (storedUsers && typeof storedUsers === 'object') {
				this.users = { ...this.users, ...storedUsers }
				if (storedUsers.userCode) {
					this.userCode = storedUsers.userCode
				}
			} else {
				// 重置用户信息
				this.users = {
					a: "",
					name: "",
					mobile: "",
					userCode: ""
				}
			}
		},
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
			this.harassProtection = e.detail.value;
			uni.setStorageSync('harassProtection', this.harassProtection);
			uni.showToast({ title: e.detail.value ? '已开启骚扰防护' : '已关闭骚扰防护', icon: 'none' });
		},
		logout() {
			uni.showModal({
				title: '确认退出',
				content: '确定要退出登录吗？',
				success: (res) => {
					if (res.confirm) {
						// 清除用户信息
						uni.removeStorageSync('users');
						uni.removeStorageSync('userId');
						// 重置用户数据
						this.users = {
							a: "",
							name: "",
							mobile: "",
							userCode: ""
						};
						uni.showToast({ title: '已退出登录', icon: 'success' });
					}
				}
			});
		},
		openUserAgreement() {
			uni.showToast({ title: '打开用户协议', icon: 'none' });
		},
		openPrivacyPolicy() {
			uni.showToast({ title: '打开隐私政策', icon: 'none' });
		},
		manageRelatives() {
			if (!this.isLoggedIn) {
				return uni.showToast({ title: '请先登录', icon: 'none' });
			}
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
	margin: 12px 16px 20px;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 16px;
	padding: 20px;
	display: flex;
	align-items: center;
	box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}
.vip-info { flex: 1; color: #fff; }
.vip-name { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
.vip-name-placeholder { font-size: 20px; font-weight: 600; opacity: 0.9; }
.vip-code { margin-top: 6px; font-size: 14px; opacity: 0.9; }
.vip-desc { margin-top: 6px; font-size: 14px; opacity: 0.8; }
.loginbtn {
	padding: 10px 24px;
	background-color: #fff;
	color: #667eea;
	border-radius: 24px;
	font-size: 16px;
	font-weight: 600;
	border: none;
	box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.logout-btn {
	padding: 8px 20px;
	background-color: rgba(255,255,255,0.2);
	color: #fff;
	border-radius: 20px;
	font-size: 14px;
	border: 1px solid rgba(255,255,255,0.3);
}
.logout-btn text {
	font-weight: 500;
}

.content { height: calc(100vh - 200px); padding: 0 16px 24px; }
.section-title { 
	margin: 20px 0 12px; 
	font-size: 18px; 
	font-weight: 700; 
	color: #333;
	display: flex;
	align-items: center;
}
.link { 
	color: #28c266; 
	font-size: 14px; 
	margin-left: auto;
	font-weight: 400;
}
.placeholder { 
	height: 120px; 
	color:#999; 
	background:#fff; 
	border-radius:12px; 
	display:flex; 
	align-items:center; 
	justify-content:center;
	font-size: 14px;
	margin-bottom: 12px;
}
.login-tip {
	background: #fff9e6;
	color: #ff8a00;
}
.three-cards { 
	display:flex; 
	gap:12px; 
	margin-bottom: 12px;
}
.small-card { 
	flex:1; 
	background:#fff; 
	border-radius:12px; 
	height:100px; 
	display:flex; 
	flex-direction: column;
	align-items:center; 
	justify-content:center; 
	gap: 8px;
	padding: 12px;
	box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.small-card text {
	font-size: 16px;
	font-weight: 600;
	color: #333;
}

.settings-list { 
	display: flex; 
	flex-direction: column; 
	gap: 12px; 
	margin-bottom: 12px;
}
.setting-item { 
	background: #fff; 
	border-radius: 12px; 
	padding: 16px; 
	display: flex; 
	align-items: center;
	box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.setting-item text {
	flex: 1;
	font-size: 16px;
	color: #333;
	margin-left: 12px;
}
.icon { 
	width: 40px; 
	height: 40px; 
	border-radius: 8px;
}
.arrow { 
	margin-left: auto; 
	color: #999; 
	font-size: 18px;
}

.footer { 
	margin-top: 32px; 
	padding-top: 24px;
	border-top: 1px solid #eee;
	text-align: center; 
	color: #999; 
	font-size: 13px; 
}
.version { margin-bottom: 6px; }
.support { margin-bottom: 12px; }
.links { 
	display: flex; 
	justify-content: center; 
	gap: 24px; 
}
.links text {
	color: #28c266;
	text-decoration: underline;
}
</style>