const app = getApp();
const analytic = require('../../../analytic/analytic.js');
const order = require('../../../order/order.js');
const bmksearch = require('../../../utils/bmksearch/bmksearch.js');
const coordtransform = require('../../../utils/coordtransform.js');
const tool = require('../../../utils/util.js');

Page({
  data: {
    loadingHidden: false,
    projectId: '',
    review: {},
    markers: [],
    optionsList: [
      {
        name: '交通',
        key: 'traffic',
        isExpand: false,
      },
      {
        name: '生活',
        key: 'life',
        isExpand: false,
      },
      {
        name: '医疗',
        key: 'hospital',
        isExpand: false,
      },
      {
        name: '学校',
        key: 'school',
        isExpand: false,
      },
    ],
    currentTabIndex: 0,
    isIpx: false,
    ePageViewFlag: false,
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

  onLoad: function (options) {
    var projectId = '';
    var currentTabIndex = 0;
    if (options && options.q) {
      var url = decodeURIComponent(options.q);
      var query = tool.parseQueryString(url);
      if (query) {
        projectId = query.project_id;
      }
    } else {
      projectId = options.projectId;
      if (options.index) {
        currentTabIndex = options.index;
      }
    }
    if (projectId != null && projectId.length > 0) {
      var selectOption = this.data.optionsList[currentTabIndex];
      var values = [];
      this.data.optionsList.forEach((item) => {
        var option = item.key;
        let mapresult = [];
        if(bmksearch.getMarkerData() && bmksearch.getMarkerData()[option]){
          mapresult = bmksearch.getMarkerData()[option]['wxMarkerData'] || [];
        }
        item.count = mapresult.length;
        values.push(item);
      });

      let markers = [];
      if(bmksearch.getMarkerData() && bmksearch.getMarkerData()[selectOption.key]){
        markers = bmksearch.getMarkerData()[selectOption.key]['wxMarkerData']
      }
      this.setData({
        projectId: projectId,
        markers,
        optionsList: values,
        currentTabIndex: currentTabIndex,
        loadingHidden: false,
        userInfo: { project_id: projectId, periphery_type: '2' },
      });
      this.fetchNearbyAnalytic();
      this.analyticPageView('e_page_view');
      setTimeout(() => {
        this.data.ePageViewFlag = true;
      }, 500);
    }
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
    analyticProperties.project_id = this.data.projectId;
    analytic.sensors.track(eventName, analyticProperties);
  },

  regionchange(e) {
    console.log(e.type);
  },

  markertap(e) {
    console.log(e.markerId);
  },

  controltap(e) {
    console.log(e.controlId);
  },

  fetchNearbyAnalytic: function () {
    var _this = this;
    app
      .request('/v1/project/su', {
        project_id: _this.data.projectId,
      })
      .then((d) => {
        var data = d.data;
        if (
          data != undefined &&
          data.area_review != undefined &&
          data.area_review.bench_employee_info != undefined
        ) {
          data.area_review.employee_info = data.area_review.bench_employee_info;
        }
        if (data.info.lat && data.info.lng) {
          let { lng, lat } = coordtransform.bd09togcj02(
            data.info.lng,
            data.info.lat
          );
          data.info.lat = lat;
          data.info.lng = lng;
        }
        _this.setData({
          loadingHidden: true,
          review: data.area_review ? data.area_review : {},
          info: data.info ? data.info : {},
          nearProjectList: data.near_project_list ? data.near_project_list : [],
          realtiveProjectList: data.realtive_project
            ? data.realtive_project
            : [],
        });
        wx.stopPullDownRefresh();
      })
      .catch((e) => {
        wx.stopPullDownRefresh();
        _this.setData({
          loadingHidden: true,
        });
      });
  },

  tabChange: function (e) {
    var index = e.currentTarget.dataset.index;
    var item = e.currentTarget.dataset.item;
    if (index == this.data.currentTabIndex) return;
    var keys = ['traffic', 'life', 'hospital', 'school'];
    
    let markers = [];
    if(bmksearch.getMarkerData() && bmksearch.getMarkerData()[keys[index]]){
      markers = bmksearch.getMarkerData()[keys[index]]['wxMarkerData'];
    }
    this.setData({
      currentTabIndex: index,
      markers,
      userInfo: {
        project_id: this.data.projectId,
        periphery_type: String(index + 2),
      },
    });

    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.fromItem = 'i_surrounding_analysis_tag';
    analyticProperties.fromModule = 'm_surrounding_analysis';
    analyticProperties.project_id = this.data.projectId;
    analyticProperties.periphery_type = String(index + 2);
    analytic.sensors.track(
      'e_click_surrounding_analysis_tag',
      analyticProperties
    );
  },

  didTapExpand: function (e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.optionsList;
    var option = list[index];
    option.isExpand = !option.isExpand;

    this.setData({
      optionsList: list,
    });

    var analyticProperties = this.analyticProperties();
    var event = 'e_click_unfold';
    var fromItem = 'i_unfold';
    if (!option.isExpand) {
      event = 'e_click_fold';
      fromItem = 'i_fold';
    }
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.fromItem = fromItem;
    analyticProperties.fromModule = 'm_surrounding_analysis';
    analyticProperties.project_id = this.data.projectId;
    analyticProperties.adviser_id = this.data.review.employee_info.employee_id;
    analytic.sensors.track(event, analyticProperties);
  },

  didTapEmployeeReviewExpand: function (e) {
    var review = e.currentTarget.dataset.review;
    review.isExpand = !review.isExpand;
    this.setData({
      review: review,
    });

    var analyticProperties = this.analyticProperties();
    var event = 'e_click_unfold';
    var fromItem = 'i_unfold';
    if (!review.isExpand) {
      event = 'e_click_fold';
      fromItem = 'i_fold';
    }
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.fromItem = fromItem;
    analyticProperties.fromModule = 'm_adviser_comment';
    analyticProperties.project_id = this.data.projectId;
    analyticProperties.adviser_id = review.employee_info.employee_id;
    analytic.sensors.track(event, analyticProperties);
  },

  didTapMap: function () {
    wx.navigateTo({
      url:
        '../nearbyMap/nearbyMap?projectId=' +
        this.data.projectId +
        '&lat=' +
        this.data.info.lat +
        '&lng=' +
        this.data.info.lng +
        '&address=' +
        this.data.info.address +
        '&projectName=' +
        this.data.info.name,
    });

    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = 'p_surrounding_analysis_map';
    analyticProperties.fromItem = 'i_map';
    analyticProperties.fromModule = 'm_surrounding_analysis';
    analyticProperties.project_id = this.data.projectId;
    analyticProperties.periphery_type = String(this.data.currentTabIndex + 2);
    analytic.sensors.track('e_click_map', analyticProperties);
  },

  didTapConsultButton: function (e) {
    var employeeId = e.currentTarget.dataset.employeeId;
    var toModule = '';
    this.setData({
      loginUserInfo: {
        source: '156',
        op_type: '900130',
        project_id: this.data.projectId,
        adviser_id: employeeId,
      },
    });
    if (app.commonData.user.userId) {
      this.makeOrder();
      toModule = 'm_leave_phone_success_window';
    } else {
      toModule = 'm_login_window';
      this.setData({
        showLoginModal: true,
      });
    }

    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.fromItem = 'i_leave_phone_entry';
    analyticProperties.fromModule = 'm_adviser_comment';
    analyticProperties.project_id = this.data.projectId;
    analyticProperties.adviser_id = employeeId;
    analyticProperties.toModule = toModule;
    analyticProperties.op_type = '900130';
    analyticProperties.source = '156';
    analytic.sensors.track('e_click_leave_phone_entry', analyticProperties);
  },

  loginSuccessCallback: function () {
    this.setData({
      showLoginModal: false,
    });
    this.makeOrder();
  },

  cancelCallback: function () {
    this.setData({
      showLoginModal: false,
      showContact: false,
      showAlert: false,
    });
  },

  showLoginCallback: function () {
    this.setData({
      showContact: true,
    });
  },

  showAlertCallback: function () {
    this.setData({
      showAlert: true,
    });
  },

  makeOrder: function () {
    // 向他咨询按钮
    wx.showLoading({
      title: '预约中...',
    });
    var _this = this;
    order.makeOrder(
      {
        project_id: this.data.projectId,
        source: '156',
        op_type: '900130',
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

  didTapProjectCellView: function (e) {
    var index = e.currentTarget.dataset.index;
    var projectId = e.currentTarget.dataset.id;
    var block = e.currentTarget.dataset.module;
    wx.navigateTo({
      url: `/pages/web/web?url=${getApp().commonData.m_domain_project}${projectId}.html`
    });
    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = 'p_project_details';
    analyticProperties.fromItem = 'i_project_card';
    analyticProperties.fromModule = block;
    analyticProperties.project_id = projectId;
    analyticProperties.to_project_id = projectId;
    analyticProperties.fromItemIndex = String(index);
    analytic.sensors.track('e_click_project_card', analyticProperties);
  },

  analyticProperties() {
    return {
      fromPage: 'p_surrounding_analysis',
    };
  },
});
