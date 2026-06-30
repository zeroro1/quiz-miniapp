<template>
	<view class="container">
		<view class="header" v-if="isLoggedIn">
			<image class="avatar" :src="userInfo.avatar || '/static/rank.png'" mode="aspectFill"></image>
			<text class="nickname">{{ userInfo.nickname }}</text>
		</view>
		<view class="header" v-else>
			<view class="login-area">
				<text class="welcome-text">娆㈣繋鏉ュ埌鐭ヨ瘑闂瓟</text>
				<button class="btn-login" @click="onLogin" :loading="loginLoading">寰俊鐧诲綍</button>
			</view>
		</view>
		<view class="cards mt-40" v-if="isLoggedIn">
			<view class="card" @click="onStartQuiz">
				<view class="card-icon">&#x1F3AF;</view>
				<view class="card-content">
					<text class="card-title">寮€濮嬬瓟棰?/text>
					<text class="card-desc">AI鍑洪 路 10閬撶簿閫夐鐩?路 姣忛15绉?/text>
				</view>
			</view>
			<view class="card" @click="onStartQuiz">
				<view class="card-icon">&#x1F4DA;</view>
				<view class="card-content">
					<text class="card-title">甯歌瘑闂瓟</text>
					<text class="card-desc">鐢熸椿甯歌瘑銆佸巻鍙插湴鐞?/text>
				</view>
			</view>
			<view class="card" @click="onStartQuiz">
				<view class="card-icon">&#x1F9EA;</view>
				<view class="card-content">
					<text class="card-title">閫昏緫鎺ㄧ悊</text>
					<text class="card-desc">鎵捐寰嬨€佹櫤鍔涙祴璇?/text>
				</view>
			</view>
		</view>
		<view class="footer mt-40" v-if="isLoggedIn">
			<text class="footer-text">姣忔绛旈鍖呭惈 5閬撳父璇?+ 5閬撻€昏緫鎺ㄧ悊</text>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { login, updateUserInfo, startQuiz, submitAnswers, getLeaderboard, getUserRecords } from '@/utils/api.js'

const userInfo = ref(null)
const userId = ref(null)
const isLoggedIn = ref(false)
const loginLoading = ref(false)

const app = getApp()

onMounted(() => {
	checkLogin()
})

function checkLogin() {
	if (app.globalData.userId) {
		userId.value = app.globalData.userId
		userInfo.value = app.globalData.userInfo
		isLoggedIn.value = true
	}
}

function onLogin() {
	loginLoading.value = true
	uni.login({
		provider: 'weixin',
		success: (res) => {
			api.login().then(data => {
				app.globalData.userId = data.userId
				app.globalData.userInfo = {
					nickname: data.nickname || '鐢ㄦ埛',
					avatar: data.avatar || ''
				}
				userId.value = data.userId
				userInfo.value = app.globalData.userInfo
				isLoggedIn.value = true
				loginLoading.value = false
				uni.showToast({ title: '鐧诲綍鎴愬姛', icon: 'success' })
			}).catch(err => {
				loginLoading.value = false
				uni.showToast({ title: '鐧诲綍澶辫触', icon: 'none' })
				console.error(err)
			})
		},
		fail: (err) => {
			loginLoading.value = false
			uni.showToast({ title: '鐧诲綍澶辫触', icon: 'none' })
			console.error(err)
		}
	})
}

function onStartQuiz() {
	if (!isLoggedIn.value) {
		uni.showToast({ title: '璇峰厛鐧诲綍', icon: 'none' })
		return
	}
	uni.navigateTo({ url: '/pages/quiz/quiz' })
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