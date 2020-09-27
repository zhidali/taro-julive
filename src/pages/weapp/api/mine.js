/*
 * @author: zhidl
 * @Date: 2020-09-01 11:07:00
 * @description: 我的页面接口
 * @LastEditTime: 2020-09-16 14:56:22
 * @LastEditors: limengge
 */
import {
  request
} from '../network/request'

// 用户信息
async function getUser(data = {}) {
  return await request('/v1/user/user-info', data)
}

//我的浏览接口
async function getmyViewProject(data = {}) {
  return await request('/wxmini/v1/user/my-view-project', data)
}

//我的收藏接口
async function getmyFavoriteProject(data = {}) {
  return await request('/wxmini/v1/user/my-favorite-project', data)
}


export {
  getUser,
  getmyViewProject,
  getmyFavoriteProject
}