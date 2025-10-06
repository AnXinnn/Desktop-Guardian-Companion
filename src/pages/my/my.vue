<template>
	<view class="headerBox">
		<image class="avatarImg" :src="users.a ? users.a : '/static/geren.png'"></image>
		<button v-if="!users.name" class="loginbtn" @click="gologin">去登陆</button>
		<view v-else class="user-name">
			{{ users.name }}
		</view>
		<image class="customer-service" src="/static/mgc/kefu.png" @click="goCustomerService"></image>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				users: {
					a: "",
					name: ""
				}
			}
		},
		onShow() {
			const storedUsers = uni.getStorageSync("users")
			if (storedUsers && typeof storedUsers === 'object') {
				this.users = storedUsers
			}
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
			}
		}
	}
</script>

<style>
	.headerBox {
		width: 100%;
		height: 200px;
		background-color: #eee;
		margin: auto;
		display: flex;
		align-items: center;
		position: relative;
	}

	.avatarImg {
		width: 90px;
		height: 90px;
		margin-right: 20px;
		margin-left: 20px;
		border-radius: 50%;
	}

	.loginbtn {
		margin-left: 0;
		padding: 8px 20px;
		background-color: #007AFF;
		color: white;
		border-radius: 20px;
	}

	.user-name {
		font-size: 18px;
		font-weight: bold;
	}
	
	.customer-service {
		position: absolute;
		right: 20px;
		top: 20px;
		width: 40px;
		height: 40px;
	}
</style>