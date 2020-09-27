const analytic = require('../../../analytic/analytic.js');
const login = require('../../../user/login.js');
const notification = require('../../../utils/notification.js');
const select_img =
  'http://imgs.julive.com/l?p=eyJpbWdfcGF0aCI6IlwvbWluaW1ncy9yZWdpc3Rlcl9zZWxlY3QucG5nIn0=';
const select_img_affirm =
  'http://imgs.julive.com/l?p=eyJpbWdfcGF0aCI6IlwvbWluaW1ncy9yZWdpc3Rlcl9zZWxlY3RfYWZmaXJtLnBuZyJ9';
Page({
  data: {
    ePageViewFlag: false,
    use_select_img: select_img_affirm,
    flag: true,
    // v2.7.5裂变活动  首页&裂变页进入页面 时候
    isFission: false,
    text: '已阅读并同意' // 默认文案
  },
  onLoad: function (options) {
    if (options && options.isFission == '1'){
       this.setData({
         isFission:  true,
         text: '点击登录即表示同意'
       })
    }
    this.analyticPageView('e_page_view');
    setTimeout(() => {
      this.data.ePageViewFlag = true;
    }, 500);
  },
  onShow: function () {
    this.data.startViewTime = Date.parse(new Date());
    if (this.data.ePageViewFlag) {
      this.analyticPageView('e_page_view');
    }
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
      fromPage: 'p_choose_login',
    };
  },

  didClickMask() {
    wx.showToast({
      title: '请勾选用户协议',
      icon: 'none',
    });
  },

  getPhoneNumber: function (e) {
    if (
      e.detail.errMsg === 'getPhoneNumber:fail user deny' ||
      e.detail.errMsg === 'getPhoneNumber:fail:user deny' ||
      e.detail.errMsg === 'getPhoneNumber:fail:user cancel' 
    ) {
      // 用户取消，do nothing
      var analyticProperties = this.analyticProperties();
      analyticProperties.fromItem = 'i_cancel_authorization';
      analyticProperties.toPage = analyticProperties.fromPage;
      analyticProperties.wechat_authorization = '2';
      analytic.sensors.track(
        'e_click_wechat_cancel_authorization',
        analyticProperties
      );
    } else if (
      e.detail.errMsg ===
      'getPhoneNumber:fail The user is not bound to the mobile phone. Please try again after binding on the WeChat client'
    ) {
      // 用户微信没有绑定手机号，do nothing
    } else {
      this.fastLogin(e.detail.iv, e.detail.encryptedData);
      var analyticProperties = this.analyticProperties();
      analyticProperties.fromItem = 'i_confirm_authorization';
      analyticProperties.toPage = 'p_user_center';
      analyticProperties.wechat_authorization = '1';
      analytic.sensors.track(
        'e_click_wechat_confirm_authorization',
        analyticProperties
      );
    }
  },

  didTapPhoneNumberLogin: function () {
    if (this.data.use_select_img === select_img) {
      wx.showToast({
        title: '请勾选用户协议',
        icon: 'none',
      });
      return;
    }
    wx.navigateTo({
      url: '../phoneNumberLogin/phoneNumberLogin',
    });
    var analyticProperties = this.analyticProperties();
    analyticProperties.fromItem = 'i_login_entry';
    analyticProperties.toPage = 'p_phone_login';
    analyticProperties.wechat_authorization = '1';
    analyticProperties.login_state = 2;
    analytic.sensors.track('e_click_phone_login', analyticProperties);
  },

  fastLogin: function (iv, encryptedData) {
    let _this = this;
    wx.showLoading();
    login.fastLogin(iv, encryptedData, function (message, code) {
      wx.hideLoading();
      if (code == 0) {
         console.log(_this)
         //  如果 是裂变活动进来的 只返回上一个页面
         if (_this.data.isFission){
           wx.navigateBack({
             delta: 1,
           });
           return;
         }
        let pages = getCurrentPages();
        let previousPage = pages[pages.length - 2];
        if (previousPage && previousPage.loginSuccessCallback) {
          previousPage.loginSuccessCallback();
        }
        wx.navigateBack({
          delta: 1,
        });
        notification.postNotificationName('loginSuccess', {});
      } else {
        wx.showModal({
          title: '提示',
          content: message || '出错了，请稍候再试',
        });
      }
    });
  },

  didClickSelectAgreement() {
    if (this.data.isFission) return;
    this.setData({
      use_select_img:
        select_img === this.data.use_select_img
          ? select_img_affirm
          : select_img,
      flag: select_img === this.data.use_select_img ? true : false,
    });
  },

  didClickSelectAgreementUrl() {
    wx.navigateTo({
      url: '/pages/web/web?url=' + 'https://m.julive.com/app/statement',
    });
  },
  // 点击前埋点
  clickWechatLogin(){
    var analyticProperties = this.analyticProperties();
    analyticProperties.fromItem = 'i_wechat_login';
    analyticProperties.toPage = analyticProperties.fromPage;
    analytic.sensors.track('e_click_wechat_login', analyticProperties);
  }
});
