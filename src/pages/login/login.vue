<template>
	<view>
		<button class="avater-wrapper" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
			<image class="avater" :src="avatarUrl"></image>
		</button>
		<input @change="inp" type="text" class="weui-input" placeholder="请输入昵称" />
		<button @click="ok">确定</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				avatarUrl: "",
				nikeNames: ""
			}
		},
		methods: {
			onChooseAvatar(e) {
				this.avatarUrl = e.detail.avatarUrl;
			},
			inp(e) {
				this.nikeNames = e.detail.value;
			},
			ok() {
				uni.setStorageSync("users", {
					a: this.avatarUrl,
					name: this.nikeNames
				});
				uni.navigateBack();
			}
		}
	}
</script>

<style>
	.avater-wrapper {
		background: none;
		padding: 0;
		margin: 0;
		line-height: 0;
	}

	.avater {
		width: 150rpx;
		height: 150rpx;
		border-radius: 50%;
		display: block;
	}

	.weui-input {
		width: 80%;
		padding: 20rpx;
		border: 1px solid #eee;
		border-radius: 8rpx;
		margin: 40rpx auto;
		display: block;
	}
</style>