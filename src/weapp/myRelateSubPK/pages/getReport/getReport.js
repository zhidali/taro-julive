const order = require('../../../order/order.js');
const analytic = require('../../../analytic/analytic.js');
var app = getApp();

Page({
  data: {
    isIpx: app.globalData.isIpx,
    ePageViewFlag: false,
    userLoginStatus: '',
  },

  onLoad: function (options) {
    this.setData({
      loginUserInfo: {
        op_type: '900139',
      },
    });
    this.analyticPageView('e_page_view');
    setTimeout(() => {
      this.data.ePageViewFlag = true;
    }, 500);
  },

  onHide: function () {
    this.analyticPageView();
  },

  onUnload: function () {
    this.analyticPageView();
  },

  analyticPageView: function (eventName = 'e_page_quit') {
    // analytic
    // 以秒为单位,所以除以1000
    var analyticProperties = this.analyticProperties();
    if (eventName != 'e_page_view') {
      var viewTime = (Date.parse(new Date()) - this.data.startViewTime) / 1000;
      analyticProperties.view_time = viewTime;
    }
    analyticProperties.toPage = analyticProperties.fromPage;
    analytic.sensors.track(eventName, analyticProperties);
  },

  analyticProperties() {
    return {
      fromPage: 'p_get_first_call_report',
    };
  },

  onShow: function () {
    this.data.startViewTime = Date.parse(new Date());
    if (this.data.ePageViewFlag) {
      this.analyticPageView('e_page_view');
    }
    this.setData({
      userLoginStatus: app.commonData.user.userId ? true : false,
    });
  },

  didClickOrder: function () {
    if (this.data.userLoginStatus) {
      this.judgeRoutePage();
    }
    var analyticProperties = this.analyticProperties();
    analyticProperties.op_type = this.data.loginUserInfo.op_type;
    analyticProperties.fromItem = 'i_leave_phone_entry';
    analyticProperties.toPage = analyticProperties.fromPage;
    analytic.sensors.track('e_click_leave_phone_entry', analyticProperties);
  },

  judgeRoutePage: function () {
    var report = app.commonData.user.report;
    if (
      app.commonData.user.userId &&
      report &&
      report.status == 1 &&
      report.report_id
    ) {
      wx.navigateTo({
        url:
          '/pages/report/firstReport/firstReport?businessId=' +
          report.report_id +
          '&s=4',
      });
      var analyticProperties = this.analyticProperties();
      analyticProperties.fromItem = 'i_get_first_call_report';
      analyticProperties.toPage = 'p_report_first_details';
      analytic.sensors.track(
        'e_click_get_first_call_report',
        analyticProperties
      );
    } else {
      this.makeOrder();
    }
  },

  loginSuccessCallback: function () {
    this.setData({
      showLoginModal: false,
    });
    this.judgeRoutePage();
  },

  cancelCallback: function () {
    this.setData({
      showLoginModal: false,
    });
  },

  makeOrder: function () {
    // 向他咨询按钮
    wx.showLoading({
      title: '预约中...',
    });
    var _this = this;
    let obj = { op_type: '900139' };
    order.makeOrder(obj, _this.data.loginUserInfo, function () {
      wx.hideLoading();
      _this.setData({
        showOrderSuccessAlert: true,
        alertContent:
          '您已用手机号' +
          app.commonData.user.mobile +
          '预约了咨询服务，稍后咨询师将来电为您解答疑问，请注意接听电话',
      });
    });
  },
  passBackGetPhoneNumberBtn() {
    this.didClickOrder();
  },
  passBackFastLoginCallBack(e) {
    if (e.detail.loginStatus) {
      this.makeOrder();
      this.setData({
        userLoginStatus: true,
      });
    }
  },
});
