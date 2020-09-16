import { request } from '../network/request';
const enviroment = require('../enviroment/enviroment.js');
const analytic = require('../analytic/analytic.js');
const util = require('../utils/util.js');
const app = getApp();

Component({
  properties: {
    formType: {
      type: Boolean,
      value: false,
    },
    showModal: {
      type: Boolean,
      value: false,
    },
    title: {
      type: String,
      value: '请先登录',
    },
    content: {
      type: String,
      value: '登录后将提供给你更个性化的服务',
    },
    buttonTitle: {
      type: String,
      value: '确认',
    },
    popType: {
      type: String,
      value: '1', // 1是普通类型,2是红包类型
    },
    userInfo: {
      type: Object,
      value: {},
      observer: function (newVal, oldVal, changedPath) {
        if (util.isEmptyObject(newVal)) {
          this.data.userInfo = {};
        }
      },
    },
    formOpType: {
      type: String,
      value: '',
    },
    seeNum: {
      type: Array,
      value: [],
    },
    userPhone: {
      type: Number,
      value: 0,
      observer: function (newVal, oldVal, changePath) {
        let num = newVal.toString();
        if (newVal > 0) {
          this.setData({
            loginEnable: true,
          });
        }
        if (num.length === 11) {
          this.data.phone = num;
          this._fetchCheckCode(this.data.phone, this.data.imageCode);
        }
      },
    },
    contentDown: {
      type: String,
      value: '',
    },
    contentFooter: {
      type: String,
      value: '',
    },
    mobile: {
      type: String,
      value: '',
    },
    employee: {
      type: Object,
    },
  },

  data: {
    showModal: false,
    step: 1,
    loginEnable: false,
    phone: '',
    checkcode: '',
    leftSecond: 60,
    timeIntervalId: {},
    checkcodeTip: '',
    imageCodeUrl: '',
    imageCode: '',
  },

  lifetimes: {
    detached: function () {
      if (this.data.step != 1) {
        this.setData({
          step: 1,
          leftSecond: 60,
          imageCode: '',
          userInfo: {},
        });
        clearInterval(this.data.timeIntervalId);
      }
    },
  },
  methods: {
    analyticProperties() {
      var analyticProperties = {};
      var _this = this;
      Object.keys(this.data.userInfo).map(function (key, index) {
        analyticProperties[key] = _this.data.userInfo[key];
      });
      return analyticProperties;
    },

    onCancel(e) {
      var analyticProperties = this.analyticProperties();
      if (!this.data.userInfo.fromPage) {
        analyticProperties.fromPage = analytic.page.currentPage();
      }
      analyticProperties.toPage = analyticProperties.fromPage;
      analyticProperties.fromItem = 'i_close';
      analyticProperties.countermand_step = String(this.data.step);
      analytic.sensors.track('e_click_close', analyticProperties);

      this.setData({
        showModal: false,
      });
      wx.hideLoading();
      this.triggerEvent('cancelCallback', {});
    },

    hideModal(e) {
      this.setData({
        showModal: false,
      });
      this.triggerEvent('cancelCallback', {});
    },

    /**
     * 弹出框蒙层截断touchmove事件
     */
    preventTouchMove: function (e) {},

    inputPhoneChange(e) {
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

    onFetchCheckCode(e) {
      this.setData({
        leftSecond: 60,
      });
      this._fetchCheckCode(this.data.phone, this.data.imageCode);
    },

    onConfirm(e) {
      var analyticProperties = this.analyticProperties();
      if (!this.data.userInfo.fromPage) {
        analyticProperties.fromPage = analytic.page.currentPage();
      }
      analyticProperties.toPage = analyticProperties.fromPage;
      analyticProperties.fromItem = 'i_notarize';
      analyticProperties.notarize_step = String(this.data.step);
      analytic.sensors.track('e_click_notarize', analyticProperties);
      if (this.data.step == 1) {
        this.onInputMobileDone(e);
      } else if (this.data.step == 2) {
        this.onInputCheckcodeDone(e);
      } else if (this.data.step == 3) {
        this.onImagecodeDone(e);
      }
    },

    onInputMobileDone(e) {
      if (this.data.phone.length !== 11) return;
      console.log(this.data.imageCode);
      this._fetchCheckCode(this.data.phone, this.data.imageCode);
    },

    onInputCheckcodeDone(e) {
      var _this = this;
      wx.showLoading();
      login(this.data.phone, this.data.checkcode, function (message, code) {
        wx.hideLoading();
        if (code == 0) {
          _this.triggerEvent('loginSuccessCallback', {
            popType: _this.data.popType,
          });
          if (_this.data.timeIntervalId) {
            clearInterval(_this.data.timeIntervalId);
          }
          _this.setData({
            showModal: false,
            step: 1,
            imageCode: '',
          });
        } else {
          wx.showModal({
            title: '提示',
            content: message || '出错了，请稍候再试',
          });
          _this.setData({
            leftSeconde: 0,
          });
        }
      });
    },

    onImagecodeDone(e) {
      this._fetchCheckCode(this.data.phone, this.data.imageCode);
    },

    didTapImageCode(e) {
      var _this = this;
      fetchImageCode(function (url) {
        _this.setData({
          imageCodeUrl: url,
        });
      });
    },

    _fetchCheckCode(mobile, imageCode) {
      var _this = this;
      _this.data.leftSecond = 60;
      wx.showLoading({
        title: '获取中...',
      });
      fetchCheckCode(mobile, imageCode, function (code) {
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
          fetchImageCode(function (url) {
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
  },
});

function login(mobile, verifyCode, callback) {
  request('/v1/user/login', {
    mobile: mobile,
    captcha: verifyCode,
  }).then((d) => {
    setUserInfo(d, callback);
  });
}

function logout() {
  var userInfo = {
    userId: '',
    name: '',
    mobile: '',
    report: { status: 2 }
  };
  // wx.setStorage({
  //   key: 'julive_user',
  //   data: userInfo,
  // });
  analytic.sensors.registerApp({
    julive_id: String(userInfo.userId),
  });
  app.commonData.user = userInfo;

  app.commonData.login_status = userInfo.userId ? true : false;
}

function fetchCheckCode(mobile, imageCode, callback) {
  var parameters = {
    mobile: mobile,
    channel_id: app.commonData.channel.channel_id,
  };
  if (imageCode.length > 0) {
    parameters.captcha_img_code = imageCode;
  }
  request('/v1/user/captcha', parameters)
    .then((d) => {
      callback(d.code);
    })
    .catch((error) => {
      console.error(error);
    });
}

function fetchImageCode(callback) {
  request('/v1/user/captcha-img', {}).then((d) => {
    callback(d);
  });
}

function fastLogin(iv, encryptedData, callback) {
  request('/v1/user/fast-login', {
    iv: iv,
    cryp: encryptedData,
    channel_id: app.commonData.channel.channel_id,
  }).then((d) => {
    setUserInfo(d, callback);
  });
}

function setUserInfo(d, callback) {
  if (d.code == 0) {
    enviroment.setJuliveToken(d.data.token, true);
    analytic.sensors.registerApp(d.data.user_id);
    var _user = {
      userId: String(d.data.user_id),
      name: d.data.nickname,
      mobile: d.data.mobile,
      avatar: d.data.avatar ? d.data.avatar : '',
      report: d.data.report ? d.data.report : { status: 2 },
    };
    // user.setUser(_user);
    // wx.setStorage({
    //   key: 'julive_user',
    //   data: _user,
    // });
    analytic.sensors.registerApp({
      julive_id: _user.userId,
    });
    app.commonData.user = _user;
    app.commonData.login_status = _user.userId ? true : false;
    callback('success', 0);
  } else {
    callback(d.errMsg, -1);
  }
}

module.exports = {
  login: login,
  logout: logout,
  fetchImageCode: fetchImageCode,
  fetchCheckCode: fetchCheckCode,
  fastLogin: fastLogin,
};
