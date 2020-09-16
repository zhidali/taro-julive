const coordtransform = require('../../../utils/coordtransform.js');
const qqmapNavigation = require('../qqmap-wx-jssdk/qqmap-navigation.js');
const enviroment = require('../../../enviroment/enviroment.js');
const wxUserInfo = require('../../../user/wxUserInfo.js');
const autoanalysis = require('../autoanalysis/autoanalysis.js');
var analytic = require('../../../analytic/analytic.js');
const app = getApp();

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
const markerProjectBubbleImgList = [
  'dipper-icon-point-0.png',
  'dipper-icon-point-1.png',
  'dipper-icon-point-2.png',
  'dipper-icon-point-3.png',
  'dipper-icon-point-4.png',
  'dipper-icon-point-5.png',
  'dipper-icon-point-6.png',
  'dipper-icon-point-7.png',
  'dipper-icon-point-8.png',
  'dipper-icon-point-9.png',
];

const markerProjectBubbleSolidImgList = [
  'icon-dipper-solid-0.png',
  'icon-dipper-solid-1.png',
  'icon-dipper-solid-2.png',
  'icon-dipper-solid-3.png',
  'icon-dipper-solid-4.png',
  'icon-dipper-solid-5.png',
  'icon-dipper-solid-6.png',
  'icon-dipper-solid-7.png',
  'icon-dipper-solid-8.png',
  'icon-dipper-solid-9.png',
];

