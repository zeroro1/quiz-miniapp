<template>
	<view class=\"container\">
		<!-- 用户信息 -->
		<view class=\"header\" v-if=\"isLoggedIn\">
			<image class=\"avatar\" :src=\"userInfo.avatar || '/static/default-avatar.png'\" mode=\"aspectFill\"></image>
			<text class=\"nickname\">{{ userInfo.nickname }}</text>
		</view>
		<view class=\"header\" v-else>
			<button class=\"btn-login\" @click=\"onLogin\">微信登录</button>
		</view>

		<!-- 功能卡片 -->
		<view class=\"cards mt-40\" v-if=\"isLoggedIn\">
			<view class=\"card\" @click=\"onStartQuiz\">
				<view class=\"card-icon\">🎯</view>
				<text class=\"card-title\">开始答题</text>
				<text class=\"card-desc\">AI 出题 · 10道精选题目</text>
			</view>

			<view class=\"card\" @click=\"onStartQuiz\">
				<view class=\"card-icon\">📚</view>
				<text class=\"card-title\">常识问答</text>
				<text class=\"card-desc\">生活常识、历史地理</text>
			</view>

			<view class=\"card\" @click=\"onStartQuiz\">
				<view class=\"card-icon\">🧩</view>
				<text class=\"card-title\">逻辑推理</text>
				<text class=\"card-desc\">找规律、智力测试</text>
			</view>
		</view>

		<!-- 底部说明 -->
		<view class=\"footer mt-40\" v-if=\"isLoggedIn\">
			<text class=\"footer-text\">每次答题包含 5道常识 + 5道逻辑推理</text>
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
			isLoggedIn: false
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
			api.login().then(data => {
				const app = getApp()
				app.globalData.userId = data.userId
				app.globalData.userInfo = {
					nickname: data.nickname || '新用户',
					avatar: data.avatar || ''
				}
				this.userId = data.userId
				this.userInfo = app.globalData.userInfo
				this.isLoggedIn = true
				uni.showToast({ title: '登录成功', icon: 'success' })
			}).catch(err => {
				uni.showToast({ title: '登录失败', icon: 'none' })
				console.error(err)
			})
		},
		onStartQuiz() {
			if (!this.isLoggedIn) {
				uni.showToast({ title: '请先登录', icon: 'none' })
				return
			}
			uni.navigateTo({ url: '/pages/quiz/quiz' })
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
