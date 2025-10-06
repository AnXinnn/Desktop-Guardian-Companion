<template>
	<view class="msgBox">
		<view class="top">
			<view v-for="(item,i) in msgArr" :key="i">
				<view class="myMsg" v-if="item.my">
					<view class="myText">
						{{item.text}}
					</view>
					<image class="avater" src="/static/icon5.png"></image>
				</view>
				<view class="otherMag" v-else>
					<image class="avater" src="/static/icon5.png"></image>
					<view class="otherText">
						{{item.text}}
					</view>
				</view>
			</view>

		</view>
		<view class="bottom">
			<u--input class="inp" placeholder="请输入内容" border="surround" v-model="value">
			</u--input>
			<button class="sendBtn" @click="send">发送</button>

		</view>

	</view>
</template>

<script>
	import {
		methods
	} from 'uni_modules/uview-ui/libs/mixin/mixin';

	export default {
		data() {
			return {
				value: "",
				msgArr: []

			}
		},
		methods: {
			send() {
				let that = this;
				let url = "https://qianfan.baidubce.com/v2/chat/completions";

				//追加自己的提问
				this.msgArr.push({
					text: that.value,
					my: true
				})

				uni.showLoading({
					title: "努力思考中"
				})
				//发送请求
				uni.request({
					url: url,
					method: "POST",
					header : {
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
						console.log(res.data.choices[0].message.content)
						that.msgArr.push({
							text: res.data.choices[0].message.content,
							my: false
						});
						uni.hideLoading();
					}


				});
				this.value = "";
			}

		}
	}
</script>

<style>
	page {
		width: 100%;
		height: 100%;
	}

	.msgBox {
		width: 100%;
		height: 100%;
		background-color: red;
		display: flex;
		flex-direction: column;
	}

	.top {
		flex: 1;
		background-color: #eee;
		padding-bottom: 80px;
	}

	.myMsg,
	.otherMag {
		width: 94%;
		margin: 10px auto;
		display: flex;
		justify-content: flex-end;
	}

	.otherMag {
		justify-content: flex-start;
	}

	.myText,
	.otherText {
		max-width: 500rpx;
		background-color: green;
		color: #fff;
		border-radius: 7px;
		padding: 5px;
		margin-right: 10px;
	}

	.otherText {
		margin-right: 0px;
		margin-left: 10px;
		background-color: gray;
	}

	.avater {
		width: 50px;
		height: 50px;
		border-radius: 50%;
	}

	.bottom {
		width: 100%;
		height: 70px;
		position: fixed;
		bottom: 0;
		background-color: #fff;
		display: flex;
		align-items: center;
	}

	.sendBtn {
		width: 100px;
		height: 38px;
	}
</style>