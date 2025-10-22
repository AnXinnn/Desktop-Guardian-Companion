<template>
  <view class="msgBox">
		<scroll-view class="top" scroll-y :scroll-with-animation="true" :scroll-top="scrollTop" ref="scrollView">
			<view class="msg-list" :style="{ paddingBottom: (keyboardOffset + 40) + 'px' }">
				<view v-for="(item, i) in msgArr" :key="i" class="msg-row" :class="item.my ? 'row-right' : 'row-left'">
					<image class="avatar" mode="aspectFill" :src="item.avatar || (item.my ? '/static/mgc/geren.png' : '/static/mgc/kefu.png')"></image>
					<view class="bubble" :class="item.my ? 'bubble-right' : 'bubble-left'">
						<text class="bubble-text">{{ item.text }}</text>
					</view>
				</view>
			</view>
		</scroll-view>

		<view class="bottom" :style="{ transform: `translateY(-${keyboardOffset}px)` }">
			<input class="inp" placeholder="请输入内容" v-model="value" confirm-type="send" @confirm="send" @focus="handleFocus" @blur="handleBlur" />
			<button class="sendBtn" @click="send">发送</button>
		<script>
		export default {
			data() {
				return {
					value: "",
					msgArr: [],
					scrollTop: 0,
					keyboardOffset: 0,
					_initialWindowHeight: 0,
					_unsubKeyboard: null
				};
			},
			mounted() {
				if (typeof window !== 'undefined') {
					this._initialWindowHeight = window.innerHeight || 0;
				}
			},
			beforeUnmount() {
				if (this._unsubKeyboard && typeof this._unsubKeyboard === 'function') {
					this._unsubKeyboard();
					this._unsubKeyboard = null;
				}
			},
			methods: {
				// 滚动到底部（简单策略：把 scrollTop 设为一个大数）
				scrollToBottom() {
					this.$nextTick(() => {
						this.scrollTop = 99999;
					});
				},
				handleFocus() {
					// 尝试通过 window.innerHeight 变化估计键盘高度（H5/APP）
					if (typeof window !== 'undefined' && this._initialWindowHeight) {
						setTimeout(() => {
							const h = window.innerHeight || 0;
							const offset = Math.max(0, this._initialWindowHeight - h);
							this.keyboardOffset = offset;
							this.scrollToBottom();
						}, 300);
					}
					// 兼容 uni 提供的键盘事件（若支持）
					if (typeof uni !== 'undefined' && uni.onKeyboardHeightChange) {
						this._unsubKeyboard = uni.onKeyboardHeightChange(res => {
							if (res && res.height) {
								this.keyboardOffset = res.height;
								this.scrollToBottom();
							}
						});
					}
				},
				handleBlur() {
					setTimeout(() => {
						this.keyboardOffset = 0;
					}, 200);
					if (this._unsubKeyboard && typeof this._unsubKeyboard === 'function') {
						this._unsubKeyboard();
						this._unsubKeyboard = null;
					}
				},
				send() {
					let that = this;
					let url = "https://qianfan.baidubce.com/v2/chat/completions";

					//追加自己的提问
					if (that.value && that.value.trim()) {
						this.msgArr.push({
							text: that.value.trim(),
							my: true
						});
						this.scrollToBottom();
					} else {
						return;
					}

					uni.showLoading({
						title: "努力思考中"
					});
					//发送请求
					uni.request({
						url: url,
						method: "POST",
						header: {
							'Content-Type': 'application/json',
							'appid': '',
							'Authorization': 'Bearer bce-v3/ALTAK-Rc6rWtbL71fz5gQIEVdEr/13f3c1a109625316a3feb6a62eb26aaf7c71cac4'
						},
						data: JSON.stringify({
							"model": "ernie-3.5-8k",
							"messages": [{
								"role": "user",
								"content": that.value
							}],
							"web_search": {
								"enable": false,
								"enable_citation": false,
								"enable_trace": false
							}
						}),
						success: (res) => {
							let content = (res && res.data && res.data.choices && res.data.choices[0] && res.data.choices[0].message && res.data.choices[0].message.content) || '对方未返回消息';
							that.msgArr.push({
								text: content,
								my: false
							});
							uni.hideLoading();
							that.scrollToBottom();
						},
						fail: (err) => {
							console.error('请求失败', err);
							that.msgArr.push({ text: '网络请求失败，请重试', my: false });
							uni.hideLoading();
							that.scrollToBottom();
						}
					});
					this.value = "";
				}
			}
		};
		</script>
						console.error('请求失败', err);
						that.msgArr.push({ text: '网络请求失败，请重试', my: false });
						uni.hideLoading();
						that.scrollToBottom();
					}


				});
				this.value = "";
			}

		}
	}
</script>

