<template>
	<view class="container">
		<!-- 加载中 -->
		<view class="loading" v-if="loading">
			<text>AI 正在出题...</text>
		</view>

		<!-- 答题区域 -->
		<view v-else-if="!showResult">
			<!-- 顶部栏 -->
			<view class="top-bar">
				<view class="progress-info">
					<text>第 {{ currentIndex + 1 }}/{{ questions.length }}</text>
					<text class="timer-text" :class="{ timer-warning: timeLeft <= 5 }">⏱ {{ timeLeft }}s</text>
				</view>
				<view class="progress-track">
					<view class="progress-fill" :style="{ width: ((currentIndex + 1) / questions.length * 100) + '%' }"></view>
				</view>
			</view>

			<!-- 题目 -->
			<view class="card question-card">
				<view class="question-tag" :class="question.type === 'COMMONSENSE' ? 'tag-commonsense' : 'tag-logic'">
					{{ question.type === 'COMMONSENSE' ? '📚 常识' : '🧩 逻辑' }}
				</view>
				<text class="question-text">{{ question.content }}</text>
			</view>

			<!-- 选项 -->
			<view class="options">
				<view class="option" v-for="opt in optionKeys" :key="opt"
				      @click="onAnswer(opt)"
				      :class="{ selected: answers[currentIndex] === opt }">
					<text class="option-label">{{ opt }}.</text>
					<text class="option-content">{{ getOptionContent(opt) }}</text>
				</view>
			</view>

			<!-- 导航按钮 -->
			<view class="nav-buttons">
				<button class="btn-nav" @click="onPrev" :disabled="currentIndex === 0">上一题</button>
				<button class="btn-nav btn-next" @click="onNext" :disabled="currentIndex === questions.length - 1">下一题</button>
			</view>
		</view>

		<!-- 结果页面 -->
		<view class="result-page" v-if="showResult && result">
			<view class="score-circle">
				<text class="score-number">{{ result.accuracy.toFixed(1) }}%</text>
				<text class="score-label">正确率</text>
			</view>

			<view class="result-details card">
				<view class="detail-row">
					<text>总题数</text>
					<text>{{ result.totalQuestions }}</text>
				</view>
				<view class="detail-row">
					<text>正确数</text>
					<text>{{ result.correctCount }}</text>
				</view>
				<view class="detail-row">
					<text>总用时</text>
					<text>{{ result.totalTime }}秒</text>
				</view>
			</view>

			<!-- 每题详情 -->
			<view class="answer-detail" v-for="(item, idx) in result.details" :key="idx">
				<view class="detail-header" :class="item.isCorrect ? 'correct' : 'wrong'">
					<text>{{ item.isCorrect ? '✅' : '❌' }} 第{{ item.questionIndex + 1 }}题</text>
				</view>
				<text class="detail-question">{{ item.content }}</text>
				<text class="detail-answer">你的答案: {{ item.userAnswer }} | 正确答案: {{ item.correctAnswer }} | 用时: {{ item.timeTaken }}s</text>
			</view>

			<button class="btn-restart" @click="onRestart">再来一局</button>
		</view>
	</view>
</template>

<script>
import api from '@/utils/api.js'

export default {
	data() {
		return {
			questions: [],
			optionKeys: ['A', 'B', 'C', 'D'],
			currentIndex: 0,
			answers: [],
			timesTaken: [],
			loading: false,
			showResult: false,
			result: null,
			sessionId: null,
			timeLeft: 15,
			timer: null
		}
	},
	computed: {
		question() {
			return this.questions[this.currentIndex] || {}
		}
	},
	onLoad() {
		this.startNewQuiz()
	},
	onUnload() {
		this.clearTimer()
	},
	beforeDestroy() {
		this.clearTimer()
	},
	methods: {
		startNewQuiz() {
			this.loading = true
			this.showResult = false
			const app = getApp()
			api.startQuiz(app.globalData.userId).then(data => {
				this.questions = data.questions
				this.sessionId = data.sessionId
				this.currentIndex = 0
				this.answers = new Array(data.questions.length).fill('')
				this.timesTaken = new Array(data.questions.length).fill(0)
				this.loading = false
				this.startTimer()
			}).catch(err => {
				uni.showToast({ title: '加载失败', icon: 'none' })
				this.loading = false
			})
		},
		startTimer() {
			this.clearTimer()
			this.timeLeft = 15
			this.timer = setInterval(() => {
				this.timeLeft--
				if (this.timeLeft <= 0) {
					this.clearTimer()
					if (this.currentIndex < this.questions.length - 1) {
						this.onNext()
					} else {
						this.submitQuiz()
					}
				}
			}, 1000)
		},
		clearTimer() {
			if (this.timer) {
				clearInterval(this.timer)
				this.timer = null
			}
		},
		getOptionContent(key) {
			return this.question['option' + key] || ''
		},
		onPrev() {
			if (this.currentIndex > 0) {
				this.timesTaken[this.currentIndex] = 15 - this.timeLeft
				this.currentIndex--
				this.startTimer()
			}
		},
		onNext() {
			if (this.currentIndex < this.questions.length - 1) {
				this.timesTaken[this.currentIndex] = 15 - this.timeLeft
				this.currentIndex++
				this.startTimer()
			}
		},
		onAnswer(answer) {
			this.answers[this.currentIndex] = answer
		},
		submitQuiz() {
			this.clearTimer()
			this.timesTaken[this.currentIndex] = 15 - this.timeLeft
			const app = getApp()
			const request = {
				sessionId: this.sessionId,
				userId: app.globalData.userId,
				answers: this.questions.map((q, i) => ({
					questionIndex: i,
					answer: this.answers[i] || '',
					timeTaken: this.timesTaken[i] || 15
				}))
			}
			api.submitAnswers(request).then(result => {
				this.result = result
				this.showResult = true
			}).catch(err => {
				uni.showToast({ title: '提交失败', icon: 'none' })
			})
		},
		onSubmit() {
			this.submitQuiz()
		},
		onRestart() {
			this.startNewQuiz()
		}
	}
}
</script>

