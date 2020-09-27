const bezierCurve = require('../../../utils/bezierCurve.js');
const coordtransform = require('../../../utils/coordtransform.js');
const qqmapNavigation = require('../qqmap-wx-jssdk/qqmap-navigation.js');
const autoanalysis = require('../autoanalysis/autoanalysis.js');
const analytic = require('../../../analytic/analytic.js');
const audioController = require('./audioController.js');
const app = getApp();
const wxUserInfo = require('../../../user/wxUserInfo.js');
const destinationBackColor = ['#FA5F35', '#FF687E'];
const startBackColor = [
  '#47B3E3',
  '#0AD487',
  '#5DAAF8',
  '#378EB5',
  '#08CED9',
  '#A3DBE1',
  '#E09230',
  '#FFCF2B',
  '#E3CF47',
  '#E9B488',
];
const mapStartPiont = [
  '/dipperSubPK/images/map_start1.png',
  '/dipperSubPK/images/map_start2.png',
  '/dipperSubPK/images/map_start3.png',
  '/dipperSubPK/images/map_start4.png',
  '/dipperSubPK/images/map_start5.png',
  '/dipperSubPK/images/map_start6.png',
  '/dipperSubPK/images/map_start7.png',
  '/dipperSubPK/images/map_start8.png',
  '/dipperSubPK/images/map_start9.png',
  '/dipperSubPK/imagess/map_start10.png',
];

