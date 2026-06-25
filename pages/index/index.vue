<template>
	<view class="container">
		<!-- 用户信息 -->
		<view class="header" v-if="isLoggedIn">
			<image class="avatar" :src="userInfo.avatar || '/static/default-avatar.png'" mode="aspectFill"></image>
			<text class="nickname">{{ userInfo.nickname }}</text>
		</view>
		<view class="header" v-else>
			<view class="login-area">
				<text class="welcome-text">欢迎来到知识问答</text>
				<button class="btn-login" @click="onLogin" :loading="loginLoading">微信登录</button>
			</view>
		</view>

		<!-- 功能卡片 -->
		<view class="cards mt-40" v-if="isLoggedIn">
			<view class="card" @click="onStartQuiz">
				<view class="card-icon">🎯</view>
				<view class="card-content">
					<text class="card-title">开始答题</text>
					<text class="card-desc">AI 出题 · 10道精选题目 · 每题15秒</text>
				</view>
			</view>

			<view class="card" @click="onStartQuizByType('COMMONSENSE')">
				<view class="card-icon">📚</view>
				<view class="card-content">
					<text class="card-title">常识问答</text>
					<text class="card-desc">生活常识、历史地理</text>
				</view>
			</view>

			<view class="card" @click="onStartQuizByType('LOGIC')">
				<view class="card-icon">🧩</view>
				<view class="card-content">
					<text class="card-title">逻辑推理</text>
					<text class="card-desc">找规律、智力测试</text>
				</view>
			</view>
		</view>

		<!-- 底部说明 -->
		<view class="footer mt-40" v-if="isLoggedIn">
			<text class="footer-text">每次答题包含 5道常识 + 5道逻辑推理</text>
		</view>
	</view>
</template>

<script>
import api from '@/utils/api.js'

export default {
	data() {
		return {
			userInfo: null,
			userId: null,
			isLoggedIn: false,
			loginLoading: false
		}
	},
	onLoad() {
		this.checkLogin()
	},
	methods: {
		checkLogin() {
			const app = getApp()
			if (app.globalData.userId) {
				this.userId = app.globalData.userId
				this.userInfo = app.globalData.userInfo
				this.isLoggedIn = true
			}
		},
		onLogin() {
			this.loginLoading = true
			// 先微信登录获取 openid
			api.login().then(data => {
				const app = getApp()
				app.globalData.userId = data.userId
				app.globalData.openid = data.openid
				
				// 如果是新用户，请求授权获取头像昵称
				if (data.isNewUser) {
					this.requestUserProfile(data.userId)
				} else {
					this.userId = data.userId
					this.userInfo = {
						nickname: data.nickname || '用户',
						avatar: data.avatar || ''
					}
					app.globalData.userInfo = this.userInfo
					this.isLoggedIn = true
					uni.showToast({ title: '登录成功', icon: 'success' })
				}
				this.loginLoading = false
			}).catch(err => {
				uni.showToast({ title: '登录失败', icon: 'none' })
				this.loginLoading = false
				console.error(err)
			})
		},
		// 请求用户授权获取头像昵称
		requestUserProfile(userId) {
			uni.authorize({
				scope: 'scope.userInfo',
				success: () => {
					// 授权成功，获取用户信息
					uni.getUserProfile({
						desc: '用于完善用户资料',
						success: (profileRes) => {
							const app = getApp()
							this.userInfo = {
								nickname: profileRes.userInfo.nickName,
								avatar: profileRes.userInfo.avatarUrl
							}
							app.globalData.userInfo = this.userInfo
							
							// 同步到后端
							api.updateUserInfo(userId, this.userInfo.nickname, this.userInfo.avatar).then(() => {
								this.isLoggedIn = true
								uni.showToast({ title: '登录成功', icon: 'success' })
							}).catch(err => {
								console.error('更新用户信息失败', err)
								this.isLoggedIn = true
								uni.showToast({ title: '登录成功', icon: 'success' })
							})
						},
						fail: () => {
							// 用户拒绝授权，使用默认信息
							this.userInfo = { nickname: '用户', avatar: '' }
							const app = getApp()
							app.globalData.userInfo = this.userInfo
							this.isLoggedIn = true
							uni.showToast({ title: '登录成功', icon: 'success' })
						}
					})
				},
				fail: () => {
					// 用户未授权，引导手动授权
					this.userInfo = { nickname: '用户', avatar: '' }
					const app = getApp()
					app.globalData.userInfo = this.userInfo
					this.isLoggedIn = true
					uni.showToast({ title: '登录成功', icon: 'success' })
				}
			})
		},
		onStartQuiz() {
			if (!this.isLoggedIn) {
				uni.showToast({ title: '请先登录', icon: 'none' })
				return
			}
			uni.navigateTo({ url: '/pages/quiz/quiz' })
		},
		onStartQuizByType(type) {
			if (!this.isLoggedIn) {
				uni.showToast({ title: '请先登录', icon: 'none' })
				return
			}
			uni.navigateTo({ url: '/pages/quiz/quiz?type=' + type })
		}
	}
}
</script>

<style>
.header {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40rpx 0;
}

.login-area {
	text-align: center;
	padding: 60rpx 0;
}

.welcome-text {
	display: block;
	font-size: 40rpx;
	font-weight: bold;
	margin-bottom: 40rpx;
	color: #333;
}

.avatar {
	width: 120rpx;
	height: 120rpx;
	border-radius: 50%;
	margin-right: 20rpx;
}

.nickname {
	font-size: 36rpx;
	font-weight: bold;
}

.btn-login {
	background: linear-gradient(135deg, #4CAF50, #66BB6A);
	color: #fff;
	border: none;
	border-radius: 50rpx;
	padding: 20rpx 60rpx;
	font-size: 32rpx;
}

.cards {
	display: flex;
	flex-direction: column;
}

.card {
	background: #fff;
	border-radius: 16rpx;
	padding: 40rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.08);
	display: flex;
	align-items: center;
}

.card-icon {
	font-size: 60rpx;
	margin-right: 24rpx;
}

.card-content {
	flex: 1;
}

.card-title {
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 8rpx;
}

.card-desc {
	font-size: 24rpx;
	color: #999;
}

.footer {
	text-align: center;
}

.footer-text {
	font-size: 24rpx;
	color: #bbb;
}
</style>
