// const analytic = require('../analytic/analytic.js')
import { request } from "../network/request";
var _ = {};
var wxUserInfo = {};

wxUserInfo.init = function() {
  this._.info.init();
};

wxUserInfo.getNickName = function () {
  return this._.info.wxUserInfo.nickName
}

wxUserInfo.setNickName = function (name) {
   this._.info.wxUserInfo.nickName =  name
}

wxUserInfo.getWxUserInfo = function (data) {
  let userInfo = data.userInfo
  // 可能失败情况下
  if (!userInfo) return;
  this._.info.wxUserInfo.nickName = userInfo.nickName
  request('/v1/user/updinfo', {
    'nickname': userInfo.nickName,
    'sex': userInfo.gender,
    'wechat_city': userInfo.city,
    'country': userInfo.country,
    'wechat_province': userInfo.province,
    'headimgurl': userInfo.avatarUrl
  })
}

_.info = {
  wxUserInfo: {
    nickName: "",
  },
  init: function() {
    var e = this.wxUserInfo;
    wx.getUserInfo({
      success: function(res) {
        e.nickName = res.userInfo.nickName
        request('/v1/user/updinfo', {
          'nickname': res.userInfo.nickName,
          'sex': res.userInfo.gender,
          'wechat_city': res.userInfo.city,
          'country': res.userInfo.country,
          'wechat_province': res.userInfo.province,
          'headimgurl': res.userInfo.avatarUrl
        })
      }
    })

  },
};

wxUserInfo._ = _;
module.exports = wxUserInfo;