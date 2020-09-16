const app = getApp();
var WxParse = require("../../../utils/wxParse/wxParse.js");
var analytic = require("../../../analytic/analytic.js");

Page({
  data: {
    dynamic: {},
    dynamicHouseTypeList: [],
    hotHouseTypeList: [],
    loadingHidden: false,
    isIpx: app.globalData.isIpx,
    startViewTime: 0,
    ePageViewFlag: false
  },

  onLoad: function(options) {
    var projectId = options.projectId ? options.projectId : "";
    var projectName = options.projectName ? options.projectName : "";
    this.setData({
      projectId: projectId,
      projectName: projectName,
      dynamicId: options.dynamicId,
      type: options.type,
      userInfo: {
        project_id: projectId,
        project_dynamic_id: options.dynamicId
      }
    });
    this.fetchDynamic(options.type, options.dynamicId);
    this.analyticPageView("e_page_view");
    setTimeout(() => {
      this.data.ePageViewFlag = true;
    }, 500);
  },

  onShow: function() {
    this.data.startViewTime = Date.parse(new Date());
    if (this.data.ePageViewFlag) {
      this.analyticPageView("e_page_view");
    }
  },

  onHide: function() {
    this.analyticPageView();
  },

  onUnload: function() {
    this.analyticPageView();
  },

  analyticPageView: function(eventName = "e_page_quit") {
    // analytic
    // 以秒为单位,所以除以1000
    var analyticProperties = this.analyticProperties();
    if (eventName != "e_page_view") {
      var viewTime = (Date.parse(new Date()) - this.data.startViewTime) / 1000;
      analyticProperties.view_time = viewTime;
    }
    analyticProperties.project_id = this.data.projectId;
    analyticProperties.project_dynamic_id = this.data.dynamicId;
    analyticProperties.toPage = analyticProperties.fromPage;
    analytic.sensors.track(eventName, analyticProperties);
  },

  analyticProperties() {
    return {
      fromPage: "p_project_dynamic_details"
    };
  },

  fetchDynamic: function(sourceType, dynamicId) {
    var _this = this;
    if(!dynamicId){
      wx.switchTab({
        url: '/pages/home/home',
      });
      return;
    };
    app
      .request("/v1/project/news-info", {
        id: dynamicId,
        type: sourceType
      })
      .then(d => {
        if (d.code == 0) {
          WxParse.wxParse("content", "html", d.data.info.content, _this);
          d.data.info.content = _this.data.content;
          _this.setData({
            loadingHidden: true,
            dynamic: d.data.info,
            dynamicHouseTypeList: d.data.dynamic_house_type,
            hotHouseTypeList: d.data.hot_house_type
          });
        }
      })
      .catch(error => {
        console.log(error);
      });
  },

  didTapPreviewDynamicImage: function(e) {
    var index = e.currentTarget.dataset.index;
    wx.previewImage({
      urls: this.data.dynamic.image_list.map(item => {
        return item.img_url;
      }),
      current: this.data.dynamic.image_list[index].img_url
    });

    // analytic
    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.fromItem = "i_zoom_in_picture";
    analyticProperties.fromModule = "m_project_dynamic_details";
    analyticProperties.img_url = this.data.dynamic.image_list[index].img_url;
    analyticProperties.project_id = this.data.projectId;
    analyticProperties.project_dynamic_id = this.data.dynamic.id;
    analytic.sensors.track("e_click_zoom_in_picture", analyticProperties);
  },

  didTapHouseTypeCell: function(e) {
    var houseType = e.currentTarget.dataset.houseType;
    var index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url:
        "/houseTypeSubPK/pages/detail/houseTypeDetail?houseId=" +
        houseType.house_type_id +
        "&roomType=" +
        houseType.room_type[0]
    });

    // analytic
    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = "p_house_type_details";
    analyticProperties.fromItem = "i_house_type_card ";
    analyticProperties.fromModule = "m_project_other_house_type";
    analyticProperties.fromItemIndex = String(index);
    analyticProperties.project_id = this.data.projectId;
    analyticProperties.project_dynamic_id = this.data.dynamic.id;
    analyticProperties.house_type_id = houseType.house_type_id;
    analytic.sensors.track("e_click_house_type_card", analyticProperties);
  },

  onShareAppMessage: function() {
    return {
      title:
        this.data.projectName.length > 0
          ? this.data.projectName + "-动态详情"
          : "品质盘、优惠盘动态，即时掌握",
      path:
        "/dynamicSubPK/pages/detail/dynamicDetail?projectId=" +
        this.data.projectId +
        "&dynamicId=" +
        this.data.dynamicId +
        "&type=" +
        this.data.type
    };
  }
});
