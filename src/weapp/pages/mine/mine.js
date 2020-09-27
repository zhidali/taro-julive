const user = require('../../user/user.js');
const analytic = require('../../analytic/analytic.js');
// const enviroment = require('../../enviroment/enviroment.js');
const route = require('../../route/route.js');
const wxUserInfo = require('../../user/wxUserInfo.js');
const notification = require('../../utils/notification.js');
const order = require('../../order/order.js');
const app = getApp();

Page({
  data: {
    user: null,
    isAvailable: false,
    contact: '',
    report: {
      status: 2,
    },
    recordFetchUserMenu: 'first',
    userMenu: '',
    ePageViewFlag: false,
    showTabHousePurchase: false,
    userLoginStatus: false,
    loadingHidden: false,
    abTest: {},
    activity_enter: {}, //裂变活动的tab数据
  },

  onLoad: async function () {
    await app.getAbtest();
    this.setData({
      abTest: app.abTest, //ABC
      userLoginStatus: app.commonData.user.userId ? true : false,
    })
    app.watchCommonData('login_status', (newv) => {
      this.setData({
        userLoginStatus: newv ? true : false
      })
    })
    this.fetchUserMenu();
    notification.addNotification('CityHadChanged', this.fetchUserMenu, this);
    this.analyticPageView('e_page_view');
    setTimeout(() => {
      this.data.ePageViewFlag = true;
    }, 500);
  },

  onShow: function () {
    this.data.startViewTime = Date.parse(new Date());
    this.data.contact = getApp().commonData.channel.phone;
    this.upDataUserInfo();
    if (this.data.ePageViewFlag) {
      this.analyticPageView('e_page_view');
    }
    this.setData({
      showTabHousePurchase: app.commonData.mineTabPurchase,
      userLoginStatus: app.commonData.user.userId ? true : false,
    });
  },

  async fetchUserMenu() {
    try {
      const res = await app.request('/v1/user/menu', {
        is_login: app.commonData.user.userId ? 1 : 2,
      });
      if (res.code == undefined) return;
      this.setData({
        about: res.data.about ? res.data.about : '',
        help_me_find_house: res.data.help_me_find_house ?
          res.data.help_me_find_house : '',
        recordFetchUserMenu: app.commonData.user.userId || '',
        house_welfare: res.data.house_welfare ? res.data.house_welfare : '',
        loadingHidden: true,
        activity_enter: res.data.activity_enter || {}

      });
    } catch (err) {
      console.log(err);
    }
  },
  onHide: function () {
    this.analyticPageView();
  },

  onUnload: function () {
    this.analyticPageView();
  },

  analyticPageView: function (eventName = 'e_page_quit') {
    var analyticProperties = this.analyticProperties();
    if (eventName != 'e_page_view') {
      var viewTime = (Date.parse(new Date()) - this.data.startViewTime) / 1000;
      analyticProperties.view_time = viewTime;
    }
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.project_id = this.data.projectId;
    analytic.sensors.track(eventName, analyticProperties);
  },
  analyticProperties() {
    return {
      fromPage: 'p_user_center',
    };
  },


  upDataUserInfo() {
    if (app.commonData.user.userId) {
      let _this = this;
      app.request('/v1/user/user-info', {}).then((res) => {
        if (res && res.data && res.data.user_id) {
          var userInfo = {
            userId: String(res.data.user_id),
            name: res.data.nickname,
            mobile: res.data.mobile,
            avatar: res.data.avatar,
          };
          // user.setUser(userInfo);
          // wx.setStorage({
          //   key: 'julive_user',
          //   data: userInfo,
          // });
          analytic.sensors.registerApp({
            julive_id: userInfo.userId,
          });
          app.commonData.user = userInfo;
          app.commonData.login_status = userInfo.userId ? true : false;
          if (
            _this.data.user === null ||
            _this.data.user.avatar != res.data.avatar
          ) {
            _this.setData({
              isAvailable: app.commonData.user.userId || '',
              user: userInfo,
              report: res.data.report,
              see_project_data: JSON.stringify(res.data.see_project_data) === '{}' ?
                false : res.data.see_project_data,
            });
          } else {
            let userName = 'user.name';
            let userMobile = 'user.mobile';
            _this.setData({
              isAvailable: app.commonData.user.userId || '',
              [userName]: userInfo.name,
              [userMobile]: userInfo.mobile,
              report: res.data.report,
              see_project_data: JSON.stringify(res.data.see_project_data) === '{}' ?
                false : res.data.see_project_data,
            });
          }
        }
      });
    }
    if (
      this.data.recordFetchUserMenu != 'first' &&
      this.data.recordFetchUserMenu != app.commonData.user.userId
    ) {
      this.data.recordFetchUserMenu = app.commonData.user.userId || '';
      this.fetchUserMenu();
    }
  },
  didClickReport: function () {
    if (this.data.see_project_data) {
      wx.navigateTo({
        url: '/pages/web/web?url=' +
          encodeURIComponent(this.data.see_project_data.url),
      });
      var properties = this.analyticProperties();
      properties.fromItem = 'i_rate_url';
      properties.toPage = 'p_webview';
      properties.to_url = this.data.see_project_data.url;
      analytic.sensors.track('e_click_rate_entry', properties);
    } else if (
      app.commonData.user.userId &&
      this.data.report.status == 1 &&
      this.data.report.report_id
    ) {
      wx.navigateTo({
        url: '../report/firstReport/firstReport?businessId=' +
          this.data.report.report_id +
          '&s=4',
      });
      var properties = this.analyticProperties();
      properties.login_state = '1';
      properties.toPage = 'p_report_first_details';
      properties.fromItem = 'i_first_call_report';
      analytic.sensors.track('e_click_first_call_report', properties);
    } else {
      wx.navigateTo({
        url: '../../myRelateSubPK/pages/getReport/getReport',
      });

      var properties = this.analyticProperties();
      properties.login_state = '1';
      properties.toPage = 'p_get_first_call_report';
      properties.fromItem = 'i_get_first_call_report';
      analytic.sensors.track('e_click_get_first_call_report', properties);
    }
  },

  didClickFindRoom: function () {
    let url = this.data.help_me_find_house.url;
    wx.navigateTo({
      url: '/pages/web/web?url=' + url,
    });

    var properties = this.analyticProperties();
    properties.login_state = this.data.isAvailable ? '1' : '2';
    properties.toPage = 'p_webview';
    properties.fromItem = 'i_help_find_room';
    properties.to_url = url;
    analytic.sensors.track('e_click_help_find_room', properties);
  },

  didClickSpecialCar: function () {
    wx.navigateTo({
      url: '/otherRelateSubPK/pages/specialCar/specialCar',
    });

    var properties = this.analyticProperties();
    properties.login_state = this.data.isAvailable ? '1' : '2';
    properties.toPage = 'p_reservation_car_see_house';
    properties.fromItem = 'i_user_center_tailored_taxi';
    analytic.sensors.track('e_click_user_center_tailored_taxi', properties);
  },

  didClickAsk: function () {
    wx.navigateTo({
      url: '/questionRelateSubPK/pages/ask/questionAsk',
    });

    var properties = this.analyticProperties();
    properties.login_state = this.data.isAvailable ? '1' : '2';
    properties.toPage = 'p_ask_someone';
    properties.fromItem = 'i_ask';
    analytic.sensors.track('e_click_ask', properties);
  },

  didClickPhone: function () {
    var _this = this;
    wx.makePhoneCall({
      phoneNumber: this.data.contact,
      success: function () {
        var analyticProperties = _this.analyticProperties();
        analyticProperties.login_state = _this.data.isAvailable ? '1' : '2';
        analyticProperties.toPage = analyticProperties.fromPage;
        analyticProperties.fromItem = 'i_call';
        analytic.sensors.track('e_click_call', analyticProperties);
        order.reportOrder();
      },
      fail: function () {
        var analyticProperties = _this.analyticProperties();
        analyticProperties.login_state = _this.data.isAvailable ? '1' : '2';
        analyticProperties.toPage = analyticProperties.fromPage;
        analyticProperties.fromItem = 'i_cancel';
        analytic.sensors.track('e_click_call_cancel', analyticProperties);
      },
    });

    var properties = this.analyticProperties();
    properties.toPage = properties.fromPage;
    properties.login_state = this.data.isAvailable ? '1' : '2';
    properties.fromItem = 'i_dial_service_call';
    analytic.sensors.track('e_click_dial_service_call', properties);
  },

  didClickAbout: function () {
    wx.navigateTo({
      url: '/pages/web/web?url=' + encodeURIComponent(this.data.about.url),
    });

    var properties = this.analyticProperties();
    properties.to_url = this.data.about.url;
    properties.login_state = this.data.isAvailable ? '1' : '2';
    properties.toPage = 'p_webview';
    properties.fromItem = 'i_about_julive';
    analytic.sensors.track('e_click_about_julive', properties);
  },
  didClickRecordBox: function () {
    wx.navigateTo({
      url: '../../dipperSubPK/pages/recordBox/recordBox',
    });
    var properties = this.analyticProperties();
    properties.fromItem = 'i_housing_treasured_book';
    properties.toPage = 'p_user_housing_treasured_book';
    properties.login_state = this.data.isAvailable ? '1' : '2';
    analytic.sensors.track('e_click_housing_treasured_book', properties);
  },
  async quitLogin() {
    if (!app.commonData.user.userId) return;
    const res = await app.request('/v1/user/logout', {
      // token: enviroment.getJuliveToken(),
      token: app.enviroment.token || '',
      user_id: app.commonData.user.userId || '',
      nickname: wxUserInfo.getNickName(),
    });
    const {
      code
    } = res;
    if (code !== 0) return;
    var _this = this;
    // wx.removeStorage({
    //   key: 'julive_user',
    //   success(res) {
    //     app.commonData.user = {};
    //     app.commonData.login_status = false;
    //     _this.setData({
    //       isAvailable: false,
    //       see_project_data: false,
    //       user: '',
    //       report: {
    //         status: 2
    //       },
    //     });
    //     _this.fetchUserMenu();
    //     user.fetchUserHasOrder();
    //   },
    // });

    app.commonData.user = {};
    app.commonData.login_status = false;
    _this.setData({
      isAvailable: false,
      see_project_data: false,
      user: '',
      report: {
        status: 2
      },
    });
    _this.fetchUserMenu();
    user.fetchUserHasOrder();
    var properties = this.analyticProperties();
    properties.fromItem = 'i_logout';
    properties.toPage = 'p_user_center ';
    analytic.sensors.track('e_click_logout', properties);
  },
  didClickPrivacy() {
    var properties = this.analyticProperties();
    let url = 'https://m.julive.com/topic/yinsixieyi.html';
    route.transfer(url);
    properties.to_url = url;
    properties.toPage = 'p_webview';
    properties.fromItem = 'i_privacy_protocol';
    analytic.sensors.track('e_click_privacy_protocol', properties);
  },
  //进入会话页面
  didClickContact() {
    analytic.sensors.track('e_click_open_app', {
      fromPage: this.analyticProperties().fromPage,
      fromModule: '',
      fromItem: 'i_open_app',
      toPage: 'p_online_service',
    });
  },
  passBackFastLoginCallBack(e) {
    let {
      loginStatus,
      markType
    } = e.detail;
    // 登录/注册按钮 1；我的购房宝典 2;成交好礼 3;帮我找房 4; 我要提问5;
    if (loginStatus) {
      this.upDataUserInfo();
      this.setData({
        isAvailable: true,
        userLoginStatus: true,
      });
    }
    if (markType == '1') {
      // do to
    } else if (markType == '2') {
      this.didClickRecordBox();
    } else if (markType == '4') {
      this.didClickFindRoom();
    } else if (markType == '5') {
      this.didClickAsk();
    }
  },
  //跳转到购房宝典
  didClickHousePurchase() {
    wx.navigateTo({
      url: '/pages/web/web?url=' + encodeURIComponent(this.data.house_welfare.url),
    });
    analytic.sensors.track('e_click_buy_house_book_entry', {
      fromPage: this.analyticProperties().fromPage,
      fromModule: '',
      fromItem: 'i_buy_house_book_entry',
      toPage: 'p_webview',
      to_url: this.data.house_welfare.url,
    });
  },
  //跳转，我的收藏
  didClickMyFavorite() {
    wx.navigateTo({
      url: '/myRelateSubPK/pages/myFavorite/myFavorite',
    });
    analytic.sensors.track('e_click_follow_project', {
      fromPage: this.analyticProperties().fromPage,
      fromItem: 'i_follow_project',
      toPage: 'p_my_follow',
    });
  },

  //跳转，列表活动页面
  didClickShareAct() {
    wx.navigateTo({
      url: "/activitySubPK/pages/fissionActivity/fissionActivity",
    });
    analytic.sensors.track('e_click_rengou_discount', {
      id: 9353,
      fromPage: 'p_user_center',
      fromItem: 'i_rengou_discount',
      toPage: 'p_help_activity',
    });
  }
});