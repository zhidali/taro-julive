var analytic = require("../../../analytic/analytic.js");
const app = getApp();

Page({
  data: {
    loadingHidden: false,
    projectId: "",
    projectName: "",
    dynamicList: [],
    screenWidth: 0,
    isIpx: app.globalData.isIpx,
    startViewTime: 0,
    ePageViewFlag: false,
    page: 1, //列表分页
    hasMore: false, //是否有下一页数据

  },

  onLoad: function (options) {
    var screenWidth = wx.getSystemInfoSync().windowWidth;
    if (screenWidth == 0) {
      screenWidth = 375;
    }
    var projectId = options.projectId ? options.projectId : "";
    var projectName = options.projectName ? options.projectName : "";
    this.setData({
      projectId: projectId,
      projectName: projectName,
      screenWidth: screenWidth,
      userInfo: {
        project_id: projectId
      }
    });
    this.fetchDynamicList(true);
    this.analyticPageView("e_page_view");
    setTimeout(() => {
      this.data.ePageViewFlag = true;
    }, 500);
  },

  onShow: function () {
    this.data.startViewTime = Date.parse(new Date());
    if (this.data.ePageViewFlag) {
      this.analyticPageView("e_page_view");
    }
  },

  onHide: function () {
    this.analyticPageView();
  },

  onUnload: function () {
    this.analyticPageView();
  },

  analyticPageView: function (eventName = "e_page_quit") {
    // analytic
    // 以秒为单位,所以除以1000
    var analyticProperties = this.analyticProperties();
    if (eventName != "e_page_view") {
      var viewTime = (Date.parse(new Date()) - this.data.startViewTime) / 1000;
      analyticProperties.view_time = viewTime;
    }
    analyticProperties.project_id = this.data.projectId;
    analyticProperties.toPage = analyticProperties.fromPage;
    analytic.sensors.track(eventName, analyticProperties);
  },

  analyticProperties() {
    return {
      fromPage: "p_project_dynamic"
    };
  },

  fetchDynamicList: function (isRefresh) {
    var _this = this;
    if (isRefresh) {
      this.data.page = 1;
    } else {
      this.data.page++

    }
    app
      .request("/v1/project/news", {
        project_id: _this.data.projectId,
        page: _this.data.page,

      })
      .then(d => {
        let _data = d.data;
        var list = d && d.data.list ? d.data.list : [];
        _this.setData({
          dynamicList: _this.data.dynamicList.concat(list),
          loadingHidden: true,
          hasMore: _data.has_more ? _data.has_more == 1 : false

        });
      })
      .catch(error => {
        console.log(error);
      });
  },

  didTapDynamicItem: function (e) {
    if (e.target.id == "image-container") return;
    var dynamic = e.currentTarget.dataset.dynamic;
    var index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: "/dynamicSubPK/pages/detail/dynamicDetail?dynamicId=" +
        dynamic.id +
        "&type=" +
        dynamic.type +
        "&projectId=" +
        this.data.projectId +
        "&projectName=" +
        this.data.projectName
    });

    // analytic
    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = "p_project_dynamic_details";
    analyticProperties.fromItem = "i_project_dynamic_card ";
    analyticProperties.fromItemIndex = String(index);
    analyticProperties.project_id = this.data.projectId;
    analyticProperties.project_dynamic_id = dynamic.id;
    analytic.sensors.track("e_click_project_dynamic_card", analyticProperties);
  },

  didClickImageContainer: function (e) {
    var imageList = e.currentTarget.dataset.imageList;
    var dynamicId = e.currentTarget.dataset.dynamicId;
    if (imageList.length > 0) {
      var index = e.currentTarget.dataset.index;
      var tapItem = imageList[index];
      wx.previewImage({
        urls: imageList.map(item => {
          return item.img_url;
        }),
        current: tapItem.img_url
      });
    }

    // analytic
    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.fromItem = "i_zoom_in_picture";
    analyticProperties.img_url = imageList[index].img_url;
    analyticProperties.project_id = this.data.projectId;
    analyticProperties.project_dynamic_id = dynamicId;
    analytic.sensors.track("e_click_zoom_in_picture", analyticProperties);
  },

  onShareAppMessage: function () {
    var _this = this;
    return {
      title: _this.data.projectName.length > 0 ?
        _this.data.projectName + "-楼盘近期动态" : "一手楼盘动态，实时播报，不容错过",
      path: "/dynamicSubPK/pages/list/dynamicList?projectId=" + this.data.projectId
    };
  },

  onReachBottom: function () {
    if (this.data.hasMore) {
      this.fetchDynamicList(false);
    }
  },
});