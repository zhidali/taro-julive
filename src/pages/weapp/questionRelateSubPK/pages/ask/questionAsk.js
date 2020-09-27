const app = getApp();
var analytic = require('../../../analytic/analytic.js');
// const enviroment = require('../../../enviroment/enviroment.js');

Page({
  data: {
    loadingHidden: false,
    projectId: '',
    employeeId: '',
    employee: {},
    questionText: '',
    isPop: false,
    startViewTime: 0,
    opType: '',
    clickModule: '',
    ePageViewFlag: false,
    userLoginStatus: true,
  },

  onLoad: function (options) {
    var employeeId = options.employeeId;
    var projectId = options.projectId ? options.projectId : '';
    if (options.op_type != undefined && options.op_type.length > 0) {
      this.setData({
        opType: options.op_type,
      });
    }
    if (employeeId != undefined && employeeId.length > 0) {
      this.setData({
        employeeId: employeeId,
        projectId: projectId,
        loginUserInfo: { fromPage: 'p_ask_adviser', adviser_id: employeeId },
      });
      this.fetchEmployee();
    } else {
      this.setData({
        loadingHidden: true,
        projectId: projectId,
        loginUserInfo: { fromPage: 'p_ask_someone' },
      });
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
    this.setData({
      userLoginStatus: app.commonData.user.userId ? true : false,
    });
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
    if (this.data.employeeId) {
      analyticProperties.fromPage = 'p_ask_adviser';
      analyticProperties.adviser_id = this.data.employeeId;
    }
    analyticProperties.toPage = analyticProperties.fromPage;
    analytic.sensors.track(eventName, analyticProperties);
  },

  analyticProperties() {
    return {
      fromPage: 'p_ask_someone',
    };
  },

  fetchEmployee: function () {
    var _this = this;
    app
      .request('/v1/qa/put-qa', {
        employee_id: _this.data.employeeId,
        project_id: _this.data.projectId,
      })
      .then((d) => {
        _this.setData({
          employee: d.data.employee_info,
          loadingHidden: true,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  },

  inputQuestionChange: function (e) {
    this.setData({
      questionText: e.detail.value,
    });
  },

  didClickQuicklyConsultButton: function () {
    var fromPage = 'p_ask_someone';
    if (this.data.employeeId) {
      fromPage = 'p_ask_adviser';
    }
    var loginUserInfo = {};
    loginUserInfo.fromPage = fromPage;
    if (this.data.employeeId) {
      loginUserInfo.adviser_id = this.data.employeeId;
    }
    this.setData({
      loginUserInfo: loginUserInfo,
      clickModule: 'm_order_advise',
      opType: '900211',
    });
    if (app.commonData.user.userId) {
      this.submitQuestion();
    }
    // analytic
    var analyticProperties = this.analyticProperties();
    if (this.data.employeeId) {
      analyticProperties.fromPage = 'p_ask_adviser';
    }
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.fromItem = 'i_order_adviser';
    if (this.data.employeeId) {
      analyticProperties.adviser_id = this.data.employeeId;
    }
    if (this.data.projectId) {
      analyticProperties.project_id = this.data.projectId;
    }
    analytic.sensors.track('e_click_order_adviser', analyticProperties);

    //加上留电的埋点
    this.orderAnalytic();
  },

  didClickSubmitQuestionButton: function () {
    var fromPage = 'p_ask_someone';
    if (this.data.employeeId) {
      fromPage = 'p_ask_adviser';
    }
    var loginUserInfo = {};
    loginUserInfo.fromPage = fromPage;
    if (this.data.employeeId) {
      loginUserInfo.adviser_id = this.data.employeeId;
    }
    loginUserInfo.query = this.data.questionText;
    this.setData({
      loginUserInfo: loginUserInfo,
      clickModule: 'm_submit_qa',
      opType: '900074',
    });
    if (app.commonData.user.userId) {
      this.submitQuestion(this.data.questionText);
    }

    var analyticProperties = this.analyticProperties();
    if (this.data.employeeId) {
      analyticProperties.fromPage = 'p_ask_adviser';
    }
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.fromItem = 'i_submit_question';
    if (this.data.employeeId) {
      analyticProperties.adviser_id = this.data.employeeId;
    }
    if (this.data.projectId) {
      analyticProperties.project_id = this.data.projectId;
    }
    analyticProperties.query = this.data.questionText;
    analytic.sensors.track('e_click_submit_question', analyticProperties);
    //加上留电的埋点
    this.orderAnalytic();
  },

  orderAnalytic() {
    var orderAnalyticProperties = this.analyticProperties();
    if (this.data.employeeId) {
      orderAnalyticProperties.fromPage = 'p_ask_adviser';
    }
    orderAnalyticProperties.toPage = orderAnalyticProperties.fromPage;
    orderAnalyticProperties.fromModule = this.data.clickModule;
    orderAnalyticProperties.fromItem = 'i_leave_phone_entry';
    orderAnalyticProperties.login_state = app.commonData.user.userId ? '1' : '2';
    if (this.data.employeeId) {
      orderAnalyticProperties.adviser_id = this.data.employeeId;
    }
    if (this.data.projectId) {
      orderAnalyticProperties.project_id = this.data.projectId;
    }

    orderAnalyticProperties.op_type = this.data.opType;
    analytic.sensors.track(
      'e_click_leave_phone_entry',
      orderAnalyticProperties
    );
  },

  orderSuccessAnalytic(leavePhoneState, order_id = -1, business_type) {
    var orderAnalyticProperties = this.analyticProperties();
    if (this.data.employeeId) {
      orderAnalyticProperties.fromPage = 'p_ask_adviser';
    }
    orderAnalyticProperties.toPage = orderAnalyticProperties.fromPage;
    orderAnalyticProperties.fromModule = this.data.clickModule;
    orderAnalyticProperties.fromItem = 'i_confirm_leave_phone';
    orderAnalyticProperties.leave_phone_state = leavePhoneState;
    if (this.data.employeeId) {
      orderAnalyticProperties.adviser_id = this.data.employeeId;
    }
    if (this.data.projectId) {
      orderAnalyticProperties.project_id = this.data.projectId;
    }
    orderAnalyticProperties.op_type = this.data.opType;
    orderAnalyticProperties.order_id = order_id;
    orderAnalyticProperties.business_type = business_type;
    analytic.sensors.track(
      'e_click_confirm_leave_phone',
      orderAnalyticProperties
    );
  },

  loginSuccessCallback: function () {
    this.submitQuestion(this.data.questionText);
  },

  cancelCallback: function () {
    this.setData({
      isPop: false,
      showLoginModal: false,
    });
  },

  confirmCallback: function () {
    this.setData({
      isPop: false,
      showSuccessAlert: false,
    });
    wx.navigateBack({
      delta: 1,
    });
  },

  submitQuestion: function (question = '') {
    wx.showLoading({
      title: '提交中...',
    });
    var _this = this;
    var parameters = {};
    if (question.length > 0) {
      parameters.question = question;
    }
    parameters.channel_id = app.commonData.channel.channel_id;
    if (this.data.employeeId.length > 0) {
      parameters.employee_id = this.data.employeeId;
    }
    if (this.data.projectId.length > 0) {
      parameters.project_id = this.data.projectId;
    }
    parameters.op_type = this.data.opType;
    parameters.source = '157';
    var pages = getCurrentPages(); //获取加载的页面
    var currentPage = pages[pages.length - 1]; //获取当前页面的对象
    var _url = currentPage.route;

    // const gdtId = enviroment.getGDTId();
    const gdtId = app.enviroment.gdt_vid;
    if (gdtId && gdtId.length > 0) {
      parameters.wx_ad_click_id = gdtId;
      parameters.url = _url;
    }
    app
      .request('/v1/qa/ask', parameters)
      .then((d) => {
        _this.setData({
          isPop: true,
          showSuccessAlert: true,
          alertContent:
            _this.data.employeeId.length > 0
              ? '居理正在努力帮您召唤咨询师' +
                this.data.employee.employee_name +
                '...'
              : '居理正在努力帮您召唤咨询师...',
        });
        wx.hideLoading();
        let order_id = d.data.order_id || 0;
        let business_type = d.data.business_type || '';
        _this.orderSuccessAnalytic('1', order_id, business_type);
      })
      .catch((e) => {
        console.log(e);
        wx.hideLoading();
        _this.orderSuccessAnalytic('2');
      });
  },
  // 实验B的留电登录调微信登录逻辑
  passBackGetPhoneNumberBtn(e) {
    let _markOpType = e.detail.markOpType;
    let loginUserInfo = {};
    loginUserInfo.fromPage = this.data.employeeId
      ? 'p_ask_adviser'
      : 'p_ask_someone';
    if (this.data.employeeId) {
      loginUserInfo.adviser_id = this.data.employeeId;
    }
    loginUserInfo.query = this.data.questionText;
    this.setData({
      loginUserInfo: loginUserInfo,
      clickModule: _markOpType == '900074' ? 'm_submit_qa' : 'm_order_advise',
      opType: _markOpType,
    });
    this.orderAnalytic();
  },
  passBackFastLoginCallBack(e) {
    if (e.detail.loginStatus) {
      this.submitQuestion();
      this.setData({
        userLoginStatus: true,
      });
    }
  },
});
