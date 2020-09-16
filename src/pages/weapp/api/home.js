/*
 * @author: zhidl
 * @Date: 2020-08-10 10:32:18
 * @description: 首页api接口
 * @LastEditTime: 2020-09-01 19:21:26
 * @LastEditors: limengge
 */
const app = getApp();

// 首页接口
async function getHomeData(data = {}) {
  return await app.request('/wxmini/v1/common/home', data)
}

// 首页新闻模块数据
async function getHomeCityNews(data = {}) {
  return await app.request('/wxmini/v1/common/city-news', data)
}

// 首页搜索条件接口
async function getCondition(data = {}) {
  return await app.request('/v1/project/condition', data)
}

// 首页弹窗接口
async function getHomePopup(data = {}) {
  return await app.request('/wxmini/v1/common/home-popup', data)
}

// 获取 热销 特价 新开等楼盘
async function getHomeRecommendProject(data = {}) {
  return await app.request('/wxmini/v1/common/home-recommend-project', data)
}

// 获取订阅弹窗的订阅信息

async function getHomeSubscribe(data = {}) {
  return await app.request('/v2/subscribe/subscribe', data)
}

export {
  getHomeData,
  getCondition,
  getHomePopup,
  getHomeRecommendProject,
  getHomeCityNews,
  getHomeSubscribe
}