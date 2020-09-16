/*
 * @author: zhidl
 * @Date: 2020-08-16 21:23:39
 * @description: 楼盘列表 api 接口
 * @LastEditTime: 2020-08-27 16:55:20
 * @LastEditors: zhidl
 */
const app = getApp();

// 首页搜索条件接口
async function getAssigned(data = {}) {
  return await app.request('/wxmini/v1/project/assigned', data)
}
// 获取楼盘列表数据
async function getProjectList(data = {}) {
  return await app.request('/wxmini/v1/project/search', data)
}
// 楼盘收藏接口
async function favorite(data = {}) {
  return await app.request('/wxmini/v1/user/favorite-project', data)
}

// 列表页面弹窗
async function listPopup(data = {}) {
  return await app.request('/wxmini/v1/common/project-list-popup', data)
}

export {
  getAssigned,
  getProjectList,
  favorite,
  listPopup
}