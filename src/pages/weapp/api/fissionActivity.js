/*
 * @author: dixin
 * @Date: 2020-09-12
 * @description: 活动 api 接口
 * @LastEditTime: 2020-09-12 11:00:15
 * @LastEditors: dioxin
 */
const app = getApp();

// 裂变页面  活动公共参数接口
async function activityCommon(data = {}) {
  return await app.request("/wxmini/v1/activity/common", data);
}

// 裂变页面  用户的活动页面信息
async function activityUserInfo(data = {}) {
  return await app.request("/wxmini/v1/activity/activity-user-info", data);
}

// 裂变页面  我的助力用户
async function helpUserList(data = {}) {
  return await app.request("/wxmini/v1/activity/help-user-list", data);
}

// 裂变页面  我的带看助力用户
async function seeUserList(data = {}) {
  return await app.request("/wxmini/v1/activity/see-user-list", data);
}

// 裂变页面  我的签约助力用户
async function signUserList(data = {}) {
  return await app.request("/wxmini/v1/activity/sign-user-list", data);
}
export {
  activityCommon,
  activityUserInfo,
  helpUserList,
  seeUserList,
  signUserList,
};
