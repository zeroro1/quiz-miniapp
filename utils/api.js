const BASE_URL = 'http://localhost:8080/api'

function request(url, method, data) {
	return new Promise((resolve, reject) => {
		uni.request({
			url: BASE_URL + url,
			method: method,
			data: data,
			header: {
				'Content-Type': 'application/json'
			},
			success: (res) => {
				if (res.statusCode === 200) {
					resolve(res.data)
				} else {
					reject(new Error('请求失败: ' + res.statusCode))
				}
			},
			fail: (err) => {
				reject(err)
			}
		})
	})
}

module.exports = {
	request,
	login: function() {
		return new Promise((resolve, reject) => {
			uni.login({
				provider: 'weixin',
				success: (res) => {
					request('/wx/login', 'POST', { code: res.code })
						.then(data => resolve(data))
						.catch(reject)
				},
				fail: reject
			})
		})
	},
	startQuiz: function(userId) {
		return request('/quiz/start', 'POST', { userId })
	},
	submitAnswers: function(data) {
		return request('/quiz/submit', 'POST', data)
	},
	getLeaderboard: function(type) {
		return request('/leaderboard/' + type, 'GET')
	},
	getUserRecords: function(userId) {
		return request('/user/records?userId=' + userId, 'GET')
	}
}
