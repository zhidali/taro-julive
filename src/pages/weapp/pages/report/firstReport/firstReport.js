const app = getApp();
const route = require('../../../route/route.js');
var WxParse = require('../../../utils/wxParse/wxParse.js');
var tool = require('../../../utils/util.js');
var analytic = require('../../../analytic/analytic.js');

var scrollOffset = 0;

Page({
  data: {
    source: 3,
    reportId: '',
    report: {},
    loadingHidden: false,
    flowTabWidth: 85,
    flowActiveIndex: 0,
    report: {},
    currentServiceIntroduceIndex: 0,
    currentQuestionIndex: 0,
    currentDistrictIndex: 0,
    serviceIntroduceList: [
      'service-introduce-1',
      'service-introduce-2',
      'service-introduce-3',
    ],
    startViewTime: 0,
    ePageViewFlag: false,
    is_virtual_city: false, //是否是虚拟城市
  },

  onLoad: function (options) {
    wx.hideShareMenu();
    var scene = options.scene;
    var source = 3;
    var businessId = '';
    if (scene) {
      scene = decodeURIComponent(scene);
      var params = scene.split(',');
      businessId = params[0];
      var s = params[1];
      businessId = businessId.split('_')[1];
      source = s.split('_')[1];
    } else {
      businessId = options.businessId ? options.businessId : '';
      source = options.s ? options.s : 3;
    }
    this.setData({
      reportId: businessId,
      source: source,
    });
    if (businessId) {
      this.fetchReportDetail();
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
    analyticProperties.toPage = 'p_report_first_details';
    analyticProperties.page_soure = 'miniprogram';
    analytic.sensors.track(eventName, analyticProperties);
  },

  analyticProperties() {
    return {
      fromPage: 'p_report_first_details',
      toPage: 'p_report_first_details',
      report_id: this.data.reportId,
      city_id: this.data.report.city_id,
      open_source: this.data.source,
    };
  },

  fetchReportDetail() {
    var _this = this;
    app
      .request('/v1/talk/first-report', {
        business_id: _this.data.reportId,
      })
      .then((res) => {
        wx.showShareMenu();
        if (res.data.flow.list.length > 0) {
          var windowWidth = 375;
          try {
            windowWidth = wx.getSystemInfoSync().windowWidth;
            _this.setData({
              flowTabWidth: (windowWidth - 125) / res.data.flow.list.length,
            });
          } catch (e) {
            console.error(e);
          }
        }
        res.data.recommend_project.project_list.forEach((item) => {
          WxParse.wxParse('reviewContent', 'html', item.content, _this);
          item.content = _this.data.reviewContent;
        });
        res.data.question.list.forEach((item) => {
          WxParse.wxParse('questionContent', 'html', item.content, _this);
          item.content = _this.data.questionContent;
          item.contentText = tool.parseContent(_this.data.questionContent);
        });
        res.data.district.list.forEach((item) => {
          WxParse.wxParse('districtContent', 'html', item.content, _this);
          item.content = _this.data.districtContent;
          item.contentText = tool.parseContent(_this.data.districtContent);
        });
        res.data.market_case.list.forEach((item) => {
          WxParse.wxParse('marketContent', 'html', item.content, _this);
          item.content = _this.data.marketContent;
          item.contentText = tool.parseContent(_this.data.marketContent);
        });
        res.data.blank_module.forEach((item) => {
          WxParse.wxParse('blankContent', 'html', item.content, _this);
          item.contentText = tool.parseContent(_this.data.blankContent);
        });
        _this.setData({
            report: res.data,
            loadingHidden: true,
            is_virtual_city: res.data.is_virtual_city == 1 ? true : false,
          },
          () => {
            _this.analyticPageView('e_page_view');
          }
        );
      })
      .catch((e) => {
        console.error(e);
      });
  },

  didClickFlowTitle: function () {
    route.transfer(this.data.report.flow.url);
    // analytic
    analytic.sensors.track('e_click_flow_describe', {
      fromPage: 'p_report_first_details',
      report_id: this.data.reportId,
      city_id: app.commonData.city.city_id,
    });
  },

  didClickFlowTabItem: function (e) {
    var index = e.currentTarget.dataset.index;
    this.setData({
      flowActiveIndex: index,
    });
  },

  didClickServiceIntroduce: function () {
    route.transfer(this.data.report.detailserver);

    // analytic
    analytic.sensors.track(
      'e_click_service_describe',
      this.analyticProperties()
    );
  },

  didClickPayItem: function () {
    // analytic
    analytic.sensors.track('e_click_reward_entry', this.analyticProperties());

    var _this = this;
    wx.showLoading({
      title: '打赏中...',
    });
    app
      .request('/v1/reward/index', {
        money: 9.9,
        order_id: this.data.report.order_id,
        employee_id: this.data.report.employee.id,
        nick_name: '', // 现在没有获取用户的信息
        from_url: 'pages/report/firstReport/firstReport',
        business_id: this.data.report.business_id,
        business_type: 'FirstReport',
      })
      .then((res) => {
        var payload = res.data.res;
        payload.success = () => {
          wx.hideLoading();
          wx.showToast({
            title: '打赏成功',
            icon: 'success',
            duration: 1500,
          });

          // analytic
          var analyticProperties = _this.analyticProperties();
          analyticProperties.employee_id = _this.data.report.employee.id;
          analyticProperties.reward_money = String(res.data.money);
          analytic.sensors.track('e_pay_success', analyticProperties);
        };
        payload.fail = ({
          errMsg
        }) => {
          wx.hideLoading();
          if (errMsg == 'requestPayment:fail cancel') {
            wx.showToast({
              title: '您已取消支付',
              icon: 'none',
            });
          } else {
            wx.showToast({
              title: errMsg,
              icon: 'none',
            });
          }
        };
        wx.requestPayment(payload);
      })
      .catch((e) => {
        wx.hideLoading();
        console.error(e);
      });
  },

  onServiceSwiperChange: function (e) {
    this.setData({
      currentServiceIntroduceIndex: e.detail.current,
    });

    // analytic
    analytic.sensors.track('e_slide_daikan_card', this.analyticProperties());
  },

  onQuestionSwiperChange: function (e) {
    this.setData({
      currentQuestionIndex: e.detail.current,
    });

    // analytic
    analytic.sensors.track('e_slide_q_card', this.analyticProperties());
  },

  didClickQuestion: function (e) {
    this.popViewWillShow();
    var questiton = e.currentTarget.dataset.question;
    this.setData({
      showBlockDetail: true,
      blockTitle: this.data.report.question.title,
      title: questiton.title,
      content: questiton.content,
      downloadList: questiton.attachment,
    });
    // analytic
    var analyticsProperties = this.analyticProperties();
    analyticsProperties.q_type = questiton.color === 1 ? 'mine' : 'hot';
    analytic.sensors.track('e_click_q_card', analyticsProperties);
  },

  didClickQuestionMore: function (e) {
    route.transfer(this.data.report.question.url);
    // analytic
    analytic.sensors.track('e_click_more_q', this.analyticProperties());
  },

  didClickDistrict: function (e) {
    this.popViewWillShow();
    var district = e.currentTarget.dataset.district;
    this.setData({
      showBlockDetail: true,
      blockTitle: this.data.report.district.title,
      title: district.district_name,
      content: district.content,
      downloadList: [],
    });
    // analytic
    analytic.sensors.track('e_click_area_card', this.analyticProperties());
  },

  onDistrictSwiperChange: function (e) {
    this.setData({
      currentDistrictIndex: e.detail.current,
    });
    // analytic
    analytic.sensors.track('e_slide_area_card', this.analyticProperties());
  },

  didClickProjectMore: function (e) {
    route.transfer(this.data.report.recommend_project.url);

    // analytic
    var analyticProperties = this.analyticProperties();
    analyticProperties.fromItem = 'i_view_more_project';
    analyticProperties.toPage = '';
    analyticProperties.to_url = this.data.report.recommend_project.url;
    analytic.sensors.track('e_click_view_more_project', analyticProperties);
  },

  didClickMarketCaseMore: function (e) {
    route.transfer(this.data.report.market_case.url);

    // analytic
    analytic.sensors.track('e_click_more_market', this.analyticProperties());
  },

  didClickMarketCase: function (e) {
    this.popViewWillShow();
    var marketCase = e.currentTarget.dataset.marketCase;
    this.setData({
      showBlockDetail: true,
      blockTitle: this.data.report.market_case.title,
      title: marketCase.name,
      content: marketCase.content,
      downloadList: [],
    });

    // analytic
    analytic.sensors.track('e_click_market', this.analyticProperties());
  },

  closePopViewCallback: function (e) {
    this.setData({
      showBlockDetail: false,
    });

    wx.pageScrollTo({
      scrollTop: scrollOffset,
      duration: 0,
    });
    scrollOffset = 0;
  },

  popViewWillShow: function (e) {
    var query = wx.createSelectorQuery().in(this);
    query.select('.container').boundingClientRect();
    query
      .selectViewport()
      .scrollOffset((res) => {
        scrollOffset = res.scrollTop;
      })
      .exec();
  },

  didTapProjectCellView: function (e) {
    let _id = e.currentTarget.dataset.id;
    let _url = e.currentTarget.dataset.url;
    let _index = e.currentTarget.dataset.index;
    if (this.data.is_virtual_city && _url !== '') {
      wx.navigateTo({
        url: '/pages/web/web?url=' + encodeURIComponent(_url),
      });
    } else {
      wx.navigateTo({
        url: '../../project/detail/projectDetail?projectId=' + _id,
      });
    }
    // analytic
    var analyticProperties = this.analyticProperties();
    analyticProperties.project_id = _id;
    analyticProperties.fromModule = 'm_recommend_project';
    analyticProperties.fromItem = 'i_project_card';
    analyticProperties.fromItemIndex = String(_index);
    analyticProperties.toPage =
      this.data.is_virtual_city && _url !== '' ?
      'p_webview' :
      'p_project_details';
    if (this.data.is_virtual_city && _url !== '') {
      analyticProperties.to_url = _url;
    }
    analytic.sensors.track('e_click_project_card', analyticProperties);
  },

  didClickJuliveIntroduceButton: function () {
    route.transfer('https://m.julive.com/topic/julizhengtifuwu/preview.html');

    // analytic
    analytic.sensors.track(
      'e_click_flow_describe_end',
      this.analyticProperties()
    );
  },

  onShareAppMessage: function () {
    var _this = this;
    return {
      title: this.data.report.share.title,
      path: 'pages/report/firstReport/firstReport?businessId=' +
        this.data.reportId +
        '&s=3',
      imageUrl: this.data.report.share.img,
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

        var analyticProperties = _this.analyticProperties();
        analyticProperties.fromItem = 'i_transpond';
        analyticProperties.transpond_result = transpond_result;
        analyticProperties.transpond_differentiate = transpond_differentiate;
        analytic.sensors.track('e_click_transpond', analyticProperties);
      },
    };
  },
});