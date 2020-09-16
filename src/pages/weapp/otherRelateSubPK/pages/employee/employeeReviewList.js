const app = getApp();
const order = require('../../../order/order.js');
const analytic = require('../../../analytic/analytic.js');

Page({
  data: {
    projectId: '',
    projectName: '',
    reviewList: [],
    loadingHidden: false,
    page: 1,
    hasMore: false,
    isIpx: app.globalData.isIpx,
    ePageViewFlag: false,
  },

  onLoad: function (options) {
    var projectId = options.projectId ? options.projectId : '';
    this.setData({
      projectId: projectId,
      userInfo: { project_id: projectId },
    });
    this.fetchReviewList(true);
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
    analyticProperties.toPage = analyticProperties.fromPage;
    analytic.sensors.track(eventName, analyticProperties);
  },

  analyticProperties: function () {
    return {
      fromPage: 'p_project_adviser_comment',
      project_id: this.data.projectId,
    };
  },

  onReachBottom: function () {
    if (this.data.hasMore) {
      this.fetchReviewList(false);
    }
  },

  didTapEmployeeReviewExpand: function (e) {
    var review = e.currentTarget.dataset.review;
    var index = e.currentTarget.dataset.index;

    // 当前是展开状态，即‘点击收起’
    if (review.isExpand) {
      analytic.sensors.track('e_click_fold', {
        fromPage: 'p_project_adviser_comment',
        toPage: 'p_project_adviser_comment',
        fromModule: 'm_adviser_card',
        fromItem: 'i_fold',
        fromItemIndex: String(index),
        adviser_id: review.employee_id,
        project_id: review.project_id,
      });
    } else {
      // ‘点击展开’
      analytic.sensors.track('e_click_unfold', {
        fromPage: 'p_project_adviser_comment',
        toPage: 'p_project_adviser_comment',
        fromModule: 'm_adviser_card',
        fromItem: 'i_unfold',
        fromItemIndex: String(index),
        adviser_id: review.employee_id,
        project_id: review.project_id,
      });
    }

    review.isExpand = !review.isExpand;
    var item = this.data.reviewList[index];
    item.isExpand = review.isExpand;
    this.setData({
      reviewList: this.data.reviewList,
    });
  },

  didTapPreviewImage: function (e) {
    var images = e.currentTarget.dataset.images;
    var index = e.currentTarget.dataset.imageIndex;
    wx.previewImage({
      urls: images,
      current: images[index],
    });
  },

  fetchReviewList: function (isRefresh) {
    var _this = this;
    var isLoadMore = _this.data.isHideLoadMore;
    var pageNum = _this.data.page;
    if (isRefresh) {
      pageNum = 1;
    } else {
      pageNum++;
    }
    app
      .request('/v1/project/review', {
        project_id: _this.data.projectId,
        page: pageNum,
      })
      .then((d) => {
        var data = d.data;
        var list = data.list;
        for (var index = 0; index < list.length; index++) {
          var item = list[index];
          item.isExpand = false;
        }
        _this.setData({
          reviewList: isRefresh ? list : _this.data.reviewList.concat(list),
          loadingHidden: true,
          hasMore: d.data.has_more == 1,
        });
        wx.stopPullDownRefresh();
      })
      .catch((error) => {
        console.log(error);
        wx.stopPullDownRefresh();
      });
  },

  didTapConsultButton: function (e) {
    var adviserId = e.currentTarget.dataset.adviserId;
    var toModule = '';
    if (app.commonData.user.userId) {
      this.makeOrder();
      toModule = 'm_leave_phone_success_window';
    } else {
      this.setData({
        showLoginModal: true,
        loginUserInfo: {
          project_id: this.data.projectId,
          source: '156',
          op_type: '900081',
          adviser_id: adviserId,
        },
      });
      toModule = 'm_login_window';
    }

    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.source = '156';
    analyticProperties.op_type = '900081';
    analyticProperties.adviser_id = adviserId;
    analyticProperties.toModule = toModule;
    analyticProperties.fromItem = 'i_leave_phone_entry';
    analytic.sensors.track('e_click_leave_phone_entry', analyticProperties);
  },

  loginSuccessCallback: function () {
    this.makeOrder();
  },

  makeOrder: function () {
    // 点评列表向他咨询
    wx.showLoading({
      title: '预约中...',
    });
    var _this = this;
    order.makeOrder(
      {
        project_id: this.data.projectId,
        source: '156',
        op_type: '900081',
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

  onShareAppMessage: function () {
    return {
      title: '专业咨询师点评楼盘，不容错过',
      path:
        '/otherRelateSubPK/pages/employee/employeeReviewList?projectId=' +
        this.data.projectId,
    };
  },
});
