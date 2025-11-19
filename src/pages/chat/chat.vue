<template>
	<view class="msgBox">
		<!-- 返回按钮 -->
		<view class="header">
			<image class="back-btn" src="/static/mgc/fanhui.png" @click="goBack"></image>
			<text class="header-title">在线客服</text>
		</view>
		<!-- 消息区：scroll-view 承载，自动滚底 -->
		<scroll-view class="top" scroll-y :scroll-top="scrollTop" :scroll-with-animation="true">
			<view v-for="(item, i) in msgArr" :key="i" class="message-item">
				<!-- 时间显示 -->
				<text class="time" v-if="showTime(i)">{{ item.time }}</text>
				<!-- 消息气泡 -->
				<view :class="['message-wrapper', item.my ? 'message-wrapper--self' : 'message-wrapper--other']">
					<!-- 对方消息：头像在左 -->
					<template v-if="!item.my">
						<image class="avatar" src="/static/mgc/kefu.png" />
						<view class="bubble-wrap">
							<view class="bubble bubble--other">{{ item.text }}</view>
						</view>
					</template>
					<!-- 我的消息：头像在右 -->
					<template v-else>
						<view class="bubble-wrap">
							<view class="bubble bubble--self">{{ item.text }}</view>
						</view>
						<image class="avatar" src="/static/mgc/geren.png" />
					</template>
				</view>
			</view>
		</scroll-view>

		<!-- 底部输入区：固定位置 -->
		<view class="bottom">
			<button class="iconBtn" @click="toggleEmoji">😊</button>
			<textarea class="inp" placeholder="请输入内容" v-model="value" @keydown.enter="onEnter" auto-height></textarea>
			<button class="sendBtn" :disabled="!value.trim()" @click="send">发送</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			value: '',
			msgArr: [],
			scrollTop: 0
		}
	},
	mounted() {
		this.scrollToBottom();
	},
	methods: {
		goBack() {
			uni.navigateBack();
		},
		onEnter(e) {
			if (!e.shiftKey) {
				e.preventDefault && e.preventDefault();
				this.send();
			}
		},
		scrollToBottom() {
			this.$nextTick(() => {
				this.scrollTop = 999999;
			});
		},
		showTime(index) {
			// 简化：每条消息都显示时间，或根据时间差判断
			return true; // 暂每条显示
		},
		send() {
			const text = (this.value || '').trim();
			if (!text) return;

			const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
			this.msgArr.push({ text, my: true, time: now });
			this.value = '';
			this.scrollToBottom();

			uni.showLoading({ title: '努力思考中' });
			uni.request({
				url: 'https://qianfan.baidubce.com/v2/chat/completions',
				method: 'POST',
				header: {
					'Content-Type': 'application/json',
					appid: '',
					Authorization: 'Bearer bce-v3/ALTAK-Rc6rWtbL71fz5gQIEVdEr/13f3c1a109625316a3feb6a62eb26aaf7c71cac4'
				},
				data: JSON.stringify({
					model: 'ernie-3.5-8k',
					messages: [{ role: 'user', content: text }],
					web_search: { enable: false, enable_citation: false, enable_trace: false }
				}),
				success: (res) => {
					const reply = (res && res.data && res.data.choices && res.data.choices[0] && res.data.choices[0].message && res.data.choices[0].message.content) || '没有返回内容';
					this.msgArr.push({ text: reply, my: false, time: now });
					this.scrollToBottom();
					uni.hideLoading();
				},
				fail: () => {
					uni.hideLoading();
				}
			});
		},
		toggleEmoji() {
			uni.showToast({ title: '表情面板尚未实现', icon: 'none' });
		}
	}
}
</script>

<style>
.msgBox {
	width: 100%;
	height: 100vh;
	background-color: #f2f3f5;
	display: flex;
	flex-direction: column;
	position: relative;
}

.header {
	background: #fff;
	padding: 12px 16px;
	display: flex;
	align-items: center;
	gap: 12px;
	border-bottom: 1px solid #eee;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 100;
}

.back-btn {
	width: 24px;
	height: 24px;
}

.header-title {
	font-size: 18px;
	font-weight: 600;
}

/* 消息区 */
.top {
	flex: 1;
	padding: 20rpx 24rpx 200rpx; /* 预留底部输入区高度 */
	box-sizing: border-box;
	margin-top: 60px; /* 为header留出空间 */
	background: #f2f3f5;
}

.message-item {
	margin-bottom: 30rpx;
	display: flex;
	flex-direction: column;
}

.time {
	font-size: 24rpx;
	color: #999;
	text-align: center;
	margin: 20rpx 0;
	padding: 0 20rpx;
}

/* 消息容器 */
.message-wrapper {
	display: flex;
	align-items: flex-start;
	gap: 16rpx;
	width: 100%;
	box-sizing: border-box;
	margin-top: 10rpx;
}

/* 对方消息：左对齐 */
.message-wrapper--other {
	justify-content: flex-start;
}

/* 我的消息：右对齐 */
.message-wrapper--self {
	justify-content: flex-end;
}

.avatar {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	flex-shrink: 0;
	background: #e0e0e0;
}

.bubble-wrap {
	max-width: calc(100% - 120rpx); /* 减去头像和间距 */
	display: flex;
	align-items: flex-start;
	position: relative;
}

.bubble {
	padding: 20rpx 28rpx;
	border-radius: 12rpx;
	font-size: 32rpx;
	line-height: 1.5;
	word-break: break-word;
	white-space: pre-wrap;
	position: relative;
	font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

/* 对方消息气泡：白色，左侧 */
.bubble--other {
	background: #fff;
	color: #333;
	border-top-left-radius: 4rpx; /* 左上角小圆角 */
}

.bubble--other::before {
	content: '';
	position: absolute;
	left: -12rpx;
	top: 20rpx;
	width: 0;
	height: 0;
	border: 12rpx solid transparent;
	border-right-color: #fff;
}

/* 我的消息气泡：绿色，右侧 */
.bubble--self {
	background: #07c160;
	color: #fff;
	border-top-right-radius: 4rpx; /* 右上角小圆角 */
}

.bubble--self::after {
	content: '';
	position: absolute;
	right: -12rpx;
	top: 20rpx;
	width: 0;
	height: 0;
	border: 12rpx solid transparent;
	border-left-color: #07c160;
}


/* 底部输入区（固定） */
.bottom {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 18rpx;
	padding-bottom: calc(18rpx + env(safe-area-inset-bottom));
	padding-bottom: calc(18rpx + constant(safe-area-inset-bottom));
	box-sizing: border-box;
	background: #fff;
	display: flex;
	gap: 12rpx;
	align-items: center;
	border-top: 1rpx solid #e6e6e6;
	z-index: 10;
}

.iconBtn {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	background: transparent;
	border: none;
	font-size: 30rpx;
}

.inp {
	flex: 1;
	min-height: 70rpx;
	max-height: 160rpx;
	padding: 14rpx 18rpx;
	border-radius: 18rpx;
	border: 1rpx solid #e6e6e6;
	font-size: 32rpx;
	background: #f9f9f9;
	resize: none;
}

.sendBtn {
	min-width: 120rpx;
	height: 70rpx;
	border-radius: 14rpx;
	background-color: #07c160;
	color: #fff;
	font-size: 30rpx;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 16rpx;
	border: none;
}
.sendBtn:disabled {
	background: #cfead8;
}

/* 适配 */
@media (max-width: 420px) {
	.avatar { width: 72rpx; height: 72rpx; }
	.bubble { font-size: 30rpx; }
	.inp { font-size: 28rpx; }
}
</style>