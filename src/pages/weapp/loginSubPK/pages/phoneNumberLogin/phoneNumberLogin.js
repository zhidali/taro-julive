const login = require('../../../user/login.js');
const analytic = require('../../../analytic/analytic.js');
const app = getApp();
const notification = require('../../../utils/notification.js');

Page({
  data: {
    phone: '',
    checkcode: '',
    loginEnable: '',
    leftSecond: 60,
    imageCodeUrl: '',
    imageCode: '',
    step: 1,
    timeIntervalId: {},
    ePageViewFlag: false,
    phoneFocus: false,
    phoneNumber: '',
  },
  onLoad: function (options) {
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
    analyticProperties.view_time = viewTime;
    analytic.sensors.track(eventName, analyticProperties);
  },

  analyticProperties() {
    return {
      fromPage: 'p_phone_login',
    };
  },

  didTapImageCode(e) {
    var _this = this;
    login.fetchImageCode(function (url) {
      _this.setData({
        imageCodeUrl: url,
      });
    });
  },

  onFetchCheckCode(e) {
    this.setData({
      leftSecond: 60,
    });
    this._fetchCheckCode(this.data.phone, this.data.imageCode);

    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.fromItem = 'i_get_verification_code';
    analytic.sensors.track('e_click_get_verification_code', analyticProperties);
  },

  inputImageCodeChange(e) {
    this.setData({
      imageCode: e.detail.value,
    });
  },

  getVerificationCode(e) {
    if (this.data.phone.length !== 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none',
      });
      return;
    }
    this.setData({
      phoneFocus: false,
    });
    this._fetchCheckCode(this.data.phone, this.data.imageCode);

    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.fromItem = 'i_get_identify';
    analytic.sensors.track('e_click_get_certification', analyticProperties);
  },

  _fetchCheckCode(mobile, imageCode) {
    var _this = this;
    _this.data.leftSecond = 60;
    wx.showLoading({
      title: '获取中...',
    });
    login.fetchCheckCode(mobile, imageCode, function (code) {
      wx.hideLoading();
      if (code == 0 || code == 1109) {
        _this.setData({
          step: 2,
          checkcodeTip: '已经向' + _this.data.phone + '发送了验证码',
          loginEnable: false,
        });
        _this.data.timeIntervalId = setInterval(function () {
          if (_this.data.leftSecond - 1 == 0) {
            clearInterval(_this.data.timeIntervalId);
          }
          _this.setData({
            leftSecond: _this.data.leftSecond - 1,
          });
        }, 1000);
        if (code == 1109) {
          wx.showToast({
            title: '验证码已发送，请勿重复请求',
          });
        }
      } else if (code == 1116) {
        wx.showToast({
          title: '请输入图形验证码',
          icon: 'none',
        });
        clearInterval(_this.data.timeIntervalId);
        _this.setData({
          step: 3,
        });
        login.fetchImageCode(function (url) {
          _this.setData({
            imageCodeUrl: url,
          });
        });
      } else if (code == 1117) {
        wx.showToast({
          title: '图形验证码错误',
          icon: 'none',
        });
      } else {
        wx.showModal({
          content: '验证码发送失败',
          showCancel: false,
        });
      }
    });
  },

  didTapLoginButton() {
    var _this = this;
    wx.showLoading();
    login.login(this.data.phone, this.data.checkcode, function (message, code) {
      var login_state = '1';
      var toPage = 'p_user_center';
      wx.hideLoading();
      if (code == 0) {
        if (_this.data.timeIntervalId) {
          clearInterval(_this.data.timeIntervalId);
        }
        _this.setData({
          step: 1,
          imageCode: '',
        });

        var pages = getCurrentPages();
        var previousPage = pages[pages.length - 3];
        if (previousPage && previousPage.loginSuccessCallback) {
          previousPage.loginSuccessCallback();
        }
        wx.navigateBack({
          delta: 2,
        });
        notification.postNotificationName('loginSuccess', {});
      } else {
        login_state = '2';
        toPage = 'p_phone_login';
        wx.showModal({
          title: '提示',
          content: message || '出错了，请稍候再试',
        });
        _this.setData({
          leftSeconde: 0,
        });
      }
      var analyticProperties = _this.analyticProperties();
      analyticProperties.toPage = toPage;
      analyticProperties.fromItem = 'i_confirm_login';
      analyticProperties.login_state = login_state;
      analytic.sensors.track('e_click_confirm_login', analyticProperties);
    });
  },

  inputPhoneChange(e) {
    this.setData({
      phoneFocus: true,
    });
    var text = e.detail.value;
    if (text.length == 11) {
      this.setData({
        loginEnable: true,
        phone: text,
      });
    } else {
      this.setData({
        loginEnable: false,
        phone: text,
      });
    }
    if (text.length == 0) {
      this.setData({
        phoneFocus: false,
      });
    }
  },
  inputPhoneClear() {
    this.setData({
      phoneNumber: '',
    });
  },

  inputCheckCodeChange(e) {
    var text = e.detail.value;
    if (text.length >= 4) {
      this.setData({
        loginEnable: true,
        checkcode: text,
      });
    } else {
      this.setData({
        loginEnable: false,
        checkcode: text,
      });
    }
  },

  inputImageCodeChange(e) {
    this.setData({
      imageCode: e.detail.value,
    });
  },

  didClickProtocol: function () {
    wx.navigateTo({
      url: '/pages/web/web?url=https://m.julive.com/app/statement',
    });
  },
});
