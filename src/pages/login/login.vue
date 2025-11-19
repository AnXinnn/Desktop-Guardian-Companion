<template>
	<view class="login-page">
		<!-- 自定义返回 -->
		<view class="nav">
			<image class="back" src="/static/mgc/fanhui.png" @click="goBack"></image>
		</view>

		<view class="hero">
			<view class="title">登录伴伴守护桌面</view>
			<view class="subtitle">守护长辈手机安全</view>
		</view>

		<view class="banner">永久无广告</view>

		<view class="form">
			<input class="input" type="number" v-model.trim="mobile" placeholder="请输入手机号码" />
			<view class="code-row">
				<input class="input code" type="number" v-model.trim="code" placeholder="请输入验证码" />
				<button class="get-code" :disabled="countdown>0" @click="getCode">{{ countdown>0 ? countdown+'s' : '获取验证码' }}</button>
			</view>
			<button class="submit" :disabled="!agreed || !valid" @click="ok">登录</button>
			<view class="agree">
				<checkbox :checked="agreed" @click="agreed=!agreed" /> 同意《用户协议》和《隐私政策》
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				mobile: '',
				code: '',
				countdown: 0,
				agreed: false
			}
		},
		computed: {
			valid() {
				return /^1\d{10}$/.test(this.mobile) && this.code.length >= 4;
			}
		},
		methods: {
			goBack(){ 
				uni.navigateBack(); 
			},
			getCode(){
				if(!/^1\d{10}$/.test(this.mobile)) {
					return uni.showToast({ title:'请输入有效手机号', icon:'none' });
				}
				this.countdown = 60;
				const timer = setInterval(()=>{ 
					this.countdown--; 
					if(this.countdown<=0) clearInterval(timer); 
				},1000);
				// 模拟发送验证码
				uni.showToast({ title:'验证码已发送', icon:'success' });
			},
			ok() {
				if(!/^1\d{10}$/.test(this.mobile)) {
					return uni.showToast({ title:'请输入有效手机号', icon:'none' });
				}
				if(!this.code) {
					return uni.showToast({ title:'请输入验证码', icon:'none' });
				}
				if(!this.agreed) {
					return uni.showToast({ title:'请同意用户协议和隐私政策', icon:'none' });
				}
				
				// 生成用户码（基于手机号后7位）
				const userCode = this.mobile.slice(-7);
				
				// 保存用户信息到本地存储
				const userInfo = {
					mobile: this.mobile,
					name: `用户${this.mobile.slice(-4)}`, // 默认昵称为手机号后4位
					a: '', // 头像，默认为空
					userCode: userCode,
					loginTime: new Date().toISOString()
				};
				
				uni.setStorageSync('users', userInfo);
				uni.setStorageSync('userId', this.mobile); // 保存用户ID用于API调用
				
				uni.showToast({ title:'登录成功', icon:'success' });
				
				// 登录成功后返回个人中心页面
				setTimeout(()=> {
					uni.redirectTo({ url:'/pages/my/my' });
				}, 500);
			}
		}
	}
</script>

<style>
.login-page{ min-height:100vh; background:linear-gradient(180deg,#ffffff,#f9fbff); padding: 20px; }
.nav{ height: 44px; display:flex; align-items:center; }
.back{ width: 28px; height: 28px; }
.hero{ margin-top: 10px; }
.title{ font-size: 30px; font-weight: 800; }
.subtitle{ margin-top: 8px; color:#666; }
.banner{ margin-top: 24px; background:linear-gradient(90deg,#fff3d6,#fff6e6); color:#ff8a00; font-weight:800; padding:18px; border-radius:16px; text-align:center; }
.form{ margin-top: 24px; }
.input{ height: 48px; background:#f2f7fb; border-radius:14px; padding: 0 14px; margin-bottom: 12px; font-size: 16px; }
.code-row{ display:flex; gap: 12px; align-items:center; }
.code{ flex: 1; }
.get-code{ background:#2fc27a; color:#fff; height:48px; border-radius:14px; padding:0 14px; }
.submit{ 
	width: 100%; 
	height: 56px; 
	border-radius:28px; 
	margin-top: 16px; 
	background:#28c266; 
	color:#fff; 
	font-size:18px; 
	font-weight:600;
	border:none;
}
.submit[disabled]{ 
	background:#ccc; 
	color:#999;
	opacity:.7; 
}
.agree{ margin-top: 10px; color:#666; font-size: 14px; display:flex; align-items:center; gap:8px; }
</style>