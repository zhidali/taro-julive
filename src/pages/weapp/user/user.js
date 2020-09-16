import { userHasOrder } from '../api/common';
const analytic = require('../analytic/analytic.js');
var app;
var user = {};
// 验证是否有订单
user.fetchUserHasOrder = async function () {
  let {code, data} = await userHasOrder();
  if (code == 0) {
    // 1 有未关闭订单 2 没有未关闭订单
    app.commonData.userHasOrder = data.has_order == 1 ? true : false;
  }
};
user.init = function (that) {
  app = that;
  // var e = wx.getStorageSync('julive_user') || {};
  // app.commonData.user = e;
  // app.commonData.login_status = e.userId ? true : false;
  // var superProperties = {};
  // if (e && e.userId != undefined && String(e.userId).length > 0) {
  //   superProperties.julive_id = parseInt(e.userId);
  // } else {
  //   superProperties.julive_id = -1;
  // }
  // analytic.sensors.registerApp(superProperties);
  user.fetchUserHasOrder();
  app.commonData.mineTabPurchase = wx.getStorage('julive_minetab_purchase') || '';
};

module.exports = user;