<style>
.loading {
	text-align: center;
	padding: 200rpx 0;
	color: #999;
	font-size: 28rpx;
}

.top-bar {
	padding: 20rpx 30rpx;
	background: #fff;
	border-radius: 12rpx;
	margin-bottom: 20rpx;
}

.progress-info {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10rpx;
}

.timer-text {
	font-size: 32rpx;
	font-weight: bold;
	color: #4CAF50;
}

.timer-warning {
	color: #f44336;
	animation: blink 0.5s ease-in-out infinite alternate;
}

@keyframes blink {
	from { opacity: 1; }
	to { opacity: 0.4; }
}

.progress-track {
	height: 8rpx;
	background: #eee;
	border-radius: 4rpx;
	margin-top: 10rpx;
}

.progress-fill {
	height: 100%;
	background: linear-gradient(90deg, #4CAF50, #66BB6A);
	border-radius: 4rpx;
	transition: width 0.3s;
}

.question-card {
	margin-bottom: 30rpx;
}

.question-tag {
	display: inline-block;
	padding: 6rpx 16rpx;
	border-radius: 20rpx;
	font-size: 22rpx;
	margin-bottom: 16rpx;
}

.tag-commonsense {
	background: #E8F5E9;
	color: #4CAF50;
}

.tag-logic {
	background: #E3F2FD;
	color: #2196F3;
}

.question-text {
	font-size: 32rpx;
	font-weight: bold;
	line-height: 1.6;
}

.options {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
	margin-bottom: 30rpx;
}

.option {
	background: #fff;
	border: 2rpx solid #e0e0e0;
	border-radius: 12rpx;
	padding: 24rpx;
	display: flex;
	align-items: flex-start;
}

.option.selected {
	border-color: #4CAF50;
	background: #E8F5E9;
}

.option-label {
	font-weight: bold;
	margin-right: 12rpx;
	color: #4CAF50;
}

.option-content {
	flex: 1;
	font-size: 28rpx;
	line-height: 1.5;
}

.nav-buttons {
	display: flex;
	justify-content: space-between;
	margin-bottom: 20rpx;
}

.btn-nav {
	background: #fff;
	color: #666;
	border: 2rpx solid #ddd;
	border-radius: 12rpx;
	padding: 16rpx 40rpx;
	font-size: 28rpx;
	flex: 1;
	margin: 0 8rpx;
}

.result-page {
	padding: 20rpx;
}

.score-circle {
	text-align: center;
	padding: 60rpx 0;
	background: #fff;
	border-radius: 16rpx;
	margin-bottom: 20rpx;
}

.score-number {
	font-size: 80rpx;
	font-weight: bold;
	color: #4CAF50;
}

.score-label {
	display: block;
	font-size: 24rpx;
	color: #999;
	margin-top: 10rpx;
}

.detail-row {
	display: flex;
	justify-content: space-between;
	padding: 16rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
	font-size: 28rpx;
}

.answer-detail {
	background: #fff;
	border-radius: 12rpx;
	padding: 20rpx;
	margin-bottom: 16rpx;
}

.detail-header {
	font-size: 26rpx;
	font-weight: bold;
	padding-bottom: 10rpx;
}

.detail-header.correct { color: #4CAF50; }
.detail-header.wrong { color: #f44336; }

.detail-question {
	font-size: 28rpx;
	line-height: 1.5;
	margin-bottom: 10rpx;
}

.detail-answer {
	font-size: 22rpx;
	color: #999;
}

.btn-restart {
	background: linear-gradient(135deg, #4CAF50, #66BB6A);
	color: #fff;
	border: none;
	border-radius: 12rpx;
	padding: 24rpx;
	font-size: 32rpx;
	margin-top: 20rpx;
}
</style>
