const analytic = require('../../analytic/analytic.js');
// const enviroment = require('../../enviroment/enviroment');
const user = require('../../user/user');
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    /**  父组建 可能需要知道 是谁 触发 e_click_confirm_leave_phone
     *   markType string  类型
     *   markData   object
     */
    markType: {
      type: String,
      value: '',
    },
    markOpType: {
      type: String,
      value: '',
    },
    markIndex: {
      type: Number,
      value: '',
    },
    markData: {
      type: Object,
      value: {},
    },
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    getPhoneNumber: function (e) {
      
      app.dialogMapData('close');

      let pages = getCurrentPages();
      let currentPage = pages[pages.length - 1];
      console.log(currentPage.route)
      if (currentPage.route === 'pages/mine/mine') {
        this.triggerClickGetPhoneNumberBtn();
      }
      if (
        e.detail.errMsg === 'getPhoneNumber:fail user deny' ||
        e.detail.errMsg === 'getPhoneNumber:fail:user deny' ||
        e.detail.errMsg === 'getPhoneNumber:fail:user cancel'
      ) {
        // 用户取消，do nothing
        let analyticProperties = {};
        analyticProperties.fromItem = 'i_cancel_authorization';
        analyticProperties.fromPage = analytic.page.currentPage();
        analyticProperties.toPage = analytic.page.currentPage();
        analyticProperties.wechat_authorization = '2';
        if (this.data.markOpType) {
          analyticProperties.op_type = this.data.markOpType;
        }
        analytic.sensors.track(
          'e_click_wechat_cancel_authorization',
          analyticProperties
        );
        this.triggerEvent('WechatUserCancel', {
          markType: this.data.markType,
          markOpType: this.data.markOpType,
          markData: this.data.markData,
          markIndex: this.data.markIndex,
        });
      } else if (
        e.detail.errMsg ===
        'getPhoneNumber:fail The user is not bound to the mobile phone. Please try again after binding on the WeChat client'
      ) {
        // 用户微信没有绑定手机号，do nothing
        // this.triggerEvent('FastLoginCallBack', {
        //   loginStatus: false,
        //   markType: this.data.markType,
        //   markData: this.data.markData
        // });
      } else {
        this.fastLogin(e.detail.iv, e.detail.encryptedData);
        let analyticProperties = {};
        analyticProperties.fromItem = 'i_confirm_authorization';
        analyticProperties.fromPage = analytic.page.currentPage();
        analyticProperties.toPage = analytic.page.currentPage();
        analyticProperties.wechat_authorization = '1';
        if (this.data.markOpType) {
          analyticProperties.op_type = this.data.markOpType;
        }
        analytic.sensors.track(
          'e_click_wechat_confirm_authorization',
          analyticProperties
        );
      }
    },
    fastLogin(iv, encryptedData) {
      let _this = this;
      wx.showLoading();
      _this.sendFastLogin(iv, encryptedData, (message, code) => {
        wx.hideLoading();
        if (code == 0) {
          _this.triggerEvent('FastLoginCallBack', {
            loginStatus: true,
            markOpType: _this.data.markOpType,
            markIndex: _this.data.markIndex,
            markData: _this.data.markData,
            markType: _this.data.markType,
          });

          user.fetchUserHasOrder();
        } else {
          _this.triggerEvent('FastLoginCallBack', {
            loginStatus: false,
            markOpType: _this.data.markOpType,
            markIndex: _this.data.markIndex,
            markData: _this.data.markData,
            markType: _this.data.markType,
          });
          wx.showModal({
            title: '提示',
            content: message || '出错了，请稍候再试',
          });
        }
      });
    },
    sendFastLogin(iv, encryptedData, callback) {
      app
        .request('/v1/user/fast-login', {
          iv: iv,
          cryp: encryptedData,
          channel_id: app.commonData.channel.channel_id,
        })
        .then((d) => {
          this.setUserInfo(d, callback);
        });
    },
    setUserInfo(d, callback) {
      if (d.code == 0) {
        // enviroment.setJuliveToken(d.data.token, true);

        app.enviroment.setJuliveToken(d.data.token, true);

        analytic.sensors.registerApp(d.data.user_id);
        let _user = {
          userId: String(d.data.user_id),
          name: d.data.nickname,
          mobile: d.data.mobile,
          avatar: d.data.avatar ? d.data.avatar : '',
          report: d.data.report ? d.data.report : {
            status: 2
          },
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
        app.commonData.login_status = d.data.user_id ? true : false;
        callback('success', 0);
      } else {
        callback(d.errMsg, -1);
      }
    },
    beforeClickButton(e) {
      app.dialogMapData('set', 'wx-login');
      // 这个是东西 是干啥用的呢 
      // 如果首页 微信手机号授权弹窗弹起时候  标示一个状态
      // 因为苑福的需求 首页弹窗 触发时候 发现 有授权登录弹窗 要延迟触发
      let pages = getCurrentPages();
      let currentPage = pages[pages.length - 1];
      if (currentPage.route === 'pages/home/home') {
        let flag = e === false ? false : true
        app.globalData.showWxPhoneNumberAleat = flag
        this.triggerClickGetPhoneNumberBtn();
      } else if (currentPage.route === 'pages/project/list/projectList') {
        this.triggerClickGetPhoneNumberBtn();
      } else if (currentPage.route === 'pages/information/information') {
        this.triggerClickGetPhoneNumberBtn();
      } else if (currentPage.route == 'questionRelateSubPK/pages/ask/questionAsk') {
        this.triggerClickGetPhoneNumberBtn();
      } else if (currentPage.route == 'myRelateSubPK/pages/getReport/getReport') {
        this.triggerClickGetPhoneNumberBtn();
      }
    },
    // e_click_confirm_leave_phone  留电前需要的函数
    triggerClickGetPhoneNumberBtn() {
      this.triggerEvent('ClickGetPhoneNumberBtn', {
        markOpType: this.data.markOpType,
        markType: this.data.markType,
        markData: this.data.markData,
        markIndex: this.data.markIndex,
      });
    }
  },
});