var recommendMap;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    hide_good_box: true,
    dipperLoginFlag: false,
    selectTrafficFlag: false, // 默认自驾
    currentDestnation: 0, // 默认 终点 顺位第一位
    selectDestinationFlag: false, // 默认 终点 顺位第一位
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
    recommendMapScale: 10,
    recommendMapIncludePointList: [],
    img_current_index: 1,
    sweiperImgCurrent: 0,
    swiCurrent: 0,
    postSaveRequiredFlag: true,
    matingTitle: [
      {
        name: '交通',
        key: 0,
        flag: false,
        isClick: false,
      },
      {
        name: '学校',
        key: 1,
        flag: false,
        isClick: false,
      },
      {
        name: '购物',
        key: 2,
        flag: false,
        isClick: false,
      },
      {
        name: '医院',
        key: 3,
        flag: false,
        isClick: false,
      },
      {
        name: '房价',
        key: 4,
        flag: false,
        isClick: false,
      },
    ],
    around_traffic_List: [],
    around_education_List: [],
    around_market_list: [],
    around_hospital_list: [],
    project_price_list: [],
    project_ids: [],
    matingTitleObj: {},
    recommendMapFlag: true,
    is_virtual_city: false, //是否是虚拟城市
  },
  acquireWxLogin(res) {
    this.setData({
      dipperLoginFlag: true,
    });
    wxUserInfo.getWxUserInfo(res.detail);
    autoanalysis.elementTracker(
      'multiProject',
      {
        wechat_authorization: wxUserInfo.getNickName() ? '1' : '2',
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
      },
      3931
    );
    if (this.data.is_need_pop && this.data.dipperLoginFlag) {
      this.data.is_need_pop = false;
      this.didTapAlertWiw(3);
    }
  },
  skipOut() {
    this.setData({
      dipperLoginFlag: true,
    });
    let _this = this;
    autoanalysis.elementTracker(
      'multiProject',
      {
        order_id: _this.data.o_id,
        adviser_id: _this.data.employee.id,
        material_id: _this.data.share_id,
      },
      3932
    );
    if (this.data.is_need_pop && this.data.dipperLoginFlag) {
      this.data.is_need_pop = false;
      this.didTapAlertWiw(3);
    }
  },
  getUserInfo() {
    if (wxUserInfo.getNickName()) {
      this.setData({
        dipperLoginFlag: true,
      });
    }
  },
  toProjectDetail(e) {
    let projectId = e.currentTarget.dataset.projectid;
    // let projectUrl = e.currentTarget.dataset.url;
    let index = e.currentTarget.dataset.index;
    let module = e.currentTarget.dataset.module;
    let fromModule;
    let obj = {
      project_ids: this.data.project_ids,
      order_id: this.data.o_id,
      adviser_id: this.data.employee.id,
      material_id: this.data.share_id,
      fromItemIndex: String(index),
      fromItem: 'i_project_card',
      project_id: projectId,
      toPage: 'p_project_details',
    };
    let projectUrl = this.data.project_info[index].project_url;
    if (this.data.is_virtual_city && projectUrl !== '') {
      wx.navigateTo({
        url: '/pages/web/web?url=' + encodeURIComponent(projectUrl),
      });
      obj.toPage = 'p_webview';
      obj.to_url = projectUrl;
    } else
      wx.navigateTo({
        url: '/pages/project/detail/projectDetail?projectId=' + projectId,
      });
    if (module == 1) {
      fromModule = 'm_project_price'; // 楼盘价格
    } else if (module == 2) {
      fromModule = 'm_project_details_info'; // 楼盘信息详情
    } else if (module == 3) {
      fromModule = 'm_commuting_route'; // 通勤路线
    } else if (module == 4) {
      fromModule = 'm_surrounding_analysis'; // 周边配套模块
      obj.tab_id = this.data.matingTitleObj.type;
    } else if (module == 5) {
      fromModule = 'm_project_swot_analysis'; // 楼盘优劣势分析
    }
    (obj.fromModule = fromModule),
      autoanalysis.elementTracker('multiProject', obj, 3954);
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
        'multiProject',
        {
          project_ids: this.data.project_ids,
          order_id: this.data.o_id,
          adviser_id: this.data.employee.id,
          material_id: this.data.share_id,
        },
        3956
      );
    } else {
      autoanalysis.elementTracker(
        'multiProject',
        {
          project_ids: this.data.project_ids,
          order_id: this.data.o_id,
          adviser_id: this.data.employee.id,
          material_id: this.data.share_id,
        },
        3957
      );
    }
    this.sendPoint(4662, {
      fromItemIndex: String(e.currentTarget.dataset.index),
    });
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
        currentDestnation: e.currentTarget.dataset.index,
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
        currentDestnation: e.currentTarget.dataset.index,
      });
    }
    autoanalysis.elementTracker(
      'multiProject',
      {
        project_ids: this.data.project_ids,
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
        fromItemIndex: flag ? 1 : 0,
      },
      4662
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
    autoanalysis.elementTracker(
      'multiProject',
      {
        project_id: this.data.project_ids[index],
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
        fromItemIndex: index,
      },
      4841
    );
  },
  didClickMap() {
    if (!this.data.goToMapFlag) return;
    this.data.goToMapFlag = false;
    wx.navigateTo({
      url: '../navigationMap/navigationMap',
    });
    autoanalysis.elementTracker(
      'multiProject',
      {
        project_ids: this.data.project_ids,
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
      },
      4109
    );
  },
  didClickMapMore() {
    wx.navigateTo({
      url: '../navigationMap/navigationMap',
    });
    this.sendPoint(5935);
  },
  lookMore(e) {
    let index = e.target.dataset.index;
    let sonIndex = e.target.dataset.sonIndex;
    let item = this.data.project_info[index].house_list[sonIndex];
    let contentSummaryShow = `project_info[${index}].house_list[${sonIndex}].house_summary_show`;
    let contentSummaryFlag = `project_info[${index}].house_list[${sonIndex}].house_summary_flag`;
    if (item.house_summary_flag) {
      this.setData({
        [contentSummaryShow]: item.house_summary_short,
        [contentSummaryFlag]: false,
      });
    } else {
      this.setData({
        [contentSummaryShow]: item.house_summary,
        [contentSummaryFlag]: true,
      });
    }
  },
  didClicklookMorkReferral() {
    let pathUrl = `${this.data.detailserver}&share_id=${this.data.share_id}&share_type=${this.data.type}&id=${this.data.o_id}`;
    wx.navigateTo({
      url: '/pages/web/web?url=' + encodeURIComponent(pathUrl),
    });
    autoanalysis.elementTracker(
      'multiProject',
      {
        project_ids: this.data.project_ids,
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
        toPage: 'p_webview',
        to_url: this.data.detailserver,
      },
      4019
    );
  },
  navToRecordBox() {
    wx.navigateTo({
      url: '../recordBox/recordBox',
    });
    autoanalysis.elementTracker(
      'multiProject',
      {
        project_ids: this.data.project_ids,
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
        login_state: app.commonData.user.userId ? 1 : 2,
      },
      4024
    );
  },
  async touchOnGoods(e, x) {
    let { isCollect } = e.detail;
    if (isCollect) {
      this.setData({
        isCollect: true,
      });
    } else {
      this.setData({
        isCollect: false,
      });
    }
    autoanalysis.elementTracker(
      'multiProject',
      {
        project_ids: this.data.project_ids,
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
        collection_action: isCollect ? 1 : 2,
      },
      4022
    );
  },
  hostPhoneCall(e) {
    wx.makePhoneCall({
      phoneNumber: this.data.employee.mobile ||  getApp().commonData.channel.phone,
    });
    this.sendPoint(4023);
  },
  hostOnShare() {
    autoanalysis.elementTracker(
      'multiProject',
      {
        project_ids: this.data.project_ids,
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
      },
      4021
    );
  },
  async browse() {
    if (!this.data.browseFlag) return;
    let res = await app.request('/v1/beidou/browse', {
      user_id: app.commonData.user.userId || '',
      share_id: this.data.share_id,
      show_type: 6,
      order_id: this.data.o_id,
      nickname: wxUserInfo.getNickName(),
    });
    console.log(res);
  },
  async getMuchProject(share_id, o_id, type) {
    let _this = this;
    let res = await app.request('/v3/beidou/much-project', {
      share_id: share_id,
    });
    let data = res.data;
    let aroundTrafficFlag = false;
    let housesDescList = [];
    let tags = [];

    let { houseInfoListFix, houseEvaluatingListFix } = this.formatAround(
      data.project_info
    );

    this.data.matingTitle.findIndex((item, index) => {
      if (item.flag) {
        this.data.matingTitleObj = this.getMatingTitleObj(index);
        item.isClick = true;
        return true;
      }
    });

    // tags
    if (data.required != '') {
      Object.keys(data.required).map((key) => {
        if (key === 'house_type' && data.required[key].length >= 1) {
          data.required[key].forEach((houseType) => {
            tags.push(houseType);
          });
        } else if (data.required[key]) {
          tags.push(data.required[key]);
        }
      });
    }

    let markerProjectBubble = this.markerProjectBubble(data.project_bubble);
    _this.setData(
      {
        // BUG
        employee: data.employee || {id: ''},
        project_info: data.project_info,
        down_payments: data.down_payments,
        loan_term: data.loan_term,
        lending_rate: data.lending_rate,
        detailserver: data.detailserver,
        loadingHidden: true,
        isCollect: data.is_collect == 2 ? true : false,
        housesDescList: housesDescList,
        tags: tags,
        commute: data.commute,
        commuteAction: data.commute.length >= 1 ? data.commute[0] : '',
        price_update_datetime: data.price_update_datetime,
        shareMessage: data.share,
        markerProjectBubble: markerProjectBubble,
        project_img: data.project_img,
        project_imglist_current:
          data.project_img.length > 0 ? data.project_img[0] : '',
        is_need_pop: data.is_need_pop,
        is_update_require: data.is_update_require || '',
        forMeCall: data.is_click_like === 1 ? true : false,
        houseInfoListFix: houseInfoListFix,
        houseEvaluatingListFix: houseEvaluatingListFix,
        matingTitle: this.data.matingTitle,
        matingTitleObj: this.data.matingTitleObj,
        is_virtual_city: data.is_virtual_city == 1 ? true : false,
      },
      () => {
        this.browse();
        if (this.data.recommendMapIncludePointList.length > 1) {
          recommendMap.includePoints({
            padding: [40],
            points: this.data.recommendMapIncludePointList,
            success: function (res) {
              console.log(res);
            },
          });
        }

        //20s 弹窗
        if (this.data.is_need_pop) {
          setTimeout(() => {
            if (this.data.is_need_pop) {
              this.data.is_need_pop = false;
              this.didTapAlertWiw(3);
            }
          }, 20000);
        }

        this.exposureFunList();
        this.countCatalog();
        this.countTableLeftProjectNameHeight();
        if (
          this.data.project_imglist_current.img_arr &&
          this.data.project_imglist_current.img_arr.length > 0
        ) {
          this.setData({
            img_type:
              this.data.project_imglist_current.img_arr[0].img_type == 1
                ? '样板间'
                : '效果图',
          });
        }
        this.analyticPageView('e_page_view');
        setTimeout(() => {
          this.data.ePageViewFlag = true;
        }, 500);
      }
    );
    if (data.commute && data.commute.length >= 1) {
      this.initMapData(data.commute);
    }
  },
  // 计算左边table 固定栏 和 左边滑动
  countTableLeftProjectNameHeight() {
    let _this = this;
    this.data.project_info.forEach((item, index) => {
      let className = `.house-info-box-scroll-ri${index}`;
      wx.createSelectorQuery()
        .selectAll(className)
        .boundingClientRect(function (rect) {
          _this.data.houseInfoListFix[index].height = rect[0].height;
          if (index === _this.data.project_info.length - 1) {
            _this.setData({
              houseInfoListFix: _this.data.houseInfoListFix,
            });
          }
        })
        .exec();
    });

    this.data.project_info.forEach((item, index) => {
      let className = `.house-evaluating-scroll-ri${index}`;
      wx.createSelectorQuery()
        .selectAll(className)
        .boundingClientRect(function (rect) {
          _this.data.houseEvaluatingListFix[index].height = rect[0].height;
          if (index === _this.data.project_info.length - 1) {
            _this.setData({
              houseEvaluatingListFix: _this.data.houseEvaluatingListFix,
            });
          }
        })
        .exec();
    });
  },
  formatAround(project_info) {
    // 楼盘详情 table
    let houseInfoListFix = [];

    // 楼盘优劣势
    let houseEvaluatingListFix = [];

    project_info.forEach((item, currentIndex, arr) => {
      // 周边配套  around_traffic  traffic_is_show    // 交通  学校 around_education education_is_show  购物 around_market market_is_show 医院 around_hospital hospital_is_show 房价  second_project_price 2收房  project_price_is_show	 take_address_price 拿地价格
      houseInfoListFix.push({
        project_id: item.project_id,
        project_url: item.project_url,
        name: item.name,
      });

      houseEvaluatingListFix.push({
        project_id: item.project_id,
        name: item.name,
        project_url: item.project_url,
      });

      item.house_list.forEach((houseItem) => {
        if (!item.house_list || item.house_list.length == 0) return;
        houseItem.starList = [];
        let starNum = houseItem.star_level;
        for (let i = 1; i < 6; i++) {
          if (i <= starNum) {
            houseItem.starList.push({
              url: 'icon_dipper_star.png',
            });
          } else if ((i - 1) * 10 < starNum * 10) {
            houseItem.starList.push({
              url: 'icon_dipper_srat_half.png',
            });
          } else {
            houseItem.starList.push({
              url: 'icon_dipper_srat_gray.png',
            });
          }
        }
      });

      let matingTitle = this.data.matingTitle;
      if (item.traffic_is_show && item.around_traffic.length > 0) {
        let obj = {
          first_group_list: [],
          two_group_list: [],
          name: '',
          project_id: '',
        };
        obj.name = item.name;
        obj.project_id = item.project_id;
        item.around_traffic_subway = [];
        item.around_traffic_bus = [];
        item.around_traffic.forEach((transportationItem) => {
          if (transportationItem.type == '2') {
            item.around_traffic_subway.push(transportationItem);
            let txt = `距${transportationItem.line}${transportationItem.station}直线${transportationItem.distance}${transportationItem.unit}`;
            obj.two_group_list.push(txt);
          } else {
            let txt = `距${transportationItem.line}${transportationItem.station}直线${transportationItem.distance}${transportationItem.unit}`;
            item.around_traffic_bus.push(transportationItem);
            obj.first_group_list.push(txt);
          }
        });

        matingTitle[0].flag = true;
        this.data.around_traffic_List.push(obj);
      }

      if (item.education_is_show && item.around_education.length > 0) {
        let obj = {
          first_group_list: [],
          two_group_list: [],
          name: '',
          project_id: '',
        };
        obj.name = item.name;
        obj.project_id = item.project_id;
        item.around_education.forEach((item, index) => {
          ++index;
          let txt = `${index}.距${item.periphery_name}${item.walk_distance}${item.unit}`;
          obj.first_group_list.push(txt);
        });

        matingTitle[1].flag = true;
        this.data.around_education_List.push(obj);
      }

      if (item.market_is_show && item.around_market.length > 0) {
        let obj = {
          first_group_list: [],
          two_group_list: [],
          name: '',
          project_id: '',
        };
        obj.name = item.name;
        obj.project_id = item.project_id;
        item.around_market.forEach((item, index) => {
          ++index;
          let txt = `${index}.距${item.periphery_name}${item.walk_distance}${item.unit}`;
          obj.first_group_list.push(txt);
        });

        matingTitle[2].flag = true;
        this.data.around_market_list.push(obj);
      }

      if (item.hospital_is_show && item.around_hospital.length > 0) {
        let obj = {
          first_group_list: [],
          two_group_list: [],
          name: '',
          project_id: '',
        };
        obj.name = item.name;
        obj.project_id = item.project_id;
        item.around_hospital.forEach((item, index) => {
          ++index;
          let txt = `${index}.距${item.periphery_name}${item.walk_distance}${item.unit}`;
          obj.first_group_list.push(txt);
        });

        matingTitle[3].flag = true;
        this.data.around_hospital_list.push(obj);
      }

      if (
        item.project_price_is_show &&
        (item.take_address_price || item.second_project_price)
      ) {
        let obj = {
          first_group_list: [],
          two_group_list: [],
          name: '',
          project_id: '',
        };
        obj.name = item.name;
        obj.project_id = item.project_id;
        matingTitle[4].flag = true;
        obj.first_group_list.push({
          take_address_price: item.take_address_price,
          second_project_price: item.second_project_price,
        });
        this.data.project_price_list.push(obj);
      }

      this.data.project_ids.push(String(item.project_id));
    });

    return {
      houseInfoListFix,
      houseEvaluatingListFix,
    };
  },
  // 目录模块
  countCatalog() {
    let catalogList = [];

    if (this.data.tags && this.data.tags.length > 0) {
      catalogList.push({
        key: 1,
        name: '您的购房需求',
        flag: false,
        className: 'm_bughouse_need',
      });
    }

    if (
      this.data.markerProjectBubble &&
      this.data.markerProjectBubble.length > 0
    ) {
      catalogList.push({
        key: 2,
        name: '为您推荐楼盘',
        flag: false,
        className: 'recommend-map',
      });
    }

    if (this.data.project_info && this.data.project_info.length > 0) {
      catalogList.push({
        key: 3,
        name: '楼盘价格',
        flag: false,
        className: 'm_project_price',
      });
      catalogList.push({
        key: 4,
        name: '楼盘详细信息',
        flag: false,
        className: 'm_project_details_info',
      });
    }

    if (this.data.commute && this.data.commute.length > 0) {
      catalogList.push({
        key: 5,
        name: '通勤路线',
        flag: false,
        className: 'm_commuting_route',
      });
    }

    if (this.data.matingTitleObj.matingTitleList) {
      catalogList.push({
        key: 6,
        name: '周边配套',
        flag: false,
        className: 'm_surrounding_analysis',
      });
    }

    if (this.data.project_info && this.data.project_info.length > 0) {
      catalogList.push({
        key: 7,
        name: '楼盘优劣势分析',
        flag: false,
        className: 'm_project_swot_analysis',
      });
    }
    if (this.data.project_img.length > 0) {
      catalogList.push({
        key: 8,
        name: '楼盘图片',
        flag: false,
        className: 'm_project_picture',
      });
    }
    catalogList.push({
      key: 9,
      name: '反馈区',
      flag: false,
      className: 'm_feedback',
    });

    this.setData(
      {
        catalogList: catalogList,
      },
      () => {
        this.data.catalogList.forEach((item) => {
          let className = `.${item.className}`;
          this.createSelectorQuery()
            .select(className)
            .boundingClientRect(function (rect) {
              item.top = rect.top;
            })
            .exec();
        });
      }
    );
  },
  // 曝光集合
  exposureFunList() {
    // 曝光 楼盘详细 信息
    this.m_project_details_info = wx.createIntersectionObserver(this);
    this.m_project_details_info
      .relativeToViewport('.container')
      .observe('.m_project_details_info', (res) => {
        this.exposure('m_project_details_info');
        if (this.data.is_need_pop && this.data.dipperLoginFlag) {
          this.data.is_need_pop = false;
          this.didTapAlertWiw(3);
        }
        this.m_project_details_info.disconnect();
      });

    // 反馈模块
    this.m_feedback = wx.createIntersectionObserver(this);
    this.m_feedback
      .relativeToViewport('.container')
      .observe('.m_feedback', (res) => {
        this.exposure('m_feedback');
        this.m_feedback.disconnect();
      });

    //  楼盘图册模块
    this.m_project_picture = wx.createIntersectionObserver(this);
    this.m_project_picture
      .relativeToViewport('.container')
      .observe('.m_project_picture', (res) => {
        this.exposure('m_project_picture');
        this.m_project_picture.disconnect();
      });

    //  楼盘优劣势分析
    this.m_project_swot_analysis = wx.createIntersectionObserver(this);
    this.m_project_swot_analysis
      .relativeToViewport('.container')
      .observe('.m_project_swot_analysis', (res) => {
        this.exposure('m_project_swot_analysis');
        this.m_project_swot_analysis.disconnect();
      });

    //  周边配套模块
    this.m_surrounding_analysis = wx.createIntersectionObserver(this);
    this.m_surrounding_analysis
      .relativeToViewport('.container')
      .observe('.m_surrounding_analysis', (res) => {
        this.exposure('m_surrounding_analysis');
        this.m_surrounding_analysis.disconnect();
      });

    //  楼盘价格模块
    this.m_project_price = wx.createIntersectionObserver(this);
    this.m_project_price
      .relativeToViewport('.container')
      .observe('.m_project_price', (res) => {
        this.exposure('m_project_price');
        this.m_project_price.disconnect();
      });

    //   居理服务模块
    this.m_julive_service = wx.createIntersectionObserver(this);
    this.m_julive_service
      .relativeToViewport('.container')
      .observe('.m_julive_service', (res) => {
        this.exposure('m_julive_service');
        this.m_julive_service.disconnect();
      });

    //   通勤路线模块
    this.m_commuting_route = wx.createIntersectionObserver(this);
    this.m_commuting_route
      .relativeToViewport('.container')
      .observe('.m_commuting_route', (res) => {
        this.exposure('m_commuting_route');
        this.m_commuting_route.disconnect();
      });
  },
  exposure(fromModule) {
    autoanalysis.elementTracker(
      'multiProject',
      {
        project_ids: this.data.project_ids,
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
        fromModule: fromModule,
      },
      5973
    );
  },
  markerProjectBubble(project_bubble) {
    if (project_bubble.length === 0 || !project_bubble) {
      return '';
    } else {
      let markerProjectBubble = [];
      let recommendMapMarkerProjectBubble = []; //  recommendMap  页面使用
      // 这里初始化  发现在page上面 初始化无效
      recommendMap = wx.createMapContext('recommendMap');
      project_bubble.forEach((item, index) => {
        this.data.recommendMapIncludePointList.push({
          latitude: item.lat,
          longitude: item.lng,
        });
        if (item.show_bubble) {
          markerProjectBubble.push({
            latitude: item.lat,
            longitude: item.lng,
            id: index,
            width: 18,
            height: 18,
            iconPath:
              '/dipperSubPK/images/' + markerProjectBubbleImgList[index],
            callout: {
              content: item.name + '\n' + item.price_min,
              color: '#242629',
              fontSize: '14',
              borderRadius: 4,
              padding: 6,
              display: 'ALWAYS',
              textAlign: 'center',
            },
          });
        } else {
          markerProjectBubble.push({
            latitude: item.lat,
            longitude: item.lng,
            id: index,
            width: 18,
            height: 18,
            iconPath:
              '/dipperSubPK/images/' + markerProjectBubbleSolidImgList[index],
          });
        }
        recommendMapMarkerProjectBubble.push({
          project_id: item.project_id,
          latitude: item.lat,
          longitude: item.lng,
          id: index,
          width: 18,
          height: 18,
          iconPath: '/dipperSubPK/images/' + markerProjectBubbleImgList[index],
          callout: {
            content: item.name + '\n' + item.price_min,
            color: '#242629',
            fontSize: '14',
            borderRadius: 4,
            padding: 6,
            display: 'ALWAYS',
            textAlign: 'center',
          },
        });
        this.data.recommendMapMarkerProjectBubble = recommendMapMarkerProjectBubble;
      });
      return markerProjectBubble;
    }
  },
  async fetchRequiredInfo(share_id) {
    let { data } = await app.request('/v3/beidou/required-info', {
      share_id: share_id,
      open_id: enviroment.getOpenId(),
    });

    if (data.project_type && data.project_type.label.length > 0) {
      data.project_type.label.findIndex((item) => {
        if (item.key === data.project_type.default_val) {
          item.flag = true;
          this.data.selectProjectType = item;
          return;
        }
      });
    }
    this.setData({
      total_price: data.total_price,
      first_price: data.first_price,
      acreage: data.acreage,
      project_type_list: data.project_type.label,
    });
  },
  initMapData(arr) {
    arr.forEach((list, idx) => {
      let marker = [];
      let startPointList = [];
      let destination;
      list.forEach((item, index) => {
        if (index > 9) return;
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
          width: 18,
          height: 18,
          iconPath: '/dipperSubPK/images/' + markerProjectBubbleImgList[index],
          callout: {
            content: item.project_name,
            color: '#fff',
            fontSize: '12',
            borderRadius: 4,
            bgColor: startBackColor[index],
            padding: 8,
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
          'A',
          false
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
        type = 6;
      }
      console.log(options.sampshare);
      // 宝典进来 或者 分享进来 进行上报  否则 不上报
      if (
        app.recordFlag.browseFlag ||
        (options.sampshare && options.sampshare.length >= 1)
      ) {
        this.data.browseFlag = true;
      }
      this.setData({
        share_id: share_id,
        o_id: o_id,
        type: type,
        isIpx: app.globalData.isIpx,
      });
      // 启动进入 end
      this.fetchRequiredInfo(share_id);
      this.getMuchProject(share_id, o_id, type);
      this.getUserInfo();
      if (app.globalData.platform === 'ios') {
        // 解决iOS上  input 在cover-view上无法显示
        this.setData({
          isIosInput: true,
        });
      }
    } catch (e) {
      console.log(e);
    }
    wx.showShareMenu({
      withShareTicket: true,
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    autoanalysis.elementTracker(
      'multiProject',
      {
        project_ids: this.data.project_ids,
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
      },
      4021
    );
    return {
      title: this.data.shareMessage.title,
      path: `dipperSubPK/pages/multiProject/multiProject?o_id=${this.data.o_id}&share_id=${this.data.share_id}&type=2`,
      imageUrl: this.data.shareMessage.img,
    };
  },
  onShow: function () {
    this.data.goToMapFlag = true;
    this.data.recommendMapFlag = true;
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
    analyticProperties.fromPage = 'p_multi_project_analysis';
    analyticProperties.material_id = this.data.share_id;
    analyticProperties.adviser_id = this.data.employee.id;
    analyticProperties.order_id = this.data.o_id;
    analyticProperties.toPage = 'p_multi_project_analysis';
    analytic.sensors.track(eventName, analyticProperties);
  },
  employeNavigateTo() {
    wx.navigateTo({
      url: `../employeDetails/employeDetails?o_id=${this.data.o_id}&share_id=${this.data.share_id}&type=${this.data.type}&frompage=p_multi_project_analysis`,
    });
    autoanalysis.elementTracker(
      'multiProject',
      {
        project_ids: this.data.project_ids,
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
      },
      4651
    );
  },
  employeCardShare() {
    console.log('employeCardShare');
  },
  employeCardEmployeCod() {
    autoanalysis.elementTracker(
      'multiProject',
      {
        project_ids: this.data.project_ids,
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
      },
      4657
    );
  },
  employeCardPhoneCall() {
    autoanalysis.elementTracker(
      'multiProject',
      {
        project_ids: this.data.project_ids,
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
      },
      4654
    );
  },
  hostDownApp() {
    autoanalysis.elementTracker(
      'multiProject',
      {
        project_ids: this.data.project_ids,
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
      },
      4832
    );
  },
  hostPayAward(e) {
    let pay_state = e.detail.pay_state;
    autoanalysis.elementTracker(
      'multiProject',
      {
        project_ids: this.data.project_ids,
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
        pay_state: pay_state,
      },
      4664
    );
  },
  didTapSelectHouse(e) {
    let index = e.currentTarget.dataset.index;
    this.setData({
      housesDescTrNum: index,
    });
  },
  didTapSlideSwiper(e) {
    let index = e.detail.current;
    this.setData({
      img_current_index: index + 1,
      img_type:
        this.data.project_imglist_current.img_arr[index].img_type == 1
          ? '样板间'
          : '效果图',
    });
    this.sendPoint(5943, {
      img_url: this.data.project_imglist_current.img_arr[index].url,
      project_id: this.data.project_imglist_current.project_id,
    });
  },
  didTapAlertWiw(e) {
    let type;
    if (Object.prototype.toString.call(e) == '[object Number]') {
      type = e;
    } else {
      type = e.currentTarget.dataset.type;
    }
    this.setData({
      loadAltFlag: true,
      loadAltType: type,
    });
    if (type === 3) {
      autoanalysis.elementTracker(
        'multiProject',
        {
          project_ids: this.data.project_ids,
          order_id: this.data.o_id,
          adviser_id: this.data.employee.id,
          material_id: this.data.share_id,
          fromModule: 'm_buy_house_demand_window',
        },
        5973
      );
      app.request('/v3/beidou/save-required-window', {
        share_id: this.data.share_id,
        open_id: enviroment.getOpenId(),
      });
    } else if (type == 1) {
      this.sendPoint(5929);
    }
  },
  didClickCloseShowModal(e) {
    this.setData({
      loadAltFlag: false,
    });
    if (e.currentTarget.dataset.type == 2) {
      this.sendPoint(5976, {
        click_position: '2',
      });
    } else if (1) {
      this.sendPoint(5976, {
        click_position: '1',
      });
    }
  },
  didClickToOrderConfig(e) {
    let obj = {
      project_ids: this.data.project_ids,
      order_id: this.data.o_id,
      adviser_id: this.data.employee.id,
      material_id: this.data.share_id,
    };
    let index = e.currentTarget.dataset.index;
    if (index == 1) {
      this.sendPoint(5924);
    } else if (index == 2) this.sendPoint(5977);
    wx.navigateTo({
      url: `../orderConfig/orderConfig?share_id=${this.data.share_id}&mobile=${this.data.employee.mobile}&o_id=${this.data.o_id}&employeeId=${this.data.employee.id}`,
    });
  },
  didClickMapScale(e) {
    let type = e.currentTarget.dataset.type;
    let _this = this;

    recommendMap.getScale({
      success: function (res) {
        if (type === 'add') {
          _this.setData({
            recommendMapScale: res.scale + 1,
          });
          _this.sendPoint(5925);
        } else {
          _this.setData({
            recommendMapScale: res.scale - 1,
          });
          _this.sendPoint(5926);
        }
      },
    });
  },
  didClickRecommendMap() {
    if (!this.data.recommendMapFlag) return;
    wx.navigateTo({
      url: `../recommendMap/recommendMap?share_id=${this.data.share_id}&o_id=${this.data.o_id}&employeeId=${this.data.employee.id}`,
    });
    this.sendPoint(5927);
  },
  didClickToClientMessage() {
    wx.navigateTo({
      url: `../clientMessage/clientMessage?share_id=${this.data.share_id}&order_id=${this.data.o_id}&employeeId=${this.data.employee.id}`,
    });
    this.sendPoint(5955);
  },
  didClickChangeSweiperImg(e) {
    let index = e.currentTarget.dataset.index;
    if (this.data.sweiperImgCurrent === index) return;
    this.setData({
      project_imglist_current: this.data.project_img[index],
      sweiperImgCurrent: index,
      swiCurrent: 0, // 默认当前滑块初始化
      img_current_index: 1, //默认当先 n/ length  n 为1
    });
    this.sendPoint(5946, {
      fromItemIndex: String(index),
      project_id: this.data.project_img[index].project_id,
    });
  },
  didClickHouseTypeImg(e) {
    let index = e.currentTarget.dataset.index;
    let arr = [];
    this.data.project_imglist_current.img_arr.forEach((item) => {
      arr.push(item.url);
    });
    let url = this.data.project_imglist_current.img_arr[
      this.data.img_current_index - 1
    ].url;
    wx.previewImage({
      current: url,
      urls: arr,
    });

    this.sendPoint(5945, {
      fromItemIndex: String(index),
      img_url: url,
      project_id: this.data.project_imglist_current.project_id,
    });
  },
  scrollHouseInfo(e) {
    this.sendPoint(5931);
  },
  didClickInputTotalPrice(e) {
    let obj = 'total_price.default_val';
    this.setData({
      [obj]: e.detail.value,
    });
  },
  didClickChangeTotalPrice(e) {
    let obj = 'total_price.default_val';
    this.setData({
      [obj]: e.detail.value,
      totalPriceFocus: false,
    });
    this.sendPoint(5975, {
      input_total_price: e.detail.value,
    });
  },
  tapTotalPriceFocus() {
    this.setData({
      totalPriceFocus: true,
      firstPriceFocus: false,
      acreageFocus: false,
    });
  },
  didClickInputFirstPrice(e) {
    let obj = 'first_price.default_val';
    this.setData({
      [obj]: e.detail.value,
    });
  },
  didClickChangeFirstPrice(e) {
    let obj = 'first_price.default_val';
    this.setData({
      [obj]: e.detail.value,
      firstPriceFocus: false,
    });
    this.sendPoint(5975, {
      input_downpay: e.detail.value,
    });
  },
  tapFirstPriceFocus() {
    this.setData({
      totalPriceFocus: false,
      firstPriceFocus: true,
      acreageFocus: false,
    });
  },
  didClickInputAcreage(e) {
    let obj = 'acreage.default_val';
    this.setData({
      [obj]: e.detail.value,
    });
  },
  didClickChangeAcreage(e) {
    let obj = 'acreage.default_val';
    this.setData({
      [obj]: e.detail.value,
      acreageFocus: false,
    });
    this.sendPoint(5975, {
      input_proportion: e.detail.value,
    });
  },
  tapAcreageFocus() {
    this.setData({
      totalPriceFocus: false,
      firstPriceFocus: false,
      acreageFocus: true,
    });
  },
  didClickProjectType(e) {
    let index = e.currentTarget.dataset.index;
    this.data.project_type_list.forEach((item, idx) => {
      if (index == idx) {
        item.flag = !item.flag;
        if (item.flag) {
          this.sendPoint(5975, {
            project_type: item ? [item.key] : '',
          });
        }
      } else {
        item.flag = false;
      }
    });
    this.setData({
      project_type_list: this.data.project_type_list,
      selectProjectType: this.data.project_type_list[index].flag
        ? this.data.project_type_list[index]
        : { key: '' },
    });
  },
  async didClicksendSaveRequiredInfo() {
    if (!this.data.postSaveRequiredFlag) return;
    let data = this.data;

    let res = await app.request('/v3/beidou/save-required-info', {
      total_price: data.total_price.default_val || '',
      first_price: data.first_price.default_val || '',
      acreage: data.acreage.default_val || '',
      project_type: data.selectProjectType ? data.selectProjectType.key : '',
      share_id: this.data.share_id,
      open_id: enviroment.getOpenId(),
    });

    this.setData({
      loadAltType: 2,
    });
    this.data.postSaveRequiredFlag = true;
    this.sendPoint(5978, {
      input_total_price: data.total_price.default_val || '',
      input_downpay: data.first_price.default_val || '',
      input_proportion: data.acreage.default_val || '',
      project_type: data.selectProjectType ? [data.selectProjectType.key] : '',
    });
  },
  didiClickHouseApartImg(e) {
    let index = e.currentTarget.dataset.index;
    let src = e.currentTarget.dataset.src;
    let projectId = e.currentTarget.dataset.projectid;
    wx.previewImage({
      current: src,
      urls: [src],
    });
    this.sendPoint(5932, {
      fromItemIndex: String(index),
      project_id: projectId,
      img_url: src,
    });
  },
  didClickAatalog(e) {
    let type = e.currentTarget.dataset.type;
    let bole;
    if (type === 'open') {
      bole = true;
    } else {
      bole = false;
    }
    this.setData({
      catalogFlag: bole,
    });
  },
  async pullFor() {
    let res = await app.request('/v1/beidou/like', {
      type: this.data.forMeCall ? '1' : '2',
      user_id: app.commonData.user.userId || '',
      employee_id: this.data.employee.id || '',
    });
    this.setData(
      {
        forMeCall: this.data.forMeCall ? false : true,
      },
      () => {
        this.sendPoint(5952, {
          like_action: this.data.forMeCall ? '1' : '2',
        });
      }
    );
  },
  didiClickAatalogItem(e) {
    let index = e.currentTarget.dataset.index;
    this.data.catalogList.forEach((item) => {
      if (item.flag) {
        item.flag = false;
      }
    });

    this.data.catalogList[index].flag = true;
    this.setData({
      catalogFlag: false,
      catalogList: this.data.catalogList,
    });

    let className = `.${this.data.catalogList[index].className}`;
    let _this = this;
    if (this.data.catalogList[index].top) {
      _this.usePageScrollTo(this.data.catalogList[index].top);
    } else {
      this.createSelectorQuery()
        .select(className)
        .boundingClientRect(function (rect) {
          _this.data.catalogList[index].top = rect.top;
          _this.usePageScrollTo(rect.top);
        })
        .exec();
    }
  },
  usePageScrollTo(top) {
    wx.pageScrollTo({
      scrollTop: top,
      duration: 200,
    });
  },
  didClickMatingItem(e) {
    let { index, key } = e.currentTarget.dataset;
    if (this.data.matingTitle[key].isClick) return;
    this.data.matingTitle.forEach((item) => {
      if (key === item.key) {
        item.isClick = true;
      } else {
        item.isClick = false;
      }
    });
    // type 0 是 公交   type  4   周边价格   else type 123   学校 购物 医院

    let matingTitleObj = this.getMatingTitleObj(key);
    this.setData({
      matingTitle: this.data.matingTitle,
      matingTitleObj: matingTitleObj,
    });
    this.sendPoint(5936, {
      fromItemIndex: String(index),
      tab_id: String(key),
    });
  },
  getMatingTitleObj(key) {
    let matingTitleObj = {};
    switch (key) {
      case 0:
        matingTitleObj.type = 0;
        matingTitleObj.matingTitleList = this.data.around_traffic_List;
        break;
      case 1:
        matingTitleObj.type = 1;
        matingTitleObj.matingTitleList = this.data.around_education_List;
        break;
      case 2:
        matingTitleObj.type = 2;
        matingTitleObj.matingTitleList = this.data.around_market_list;
        break;
      case 3:
        matingTitleObj.type = 3;
        matingTitleObj.matingTitleList = this.data.around_hospital_list;
        break;
      case 4:
        matingTitleObj.type = 4;
        matingTitleObj.matingTitleList = this.data.project_price_list;
        break;
      default:
        matingTitleObj = {};
    }
    return matingTitleObj;
  },
  scrollHouseEvaluating() {
    this.sendPoint(5942);
  },
  sendPoint(id, expandObj) {
    let obj = {
      project_ids: this.data.project_ids,
      order_id: this.data.o_id,
      adviser_id: this.data.employee.id,
      material_id: this.data.share_id,
    };
    if (expandObj) {
      obj = Object.assign({}, obj, expandObj);
    }
    autoanalysis.elementTracker('multiProject', obj, id);
  },
  didClickEmployeeMobile() {
    wx.makePhoneCall({
      phoneNumber: this.data.employee.mobile || getApp().commonData.channel.phone,
    });
    this.sendPoint(5969);
  },
  didClickBackPage() {
    this.setData({
      loadAltFlag: false,
    });
    this.sendPoint(5971);
  },
});
