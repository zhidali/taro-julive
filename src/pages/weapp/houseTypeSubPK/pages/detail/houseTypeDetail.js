const app = getApp();
const order = require("../../../order/order.js");
const tool = require("../../../utils/util.js");
const analytic = require("../../../analytic/analytic.js");

Page({
  data: {
    houseId: "",
    roomType: "",
    houseInfo: {},
    data: {},
    curImageIndex: 1,
    screenWidth: 375,
    areaInfoList: [],
    commentInfoList: [],
    imageList: [],
    loadingHidden: false,
    projectId: "",
    projectName: "",
    isIpx: app.globalData.isIpx,
    ePageViewFlag: false
  },

  onLoad: function(options) {
    var houseId = "";
    if (options && options.q) {
      var url = decodeURIComponent(options.q);
      var query = tool.parseQueryString(url);
      if (query) {
        houseId = query.house_id;
      }
    } else if (options.houseId) {
      houseId = options.houseId;
    } else if (options.scene) {
      let scene = decodeURIComponent(options.scene);
      let params = scene.split(",");
      let id = params[0].split("_")[1];
      houseId = id;
    }

    this.setData({
      houseId: houseId,
      roomType: options.roomType ? options.roomType : 0,
      userInfo: { house_type_id: houseId }
    });
    this.fetchHouseTypeDetail();
    // this.analyticPageView("e_page_view");
    // setTimeout(() => {
    //   this.data.ePageViewFlag = true;
    // }, 500);
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
    analyticProperties.toPage = analyticProperties.fromPage;
    analytic.sensors.track(eventName, analyticProperties);
  },

  analyticProperties: function() {
    return {
      fromPage: "p_house_type_details",
      house_type_id: this.data.houseId,
      project_id: this.data.projectId
    };
  },

 
  reportSlideImageForm: function(e) {
    this.didTapSlideImage(e);
  },

  didSwiperSlideImage: function(e) {
    this.setData({
      curImageIndex: e.detail.current + 1
    });
  },

  didTapSlideImage: function(e) {
    var index = e.currentTarget.dataset.index;
    wx.previewImage({
      urls: this.data.imageList,
      current: this.data.imageList[index]
    });

    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.fromItem = "i_zoom_in_picture";
    analyticProperties.project_id = this.data.projectId;
    analyticProperties.house_type_id = this.data.houseId;
    analyticProperties.img_url = this.data.imageList[index];
    analytic.sensors.track("e_click_zoom_in_picture", analyticProperties);
  },

  didTapOtherType: function(e) {
    var houseType = e.currentTarget.dataset.houseType;
    var isOther = e.currentTarget.dataset.isOther;
    var index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url:
        "/houseTypeSubPK/pages/detail/houseTypeDetail?houseId=" +
        houseType.house_type_id +
        "&roomType=" +
        houseType.room_type[0]
    });

    var fromModule = "m_same_price_house_type";
    if (isOther) {
      fromModule = "m_project_other_house_type";
    }
    var analyticProperties = this.analyticProperties();
    analyticProperties.fromModule = fromModule;
    analyticProperties.fromItemIndex = String(index);
    analyticProperties.fromItem = "i_house_type_card";
    analyticProperties.toPage = "p_house_type_details";
    analyticProperties.house_type_id = this.data.houseId;
    analyticProperties.to_house_type_id = houseType.house_type_id;
    analyticProperties.project_id = this.data.projectId;
    analytic.sensors.track("e_click_house_type_card", analyticProperties);
  },

  fetchHouseTypeDetail: function() {
    var _this = this;
     _this.data.houseId = decodeURIComponent(_this.data.houseId).trim();
    if(!_this.data.houseId){
      wx.switchTab({
        url: '/pages/home/home',
      });
      return;
    };
    app
      .request("/v1/project/ht-info", {
        house_id: _this.data.houseId,
        room_type: _this.data.roomType
      })
      .then(d => {
        var _data = d.data;
        var _areaInfoList = [];
        var _commentInfoList = [];
        if (d.data.house_info.acreage && d.data.house_info.acreage > 0) {
          _areaInfoList.push({
            title: "建面",
            value: d.data.house_info.acreage + "㎡"
          });
        }
        if (d.data.house_info.ac_acreage && d.data.house_info.ac_acreage > 0) {
          _areaInfoList.push({
            title: "套内",
            value: d.data.house_info.ac_acreage + "㎡"
          });
        }
        _areaInfoList.push({
          title: "朝向",
          value: _data.house_info.orientation
        });

        _areaInfoList.push({
          title: "层高",
          value:
            tool.disposeEmptyText(_data.house_info.floor_height).length == 0
              ? ""
              : tool.disposeEmptyText(_data.house_info.floor_height) + "m"
        });

        _areaInfoList.push({
          title: "类型",
          value: _data.house_info.room_type
        });
        let arr = [];
        let countN = 0;
        _areaInfoList.forEach((item, index) => {
          if (index != 0 && index % 2 === 0) {
            countN++;
          }
          if (!arr[countN]) {
            arr[countN] = [];
          }
          arr[countN].push(item);
        });
        _commentInfoList.push({
          title: "优势描述",
          value: _data.house_info.good_desc || "暂无"
        });

        _commentInfoList.push({
          title: "劣势描述",
          value: _data.house_info.bad_desc || "暂无"
        });

        var roomDetail = "";
        if (
          _data.house_info.master_bed_room != null &&
          _data.house_info.master_bed_room.length > 0
        ) {
          roomDetail += "主卧：";
          roomDetail += _data.house_info.master_bed_room;
        }

        if (
          _data.house_info.toilet != null &&
          _data.house_info.toilet.length > 0
        ) {
          if (roomDetail.length > 0) {
            roomDetail += "\n";
          }
          roomDetail += "卫生间：";
          roomDetail += _data.house_info.toilet;
        }

        if (
          _data.house_info.living_room != null &&
          _data.house_info.living_room.length > 0
        ) {
          if (roomDetail.length > 0) {
            roomDetail += "\n";
          }
          roomDetail += "客厅：";
          roomDetail += _data.house_info.living_room;
        }

        if (
          _data.house_info.kitchen != null &&
          _data.house_info.kitchen.length > 0
        ) {
          if (roomDetail.length > 0) {
            roomDetail += "\n";
          }
          roomDetail += "厨房：";
          roomDetail += _data.house_info.kitchen;
        }

        if (
          _data.house_info.restaurant != null &&
          _data.house_info.restaurant.length > 0
        ) {
          if (roomDetail.length > 0) {
            roomDetail += "\n";
          }
          roomDetail += "餐厅：";
          roomDetail += _data.house_info.restaurant;
        }

        if (
          _data.house_info.terrace != null &&
          _data.house_info.terrace.length > 0
        ) {
          if (roomDetail.length > 0) {
            roomDetail += "\n";
          }
          roomDetail += "露台：";
          roomDetail += _data.house_info.terrace;
        }

        if (roomDetail.length > 0) {
          _commentInfoList.push({
            title: "居室详解",
            value: roomDetail
          });
        }

        _this.setData(
          {
            data: d.data,
            houseInfo: d.data.house_info,
            areaInfoList: arr,
            commentInfoList: _commentInfoList,
            loadingHidden: true,
            projectId: d.data.house_info.project_id,
            projectName: d.data.house_info.project_info.project_name,
            imageList: d.data.pic_list,
            userInfo: {
              house_type_id: _this.data.houseId,
              project_id: d.data.house_info.project_id
            }
          },
          () => {
            this.analyticPageView("e_page_view");
            setTimeout(() => {
              this.data.ePageViewFlag = true;
            }, 500);
          }
        );
      })
      .catch(error => {
        console.log(error);
      });
  },

  didTapContactCounselor: function(e) {
    var toModule = "";
    if (app.commonData.user.userId) {
      this.makeOrder();
      toModule = "m_leave_phone_success_window";
    } else {
      this.setData({
        showLoginModal: true,
        loginUserInfo: {
          op_type: "900077",
          source: "156",
          house_type_id: this.data.houseId,
          project_id: this.data.projectId,
          adviser_id: this.data.houseInfo.employee_id
        }
      });
      toModule = "m_login_window";
    }
    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.source = "156";
    analyticProperties.op_type = "900077";
    analyticProperties.project_id = this.data.projectId;
    analyticProperties.house_type_id = this.data.houseId;
    analyticProperties.adviser_id = this.data.houseInfo.employee_id;
    analyticProperties.toModule = toModule;
    analyticProperties.fromItem = "i_leave_phone_entry";
    analytic.sensors.track("e_click_leave_phone_entry", analyticProperties);
  },

  didTapPremises: function() {
    wx.navigateTo({
      url: `/pages/web/web?url=${getApp().commonData.m_domain_project}${this.data.projectId}.html`
    });
    let analyticProperties = this.analyticProperties();
    analyticProperties.fromModule = "m_house_type_analysis";
    analyticProperties.fromItem = "i_project_name";
    analyticProperties.toPage = "p_project_details";
    analyticProperties.project_id = this.data.projectId;
    analyticProperties.house_type_id = this.data.houseId;
    analytic.sensors.track("e_click_project_name", analyticProperties);
  },

  loginSuccessCallback: function() {
    this.makeOrder();
  },

  makeOrder: function() {
    // 向TA咨询逻辑
    wx.showLoading({
      title: "预约中..."
    });
    var _this = this;
    order.makeOrder(
      {
        project_id: this.data.projectId,
        source: "156",
        op_type: "900077"
      },
      {
        project_id: this.data.projectId,
        house_type_id: this.data.houseId,
        adviser_id: this.data.houseInfo.employee_id
      },
      function() {
        wx.hideLoading();
        _this.setData({
          showOrderSuccessAlert: true,
          alertContent:
            "您已用手机号" +
            app.commonData.user.mobile +
            "预约了咨询服务，稍后咨询师将来电为您解答疑问，请注意接听电话"
        });
      }
    );
  },

  onShareAppMessage: function() {
    return {
      title:
        this.data.projectName && this.data.projectName.length > 0
          ? this.data.projectName + "-户型详情"
          : "好户型，才有好生活",
      path:
        "/houseTypeSubPK/pages/detail/houseTypeDetail?houseId=" + this.data.houseId
    };
  }
});
