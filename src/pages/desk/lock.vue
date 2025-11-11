<template>
	<view class="page">
		<view class="header">
			<image class="back-btn" src="/static/mgc/fanhui.png" @click="goBack"></image>
			<text class="title">锁定桌面</text>
		</view>
		<view class="row">
			<text>开启锁定桌面</text>
			<switch :checked="settings.lock" @change="onToggle" />
		</view>
		<view class="tip">锁定排列与编辑，避免误删应用。</view>
	</view>
</template>

<script>
export default {
	data(){
		return { settings: uni.getStorageSync('deskSettings') || { force:false, lock:false, stable:true } }
	},
	methods:{
		goBack() {
			uni.navigateBack();
		},
		onToggle(e){
			this.settings.lock = e.detail.value
			uni.setStorageSync('deskSettings', this.settings)
			uni.showToast({ title: this.settings.lock ? '已开启' : '已关闭', icon: 'none' })
		}
	}
}
</script>

<style>
.page{ padding: 20px; }
.header{ display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.back-btn{ width: 24px; height: 24px; }
.title{ font-size: 22px; font-weight: 700; }
.row{ background:#fff; border-radius:12px; padding:16px; display:flex; justify-content:space-between; align-items:center; }
.tip{ color:#888; font-size:14px; margin-top:12px; }
</style>

