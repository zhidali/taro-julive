/*
 * @author: wangxue
 * @Date: 2020-08-18
 * @description: 搜索 api 接口
 * @LastEditTime: 2020-09-27 12:46:22
 * @LastEditors: zhidl
 */

import {
  request
} from '../network/request';

const app = getApp();
// 搜索-热门搜索词
async function searchQuick(data = {}) {
  return await app.request('/wxmini/v1/project/search-quick', data)
}

// 搜索-搜索联想
async function searchSuggest(data = {}) {
  return await app.request('/wxmini/v1/project/search-suggest', data)
}

export {
  searchQuick,
  searchSuggest
}