const tool = require('../../../utils/util.js');
const analytic = require('../../../analytic/analytic.js');

const app = getApp();

Page({
  data: {
    loadingHidden: false,
    isShow: false,
    isTapItem: false,
    projectId: '',
    projectName: '',
    houseTypeList: [],
    roomTypeList: [],
    statusList: [],
    roomIndex: 0,
    roomId: '',
    statusIndex: '',
    statusName: '',
    statusId: '',
    hasNoMore: false,
    isIpx: app.globalData.isIpx,
  },

  onLoad: function (options) {
    var projectId = '';
    if (options && options.q) {
      var url = decodeURIComponent(options.q);
      var query = tool.parseQueryString(url);
      if (query) {
        projectId = query.project_id;
      }
    } else {
      projectId = options.projectId;
    }
    var projectName = options.projectName ? options.projectName : '';
    this.setData({
      projectId: projectId,
      projectName: projectName,
      userInfo: { project_id: projectId },
    });
    this.fetchHouseTypeList();
    this.analyticPageView('e_page_view');
  },

  onShow: function () {
    this.data.startViewTime = Date.parse(new Date());
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
      fromPage: 'p_house_type_list',
      project_id: this.data.projectId,
    };
  },

  onPageScroll: function () {
    this.setData({
      isShow: false,
    });
  },

  didTapRoomText: function (e) {
    var index = e.currentTarget.id;
    var roomList = this.data.roomTypeList;
    this.setData({
      roomIndex: index,
      roomId: roomList[index].value,
    });
    this.fetchHouseTypeList();

    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.filter_sort_value = roomList[index].value;
    analyticProperties.fromItem = 'i_click_house_type_tag';
    analyticProperties.fromItemIndex = String(index);
    analytic.sensors.track('e_click_house_type_tag', analyticProperties);
  },

  didTapSellStatus: function (e) {
    var show = this.data.isShow;
    if (show) {
      show = false;
    } else {
      show = true;
    }
    this.setData({
      isShow: show,
    });

    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.fromItem = 'i_house_type_sale_status_entry';
    analytic.sensors.track(
      'e_click_house_type_sale_status_entry',
      analyticProperties
    );
  },

  didTapStatusItem: function (e) {
    var index = e.currentTarget.id;
    var list = this.data.statusList;
    this.setData({
      statusIndex: index,
      statusName: list[index].name,
      statusId: list[index].value,
      isTapItem: true,
      isShow: false,
    });
    this.fetchHouseTypeList();

    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.filter_sort_value = list[index].value;
    analyticProperties.fromItem = 'i_house_type_sale_status';
    analytic.sensors.track(
      'e_click_house_type_sale_status',
      analyticProperties
    );
  },

  didTapHouseTypeCell: function (e) {
    var houseType = e.currentTarget.dataset.houseType;
    var index = e.currentTarget.dataset.index;
    var roomType = houseType.room_type[0];
    wx.navigateTo({
      url:
        '/houseTypeSubPK/pages/detail/houseTypeDetail?houseId=' +
        houseType.house_type_id +
        '&roomType=' +
        roomType,
    });

    var analyticProperties = this.analyticProperties();
    analyticProperties.fromItem = 'i_house_type_card';
    analyticProperties.fromItemIndex = String(index);
    analyticProperties.toPage = 'p_house_type_details';
    analyticProperties.house_type_id = houseType.house_type_id;
    analytic.sensors.track('e_click_house_type_card', analyticProperties);
  },

  fetchHouseTypeList: function () {
    var _this = this;
    app
      .request('/v1/project/ht', {
        project_id: _this.data.projectId,
        room_type: _this.data.roomId,
        status: _this.data.statusId,
      })
      .then((d) => {
        var data = d.data;
        var list = data.list;

        this.setData({
          houseTypeList: data.list,
          roomTypeList: data.room_type,
          statusList: data.status,
          loadingHidden: true,
          hasNoMore: data.list.length == 0 ? true : false,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  },

  onShareAppMessage: function () {
    var _this = this;
    return {
      title:
        this.data.projectName.length > 0
          ? this.data.projectName + '-户型分析'
          : '好户型，才有好生活',
      path:
        '/houseTypeSubPK/pages/list/houseTypeList?projectId=' +
        this.data.projectId,
    };
  },
});
