const enviroment = require('../enviroment/enviroment.js');
const julive_local_config = require('../julive-local-config.js');

import {
  BASE_URL
} from './config'

/**
 * 请求API接口
 * @param  {String} api    api 根地址
 * @param  {String} path   请求路径
 * @param  {Objece} params 参数
 * @return {Promise}       包含抓取任务的Promise
 */

// 监听第一次进入时候 install 等待时候防止重复请求
let installFlag = false;
let token = getJuliveToken();
let installING = false;
// 判断是否第一次拉取conf
/**
 * 请求API接口
 * @param  {String} api    api 根地址
 * @param  {String} path   请求路径
 * @param  {Objece} params 参数
 * @return {Promise}       包含抓取任务的Promise
 */
async function request(path, params, method = "POST") {
  if (token) {
    return await swanRequest(path, params, method);
    // instill 请求中
  } else if (installFlag) {
    return await sleep(request, path, params, method);
  } else if (!token) {
    return await sleep(request, path, params, method);
  }
}


async function install(flag) {
  // 如果在basciData调用 发现token 有 则不发送请求
  if (flag) {
    installFlag = true;
  }
  if ((flag && token) || installING) return;
  installING = true;
  let res = await getWxLogin();
  if (res.code) {
    let d = await swanRequest("/v1/device/install", {
      code: res.code,
      wx_appid: julive_local_config.wxappid
    });

    installING = false;
    if (d.code == 0) {
      installFlag = false;
      enviroment.setJuliveLabel(d.data)
      token = d.data.token;
    } else {
      return await sleep(install);
    }
  }
}

// 真的 请求 调用 && 每次调用就 真是调用
async function swanRequest(path, params, method = "POST") {
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + `${path}`,
      data: {
        common: enviroment.getEnviromentParams(),
        params: params
      },
      header: {
        "Content-Type": "application/json"
      },
      method: method,
      success: res => {
        if (res.data.code == "1006") {
          // token失效，需要清空
          enviroment.setJuliveToken("", true);
          token = "";
          // let app = getApp();
          // app.commonData.user = {
          //   userId: '',
          //   name: '',
          //   mobile: '',
          //   avatar: '',
          //   report: {
          //     status: 2
          //   }
          // };
          // app.commonData.login_status = false;

          install();
          resolve(request(path, params, (method = "POST")));
        } else {
          resolve(res.data);
        }
      },
      fail: err => {
        console.log('fail')
        console.log(err)
        console.log('end')
        reject(err);
      }
    });
  });
}

function getWxLogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: res => {
        resolve(res);
      },
      fail: res => {
        reject(res);
      }
    });
  });
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function sleep(fn, ...args) {
  await delay(150);
  return fn(...args);
}

function getJuliveToken() {
  try {
    let julive_label = wx.getStorageSync("julive_label") || "";
    enviroment.setJuliveLabel(julive_label, 1)
    return julive_label.token
  } catch (e) {
    return "";
  }
}

export {
  request,
  install,
};