Page({
  /**
   * 页面的初始数据
   */
  data: {
    sliderValue: 0,
    audioImg: 'audio_play0.png',
    flag: false,
    onOff: false,
    intoViewIndex: 'a0',
    selectTrafficFlag: false, // 默认自驾
    selectDestinationFlag: false, // 默认 终点 顺位第一位
    marker: [],
    hide_good_box: true,
    totalDuration: 0,
    currentDuration: 0,
    onWaitingFlag: false,
    dipperLoginFlag: false,
    farmatCurrentDuration: '00:00',
    formatTotalDuration: '00:00',
    intoViewIndexNum: 0,
    polylineA: {
      driving: [],
      transit: [],
      marker: [],
      selectTrafficFlag: false,
      houseTrafficIndex: 0,
    },
    polylineB: {
      driving: [],
      transit: [],
      marker: [],
      selectTrafficFlag: false,
      houseTrafficIndex: 0,
    },
    houseTrafficIndex: 0,
    goToMapFlag: true,
    ePageViewFlag: false,
    is_virtual_city: false, //是否是虚拟城市
    employee: {}
  },
  acquireWxLogin(res) {
    this.setData({
      dipperLoginFlag: true,
    });
    wxUserInfo.getWxUserInfo(res.detail);
    autoanalysis.elementTracker(
      'singleProject',
      {
        wechat_authorization: wxUserInfo.getNickName() ? '1' : '2',
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
      },
      3931
    );
  },
  skipOut() {
    this.setData({
      dipperLoginFlag: true,
    });
    autoanalysis.elementTracker(
      'singleProject',
      {
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
      },
      3932
    );
  },
  getUserInfo() {
    if (wxUserInfo.getNickName()) {
      this.setData({
        dipperLoginFlag: true,
      });
    }
  },
  didClickProjectCardItem: function (e) {
    let { item } = e.currentTarget.dataset;
    let obj = {
      project_id: this.data.projectId,
      order_id: this.data.o_id,
      adviser_id: this.data.employee.id,
      material_id: this.data.share_id,
    };
    if (item.house_type == 1) {
      if (this.data.is_virtual_city && item.house_url !== '') {
        wx.navigateTo({
          url: '/pages/web/web?url=' + encodeURIComponent(item.house_url),
        });
        obj.to_url = item.house_url;
        autoanalysis.elementTracker('singleProject', obj, 393500);
      } else {
        wx.navigateTo({
          url: `/houseTypeSubPK/pages/detail/houseTypeDetail?houseId=  ${item.house_type_id}`,
        });
        autoanalysis.elementTracker('singleProject', obj, 3935);
      }
    } else {
      autoanalysis.elementTracker('singleProject', obj, 3935);
    }
  },
  didClickProjectdetails(e) {
    let index = e.currentTarget.dataset.index;
    if (
      this.data.is_virtual_city &&
      this.data.project_info.project_url !== ''
    ) {
      wx.navigateTo({
        url:
          '/pages/web/web?url=' +
          encodeURIComponent(this.data.project_info.project_url),
      });
    } else {
      wx.navigateTo({
        url:
          '/pages/project/detail/projectDetail?projectId=' +
          this.data.projectId,
      });
    }

    let obj = {
      project_id: this.data.projectId,
      order_id: this.data.o_id,
      adviser_id: this.data.employee.id,
      material_id: this.data.share_id,
    };
    if (index == 1) {
      if (this.data.is_virtual_city) {
        obj.to_url = this.data.project_info.project_url;
        autoanalysis.elementTracker('singleProject', obj, 412000);
      } else {
        autoanalysis.elementTracker('singleProject', obj, 4120);
      }
    } else {
      autoanalysis.elementTracker('singleProject', obj, 4121);
    }
  },
  didClickNearbyMap: function (e) {
    wx.navigateTo({
      url:
        '../../../nearbySubPK/pages/nearbyMap/nearbyMap?projectId=' +
        this.data.projectId +
        '&lat=' +
        this.data.project_info.lat +
        '&lng=' +
        this.data.project_info.lng +
        '&address=' +
        this.data.project_info.address +
        '&projectName=' +
        this.data.project_info.developer +
        '&hide=' +
        true,
    });
    autoanalysis.elementTracker(
      'singleProject',
      {
        project_id: this.data.projectId,
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
      },
      3936
    );
  },
  onHouseTypeSwiper(e) {
    let current = e.detail.current;
    if (this.data.houseList.length == 2) {
      this.setData({
        intoViewIndexNum: current,
      });
    } else if (
      current >= 1 ||
      (this.data.intoViewIndexNum == 2 && current == 1)
    ) {
      this.setData({
        intoViewIndex: 'a' + (current - 1),
        intoViewIndexNum: current,
      });
    } else if (current == 0) {
      this.setData({
        intoViewIndex: 'a' + current,
        intoViewIndexNum: current,
      });
    }
    let house_type_id = '';
    if(this.data.houseList && this.data.houseList[current]){
      house_type_id = this.data.houseList[current].house_type_id
    }
    autoanalysis.elementTracker(
      'singleProject',
      {
        project_id: this.data.projectId,
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
        // house_type_id: this.data.houseList[current].id,
        house_type_id,
        fromItemIndex: String(current),
      },
      3937
    );
  },
  didScrollItem(e) {
    let index = e.currentTarget.dataset.index;
    if (index === this.data.intoViewIndexNum) return;
    this.setData({
      intoViewIndexNum: index,
    });
  },
  didClickMap() {
    if (!this.data.goToMapFlag) return;
    this.data.goToMapFlag = false;
    wx.navigateTo({
      url: '../navigationMap/navigationMap',
    });
    autoanalysis.elementTracker(
      'singleProject',
      {
        project_id: this.data.projectId,
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
      },
      4108
    );
  },
  didClicklookMorkReferral() {
    let pathUrl = `${this.data.detailserver}&share_id=${this.data.share_id}&share_type=${this.data.type}&id=${this.data.o_id}`;
    wx.navigateTo({
      url: '/pages/web/web?url=' + encodeURIComponent(pathUrl),
    });
    autoanalysis.elementTracker(
      'singleProject',
      {
        project_id: this.data.projectId,
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
        toPage: 'p_webview',
        to_url: this.data.detailserver,
      },
      3946
    );
  },
  async browse(o_id, share_id, type) {
    if (!this.data.browseFlag) return;
    let res = app.request('/v1/beidou/browse', {
      user_id: app.commonData.user.userId || '',
      share_id: share_id,
      show_type: 7,
      order_id: o_id,
      nickname: wxUserInfo.getNickName(),
    });
  },
  async filterSingleProject(o_id, share_id, type) {
    let res = await app.request('/v2/beidou/single-project', {
      share_id: share_id,
    });
    let data = res.data;
    let tags = [];
    if (data.voice.url) {
      audioController.init(this, data.voice.url);
    }
    if (!!data.commute_lng && !!data.commute_lat) {
      this.initMapData(
        data.commute_lng,
        data.commute_lat,
        data.project_info.lng,
        data.project_info.lat,
        data.project_info.name,
        data.commute_address
      );
    }
    let replace_project_info = [
      {
        name: data.project_info.name,
      },
    ];
    data.project_info.drive_time = data.drive_time;
    data.project_info.by_bus_time = data.by_bus_time;
    // tags
    if (data.required != '') {
      Object.keys(data.required).map((key) => {
        if (key === 'house_type' && data.required[key].length >= 1) {
          data.required[key].forEach((houseType) => {
            tags.push(houseType);
          });
        } else {
          tags.push(data.required[key]);
        }
      });
    }
    this.setData(
      {
        first: data.first, // 首段文字介绍
        recommon_reson: data.recommon_reson, //推荐理由
        project_tag: data.project_tag, //推荐标签
        voice: data.voice, // audio 相关
        project_info: data.project_info, //楼盘信息相关
        projectId: String(data.project_info.project_id),
        around_traffic: data.around_traffic,
        employee: data.employee || {id: '', mobile: ''},
        houseList: data.house_list,
        down_payments: data.down_payments,
        loan_term: data.loan_term,
        lending_rate: data.lending_rate,
        aroundPrice:
          JSON.stringify(data.around_price) == '{}' ? false : data.around_price,
        orderId: data.order_id,
        detailserver: data.detailserver,
        replace_project_info: replace_project_info,
        loadingHidden: true,
        isCollect: data.is_collect == 2 ? true : false,
        tags: tags,
        commute: data.commute,
        commuteAction: data.commute.length >= 1 ? data.commute[0] : '',
        project_status: data.project_status,
        project_status_des: data.project_status_des,
        shareMessage: data.share,
        is_virtual_city: data.is_virtual_city == 1 ? true : false,
      },
      () => {
        this.analyticPageView('e_page_view');
        setTimeout(() => {
          this.data.ePageViewFlag = true;
        }, 500);
        // 一个模块曝光 一次  class name   映射 埋点对应 字段的 fromModule

        // 交通情况
        if (data.around_traffic) {
          this.m_surrounding_transport = wx.createIntersectionObserver(this);
          this.m_surrounding_transport
            .relativeToViewport('.container')
            .observe('.m_surrounding_transport', (res) => {
              this.exposure('m_surrounding_transport');
              this.m_surrounding_transport.disconnect();
            });
        }
        // 楼盘详情
        this.m_project_info = wx.createIntersectionObserver(this);
        this.m_project_info
          .relativeToViewport('.container')
          .observe('.m_project_info', (res) => {
            this.exposure('m_project_info');
            this.m_project_info.disconnect();
          });
        // 推荐户型
        this.m_recommend_house_type = wx.createIntersectionObserver(this);
        this.m_recommend_house_type
          .relativeToViewport('.container')
          .observe('.m_recommend_house_type', (res) => {
            this.exposure('m_recommend_house_type');
            this.m_recommend_house_type.disconnect();
          });
        // 居理服务
        this.m_julive_service = wx.createIntersectionObserver(this);
        this.m_julive_service
          .relativeToViewport('.container')
          .observe('.m_julive_service', (res) => {
            this.exposure('m_julive_service');
            this.m_julive_service.disconnect();
          });
        //周边房价
        if (
          (this.data.aroundPrice && this.data.aroundPrice.take_address_price) ||
          this.data.aroundPrice.second_project_price
        ) {
          this.m_surrounding_house_price = wx.createIntersectionObserver(this);
          this.m_surrounding_house_price
            .relativeToViewport('.container')
            .observe('.m_surrounding_house_price', (res) => {
              this.exposure('m_surrounding_house_price');
              this.m_surrounding_house_price.disconnect();
            });
        }
        //语音解读
        if (this.data.voice.url) {
          this.m_voice_interpretation = wx.createIntersectionObserver(this);
          this.m_voice_interpretation
            .relativeToViewport('.container')
            .observe('.m_voice_interpretation', (res) => {
              this.exposure('m_voice_interpretation');
              this.m_voice_interpretation.disconnect();
            });
        }
      }
    );
    wx.setNavigationBarTitle({
      title: data.project_info.name,
    });
    if (data.commute && data.commute.length >= 1) {
      this.initMapData(data.commute);
      // 通勤路线
      this.m_commuting_route = wx.createIntersectionObserver(this);
      this.m_commuting_route
        .relativeToViewport('.container')
        .observe('.m_commuting_route', (res) => {
          this.exposure('m_commuting_route');
          this.m_commuting_route.disconnect();
        });
    }
  },
  exposure(fromModule) {
    autoanalysis.elementTracker(
      'singleProject',
      {
        project_id: this.data.projectId,
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
        fromModule: fromModule,
      },
      5783
    );
  },
  initMapData(arr) {
    console.log(arr);
    arr.forEach((list, idx) => {
      let marker = [];
      let startPointList = [];
      let destination;
      list.forEach((item, index) => {
        if (index === 0) {
          destination = coordtransform.bd09togcj02(
            item.commute_lng,
            item.commute_lat
          );
          marker.push({
            latitude: destination.lat,
            longitude: destination.lng,
            id: 0,
            width: 22,
            height: 34,
            iconPath: '/dipperSubPK/images/map_destination.png',
            callout: {
              content: item.commute_address,
              color: '#fff',
              fontSize: '12',
              borderRadius: 4,
              bgColor: destinationBackColor[index],
              padding: 6,
              display: 'ALWAYS',
              textAlign: 'center',
            },
          });
        }
        let temporary = coordtransform.bd09togcj02(
          item.project_lng,
          item.project_lat
        );
        startPointList.push(temporary);
        marker.push({
          latitude: temporary.lat,
          longitude: temporary.lng,
          id: index + 1,
          width: 22,
          height: 34,
          iconPath: mapStartPiont[index],
          callout: {
            content: item.project_name,
            color: '#fff',
            fontSize: '12',
            borderRadius: 4,
            bgColor: startBackColor[index],
            padding: 6,
            display: 'ALWAYS',
            textAlign: 'center',
          },
        });
      });
      if (idx === 0) {
        qqmapNavigation.mapPolyline(
          'driving',
          startPointList,
          destination,
          this,
          'A'
        );
        qqmapNavigation.includePoints(marker);
        let content = `polylineA.marker`;
        this.setData({
          lat: destination.lat,
          lng: destination.lng,
          marker: marker,
          [content]: marker,
        });
      } else {
        // qqmapNavigation.mapPolyline(startPointList, destination, this, 'B')
        this.data.secondDestination = {
          destination: destination,
          startPointList: startPointList,
        };
        let content = `polylineB.marker`;
        this.setData({
          [content]: marker,
        });
      }
    });
  },
  onLoad: async function (options) {
    this.busPos = {};
    this.busPos['x'] = app.globalData.ww - 49;
    this.busPos['y'] = app.globalData.hh * 0.83;
    try {
      // 启动进入
      wx.hideShareMenu();
      let o_id, share_id, type;
      var scene = options.scene;
      if (scene) {
        scene = decodeURIComponent(scene);
        var params = scene.split(',');
        share_id = params[0].split('_')[1];
        o_id = params[1].split('_')[1];
        type = params[2].split('_')[1];
      } else {
        o_id = options.o_id;
        share_id = options.share_id;
        type = 7;
        //  带周一确认～～～～～～
      }
      console.log(options.sampshare);
      console.log(app.recordFlag.browseFlag);
      // 宝典进来 或者 分享进来 进行上报  否则 不上报
      if (
        app.recordFlag.browseFlag ||
        (options.sampshare && options.sampshare.length >= 1)
      ) {
        this.data.browseFlag = true;
      }
      // 启动进入 end
      this.setData({
        share_id: share_id,
        o_id: o_id,
        type: type,
        isIpx: app.globalData.isIpx,
      });
      this.getUserInfo();
      this.filterSingleProject(o_id, share_id, type);
      this.browse(o_id, share_id, type);
    } catch (e) {
      console.log(e);
    }
    wx.showShareMenu({
      withShareTicket: true,
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  navToRecordBox() {
    wx.navigateTo({
      url: '../recordBox/recordBox',
    });
    autoanalysis.elementTracker(
      'singleProject',
      {
        project_id: this.data.projectId,
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        login_state: app.commonData.user.userId ? '1' : '2',
        material_id: this.data.share_id,
      },
      3951
    );
  },
  touchOnGoods: async function (e, x) {
    let { isCollect } = e.detail;
    if (isCollect) {
      bezierCurve.touchOnGoods(e, this);
      this.setData({
        isCollect: true,
      });
    } else {
      this.setData({
        isCollect: false,
      });
    }
    autoanalysis.elementTracker(
      'singleProject',
      {
        project_id: this.data.projectId,
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        collection_action: isCollect ? '1' : '2',
        material_id: this.data.share_id,
      },
      3949
    );
  },
  hostPhoneCall() {
    wx.makePhoneCall({
      phoneNumber: this.data.employee.mobile || getApp().commonData.channel.phone,
    });
    autoanalysis.elementTracker(
      'singleProject',
      {
        project_id: this.data.projectId,
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
      },
      3950
    );
  },
  hostOnShare() {},
  onShareAppMessage() {
    autoanalysis.elementTracker(
      'singleProject',
      {
        project_id: this.data.projectId,
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
      },
      3948
    );
    return {
      title: this.data.shareMessage.title,
      path: `dipperSubPK/pages/singleProject/singleProject?o_id=${this.data.o_id}&share_id=${this.data.share_id}&type=1`,
      imageUrl: this.data.shareMessage.img,
    };
  },
  onShow: function () {
    this.data.goToMapFlag = true;
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
    let analyticProperties = {};
    if (eventName != 'e_page_view') {
      var viewTime = (Date.parse(new Date()) - this.data.startViewTime) / 1000;
      analyticProperties.view_time = viewTime;
    }
    analyticProperties.fromPage = 'p_single_project_analysis';
    analyticProperties.material_id = this.data.share_id;
    analyticProperties.adviser_id = this.data.employee.id;
    analyticProperties.order_id = this.data.o_id;
    analyticProperties.toPage = 'p_single_project_analysis';
    analytic.sensors.track(eventName, analyticProperties);
  },
  didTapAlertWiw() {
    this.setData({
      loadAltFlag: !this.data.loadAltFlag,
    });
  },
  didClickCloseShowModal() {
    this.setData({
      loadAltFlag: !this.data.loadAltFlag,
    });
  },
  employeNavigateTo() {
    wx.navigateTo({
      url: `../employeDetails/employeDetails?o_id=${this.data.o_id}&share_id=${this.data.share_id}&type=${this.data.type}&frompage=p_single_project_analysis`,
    });
    autoanalysis.elementTracker(
      'singleProject',
      {
        project_id: this.data.projectId,
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
      },
      4652
    );
  },
  employeCardShare() {
    console.log('employeCardShare');
  },
  employeCardEmployeCod() {
    autoanalysis.elementTracker(
      'singleProject',
      {
        project_id: this.data.projectId,
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
      },
      4658
    );
    console.log('employeCardEmployeCod');
  },
  employeCardPhoneCall() {
    console.log('employeCardPhoneCall');
    autoanalysis.elementTracker(
      'singleProject',
      {
        project_id: this.data.projectId,
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
      },
      4655
    );
  },
  hostDownApp() {
    console.log('hostDownApp');
    autoanalysis.elementTracker(
      'singleProject',
      {
        project_id: this.data.projectId,
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
      },
      4831
    );
  },
  hostPayAward(e) {
    let pay_state = e.detail.pay_state;
    autoanalysis.elementTracker(
      'singleProject',
      {
        project_id: this.data.projectId,
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
        pay_state: pay_state,
      },
      4665
    );
  },
  selectTraffic(e) {
    let flag = !!Number(e.currentTarget.dataset.index);
    if (this.data.selectTrafficFlag == flag) return;
    let list;
    let houseTrafficIndex;
    if (this.data.selectDestinationFlag) {
      list = flag ? this.data.polylineB.transit : this.data.polylineB.driving;
      houseTrafficIndex = this.data.polylineB.houseTrafficIndex;
      this.data.polylineB.selectTrafficFlag = flag;
    } else {
      list = flag ? this.data.polylineA.transit : this.data.polylineA.driving;
      houseTrafficIndex = this.data.polylineA.houseTrafficIndex;
      this.data.polylineA.selectTrafficFlag = flag;
    }
    this.setData({
      selectTrafficFlag: flag,
      polyline: list,
    });
    if (flag) {
      autoanalysis.elementTracker(
        'singleProject',
        {
          project_id: this.data.projectId,
          order_id: this.data.o_id,
          adviser_id: this.data.employee.id,
          material_id: this.data.share_id,
        },
        3942
      );
    } else {
      autoanalysis.elementTracker(
        'singleProject',
        {
          project_id: this.data.projectId,
          order_id: this.data.o_id,
          adviser_id: this.data.employee.id,
          material_id: this.data.share_id,
        },
        3941
      );
    }
  },
  selectDestination(e) {
    let flag = !!Number(e.currentTarget.dataset.index);
    if (this.data.selectDestinationFlag == flag) return;
    if (flag) {
      let obj = this.data.polylineB;
      this.setData({
        selectDestinationFlag: flag,
        selectTrafficFlag: obj.selectTrafficFlag,
        commuteAction: this.data.commute[1],
        houseTrafficIndex: obj.houseTrafficIndex,
        polyline: obj.selectTrafficFlag ? obj.transit : obj.driving,
        marker: obj.marker,
      });
    } else {
      let obj = this.data.polylineA;
      this.setData({
        selectDestinationFlag: flag,
        selectTrafficFlag: obj.selectTrafficFlag,
        commuteAction: this.data.commute[0],
        houseTrafficIndex: obj.houseTrafficIndex,
        polyline: obj.selectTrafficFlag ? obj.transit : obj.driving,
        marker: obj.marker,
      });
    }
    autoanalysis.elementTracker(
      'singleProject',
      {
        project_id: this.data.projectId,
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
        fromItemIndex: flag ? 1 : 0,
      },
      5063
    );
  },
  selectHouseTraffic(e) {
    let index = e.currentTarget.dataset.index;
    if (index == this.data.houseTrafficIndex) return;
    let obj = this.data.selectDestinationFlag
      ? this.data.polylineB
      : this.data.polylineA; // true 第二个终点  flase 第一个终点
    let key = this.data.selectTrafficFlag ? 'transit' : 'driving'; // true 公交  flase自驾
    let list = obj[key];
    list.forEach((item, idx) => {
      console.log(idx);
      if (index == idx) {
        item.width = 10;
      } else {
        item.width = 5;
      }
    });
    obj.houseTrafficIndex = index;
    this.setData({
      houseTrafficIndex: index,
      polyline: list,
    });
  },
});
