/*
 * @Author: your name
 * @Date: 2020-06-08 18:05:05
 * @LastEditTime: 2020-09-01 14:30:42
 * @LastEditors: zhidl
 * @Description: In User Settings Edit
 * @FilePath: /julive/order/order.js
 */
const enviroment = require('../enviroment/enviroment.js');
const analytic = require('../analytic/analytic.js');
const util = require('../utils/util.js');
const user = require('../user/user');
const app = getApp();

function makeOrder(parameters, analyticProperties, callback) {
  if (util.isEmptyObject(parameters)) parameters = {};
  parameters.city_id = app.commonData.city.city_id;
  parameters.channel_id = app.commonData.channel.channel_id;
  const gdtId = enviroment.getGDTId();
  var pages = getCurrentPages(); //获取加载的页面
  var currentPage = pages[pages.length - 1]; //获取当前页面的对象
  var _url = currentPage.route;

  if (gdtId && gdtId.length > 0) {
    parameters.wx_ad_click_id = gdtId;
    parameters.url = _url;
  }
  // analytic
  if (util.isEmptyObject(analyticProperties)) {
    analyticProperties = {};
  }
  // op_type 
  if (parameters.op_type) {
    analyticProperties.op_type = parameters.op_type;
  }
  if (parameters.source) {
    analyticProperties.source = parameters.source;
  }

  app
    .request('/v1/user/discount', parameters)
    .then((d) => {
      typeof callback == 'function' && callback(d);
      if (d.code === 0) {
        analyticProperties.order_id = String(d.data.order_id);
        analyticProperties.business_type = String(d.data.business_type);
        analyticTrack(analyticProperties, true);
        user.fetchUserHasOrder();
      } else {
        analyticTrack(analyticProperties, false);
      }
    })
    .catch((e) => {
      console.log(e);
      analyticTrack(analyticProperties, false);
    });
}
function reportOrder() {
  var pages = getCurrentPages(); //获取加载的页面
  var currentPage = pages[pages.length - 1]; //获取当前页面的对象
  var _url = currentPage.route;
  const gdtId = enviroment.getGDTId();
  if (gdtId.length > 0) {
    app
      .request('/v1/common/report', {
        url: _url,
        wx_ad_click_id: gdtId,
        type: 2,
      })
      .then((res) => {
        if (res.code === 0) {
        }
      });
  }
}

function analyticTrack(analyticProperties, discountSuccess) {
  // analytic
  var leavePhoneState = '2';
  if (discountSuccess) {
    leavePhoneState = '1';
  }
  analyticProperties.fromPage = analytic.page.currentPage();
  analyticProperties.toPage = analytic.page.currentPage();
  analyticProperties.leave_phone_state = leavePhoneState;
  analyticProperties.fromItem = analyticProperties.fromItem
    ? analyticProperties.fromItem
    : 'i_confirm_leave_phone';
  analytic.sensors.track('e_click_confirm_leave_phone', analyticProperties);
}

module.exports = {
  makeOrder: makeOrder,
  reportOrder: reportOrder,
};
