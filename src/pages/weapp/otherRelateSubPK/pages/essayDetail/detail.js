import Palette from '../../../pages/information/essayModule/palette/palette.js';
var WxParse = require('../../../utils/wxParse/wxParse.js');
const order = require('../../../order/order.js');
const analytic = require('../../../analytic/analytic.js');
const app = getApp();

Page({
  data: {
    loading: true,
    isIpx: app.globalData.isIpx,
    ePageViewFlag: false,
    showHotline: true, //显示悬浮
    showTabModule: true, //true 展开悬浮
  },

  onReady: function () {
    this.setData({
      showBackHomeIcon: getCurrentPages().length == 1,
    });
  },

  onLoad: function (options) {
    wx.showNavigationBarLoading();
    var scene = options.scene;
    var essayId = '';
    if (scene) {
      scene = decodeURIComponent(scene);
      var params = scene.split(',');
      essayId = params[0];
      essayId = essayId.split('_')[1];
    } else {
      essayId = options.essayId ? options.essayId : '';
    }
    this.setData({
      essayId: essayId,
      loginUserInfo: {
        source: '156',
        op_type: '900106',
      },
      paintInfo: {
        article_card_id: essayId,
      },
    });

    var _this = this;
    if(!this.data.essayId){
      wx.switchTab({
        url: '/pages/home/home',
      });
      return;
    };
    app
      .request('/v3/information/detail', {
        article_id: this.data.essayId,
      })
      .then((result) => {
        if (result.data.info.content) {
          WxParse.wxParse(
            'article',
            'html',
            result.data.info.content,
            _this,
            5
          );
        }
        wx.hideNavigationBarLoading();
        _this.setData({
          loading: false,
          essay: result.data.info,
        });
      });
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

  analyticPageView: function () {
    // analytic
    // 以秒为单位,所以除以1000
    var viewTime = (Date.parse(new Date()) - this.data.startViewTime) / 1000;
    var analyticProperties = this.analyticProperties();
    analyticProperties.view_time = viewTime;
    analyticProperties.toPage = analyticProperties.fromPage;
    analytic.sensors.track('e_page_view', analyticProperties);
  },

  analyticProperties() {
    return {
      fromPage: 'p_article_details',
    };
  },

  didClickMoreEssayItem: function () {
    var pages = getCurrentPages();
    var currentPage = pages[pages.length - 1];
    if (pages.length > 1) {
      wx.navigateBack({});
    } else {
      wx.reLaunch({
        url: '../../home/home?tabIndex=3',
      });
    }

    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = 'p_home';
    analyticProperties.fromModule = 'm_bottom_bar';
    analyticProperties.article_card_id = this.data.essayId;
    analyticProperties.fromItem = 'i_article_details_more';
    analytic.sensors.track('e_click_article_details_more', analyticProperties);
  },

  didClickDateItem: function () {
    if (app.commonData.user.userId) {
      this.makeOrder();
    } else {
        wx.navigateTo({
          url: '/loginSubPK/pages/register/register',
        });
    }

    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.fromModule = 'm_bottom_bar';
    analyticProperties.source = this.data.loginUserInfo.source;
    analyticProperties.op_type = this.data.loginUserInfo.op_type;
    analyticProperties.article_card_id = this.data.essayId;
    analyticProperties.fromItem = 'i_leave_phone_entry';
    analytic.sensors.track('e_click_leave_phone_entry', analyticProperties);
  },

  loginSuccessCallback: function () {
    this.makeOrder();
  },

  makeOrder: function () {
    // 向他咨询按钮
    wx.showLoading({
      title: '预约中...',
    });
    var _this = this;
    order.makeOrder(
      {
        source: '156',
        op_type: '900106',
      },
      _this.data.loginUserInfo,
      function () {
        wx.hideLoading();
        _this.setData({
          showOrderSuccessAlert: true,
          alertContent:
            '您已用手机号' +
            app.commonData.user.mobile +
            '预约了咨询服务，稍后咨询师将来电为您解答疑问，请注意接听电话',
        });
      }
    );
  },

  didClickShare: function () {
    this.setData({
      popEssayCard: true,
      template: this.generateTemplate(this.data.essay),
    });
    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.fromModule = 'm_floating_window';
    analyticProperties.article_card_id = this.data.essayId;
    analyticProperties.fromItem = 'i_share';
    analytic.sensors.track('e_click_share', analyticProperties);
  },

  generateTemplate: function (essay) {
    return new Palette().palette(essay);
  },

  wxParseTagATap: function () {},

  dismissShare: function () {
    this.setData({
      popEssayCard: false,
    });
  },

  shareImagePath: function (e) {
    this.data.imagePath = e.detail.imagePath;
  },

  onShareAppMessage: function () {
    return {
      title: '这篇好文章分享给你阅读',
      path:
        '/otherRelateSubPK/pages/essayDetail/detail?essayId=' +
        this.data.essay.id,
      imageUrl: this.data.imagePath,
    };
  },
  //悬浮窗
  didClickToApp() {
    analytic.sensors.track('e_click_open_app', {
      fromPage: this.analyticProperties().fromPage,
      fromModule: 'm_floating_window',
      fromItem: 'i_open_app',
      toPage: 'p_online_service',
      article_card_id: this.data.essayId,
    });
  },
  didClickToHome() {
    wx.switchTab({
      url: '/pages/home/home',
    });
    analytic.sensors.track('e_click_back_homepage', {
      fromPage: this.analyticProperties().fromPage,
      fromModule: 'm_floating_window',
      fromItem: 'i_back_homepage',
      toPage: 'p_home',
      article_card_id: this.data.essayId,
    });
  },
  //点击收起
  didClickFold() {
    this.setData({
      showTabModule: false,
    });
    analytic.sensors.track('e_click_fold', {
      fromPage: this.analyticProperties().fromPage,
      fromModule: 'm_floating_window',
      fromItem: 'i_fold',
      toPage: 'p_article_details',
      article_card_id: this.data.essayId,
    });
  },
  didClickUnFold() {
    this.setData({
      showTabModule: true,
    });
    analytic.sensors.track('e_click_fast_navigation', {
      fromPage: this.analyticProperties().fromPage,
      fromModule: 'm_floating_window',
      fromItem: 'i_fast_navigation',
      toPage: 'p_article_details',
      article_card_id: this.data.essayId,
    });
  },
});
