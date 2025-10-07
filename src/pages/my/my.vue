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
				<view class="vip-code">用户码：{{ userCode }}</view>
			</view>
			<button class="loginbtn" v-if="!users.name" @click="gologin">点击登录</button>
		</view>

		<!-- 内容滚动区 -->
		<scroll-view scroll-y class="content">
			<view class="section-title">已绑定家人 <text class="link" @click="manageRelatives">绑定管理 ></text></view>
			<view class="placeholder">暂时没有家人联系人信息哦</view>

			<view class="section-title">安心桌面</view>
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
			<!-- 这里可继续添加功能项 -->
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
			goStable(){ uni.navigateTo({ url: '/pages/desk/stable' }) }
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

	.back-btn {
		position: absolute;
		left: 20px;
		top: calc(var(--status-bar-height) + 16px);
		width: 30px;
		height: 30px;
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
</style>