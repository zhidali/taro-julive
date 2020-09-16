const app = getApp();
const analytic = require('../../analytic/analytic.js');
var tool = require('../../utils/util.js');

Page({
  data: {
    tabList: ['楼市资讯', '买房问问', '楼盘动态'],
    tabCurrentIndex: 0,
    scrollTop: 0,
    ePageViewFlag: false,
    projectId: '', //投放会投放某个楼盘的问问列表页面，需要projectId，组件中传参
  },
  onLoad(options) {
    //订阅的服务通知，点击跳转到楼盘动态页面
    if (options && options.index) {
      app.globalData.informationPageIndex = options.index;
    }
    var projectId = '';
    if (options && options.q) {
      var url = decodeURIComponent(options.q);
      var query = tool.parseQueryString(url);
      if (query) {
        projectId = query.project_id;
      }
    } else {
      projectId = options.projectId ? options.projectId : '';
    }

    this.setData({
      projectId: projectId,
      tabCurrentIndex: app.globalData.informationPageIndex,
    });
    setTimeout(() => {
      this.data.ePageViewFlag = true;
    }, 500);
  },
  onShow() {
    this.setData({
      tabCurrentIndex: app.globalData.informationPageIndex,
    });
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0,
    });
    this.analyticPageView('e_page_view');
    this.data.startViewTime = Date.parse(new Date());
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
    analytic.sensors.track(eventName, analyticProperties);
  },

  analyticProperties() {
    return {
      fromPage: 'p_julive_info_agency',
    };
  },

  didClickTabChange(e) {
    let _index = e.currentTarget.dataset.index;
    this.setData({
      tabCurrentIndex: _index,
    });
    app.globalData.informationPageIndex = _index;
    analytic.sensors.track('e_click_tab', {
      fromPage: this.analyticProperties().fromPage,
      toPage: this.analyticProperties().fromPage,
      fromItem: 'i_tab tab',
      tab_id: String(_index + 1),
    });
  },

  onPageScroll: function (event, topHeight) {
    if (this.data.tabCurrentIndex == 0) {
      this.selectComponent('#essayModulePage').didPageScroll(event);
    } else if (this.data.tabCurrentIndex == 1) {
      this.selectComponent('#questionAnswerPage').didPageScroll(
        event,
        topHeight
      );
    }
  },

  onReachBottom() {
    if (this.data.tabCurrentIndex == 0) {
      this.selectComponent('#essayModulePage').onPullRefreshMore();
    } else if (this.data.tabCurrentIndex == 1) {
      this.selectComponent('#questionAnswerPage').didReachBottom();
    } else if (this.data.tabCurrentIndex == 2) {
      this.selectComponent('#houseDynamicPage').didReachBottom();
    }
  },

  onShareAppMessage() {
    if (this.data.tabCurrentIndex == 0) {
      if (app.globalData.essayModuleShare.popEssayCard) {
        return {
          title: '这篇好文章分享给你阅读',
          path: '/otherRelateSubPK/pages/essayDetail/detail?essayId=' +
            app.globalData.essayModuleShare.id,
          imageUrl: app.globalData.essayModuleShare.imagePath,
        };
      } else {
        return {
          title: '买房人都爱看的楼市观点',
          path: '/pages/home/home',
        };
      }
    } else if (this.data.tabCurrentIndex == 1) {
      return {
        title: '看看大家都在问哪些问题',
        path: '/pages/home/home',
      };
    } else if (this.data.tabCurrentIndex == 2) {
      if (app.globalData.houseDynamicShare.showPainter) {
        return {
          title: '一手楼盘动态，实时播报',
          path: '/pages/home/home',
          imageUrl: app.globalData.houseDynamicShare.imagePath,
        };
      } else {
        return {
          title: '一手楼盘动态，实时播报',
          path: '/pages/home/home',
        };
      }
    }
  },

  loginSuccessCallback() {
    if (this.data.tabCurrentIndex == 0) {
      this.selectComponent('#essayModulePage').didLoginSuccess();
    } else if (this.data.tabCurrentIndex == 2) {
      this.selectComponent('#houseDynamicPage').didLoginSuccess();
    }
  },
});