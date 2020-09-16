/*
 * @author: wangxue
 * @Date: 2020-09-11
 * @description: 活动 api 接口
 * @LastEditTime: 2020-09-11 14:28:15
 * @LastEditors: wangxue
 */
const app = getApp();

// 裂变活动--助力提交接口 2020-12-31结束
async function fissionSubmit(data = {}) {
  return await app.request('/wxmini/v1/activity/pop-submit', data)
}


export {
  fissionSubmit
}