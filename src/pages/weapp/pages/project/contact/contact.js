
const order = require('../../../order/order.js');
const analytic = require('../../../analytic/analytic.js');
const util = require('../../../utils/util.js');
const route = require('../../../route/route.js');
const app = getApp();

Component({
  properties: {
    projectId: {
      type: String,
      value: '',
    },
    opType: {
      type: String,
      value: '',
    },
    consultOpType: {
      type: String,
      value: '',
    },
    source: {
      type: String,
      value: '',
    },
    userInfo: {
      type: Object,
      value: {},
      observer: function (newVal, oldVal, changedPath) {
        if (util.isEmptyObject(newVal)) {
          this.data.userInfo = {};
        }
        if (newVal != oldVal) {
          var loginUserInfo = this.analyticProperties();
          loginUserInfo.op_type = this.data.opType;
          loginUserInfo.source = this.data.source;
          if (!loginUserInfo.project_id && this.data.projectId) {
            loginUserInfo.project_id = this.data.projectId;
          }
          this.setData({
            loginUserInfo: loginUserInfo,
          });
        }
      },
    },
    isFavorite: {
      type: Boolean,
      value: false,
    },
    payInfo: {
      type: String,
      value: '',
    },
    notShowAttention: {
      type: Boolean,
      value: false,
    },
    helpHouseUrl: {
      type: String,
      value: '',
    },
    consultContent: {
      type: String,
      value: '',
    },
    consult: {
      type: String,
      value: '',
    },
    fromPage: {
      type: String,
      value: '',
    },
  },

  data: {
    showLoginModal: false,
    showOrderSuccessAlert: false,
    isIpx: false,
    clickLikeItem: false,
  },

  attached: function () {
    var _this = this;
    wx.getSystemInfo({
      success: function (res) {
        console.log(res.model);
        if (res.model.indexOf('iPhone X') != -1) {
          _this.setData({
            isIpx: true,
          });
        }
      },
    });
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

    didClickLikeItem() {
      if (app.commonData.user.userId) {
        this.operation();
      } else {
        this.triggerEvent('showLoginCallback', {});
        this.setData({
          showLoginModal: true,
          loginTitle: '请先登录',
          loginContent: '登录后将提供给你更个性化的服务',
          loginButtonTitle: '确认',
          popType: 1,
          clickLikeItem: true,
        });
      }
      var analyticProperties = this.analyticProperties();
      if (!analyticProperties.fromPage) {
        analyticProperties.fromPage = analytic.page.currentPage();
      }
      analyticProperties.toPage = analyticProperties.fromPage;
      analyticProperties.project_id = this.data.projeceId;
      analyticProperties.fromModule = 'm_bottom_bar';
      analyticProperties.fromItem = 'i_follow';
      analytic.sensors.track('e_click_follow', analyticProperties);
    },

    operation() {
      var status = this.data.isFavorite ? '2' : '1';
      var _this = this;
      app
        .request('/v1/project/operation', {
          project_id: _this.data.projectId,
          status: status,
        })
        .then((d) => {
          var data = d.data;
          _this.setData({
            isFavorite: data.status == '1',
          });
          _this.triggerEvent('attentionSuccessCallback', {
            status: data.status,
          });
        })
        .catch((error) => {
          console.log(error);
        });
    },

    didClickPhoneItem(e) {
      var _this = this;
      wx.makePhoneCall({
        phoneNumber: getApp().commonData.channel.phone || '',
        success: function () {
          var analyticProperties = _this.analyticProperties();
          analyticProperties.fromPage = analytic.page.currentPage();
          analyticProperties.toPage = analytic.page.currentPage();
          analyticProperties.fromModule = 'm_bottom_bar';
          analyticProperties.fromItem = 'i_call';
          analytic.sensors.track('e_click_call', analyticProperties);
        },
        fail: function () {
          var analyticProperties = _this.analyticProperties();
          analyticProperties.fromPage = analytic.page.currentPage();
          analyticProperties.toPage = analytic.page.currentPage();
          analyticProperties.fromModule = 'm_bottom_bar';
          analyticProperties.fromItem = 'i_cancel';
          analytic.sensors.track('e_click_call_cancel', analyticProperties);
        },
      });

      var analyticProperties = this.analyticProperties();
      analyticProperties.fromPage = analytic.page.currentPage();
      analyticProperties.toPage = analytic.page.currentPage();
      analyticProperties.fromModule = 'm_bottom_bar';
      analyticProperties.fromItem = 'i_dial_service_call';
      analytic.sensors.track('e_click_dial_service_call', analyticProperties);
    },

    didClickSearchHouseItem: function (e) {
      route.transfer(this.data.helpHouseUrl);
      var analyticProperties = {};
      analyticProperties.fromPage = analytic.page.currentPage();
      analyticProperties.fromModule = 'm_bottom_bar';
      analyticProperties.fromItem = 'i_help_find_room';
      analyticProperties.project_id = this.data.projectId;
      analytic.sensors.track('e_click_help_find_room', analyticProperties);
    },

    didClickDateItem(e) {
      var loginUserInfo = this.data.loginUserInfo;
      loginUserInfo.op_type = this.data.opType;
      this.setData({
        clickLikeItem: false,
        loginUserInfo: loginUserInfo,
      });

      var toModule = '';
      var login_state = '1';
      if (app.commonData.user.userId) {
        this.makeOrder();
        toModule = 'm_leave_phone_success_window';
      } else {
        login_state = '2';
        if (this.data.opType == '900136') {
          wx.setStorageSync('special_car', this.data.opType);
          wx.navigateTo({
            url: '/otherRelateSubPK/pages/specialCar/specialCar',
          });
        } else {
          this.triggerEvent('showLoginCallback', {});
          toModule = 'm_login_window';
          var loginTitle = '免费专车看房';
          var loginContent = '公交车太累，打车太贵，看房团还要等位';
          var loginButtonTitle = '确认';
          var popType = 1;
          var contentDown =
            '居理全程0元1对1专车看房，人均节省827元路费，全城好房一趟看完';
          if (this.data.isPayInfo) {
            loginTitle = '登录享优惠';
            loginContent = this.data.payInfo;
            loginButtonTitle = '享优惠';
            popType = 2;
            contentDown = '';
          }
          this.setData({
            showLoginModal: true,
            loginTitle: loginTitle,
            loginContent: loginContent,
            loginButtonTitle: loginButtonTitle,
            popType: popType,
            contentDown: contentDown,
            contentFooter: '',
          });
        }
      }

      var analyticProperties = this.analyticProperties();
      analyticProperties.fromPage = analytic.page.currentPage();
      analyticProperties.toPage = analytic.page.currentPage();
      analyticProperties.op_type = this.data.opType;
      analyticProperties.fromModule = 'm_bottom_bar';
      analyticProperties.toModule = toModule;
      analyticProperties.login_state = login_state;
      analyticProperties.fromItem = 'i_leave_phone_entry';
      analytic.sensors.track('e_click_leave_phone_entry', analyticProperties);
    },

    didClickConsultItem: function (e) {
      var loginUserInfo = this.data.loginUserInfo;
      loginUserInfo.op_type = this.data.consultOpType;
      this.setData({
        clickLikeItem: false,
        loginUserInfo: loginUserInfo,
      });

      var toModule = '';
      var login_state = '1';
      if (app.commonData.user.userId) {
        this.makeOrder();
        toModule = 'm_leave_phone_success_window';
      } else {
        login_state = '2';
        if (this.data.consultOpType == '900215') {
          wx.setStorageSync('special_car', this.data.consultOpType);
          wx.switchTab({
            url: '/otherRelateSubPK/pages/specialCar/specialCar',
          });
        } else {
          this.triggerEvent('showLoginCallback', {});
          toModule = 'm_login_window';
          var loginTitle = '我要咨询';
          var loginContent =
            this.data.consultContent.length > 0
              ? this.data.consultContent
              : '现在房价行情如何？哪个区域、楼盘值得买？我有没有资质...';
          var contentDown = '更多问题，居理咨询师帮您答疑解惑';
          var loginButtonTitle = '确认';
          var popType = 1;
          this.setData({
            showLoginModal: true,
            loginTitle: loginTitle,
            loginContent: loginContent,
            loginButtonTitle: loginButtonTitle,
            popType: popType,
            contentDown: contentDown,
            contentFooter:
              'tip:居理咨询师100%毕业于本科院校，高学历高素质，给您不一样的服务体验',
          });
        }
      }

      var analyticProperties = this.analyticProperties();
      analyticProperties.fromPage = analytic.page.currentPage();
      analyticProperties.toPage = analytic.page.currentPage();
      analyticProperties.op_type = this.data.consultOpType;
      analyticProperties.fromModule = 'm_bottom_bar';
      analyticProperties.toModule = toModule;
      analyticProperties.login_state = login_state;
      analyticProperties.fromItem = 'i_leave_phone_entry';
      analytic.sensors.track('e_click_leave_phone_entry', analyticProperties);
    },

    loginSuccessCallback() {
      this.triggerEvent('cancelCallback', {});
      if (this.data.clickLikeItem) {
        this.operation();
        this.setData({
          clickLikeItem: false,
        });
      } else {
        this.makeOrder();
      }
    },

    cancelCallback() {
      this.setData({
        showLoginModal: false,
      });
      this.triggerEvent('cancelCallback', {});
    },

    // 留电
    makeOrder() {
      var _this = this;
      wx.showLoading({
        title: '预约中...',
      });
      var userInfo = this.analyticProperties();
      order.makeOrder(
        {
          project_id: this.data.projectId,
          source: this.data.source,
          op_type: this.data.loginUserInfo.op_type,
        },
        userInfo,
        function () {
          wx.hideLoading();
          var popType = 1;
          var alertTitle = '预约成功';
          var alertContent =
            '您已用手机号' +
            app.commonData.user.mobile +
            '预约了咨询服务，稍后咨询师将来电为您解答疑问，请注意接听电话';
          if (
            _this.data.isPayInfo &&
            _this.data.loginUserInfo.op_type == _this.data.opType
          ) {
            // 领优惠
            alertTitle = '优惠到手';
            alertContent =
              '您已经使用' +
              app.commonData.user.mobile +
              '收获了楼盘优惠，稍后我们专业的咨询师会联系您';
            popType = 2;
          }
          _this.setData({
            showOrderSuccessAlert: true,
            alertTitle: alertTitle,
            alertContent: alertContent,
            popType: popType,
          });
        }
      );
    },
  },
});
