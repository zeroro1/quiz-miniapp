<template>
	<view class=\"container\">
		<!-- Tab 切换 -->
		<view class=\"tabs\">
			<view class=\"tab\" v-for=\"item in tabs\" :key=\"item.key\"
			      :class=\"{ active: activeTab === item.key }\"
			      @click=\"onTabChange(item.key)\">
				<text>{{ item.label }}</text>
			</view>
		</view>

		<!-- 排行榜列表 -->
		<view class=\"list\" v-if=\"!loading\">
			<view class=\"rank-item\" v-for=\"item in leaderboard\" :key=\"item.userId\">
				<view class=\"rank-num\" :class=\"{ top3: item.rank <= 3 }\">{{ item.rank }}</view>
				<view class=\"rank-info\">
					<text class=\"rank-name\">{{ item.nickname || '匿名用户' }}</text>
					<view class=\"rank-stats\">
						<text class=\"stat\">正确率 {{ item.accuracy }}%</text>
						<text class=\"stat\">平均 {{ item.avgTime.toFixed(1) }}s/题</text>
					</view>
				</view>
			</view>
		</view>

		<view class=\"empty\" v-if=\"!loading && leaderboard.length === 0\">
			<text>暂无数据，快来答题吧！</text>
		</view>
	</view>
</template>

<script>
import api from '@/utils/api.js'

export default {
	data() {
		return {
			activeTab: 'COMMONSENSE',
			tabs: [
				{ key: 'COMMONSENSE', label: '📚 常识排行' },
				{ key: 'LOGIC', label: '🧩 逻辑排行' }
			],
			leaderboard: [],
			loading: false
		}
	},
	onShow() {
		this.loadLeaderboard()
	},
	methods: {
		onTabChange(type) {
			this.activeTab = type
			this.loadLeaderboard()
		},
		loadLeaderboard() {
			this.loading = true
			api.getLeaderboard(this.activeTab).then(data => {
				this.leaderboard = data
				this.loading = false
			}).catch(err => {
				uni.showToast({ title: '加载失败', icon: 'none' })
				this.loading = false
			})
		}
	}
}
</script>

<style>
.tabs {
	display: flex;
	margin-bottom: 20rpx;
}

.tab {
	flex: 1;
	text-align: center;
	padding: 20rpx;
	background: #fff;
	border-radius: 12rpx;
	margin-right: 16rpx;
	font-size: 28rpx;
}

.tab.active {
	background: #4CAF50;
	color: #fff;
}

.rank-item {
	display: flex;
	align-items: center;
	background: #fff;
	border-radius: 12rpx;
	padding: 24rpx;
	margin-bottom: 16rpx;
}

.rank-num {
	width: 60rpx;
	height: 60rpx;
	line-height: 60rpx;
	text-align: center;
	border-radius: 50%;
	font-size: 28rpx;
	font-weight: bold;
	background: #f0f0f0;
	margin-right: 20rpx;
}

.rank-num.top3 {
	background: linear-gradient(135deg, #FFD700, #FFA500);
	color: #fff;
}

.rank-name {
	font-size: 30rpx;
	font-weight: bold;
	margin-bottom: 8rpx;
}

.rank-stats {
	display: flex;
	gap: 20rpx;
}

.stat {
	font-size: 22rpx;
	color: #999;
}

.empty {
	text-align: center;
	padding: 200rpx 0;
	color: #ccc;
	font-size: 28rpx;
}
</style>
