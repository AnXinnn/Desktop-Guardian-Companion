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
				<view class="setting-item" @click="setAsDefaultLauncher">
					<image class="icon" src="/static/mgc/Guard.png"></image>
					<text>设置为默认桌面</text>
					<text class="arrow">></text>
				</view>
				<view class="setting-item" @click="backupData" v-if="isLoggedIn">
					<image class="icon" src="/static/mgc/Guard.png"></image>
					<text>数据备份</text>
					<text class="arrow">></text>
				</view>
				<view class="setting-item" @click="restoreData" v-if="isLoggedIn">
					<image class="icon" src="/static/mgc/Guard.png"></image>
					<text>数据恢复</text>
					<text class="arrow">></text>
				</view>
				<view class="setting-item" @click="toggleApiEnv">
					<image class="icon" src="/static/mgc/Guard.png"></image>
					<text>API环境: {{ apiEnvText }}</text>
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
import {
  isDefaultLauncher,
  openLauncherChooser,
  openAppSettings,
  saveDefaultLauncherStatus
} from '@/utils/launcherHelper.js';
import apiUtils, { getApiBaseUrl, setApiEnv } from '@/utils/api.js';

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
			harassProtection: true,
			apiEnv: uni.getStorageSync('apiEnv') || 'prod' // 默认生产环境
		}
	},
	computed: {
		isLoggedIn() {
			return !!(this.users && this.users.mobile);
		},
		apiEnvText() {
			return this.apiEnv === 'dev' ? '开发环境' : '生产环境';
		}
	},
	onShow() {
		try {
			this.loadUserInfo();
			const st = uni.getStorageSync('deskSettings');
			if (st) this.settings = st;
			const harass = uni.getStorageSync('harassProtection');
			if (harass !== undefined) this.harassProtection = harass;
			// 更新API环境显示
			this.apiEnv = uni.getStorageSync('apiEnv') || 'prod';
		} catch (e) {
			console.error('个人中心页面加载失败:', e);
		}
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
		// 设置为默认桌面
		async setAsDefaultLauncher() {
			// #ifdef APP-PLUS
			try {
				// 先检查当前是否已经是默认桌面
				const isDefault = await isDefaultLauncher();
				
				if (isDefault) {
					uni.showModal({
						title: '提示',
						content: '当前应用已经是默认桌面',
						showCancel: false
					});
					return;
				}
				
				// 显示确认对话框
				uni.showModal({
					title: '设置为默认桌面',
					content: '是否将"陪伴桌面守护"设置为默认桌面？设置后，按Home键将直接返回本应用。',
					confirmText: '去设置',
					cancelText: '取消',
					success: (res) => {
						if (res.confirm) {
							// 打开桌面选择器
							openLauncherChooser();
						}
					}
				});
			} catch (e) {
				console.error('设置默认桌面失败:', e);
				uni.showToast({
					title: '设置失败',
					icon: 'none'
				});
			}
			// #endif
			
			// #ifndef APP-PLUS
			uni.showToast({
				title: '当前平台不支持此功能',
				icon: 'none'
			});
			// #endif
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
		},
		// 数据备份
		async backupData() {
			if (!this.isLoggedIn) {
				return uni.showToast({ title: '请先登录', icon: 'none' });
			}
			
			uni.showLoading({ title: '备份中...' });
			try {
				const success = await apiUtils.syncUtils.backup();
				if (success) {
					uni.hideLoading();
				} else {
					uni.hideLoading();
				}
			} catch (error) {
				uni.hideLoading();
				console.error('数据备份失败:', error);
			}
		},
		// 数据恢复
		async restoreData() {
			if (!this.isLoggedIn) {
				return uni.showToast({ title: '请先登录', icon: 'none' });
			}
			
			uni.showModal({
				title: '确认恢复',
				content: '恢复数据将覆盖本地数据，确定要继续吗？',
				success: async (res) => {
					if (res.confirm) {
						uni.showLoading({ title: '恢复中...' });
						try {
							const success = await apiUtils.syncUtils.restoreAll();
							if (success) {
								uni.hideLoading();
								// 刷新页面数据
								this.$forceUpdate();
								// 提示用户可能需要刷新页面
								setTimeout(() => {
									uni.showToast({ 
										title: '数据已恢复，请刷新相关页面', 
										icon: 'success',
										duration: 3000
									});
								}, 500);
							} else {
								uni.hideLoading();
							}
						} catch (error) {
							uni.hideLoading();
							console.error('数据恢复失败:', error);
						}
					}
				}
			});
		},
		// 切换API环境
		toggleApiEnv() {
			const currentEnv = uni.getStorageSync('apiEnv') || 'prod';
			const newEnv = currentEnv === 'dev' ? 'prod' : 'dev';
			
			uni.showModal({
				title: '切换API环境',
				content: `当前: ${currentEnv === 'dev' ? '开发环境' : '生产环境'}\n切换为: ${newEnv === 'dev' ? '开发环境' : '生产环境'}\n\n切换后需要重启应用生效`,
				confirmText: '切换',
				cancelText: '取消',
				success: (res) => {
					if (res.confirm) {
						setApiEnv(newEnv);
						this.apiEnv = newEnv;
						uni.showToast({ 
							title: `已切换为${newEnv === 'dev' ? '开发' : '生产'}环境，请重启应用`, 
							icon: 'none',
							duration: 3000
						});
					}
				}
			});
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