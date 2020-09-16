const order = require('../../../order/order.js');
var notification = require('../../../utils/notification.js');
const analytic = require('../../../analytic/analytic.js');
const util = require('../../project/utils/util.js');
const wxUserInfo = require('../../../user/wxUserInfo.js');
const app = getApp();
// const comStateObserve = require('../../../component/comStateObserve.js');
import Card from './palette/projectNewsPalette';
let appPage = getApp();

Component({
  properties: {},

  data: {
    loadingHidden: false,
    hasMore: false,
    isShow: false,
    page: 1,
    projectNewsList: [],
    project_id: '',
    subscribeFlag: false,
    loginTitle: '请先登录',
    loginContent: '登录后将提供给你更个性化的服务',
    contentFooter: '',
    userLoginStatus: true, //false时，显示微信登陆
    barTypeData: {
      isShow: false,
      type: 1,
    }, // 登录条
    loginBackType: {
      flag: false,
    },
  },

  lifetimes: {
    attached: function () {
      this.fetchProjectNews(true);
      this.data.startViewTime = Date.parse(new Date());
      notification.addNotification(
        'CityHadChanged',
        this.fetchProjectNews,
        this
      );
      this.setData({
        userLoginStatus: app.commonData.user.userId ? true : false,
      });
      // 只弹出一次
      if (appPage.globalData.houseDynamicLoginOnce || app.commonData.user.userId)
        return;
      this.setData({
        ['barTypeData.isShow']: true,
      });
    },

    //组件实例被从页面节点树移除时执行
    detached() {
      var analyticProperties = {};
      var viewTime = (Date.parse(new Date()) - this.data.startViewTime) / 1000;
      analyticProperties.view_time = viewTime;
      analyticProperties.fromPage = 'p_julive_info_agency';
      analyticProperties.toPage = 'p_julive_info_agency';
      analyticProperties.tab_id = '3';
      analytic.sensors.track('e_page_quit_details', analyticProperties);
    },
  },

  methods: {
    analyticProperties() {
      return {
        fromPage: 'p_project_highlights',
      };
    },

    fetchProjectNews: function (isRefresh, observer) {
      var _this = this;
      if (observer) {
        _this = observer;
      }
      if (isRefresh) {
        _this.data.page = 1;
      } else {
        _this.data.page++;
      }
      // 新接口无分页
      app
        .request('/wxmini/v1/project/project-dynamic-list', {
          page: _this.data.page,
        })
        .then((d) => {
          var data = d.data;
          var list =
            data != undefined && data.list != undefined ? data.list : [];
          var hasMore =
            data != undefined && data.has_more != undefined ?
            data.has_more == 1 :
            false;

          let showList = isRefresh ?
            list :
            _this.data.projectNewsList.concat(list);
          _this.setData({
            hasMore: hasMore,
            loadingHidden: true,
            projectNewsList: showList,
          });
          wx.stopPullDownRefresh();
        })
        .catch((error) => {
          wx.stopPullDownRefresh();
          _this.setData({
            loadingHidden: true,
          });
          console.log(error);
        });
    },

    dismissShare: function () {
      this.setData({
        template: {},
        palette: {},
      });
      appPage.globalData.houseDynamicShare.showPainter = false;
    },

    //跳转 楼盘详情
    didTapHouseDetail: function (e) {
      var projectId = e.currentTarget.dataset.projectId;
      var index = e.currentTarget.dataset.index;
      wx.navigateTo({
        url: `/pages/web/web?url=${getApp().commonData.m_domain_project}${projectId}.html`
      });
      var analyticProperties = this.analyticProperties();
      analyticProperties.fromPage = analyticProperties.fromPage;
      analyticProperties.fromModule = 'm_project_highlights ';
      analyticProperties.fromItem = 'i_project_card';
      analyticProperties.fromItemIndex = String(index);
      analyticProperties.toPage = 'p_project_details ';
      analyticProperties.project_id = projectId;
      analytic.sensors.track('e_click_project_card', analyticProperties);
    },

    //楼盘-查看全文，5519埋点
    didTapDynamicDetail: function (e) {
      var projectId = e.currentTarget.dataset.projectId;
      var dynamicId = e.currentTarget.dataset.dynamicId;
      var index = e.currentTarget.dataset.index;
      wx.navigateTo({
        url: '/dynamicSubPK/pages/detail/dynamicDetail?projectId=' +
          projectId +
          '&dynamicId=' +
          dynamicId +
          '&type=1',
      });
      var analyticProperties = this.analyticProperties();
      analyticProperties.fromPage = analyticProperties.fromPage;
      analyticProperties.fromModule = 'm_project_highlights ';
      analyticProperties.fromItem = 'i_view_more';
      analyticProperties.toPage = 'p_project_dynamic_details';
      analyticProperties.fromItemIndex = String(index);
      analyticProperties.project_id = projectId;
      analyticProperties.project_dynamic_id = dynamicId;
      analytic.sensors.track('e_click_view_more', analyticProperties);
    },

    //订阅楼盘动态
    didTapSubcribeHouseDynamic: function (e, markIndex) {
      var index = e ? e.currentTarget.dataset.index : markIndex;
      var projectId = this.data.projectNewsList[index].project_id;
      var dynamicId = this.data.projectNewsList[index].dynamic.id;
      this.setData({
        alertTitle: '订阅成功!',
        alertContent: '稍后会有居理咨询师给您提供楼盘动态',
        opType: '900107',
        project_id: projectId,
      });
      this.data.loginUserInfo = {
        op_type: '900107',
        project_id: projectId,
        project_dynamic_id: dynamicId,
        fromModule: 'm_project_highlights',
        fromItem: 'i_project_dynamic_notice',
        fromItemIndex: String(index),
      };
      let _this = this;
      if (app.commonData.user.userId) {
        _this.getTemplateIds(function (ids) {
          wx.requestSubscribeMessage({
            tmplIds: ids,
            success(res) {
              if (res[ids] == 'accept') {
                _this.addSubscribe();
                _this.makeOrder();
              } else {
                _this.makeOrder(false);
              }
            },
            fail(res) {
              console.log(res);
              _this.makeOrder(false);
            },
          });
        });
      }

      analytic.sensors.track('e_click_leave_phone_entry', {
        fromPage: this.analyticProperties().fromPage,
        toPage: this.analyticProperties().fromPage,
        fromModule: 'm_project_highlights',
        fromItem: 'i_project_dynamic_notice',
        fromItemIndex: String(index),
        op_type: this.data.loginUserInfo.op_type,
        project_id: projectId,
        project_dynamic_id: dynamicId,
        login_state: app.commonData.user.userId ? '1' : '2',
      });
    },

    //获取消息模版
    getTemplateIds(callback) {
      app
        .request('/v2/subscribe/get-subscribe-template-ids', {
          sub_type: 3,
        })
        .then((res) => {
          if (res.code == 0) {
            callback(res.data);
          }
        });
    },
    addSubscribe() {
      app
        .request('/v2/subscribe/subscribe', {
          obj_type: 1,
          obj_id: this.data.project_id,
          sub_type: 3,
        })
        .then((res) => {});
    },

    // 特价楼盘 优惠楼盘点击咨询
    didTapSpecialConsult: function (e, markIndex) {
      let index = e ? e.currentTarget.dataset.index : markIndex;
      let projectId = this.data.projectNewsList[index].project_id;
      let type = this.data.projectNewsList[index].type;
      let opType = type == 1 ? '900709' : '900710';
      this.setData({
        alertTitle: '预约成功!',
        alertContent: `您已用手机号${app.commonData.user.mobile}预约了咨询服务，稍后咨询师将来电为您解答疑惑，请注意接听电话`,
        opType: opType,
        project_id: projectId,
      });
      this.data.loginUserInfo = {
        op_type: opType,
        project_id: projectId,
        fromModule: 'm_project_highlights',
        fromItem: 'i_confirm_leave_phone',
        fromItemIndex: String(index),
      };
      if (app.commonData.user.userId) {
        this.makeOrder();
      }
      analytic.sensors.track('e_click_leave_phone_entry', {
        fromPage: this.analyticProperties().fromPage,
        toPage: this.analyticProperties().fromPage,
        fromModule: 'm_project_highlights',
        fromItem: 'i_leave_phone_entry',
        fromItemIndex: String(index),
        op_type: this.data.loginUserInfo.op_type,
        project_id: projectId,
        login_state: app.commonData.user.userId ? '1' : '2',
      });
    },

    onGetUserInfo: function (e) {
      var projectNews = e.currentTarget.dataset.projectNews;
      var index = e.currentTarget.dataset.index;
      var nickName = e.detail.userInfo.nickName;
      var avatarUrl = e.detail.userInfo.avatarUrl;
      if (e.detail.userInfo) {
        wxUserInfo.init();
        var statusColor = util.statusColor(
          projectNews.project_info.status.value
        );
        var totalPrice = util.formatPrice(projectNews.project_info.total_price);
        let stateBackground = statusColor.split('-')[0];
        let stateColor = statusColor.split('-')[1];

        this.setData({
          paintInfo: {
            project_id: projectNews.project_info.project_id,
          },
          showPainter: true,
          template: new Card().palette(
            projectNews,
            nickName,
            avatarUrl,
            stateBackground,
            stateColor,
            totalPrice
          ),
          palette: new Card().paletteBigImage(
            projectNews,
            nickName,
            avatarUrl,
            statusColor,
            totalPrice
          ),
        });
        appPage.globalData.houseDynamicShare.showPainter = true;
      } else {
        var that = this;
        wx.showModal({
          title: '温馨提示',
          content: '请前往关于->设置->访问用户信息，修改为允许，才可推荐楼盘动态',
          showCancel: false,
          confirmColor: '#47B3E3',
          success: function (res) {
            if (res.confirm) {
              wx.openSetting({
                success: function (res) {
                  if (res.authSetting['scope.userInfo']) {
                    wxUserInfo.init();
                    that.onConfirmSubmit();
                  }
                },
              });
            }
          },
        });
      }
    },

    didLoginSuccess: function () {
      if (this.data.subscribeFlag == false) {
        this.makeOrder();
      } else {
        let _this = this;
        _this.getTemplateIds(function (ids) {
          wx.requestSubscribeMessage({
            tmplIds: ids,
            success(res) {
              if (res[ids] == 'accept') {
                _this.addSubscribe();
                _this.makeOrder();
              } else {
                toModule = 'm_leave_phone_success_window';
                _this.makeOrder(false);
              }
            },
          });
        });
      }
    },
    cancelCallback: function () {
      this.setData({
        showLoginModal: false,
      });
    },

    makeOrder: function (noConfirmPop) {
      console.log('app.commonData.use----', app.commonData.use)
      if (noConfirmPop !== false) {
        wx.showLoading({
          title: '预约中...',
        });
      }
      var _this = this;
      let _state = noConfirmPop !== false ? true : false;
      order.makeOrder({
          project_id: this.data.project_id,
          op_type: this.data.opType,
        },
        _this.data.loginUserInfo,
        function () {
          wx.hideLoading();
          _this.setData({
            showOrderSuccessAlert: _state,
            alertTitle: '预约成功',
            popType: '1',
            alertContent: '您已用手机号' +
              app.commonData.user.mobile +
              '预约了咨询服务，稍后咨询师将来电为您解答疑问，请注意接听电话',
          });
        }
      );
    },
    //fan hui
    didClickBackTop: function () {
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 0,
      });
      analytic.sensors.track('e_click_back_top', {
        fromPage: this.analyticProperties().fromPage,
        toPage: this.analyticProperties().fromPage,
        fromItem: 'i_back_top',
      });
    },

    shareImagePath: function (e) {
      appPage.globalData.houseDynamicShare.imagePath = e.detail.imagePath;
    },
    didReachBottom: function () {
      if (this.data.hasMore) {
        this.fetchProjectNews(false);
      }
    },

    //关闭 一键登录出
    didClickCloseBarType() {
      let _this = this;
      this.setData({
          ['barTypeData.animation']: true,
        },
        () => {
          let timer = setTimeout(() => {
            _this.setData({
              ['barTypeData.isShow']: false,
            });
            clearTimeout(timer);
          }, 1500);
        }
      );
      appPage.globalData.houseDynamicLoginOnce = true;
    },
    //点击微信登陆。允许或者拒绝 回调
    passBackGetPhoneNumberBtn(e) {
      let {
        markOpType,
        markIndex
      } = e.detail;
      if (markOpType == '900107') {
        this.didTapSubcribeHouseDynamic('', markIndex, true);
      } else if (markOpType == '900710') {
        this.didTapSpecialConsult('', markIndex, true);
      }
      if (e.detail.markType === '261') {
        analytic.sensors.track('e_click_onekey_login', {
          fromPage: 'p_julive_info_agency',
          toPage: 'p_julive_info_agency',
          fromModule: 'm_onekey_tip_window',
          fromItem: 'i_onekey_login',
          tab_id: '3'
        });
      }
    },

    //微信登陆 拒绝后回调 和允许后调用完fast-login 回调，允许loginStatus=true
    passBackFastLoginCallBack(e) {
      let {
        loginStatus
      } = e.detail;
      if (loginStatus) {
        this.data.loginBackType.flag = false;
        this.setData({
          ['barTypeData.isShow']: false,
          userLoginStatus: true
        });
        app.commonData.mineTabPurchase = true;
        //如果是一键登录弹窗
        if (e.detail.markType == "261") {
          wx.showModal({
            content: '领取成功，可在我的查看',
            showCancel: false,
            complete: () => {
              if (app.commonData.userHasOrder) return;
              wx.navigateTo({
                url: '/myRelateSubPK/pages/getReport/getReport',
              });
              analytic.sensors.track('e_click_report_entry', {
                fromPage: 'p_julive_info_agency',
                fromModule: 'm_onekey_tip_window',
                fromItem: 'i_report_entry',
                toPage: 'p_buy_house_report',
                tab_id: '3'
              });
            }
          });
          analytic.sensors.track('e_click_confirm_login', {
            fromPage: 'p_julive_info_agency',
            toPage: 'p_julive_info_agency',
            fromModule: 'm_onekey_tip_window',
            fromItem: 'i_confirm_login',
            tab_id: '3'
          });
        } else {
          this.makeOrder();
        }
      }
    },
  },
});