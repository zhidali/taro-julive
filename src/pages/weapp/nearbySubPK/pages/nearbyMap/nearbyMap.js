var bmksearch = require('../../../utils/bmksearch/bmksearch.js');
const analytic = require('../../../analytic/analytic.js');
var app = getApp();

Page({
  data: {
    isIpx: app.globalData.isIpx,
    lat: 0,
    lng: 0,
    projectId: '',
    markers: [],
    projectMarkes: [],
    ePageViewFlag: false,
    tabList: [
      {
        iconPath: '/nearbySubPK/images/icon_tab_map_building.png',
        iconTabPath: '/nearbySubPK/images/icon_tab_map_building_select.png',
        name: '附近楼盘',
        key: 'building',
      },
      {
        iconPath: '/nearbySubPK/images/icon_tab_map_transit.png',
        iconTabPath: '/nearbySubPK/images/icon_tab_map_transit_select.png',
        name: '交通',
        key: 'traffic',
      },
      {
        iconPath: '/nearbySubPK/images/icon_tab_map_life.png',
        iconTabPath: '/nearbySubPK/images/icon_tab_map_life_select.png',
        name: '生活',
        key: 'life',
      },
      {
        iconPath: '/nearbySubPK/images/icon_tab_map_hospital.png',
        iconTabPath: '/nearbySubPK/images/icon_tab_map_hospital_select.png',
        name: '医疗',
        key: 'hospital',
      },
      {
        iconPath: '/nearbySubPK/images/icon_tab_map_school.png',
        iconTabPath: '/nearbySubPK/images/icon_tab_map_school_select.png',
        name: '学校',
        key: 'school',
      },
    ],
    currentTabIndex: 1,
    mapHeight: 1000,
    dipperSingeFlag: false,
  },

  onLoad: function (options) {
    var that = this;
    var screenHeight = wx.getSystemInfoSync().windowHeight;
    if (screenHeight == 0) {
      screenHeight = 1000;
    }

    this.setData({
      projectId: options.projectId,
      lat: options.lat,
      lng: options.lng,
      projectName: options.projectName,
      address: options.address,
      mapHeight: screenHeight,
      userInfo: {
        project_id: options.projectId,
        periphery_type: '2',
      },
    });
    if (options.hide) {
      this.setData({
        dipperSingeFlag: true,
      });
    }

    var _this = this;
    setTimeout(function () {
      var arr = bmksearch.getMarkerData()['traffic']['wxMarkerData'];
      var list = [];
      list = list.concat(arr);
      list.splice(0, 1, _this.projectLocationMarkers());
      _this.setData({
        markers: list,
      });
    }, 1500);

    app
      .request('/v1/project/near-project', {
        project_id: options.projectId,
      })
      .then((res) => {
        var mks = [];

        mks.push(_this.projectLocationMarkers());
        if (res.data && res.data.near_project_list) {
          var list = res.data.near_project_list;
          list.forEach((item) => {
            mks.push({
              width: 0.5,
              height: 0.5,
              iconPath: '/image/icon_life_pin.png',
              iconTapPath: '/image/icon_life_pin.png',
              id: 'project_' + item.project_id,
              latitude: item.lat,
              longitude: item.lng,
              callout: {
                content:
                  item.name +
                  ' ' +
                  item.card_price.value +
                  item.card_price.unit,
                color: '#ffffff',
                fontSize: '14',
                borderRadius: 2,
                bgColor: '#47B3E3',
                padding: 6,
                display: 'ALWAYS',
                textAlign: 'center',
              },
            });
          });
        }

        _this.setData({
          projectMarkes: mks,
        });
      });
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

  projectLocationMarkers: function () {
    return {
      width: 30,
      height: 44,
      iconPath: '/nearbySubPK/images/icon_location_project.png',
      iconTapPath: '/nearbySubPK/images/icon_location_project.png',
      id: 'address',
      latitude: this.data.lat,
      longitude: this.data.lng,
      callout: {
        content: this.data.projectName + '\n' + this.data.address,
        color: '#3E4A59',
        fontSize: '14',
        borderRadius: 2,
        borderWidth: 1,
        borderColor: '#F3F6F9',
        bgColor: '#ffffff',
        padding: 6,
        display: 'ALWAYS',
        textAlign: 'left',
      },
    };
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

  didTapCategoryItem: function (e) {
    var index = e.currentTarget.dataset.index;
    if (index == this.data.currentTabIndex) return;
    if (index == 0) {
      this.setData({
        currentTabIndex: index,
        markers: this.data.projectMarkes,
        userInfo: {
          project_id: this.data.projectId,
          periphery_type: String(index + 1),
        },
      });
    } else {
      var keys = ['traffic', 'life', 'hospital', 'school'];
      // BUG -----
      let arr = [];
      if(bmksearch.getMarkerData() && bmksearch.getMarkerData()[keys[index - 1]]){
        arr = bmksearch.getMarkerData()[keys[index - 1]]['wxMarkerData'] || [];
      }
      // --------
      var list = [];
      list = list.concat(arr);
      list.splice(0, 1, this.projectLocationMarkers());
      this.setData({
        currentTabIndex: index,
        markers: list,
        userInfo: {
          project_id: this.data.projectId,
          periphery_type: String(index + 1),
        },
      });
    }

    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.fromItem = 'i_surrounding_analysis_tag';
    analyticProperties.fromModule = 'm_bottom_bar';
    analyticProperties.fromItemIndex = String(index);
    analyticProperties.periphery_type = String(index + 1);
    analytic.sensors.track(
      'e_click_surrounding_analysis_tag',
      analyticProperties
    );
  },

  didTapCallout: function (e) {
    var markerId = e.markerId;
    if (
      markerId &&
      typeof markerId === 'string' &&
      markerId.indexOf('project_') != -1
    ) {
      var projectId = markerId.split('_')[1];
      wx.navigateTo({
        url: '/pages/project/detail/projectDetail?projectId=' + projectId,
      });
    } else if (
      markerId &&
      typeof markerId === 'string' &&
      markerId.indexOf('address') != -1
    ) {
      wx.openLocation({
        latitude: Number(this.data.lat),
        longitude: Number(this.data.lng),
        address: this.data.address,
      });
    }
  },

  analyticProperties() {
    return {
      fromPage: 'p_surrounding_analysis_map',
      project_id: this.data.projectId,
    };
  },
});
