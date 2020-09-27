/*
 * @author: zhidl
 * @Date: 2020-09-01 11:07:00
 * @description: 我的页面接口
 * @LastEditTime: 2020-09-27 13:09:59
 * @LastEditors: zhidl
 */
import {
  request
} from '../network/request'
const app = getApp();

let q = app ? app.request : request;
// 用户信息
async function getUser(data = {}) {
  return await q('/v1/user/user-info', data)
}

//我的浏览接口
async function getmyViewProject(data = {}) {
  return await q('/wxmini/v1/user/my-view-project', data)
}

//我的收藏接口
async function getmyFavoriteProject(data = {}) {
  return await q('/wxmini/v1/user/my-favorite-project', data)
}


export {
  getUser,
  getmyViewProject,
  getmyFavoriteProject
}