import NumberAnimate from '../../../utils/NumberAnimate';
const util = require('../../../utils/util.js');
const order = require('../../../order/order.js');
const analytic = require('../../../analytic/analytic.js');
const app = getApp();

Page({
  data: {
    serviceNum: '***',
    imageName: '',
    sexSelected: 1,
    timeSelected: '',
    opType: '900091',
    projectName: '',
    startDate: new Date(),
    endDate: new Date(),
    ePageViewFlag: false,
  },

  onLoad: function (options) {
    var date = new Date();
    this.setData({
      startDate: util.formatDate(new Date(date.setDate(date.getDate() + 1))),
      endDate: util.formatDate(new Date(date.setDate(date.getDate() + 30))),
    });
    this.fetchServiceNumber();
    wx.showShareMenu({
      withShareTicket: true,
    });
    this.analyticPageView('e_page_view');
    setTimeout(() => {
      this.data.ePageViewFlag = true;
    }, 500);
  },

  onShow: function () {
    if (wx.getStorageSync('special_car')) {
      this.data.opType = wx.getStorageSync('special_car');
      wx.clearStorageSync('special_car');
    }
    let num2 = 827;
    let n2 = new NumberAnimate({
      from: num2,
      speed: 1500,
      decimals: 0,
      refreshTime: 100,
      onUpdate: () => {
        this.setData({
          num2: n2.tempValue,
        });
      },
    });
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
      fromPage: 'p_reservation_car_see_house',
    };
  },

  fetchServiceNumber: function () {
    var _this = this;
    app.request('/v1/user/contract-car', {}).then((res) => {
      _this.setData({
        serviceNum: res.data.total_people,
        imageName: res.data.banner ? res.data.banner.banner_src : '',
      });
    });
  },

  didClickSelectSex: function (e) {
    var index = e.currentTarget.dataset.index;
    this.setData({
      sexSelected: index,
    });

    var analyticProperties = this.analyticProperties();
    analyticProperties.fromItem = 'i_sex';
    analyticProperties.fromItemIndex = String(index);
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.sex = String(index);
    analytic.sensors.track('e_click_sex', analyticProperties);
  },

  onDateChange: function (e) {
    this.setData({
      timeSelected: e.detail.value,
    });

    var analyticProperties = this.analyticProperties();
    analyticProperties.fromItem = 'i_confirm';
    analyticProperties.toPage = analyticProperties.fromPage;
    analytic.sensors.track('e_click_time_confirm', analyticProperties);
  },

  onDateCancel: function () {
    var analyticProperties = this.analyticProperties();
    analyticProperties.fromItem = 'i_cancel';
    analyticProperties.toPage = analyticProperties.fromPage;
    analytic.sensors.track('e_click_cancel', analyticProperties);
  },

  inputProjectNameChange: function (e) {
    var text = e.detail.value;
    this.setData({
      projectName: text,
    });
  },

  didClickSubmitButton: function (e) {
    var toModule = 'm_login_window';
    if (app.commonData.user.userId) {
      this.makeOrder();
      toModule = 'm_leave_phone_success_window';
    } else {
      this.setData({
        showLoginModal: true,
        userInfo: {
          source: '154',
          op_type: this.data.opType,
          sex: String(this.data.sexSelected),
        },
      });
    }

    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.toModule = toModule;
    analyticProperties.fromItem = 'i_leave_phone_entry';
    analyticProperties.op_type = this.data.opType;
    analyticProperties.source = '154';
    analyticProperties.see_house_time = this.data.timeSelected;
    analyticProperties.sex = String(this.data.sexSelected);
    analyticProperties.fromItemIndex = String(this.data.sexSelected);
    analyticProperties.input_keyword = this.data.projectName;
    analytic.sensors.track('e_click_leave_phone_entry', analyticProperties);

    if (this.data.projectName.length > 0) {
      var analyticProperties = this.analyticProperties();
      analyticProperties.fromItem = 'i_user_input_attention_project';
      analyticProperties.toPage = analyticProperties.fromPage;
      analyticProperties.search_keyword = this.data.projectName;
      analytic.sensors.track(
        'e_click_search_attention_project',
        analyticProperties
      );
    }
  },

  loginSuccessCallback() {
    this.makeOrder();
  },

  hideModalCallback() {},

  confirmCallback() {},

  makeOrder() {
    var _this = this;
    wx.showLoading({
      title: '预约中...',
    });
    var extraParameters = {};
    if (this.data.timeSelected.length > 0) {
      extraParameters.order_datetime = this.data.timeSelected;
    }
    if (this.data.projectName.length > 0) {
      extraParameters.app_help_special = this.data.projectName;
    }
    extraParameters.sex = this.data.sexSelected;
    order.makeOrder(
      {
        source: '154',
        op_type: this.data.opType,
        require: extraParameters,
      },
      {
        sex: String(this.data.sexSelected),
        input_keyword: this.data.projectName,
      },
      function () {
        wx.hideLoading();
        _this.setData({
          showOrderSuccessAlert: true,
        });
      }
    );
  },

  onShareAppMessage() {
    return {
      title: '985 211咨询师全程讲解，专车看房，全免费！',
      path: '/otherRelateSubPK/pages/specialCar/specialCar',
      complete(res) {
        // share result
        var transpond_result = '2';
        if (res.errMsg === 'shareAppMessage:ok') {
          transpond_result = '1';
        }
        // share type
        var transpond_differentiate = '1';
        if (res.shareTickets && res.shareTickets.length > 0) {
          transpond_differentiate = '2';
        }

        var analyticProperties = {};
        analyticProperties.fromPage = 'p_reservation_car_see_house';
        analyticProperties.fromItem = 'i_transpond';
        analyticProperties.transpond_result = transpond_result;
        analyticProperties.transpond_differentiate = transpond_differentiate;
        analytic.sensors.track('e_click_transpond', analyticProperties);
      },
    };
  },
});