<style>
/* 容器 */
.msgBox {
	width: 100%;
	height: 100%;
	background-color: #f5f7fb; /* 柔和背景，降低视觉疲劳 */
	display: flex;
	flex-direction: column;
}

/* 消息区（可滚动） */
.top {
	flex: 1;
	padding: 20rpx;
}

.msg-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.msg-row {
	display: flex;
	align-items: flex-end;
}

.row-left {
	<template>
		<view class="msgBox">
			<scroll-view class="top" scroll-y :scroll-with-animation="true" :scroll-top="scrollTop" ref="scrollView">
				<view class="msg-list" :style="{ paddingBottom: (keyboardOffset + 40) + 'px' }">
					<view v-for="(item, i) in msgArr" :key="i" class="msg-row" :class="item.my ? 'row-right' : 'row-left'">
						<image class="avatar" mode="aspectFill" :src="item.avatar || (item.my ? '/static/mgc/geren.png' : '/static/mgc/kefu.png')"></image>
						<view class="bubble" :class="item.my ? 'bubble-right' : 'bubble-left'">
							<text class="bubble-text">{{ item.text }}</text>
						</view>
					</view>
				</view>
			</scroll-view>

			<view class="bottom" :style="{ transform: `translateY(-${keyboardOffset}px)` }">
				<input class="inp" placeholder="请输入内容" v-model="value" confirm-type="send" @confirm="send" @focus="handleFocus" @blur="handleBlur" />
				<button class="sendBtn" @click="send">发送</button>
			</view>
		</view>
	</template>

	<script>
	export default {
		data() {
			return {
				value: '',
				msgArr: [],
				scrollTop: 0,
				keyboardOffset: 0,
				_initialWindowHeight: 0,
				_unsubKeyboard: null
			};
		},
		mounted() {
			if (typeof window !== 'undefined') {
				this._initialWindowHeight = window.innerHeight || 0;
			}
		},
		beforeUnmount() {
			if (this._unsubKeyboard && typeof this._unsubKeyboard === 'function') {
				this._unsubKeyboard();
				this._unsubKeyboard = null;
			}
		},
		methods: {
			// 滚动到底部（简单策略：把 scrollTop 设为一个大数）
			scrollToBottom() {
				this.$nextTick(() => {
					this.scrollTop = 99999;
				});
			},
			handleFocus() {
				// 尝试通过 window.innerHeight 变化估计键盘高度（H5/APP）
				if (typeof window !== 'undefined' && this._initialWindowHeight) {
					setTimeout(() => {
						const h = window.innerHeight || 0;
						const offset = Math.max(0, this._initialWindowHeight - h);
						this.keyboardOffset = offset;
						this.scrollToBottom();
					}, 300);
				}
				// 兼容 uni 提供的键盘事件（若支持）
				if (typeof uni !== 'undefined' && uni.onKeyboardHeightChange) {
					this._unsubKeyboard = uni.onKeyboardHeightChange(res => {
						if (res && res.height) {
							this.keyboardOffset = res.height;
							this.scrollToBottom();
						}
					});
				}
			},
			handleBlur() {
				setTimeout(() => {
					this.keyboardOffset = 0;
				}, 200);
				if (this._unsubKeyboard && typeof this._unsubKeyboard === 'function') {
					this._unsubKeyboard();
					this._unsubKeyboard = null;
				}
			},
			send() {
				const that = this;
				const url = 'https://qianfan.baidubce.com/v2/chat/completions';

				//追加自己的提问
				if (that.value && that.value.trim()) {
					this.msgArr.push({ text: that.value.trim(), my: true });
					this.scrollToBottom();
				} else {
					return;
				}

				uni.showLoading({ title: '努力思考中' });

				//发送请求
				uni.request({
					url: url,
					method: 'POST',
					header: {
						'Content-Type': 'application/json',
						appid: '',
						Authorization:
							'Bearer bce-v3/ALTAK-Rc6rWtbL71fz5gQIEVdEr/13f3c1a109625316a3feb6a62eb26aaf7c71cac4'
					},
					data: JSON.stringify({
						model: 'ernie-3.5-8k',
						messages: [
							{
								role: 'user',
								content: that.value
							}
						],
						web_search: { enable: false, enable_citation: false, enable_trace: false }
					}),
					success: res => {
						const content =
							(res && res.data && res.data.choices && res.data.choices[0] && res.data.choices[0].message && res.data.choices[0].message.content) ||
							'对方未返回消息';
						that.msgArr.push({ text: content, my: false });
						uni.hideLoading();
						that.scrollToBottom();
					},
					fail: err => {
						console.error('请求失败', err);
						that.msgArr.push({ text: '网络请求失败，请重试', my: false });
						uni.hideLoading();
						that.scrollToBottom();
					}
				});

				this.value = '';
			}
		}
	};
	</script>