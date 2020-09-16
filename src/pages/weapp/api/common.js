/*
 * @author: zhidl
 * @Date: 2020-08-10 09:11:22
 * @description: 公共接口api
 * @LastEditTime: 2020-09-15 09:45:48
 * @LastEditors: zhidl
 */
import {
  request
} from '../network/request'
const enviroment = require('../enviroment/enviroment.js');

// 快速授权登录
async function fastLogin(data = {}) {
  return await request('/v1/user/fast-login', data)
}
// 获取abtest
async function versonTest(data = {}) {
  return await request('/wxmini/v1/common/abtest', data)
}
// conf接口 获取渠道id
async function getConf(data = {}) {
  return await request('/v1/common/conf', data)
}
/**
 * 记录楼盘浏览
 * @param {object} params参数
 * @param {string} params.project_id 楼盘id
 * @return {Promise} promise对象
 */
async function viewProject(params = {}) {
  return await request('/wxmini/v1/user/view-project', params)
}
/**
 * 用户留电
 * @param {object} params参数  需传递op_type
 */
async function userDiscount(params = {}) {
  const app = getApp();
  const gdtId = enviroment.getGDTId();
  let obj = Object.assign({
    city_id: app.commonData.city.city_id,
    channel_id: app.commonData.channel.channel_id,
    op_type: ''
  }, params);
  
  // BUG
  let pages = getCurrentPages(); //获取加载的页面
  let currentPage = pages[pages.length - 1]; //获取当前页面的对象
  let _url = currentPage ? currentPage.route : '';
  if (gdtId && gdtId.length > 0) {
    obj.wx_ad_click_id = gdtId;
    obj.url = _url;
  }
  return await request('/v1/user/discount', obj)
}
/**
 * 请求用户是否有订单
 * @param {object} params参数
 * @return {Promise} promise对象
 */
async function userHasOrder(params = {}) {
  return await request('/wxmini/v1/common/has-order', params)
}
/**
 * 请求用户是否有订单
 * @param {object} params参数 微信返回用户头像相关信息
 * @return {Promise} promise对象
 */
async function updInfo(params = {}) {
  return await request('/v1/user/updinfo', params)
}
export {
  fastLogin,
  versonTest,
  viewProject,
  getConf,
  userDiscount,
  userHasOrder,
  updInfo
}