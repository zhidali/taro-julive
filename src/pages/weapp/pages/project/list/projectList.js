var notification = require('../../../utils/notification.js');
const route = require('../../../route/route.js');
const analytic = require('../../../analytic/analytic.js');
var dropdown = require('../dropdown/dropdown.js');
const utils = require('../../../utils/util.js');
const user = require('../../../user/user.js');
const order = require('../../../order/order.js');
const reportPerformance = require('../../../reportPerformance/reportPerformance');
const beforehandRequest = require('../../../beforehandRequest/beforehandRequest');
const utilGetQr = require('../../../utils/utilGetQr.js');
const app = getApp();
import {
  getAssigned,
  getProjectList,
  favorite,
  listPopup
} from '../../../api/projectList';
import {
  viewProject,
  userDiscount
} from '../../../api/common';

import {
  getFilterNames,
  tarckFilter
} from '../../home/component/filter/getFilterNames';
Page({
  data: {
    abTest: {},
    // star -------- 260列表页面data
    loadingHidden: false,
    hasMore: false,
    needFocus: false,
    page: 1,
    screenItems: [], // 筛选栏选中的标签
    hasSelectedFilter: {}, // 别的页面切换到列表页带来的筛选选项
    brandDeveloperList: [],
    operationHeight: 0,
    screenHeight: 960,
    scrollTop: 0,
    isTakeParam: false, //是否是 携带参数搜索
    houseList: [],
    // 存储曝光楼盘
    observeS: {},
    // 存储猜你喜欢曝光
    observeLike: {},
    ePageViewFlag: false,
    featureList: [],
    showFindHousePop: false, //找房弹窗
    barTypeData: {
      //引导弹窗A
      type: 2,
      isShow: false,
      isClose: false,
    },
    showEmployeePopFlag: true,
    showFullScreenPop: false,
    showFullScreenPopFlag: true,
    showCollectPop: false, //顶部引导收藏弹窗
    showSelectPop: false, //顶部的筛选引导弹窗
    userMobile: app.commonData.user.mobile || '',
    hot_tag: [],
    searchCeiling: false, // 筛选条件烂是否吸顶
    // 升级服务弹出
    isShowJuliveService: false,
    julive_server_intro_popup: {},
    // 留电成功弹窗 弹出
    isShowLeavePhone: false,
    // 留电成功弹窗 按钮文案
    leavePhoneDialogBtnText: '',
    // 留电成功弹窗 按钮类型 如果是1 则是打开app
    leavePhoneDialogBtntype: '',
    // 留电成功弹窗 提示文案
    leavePhoneDialogText: '',
    // 留电成功弹窗类型 1是关闭弹窗需要联动筛选
    leavePhoneDialogType: '',
    // 是否需要调用授权登录
    userLoginStatus: false,
    // 运营配置弹窗
    cmsDialog: false,
    cmsDialogInfo: {},
    // end ------  260列表页面data

    // start ---------- 270列表页面 data
    isLoading: false,
    // 是否请求接口加载
    isGetList: false,
    // 全量筛选
    allFilter: {},
    defaultFilter: {
      // c: '1,9999',
      // h: ['h3', 'h10'],
      // a: ['tongzhou', 'daxing'],
      // s: 's1',
      // g: '11,0'
    },
    // 是否刷新filter 接口
    isRenderFilter: false,
    // 切换卡片提示tips
    swithTips: true,
    // 卡片样式
    cardTypeA: true,
    // 搜索关键词
    keywordTxt: '',
    // 筛选项 top值
    filterTop: 102,
    filterPosition: 'fixed',
    //滑动开始y轴位置
    startY: 0,
    //滑动开始y轴位置    
    lastY: 0,
    // 品牌宣传 品宣
    brandData: {},
    // 动态提醒
    dynamicData: {},
    //留电成功弹出弹窗
    showOrderSuccessAlert: false,
    orderSucccessObj: {
      op_type: '900764'
    },
    alertContent: '',
    // 登录状态
    loginStatus: false,
    // 猜你喜欢楼盘
    guessLikeProject: [],
    // 没有处理的楼盘列表
    originalList: [],
    // 列表楼盘数据
    projectDataList: [],
    // s是否展示猜你喜欢
    isShowGuessList: false,
    // 默认显示搜索框 
    searchFixed: false,
    // 270列表是否有更多
    newHasMore: false,
    // 页码
    newPage: 1,
    // 找房弹窗
    isShowFindHouse: false,
    // 找房弹窗-意向区域
    wantRegion: {
      name: '不限',
      value: '0',
      isShowOption: false
    },
    // 找房弹窗-计划总价
    wantPrice: {
      name: '不限',
      value: '0',
      isShowOption: false
    },
    // 当前需求
    currentNeed: [],
    // 楼盘条数
    listTotal: 0,
    // 楼盘
    bottomBarData: { //底部小弹窗
      isShow: false,
      isOnce: false,
    },
    // onShow两次控制
    hasOnshow: false,
    // 是否展示返回顶部
    isShowBackTop: false,
    // 是否是筛选条件 用来处理 区域，价格，少筛选模块的筛选
    isFilter: false,
    // 是否是首次加载
    isFirstLoad: true,
    // 切换城市
    changeCity: false,
    // 筛选项头部key
    filterKey: '',
    // 禁止重复点击切换卡片 false 可点击 true不可点击
    swithCardFlag: false

    // end ------------ 270列表页面 data
  },
  onLoad: async function (options) {
    await app.getAbtest();
    this.setData({
      abTest: app.abTest
    })
    if (app.abTest.p_project_list_optimization == "A") {
      this.onLoad260(options);
    }

    if (app.abTest.p_project_list_optimization == "B" || app.abTest.p_project_list_optimization == "C") {
      this.onLoad270(options);
    }

    if (app.abTest.p_project_list_optimization == "C") {
      this.setData({
        cardTypeA: false
      })
    }
    // 首次加载置为false
    this.data.isFirstLoad = false;
  },
  onShow: async function () {
    if (this.data.hasOnshow) {
      return
    }
    this.data.hasOnshow = true;
    await app.getAbtest();
    if (app.abTest.p_project_list_optimization == "A") {
      this.onShow260();
    }
    if (app.abTest.p_project_list_optimization == "B" || app.abTest.p_project_list_optimization == "C") {
      this.onShow270();
    }
    // 控制弹窗
    let _timer = setTimeout(() => {
      this.getProjectListPopup();
      clearTimeout(_timer);
    }, 800);

  },
  onPageScroll: function (event) {
    if (app.abTest.p_project_list_optimization == "A") {
      this.onPageScroll260(event);
    } else {
      this.onPageScroll270(event);
    }

  },

  onHide: function () {
    this.data.hasOnshow = false;
    if (app.abTest.p_project_list_optimization == "A") {
      this.analyticPageView();
    } else {

    }
    app.dialogMapData('close');
    // 关闭弹窗
    this.setData({
      isShowLeavePhone: false,
      isShowJuliveService: false,
      cmsDialog: false,
      isShowFindHouse: false
    })
  },
  onUnload: function () {
    if (app.abTest.p_project_list_optimization == "A") {
      this.analyticPageView();
    } else {

    }

  },

  // start -------- 260列表页面方法
  onPageScroll260(event) {
    let {
      scrollTop
    } = event;
    if (scrollTop < 0) return;
    if (scrollTop === 0 && this.data.searchCeiling) {
      this.setData({
        searchCeiling: false,
      });
    } else if (scrollTop > this.data.scrollTop && !this.data.searchCeiling) {
      this.setData({
        searchCeiling: true,
      });
      if (!this.data.isTakeParam) {
        this.judgeSelectPopShow();
      }
    } else if (scrollTop < this.data.scrollTop && this.data.searchCeiling) {
      this.setData({
        searchCeiling: false,
      });
    }
    this.data.scrollTop = scrollTop;
  },
  onLoad260(options) {
    //260版本的投放
    if (options.scene && options.scene.indexOf('ju') !== -1) {
      utilGetQr.getCommonQrInfo(options.scene.split('_')[1]);
      app.globalData.commonQrInfo = true;
    }
    reportPerformance.setInitTime(2002);
    wx.showShareMenu({
      withShareTicket: true,
    });
    let _this = this;
    _this.setBeforehandRequest();
    let screenHeight = 0;
    wx.getSystemInfo({
      success: function (res) {
        screenHeight = res.screenHeight;
        _this.setData({
          screenHeight: screenHeight,
        });
      },
    });
    notification.addNotification('CityHadChanged', _this.refreshPage, _this);
    notification.addNotification(
      'CityHadChanged',
      _this.clearHasSelectedFilter,
      _this
    );
    notification.addNotification(
      'CityLocateComplete',
      _this.locateComplete,
      _this
    );
    this.data.hasSelectedFilter = app.globalData.filter;
    app.globalData.filter = {};
    this.refreshPage();
    this.analyticPageView('e_page_view');
    setTimeout(() => {
      this.data.ePageViewFlag = true;
    }, 500);
  },
  async onShow260() {
    this.data.startViewTime = Date.parse(new Date());
    if (!utils.isEmptyObject(app.globalData.filter)) {
      this.data.hasSelectedFilter = app.globalData.filter;
      this.setData({
        query: '',
      });
      if (app.globalData.filter.search) {
        this.setData({
          needFocus: true,
        });
        dropdown.clearAllFilter();
        await this.dropdownFilterRefresh();
      } else {
        dropdown.setFilter(this.data.hasSelectedFilter, true);
      }
      app.globalData.filter = {};
    }

    if (this.data.ePageViewFlag) {
      this.analyticPageView('e_page_view');
    }
    this.setData({
      userLoginStatus: app.commonData.user.userId ? true : false,
    });
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
  analyticProperties() {
    return {
      fromPage: 'p_project_list',
    };
  },

  onPullDownRefresh: function () {
    this.fetchHousesData(true);
  },

  onReachBottom: function () {

    if (app.abTest.p_project_list_optimization == "A" && this.data.hasMore) {
      this.fetchHousesData(false);
    } else {
      if (this.data.newHasMore) {
        this.data.newPage++;
        this.getList('loadingMore');
      }
    }
  },

  clearHasSelectedFilter: function (e) {
    this.data.hasSelectedFilter = {};
  },

  refreshPage: function () {
    this.setData({
      city: app.commonData.city,
      loadingHidden: false,
      query: '',
    });
    dropdown.clearAllFilter();
    this.fetchProjectAssigned();
  },
  /**
   * @description: 渲染楼盘列表
   * @param {boolean} isRefresh true渲染请求page1， false page++
   */
  fetchHousesData: async function (isRefresh) {
    var _this = this;
    if (isRefresh) {
      this.data.page = 1;
      _this.data.observeLike = {};
      _this.data.observeS = {};
    } else {
      this.data.page++;
    }
    var analyticProperties = dropdown.filter2analytic();
    analyticProperties.fromPage = 'p_project_list';
    if (_this.data.query.length > 0) {
      analyticProperties.query = _this.data.query;
    }
    let filterParam = dropdown.dropdownFilter();
    let isTakeParam = false;
    if (_this.data.query || JSON.stringify(filterParam) != '{}') {
      isTakeParam = true;
    }
    let projectListObj = beforehandRequest.getObjAttribute('projectList');
    let d = '';
    // 如果首页预先请求数据 就用预请求的
    if (
      projectListObj.isUse &&
      projectListObj.response &&
      projectListObj.response.code == 0
    ) {
      beforehandRequest.setObjAttribute('projectList', 'isUse', false);
      d = projectListObj.response;
    } else {
      // 如果投放页面 进来了  比如情报页tabBar 进入列表页了  再去首页 再回来
      beforehandRequest.setObjAttribute('projectList', 'isUse', false);
      d = await app.request('/v1/project/search', {
        keyword: _this.data.query,
        location: app.commonData.location,
        page: _this.data.page,
        filter: dropdown.dropdownFilter(),
      });
    }
    // .then((d) => {
    var data = d.data;
    var list = data && data.list ? data.list : [];
    var hasMore = data && data.has_more ? data.has_more == 1 : false;
    var needFocus = false;
    if (!utils.isEmptyObject(_this.data.hasSelectedFilter)) {
      if (_this.data.hasSelectedFilter.search) {
        needFocus = true;
        _this.data.hasSelectedFilter = {};
      }
    }
    let leg = isRefresh ? 0 : _this.data.houseList.length;
    _this.setData({
        houseList: isRefresh ? list : _this.data.houseList.concat(list),
        brandDeveloperList: data.brand_developer_list ?
          data.brand_developer_list : [],
        loadingHidden: true,
        needFocus: needFocus,
        hasMore: hasMore,
        employee: data.employee ? data.employee : [],
        guess_you_like: data.guess_you_like,
        is_all_sell_out: data.is_all_sell_out,
        isTakeParam: isTakeParam,
        hot_tag: data.hot_tag,
      },
      () => {
        let fromPage = 'p_project_list';
        let fromModule = 'm_project_list';
        // 曝光啊
        if (list.length > 0) {
          list.forEach((item, index) => {
            if (leg >= 20) {
              index = leg + index;
            }
            let observerName = `observer${index}`;
            _this.data.observeS[observerName] = wx.createIntersectionObserver(
              _this
            );
            let className = `.exposure${index}`;
            _this.data.observeS[observerName]
              .relativeToViewport('.container')
              .observe(className, (res) => {
                if (!_this.data.observeS[observerName]) return;
                _this.data.observeS[observerName].disconnect();
                delete _this.data.observeS[observerName];
                let id = res.dataset.id;
                let analyticProperties = _this.analyticProperties();
                analyticProperties.fromPage = fromPage;
                analyticProperties.toPage = fromPage;
                analyticProperties.fromModule = fromModule;
                analyticProperties.fromItemIndex = index;
                analyticProperties.project_id = id;
                analytic.sensors.track('e_module_exposure', analyticProperties);
              });
          });
        }
        // 猜你喜欢曝光
        if (isTakeParam && data.guess_you_like.length > 0) {
          data.guess_you_like.forEach((item, index) => {
            let observerName = `observer${index}`;
            _this.data.observeLike[
              observerName
            ] = wx.createIntersectionObserver(_this);
            let className = `.exposure_like${index}`;

            _this.data.observeLike[observerName]
              .relativeToViewport('.container')
              .observe(className, (res) => {
                if (!_this.data.observeLike[observerName]) return;
                _this.data.observeLike[observerName].disconnect();
                delete _this.data.observeLike[observerName];
                let id = res.dataset.id;
                let analyticProperties = _this.analyticProperties();
                analyticProperties.fromPage = fromPage;
                analyticProperties.toPage = fromPage;
                analyticProperties.fromModule = fromModule;
                analyticProperties.fromItemIndex = index;
                analyticProperties.project_id = id;
                analytic.sensors.track('e_module_exposure', analyticProperties);
              });
          });
        }
        // 上报给微信页面加载+请求后渲染时长
        reportPerformance.sendMsg(2002);
        _this.judgeCollectPopShow();
      }
    );
    wx.stopPullDownRefresh();
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.fromModule = 'm_filter';
    analyticProperties.fromItem = 'i_filter_project';
    analytic.sensors.track('e_filter_project', analyticProperties);
  },
  // 260 获取api筛选项
  fetchProjectAssigned: function () {
    var _this = this;
    app
      .request('/v1/project/assigned', {})
      .then((d) => {
        dropdown.dropdown(
          'dropdown',
          d.data.filter,
          _this.dropdownFilterRefresh,
          'p_project_list',
          _this
        );
        dropdown.setFilter(_this.data.hasSelectedFilter, true);
        dropdown.setPageBarShow(false);
        dropdown.setBarFixed(true);
        dropdown.setBarFixedTop(120);
      })
      .catch((error) => {
        console.log(error);
      });
  },
  async dropdownFilterRefresh() {
    await this.fetchHousesData(true);
    this.setData({
      screenItems: dropdown.filter2screenItems(),
      showEmployeePopFlag: true,
      showFullScreenPopFlag: true,
      showCollectPop: false,
      showSelectPop: false,
      barTypeData: {
        //引导弹窗A
        type: 2,
        isShow: false,
        isClose: false,
      },
    });
  },

  didClickSwitchCity: function () {
    wx.navigateTo({
      url: '/otherRelateSubPK/pages/city/cityList',
    });
    analytic.sensors.track('e_click_select_city_entry', {
      fromPage: this.analyticProperties().fromPage,
      toPage: 'p_select_city',
      fromItem: 'i_select_city_entry',
    });
  },

  didTapSearch: function (e) {
    dropdown.dismiss();
  },

  didConfirmSearch: function (e) {
    this.data.query = e.detail.value;
    this.fetchHousesData(true);
    this.setData({
      loadingHidden: false,
    });
  },
// BUG
  didTapProjectCellView: function (e) {
    var opType = e.currentTarget.dataset.opType;
    let fromModule = '';
    if (opType == 900570) {
      // 猜你喜欢埋点使用  900570
      fromModule = 'm_guess_like_list';
    } else {
      fromModule = 'm_recommend_project';
    }
    let _id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/web/web?url=${getApp().commonData.m_domain_project}${_id}.html`
    });
    //5485
    var analyticProperties = dropdown.filter2analytic();
    analyticProperties.fromPage = this.analyticProperties().fromPage;
    analyticProperties.toPage = 'p_project_details';
    analyticProperties.fromModule = fromModule;
    analyticProperties.fromItem = 'i_project_card';
    analyticProperties.fromItemIndex = String(e.currentTarget.dataset.index);
    analyticProperties.project_id = String(_id);
    if (this.data.query.length > 0) {
      analyticProperties.query = this.data.query;
    }

    analyticProperties.list_type = '1';
    analytic.sensors.track('e_click_project_card', analyticProperties);
  },

  didClickDeleteScreenItem: function (e) {
    let index = e.currentTarget.dataset.index;
    let item = this.data.featureList[index];
    let checked = !item.checked;
    item.checked = checked;
    let anonymity = `dropdown.moreGroupValues.h[${index}].checked`;
    let aliasName = `featureList[${index}].checked`;
    this.setData({
      [anonymity]: checked,
      [aliasName]: checked,
    });

    this.didTapConfirmButton('more'); // dropdown function
    var analyticProperties = this.analyticProperties();
    analyticProperties.fromPage = analytic.page.currentPage();
    analyticProperties.toPage = analytic.page.currentPage();
    analyticProperties.fromModule = 'm_fast_filter';
    analyticProperties.fromItem = 'i_select_tab';
    analyticProperties.tab_id = item.value;
    analyticProperties.fromItemIndex = index - 1; //  0 是不限不展示
    analytic.sensors.track('e_click_select_tab', analyticProperties);
  },
  preventTouchMove: function () {
    return false;
  },

  onShareAppMessage: function () {
    return {
      title: '居理新房-省钱买好房',
      path: 'pages/project/list/projectList',
      complete(res) {
        // share result
        var transpond_result = '2';
        if (res.errMsg === 'shareAppMessage:ok') {
          transpond_result = '1';
        }
        // share type
        var transpond_differentiate = '1';
        if (res.shareTickets && res.shareTickets.length > 0) {
          transpond_differentiate = '2';
        }

        var analyticProperties = this.analyticProperties();
        analyticProperties.fromItem = 'i_transpond';
        analyticProperties.transpond_result = transpond_result;
        analyticProperties.transpond_differentiate = transpond_differentiate;
        analytic.sensors.track('e_click_transpond', analyticProperties);
      },
    };
  },
  makeOrder: function () {
    // 向他咨询按钮
    wx.showLoading({
      title: '预约中...',
      mask: true,
    });
    var _this = this;
    order.makeOrder({
        op_type: _this.data.loginUserInfo.op_type,
      },
      _this.data.loginUserInfo,
      function () {
        wx.hideLoading();
        var alertTitle = '预约成功';
        _this.setData({
          showOrderSuccessAlert: true,
          alertTitle: alertTitle,
          popType: '1',
          alertContent: '您已用手机号' +
            app.commonData.user.mobile +
            '预约了咨询服务，稍后咨询师将来电为您解答疑问，请注意接听电话',
          showLoginModal: false,
          userLoginStatus: true,
        });
      }
    );
  },
  loginSuccessCallback: function (data) {
    if (data && data.detail && data.detail.opType) {
      this.data.loginUserInfo = {
        op_type: data.detail.opType,
      };
    }
    this.setData({
      showLoginModal: false,
      cmsDialog: false
    });
    this.makeOrder();
  },
  didInputSearchVal(e) {
    this.data.query = e.detail.value;
  },
  //拨打电话热线和咨询
  didClickHotline(e) {
    var _this = this;
    wx.makePhoneCall({
      phoneNumber: getApp().commonData.channel.phone || '',
      success: function () {},
      fail: function () {},
    });
    var analyticProperties = _this.analyticProperties();
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.fromModule = 'm_result';
    analyticProperties.fromItem = 'i_dial_service_call';
    analytic.sensors.track('e_click_dial_service_call', analyticProperties);
    order.reportOrder();
  },

  //没有就是底部悬浮我要咨询  2搜索未售罄的帮我咨询 3售罄时候的
  //底部悬浮 我要咨询
  didClickService() {
    let op_type = 900508;
    this.data.loginUserInfo = {
      op_type: op_type,
      fromModule: 'm_floating_window',
    };
    if (app.commonData.user.userId) {
      this.makeOrder();
    }
    var analyticProperties = this.analyticProperties();
    analyticProperties.fromModule = 'm_floating_window';
    analyticProperties.fromItem = 'i_leave_phone_entry';
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.op_type = op_type;
    analyticProperties.login_state = app.commonData.user.userId ? '1' : '2';
    analytic.sensors.track('e_click_leave_phone_entry', analyticProperties);
  },

  //搜索 未售罄的帮我找房
  didClickHelpFindHouse() {
    let op_type = 900511;
    let fromModule = 'm_result';
    this.data.loginUserInfo = {
      op_type: op_type,
      fromModule: fromModule,
    };
    if (app.commonData.user.userId) {
      this.makeOrder();
    }
    var analyticProperties = this.analyticProperties();
    analyticProperties.fromModule = fromModule;
    analyticProperties.fromItem = 'i_leave_phone_entry';
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.op_type = op_type;
    analyticProperties.login_state = app.commonData.user.userId ? '1' : '2';
    analytic.sensors.track('e_click_leave_phone_entry', analyticProperties);
  },

  //搜索 售罄的时候
  didClickSearchSellOut() {
    let op_type = 900512;
    let fromModule = 'm_recommend';
    this.data.loginUserInfo = {
      op_type: op_type,
      fromModule: fromModule,
    };
    if (app.commonData.user.userId) {
      this.makeOrder();
    }
    var analyticProperties = this.analyticProperties();
    analyticProperties.fromModule = fromModule;
    analyticProperties.fromItem = 'i_leave_phone_entry';
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.op_type = op_type;
    analyticProperties.login_state = app.commonData.user.userId ? '1' : '2';
    analytic.sensors.track('e_click_leave_phone_entry', analyticProperties);
  },
  onShareAppMessage: function () {
    return {
      title: '居理新房-省钱买好房',
      path: 'pages/home/home',
    };
  },
  //帮我找房
  didClickFindHouse(state) {
    this.data.loginUserInfo = {
      op_type: '900510',
      fromModule: 'm_help_find_house',
    };
    if (app.commonData.user.userId) {
      this.makeOrder();
    }
    var analyticProperties = this.analyticProperties();
    analyticProperties.fromPage = analyticProperties.fromPage;
    analyticProperties.fromModule = 'm_help_find_house';
    analyticProperties.fromItem = 'i_leave_phone_entry';
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.op_type = this.data.loginUserInfo.op_type;
    analyticProperties.login_state = app.commonData.user.userId ? '1' : '2';
    analytic.sensors.track('e_click_leave_phone_entry', analyticProperties);
  },
  //居理咨询师-免费咨询
  didTapAskEmployee(e, markIndex) {
    let index = e ? e.currentTarget.dataset.index : markIndex;
    let employee_id = this.data.employee.list[index].employee_id;
    let fromModule = 'm_adviser_card';
    this.data.loginUserInfo = {
      op_type: '900509',
      adviser_id: employee_id,
      fromModule: fromModule,
      fromItemIndex: String(index),
    };
    if (app.commonData.user.userId) {
      this.makeOrder();
    }
    var analyticProperties = this.analyticProperties();
    analyticProperties.fromPage = analyticProperties.fromPage;
    analyticProperties.fromModule = fromModule;
    analyticProperties.fromItem = 'i_leave_phone_entry';
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.login_state = app.commonData.user.userId ? '1' : '2';
    analyticProperties.op_type = this.data.loginUserInfo.op_type;
    analyticProperties.adviser_id = this.data.loginUserInfo.adviser_id;
    analyticProperties.fromItemIndex = String(index);
    analytic.sensors.track('e_click_leave_phone_entry', analyticProperties);
  },
  didClickViewEmployeeDetails() {},
  didClickEmployeeInfoUrl(e) {
    let index = e.currentTarget.dataset.index;
    let item = this.data.employee.list[index];
    route.transfer(item.employee_url);
    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = 'p_web_view';
    analyticProperties.fromModule = 'm_adviser_card';
    analyticProperties.fromItem = 'm_adviser_card';
    analyticProperties.to_url = item.employee_url;
    analyticProperties.adviser_id = item.employee_id;
    analyticProperties.fromItemIndex = String(index);
    analytic.sensors.track('e_click_adviser_card', analyticProperties);
  },
  //打开app
  OpenApp() {
    analytic.sensors.track('e_click_open_app', {
      fromPage: this.analyticProperties().fromPage,
      fromItem: 'i_open_app',
      toPage: 'p_online_service',
    });
  },

  //-------------实验A下面的， 引导弹窗A B
  didGuidePopADiscount() {
    if (JSON.stringify(this.data.employeeFullData) !== '{}') {
      this.setData({
        ['barTypeData.isShow']: false,
        showFullScreenPop: true,
      });
      this.data.guide_window_type = 'A';
      //B 弹窗曝光埋点
      analytic.sensors.track('e_module_exposure', {
        fromPage: this.analyticProperties().fromPage,
        toPage: this.analyticProperties().fromPage,
        fromModule: 'm_guide_leave_phone_window',
        guide_window_type: 'B',
        expo_type: '1',
      });
    } else {
      this.setData({
        ['barTypeData.isShow']: false,
      });
    }
    //关闭的埋点
    analytic.sensors.track('e_click_close', {
      fromPage: this.analyticProperties().fromPage,
      toPage: this.analyticProperties().fromPage,
      fromModule: 'm_guide_leave_phone_window',
      fromItem: 'i_close',
      guide_window_type: 'A',
      click_position: '1',
    });

  },

  didCloseEmployeePop() {
    this.setData({
      ['barTypeData.isClose']: false,
    });
    let _this = this;
    let closeGuideTimer = setTimeout(() => {
      _this.setData({
        ['barTypeData.isShow']: false,
      });
      clearTimeout(closeGuideTimer);
    }, 1000);
    analytic.sensors.track('e_click_close', {
      fromPage: this.analyticProperties().fromPage,
      toPage: this.analyticProperties().fromPage,
      fromModule: 'm_guide_leave_phone_window',
      fromItem: 'i_close',
      guide_window_type: 'A',
      click_position: '2',
    });
  },

  //弹窗B，充屏弹窗
  didCloseFullPop() {
    this.setData({
      showFullScreenPop: false,
    });
    var analyticProperties = this.analyticProperties();
    analyticProperties.fromPage = analytic.fromPage;
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.fromItem = 'i_close';
    analyticProperties.countermand_step = String(this.data.step);
    analytic.sensors.track('e_click_close', analyticProperties);
  },
  didConsultFullPop() {
    this.data.loginUserInfo = {
      op_type: '900708',
      guide_window_type: this.data.guide_window_type,
      fromModule: 'm_guide_leave_phone_window',
      fromItem: 'i_confirm_leave_phone',
    };
    if (app.commonData.user.userId) {
      this.makeOrder();
    }
    //留电埋点
    analytic.sensors.track('e_click_leave_phone_entry', {
      fromPage: this.analyticProperties().fromPage,
      toPage: this.analyticProperties().fromPage,
      fromModule: 'm_guide_leave_phone_window',
      fromItem: 'i_leave_phone_entry',
      op_type: this.data.loginUserInfo.op_type,
      guide_window_type: this.data.guide_window_type,
      login_state: app.commonData.user.userId ? '1' : '2',
    });
  },
  didCloseDiscountPop() {
    this.setData({
      showLoginModal: false,
    });
  },
  //顶部收藏弹窗
  judgeCollectPopShow() {
    let _this = this;
    if (app.globalData.listCollectPopState == true) return;
    if (app.globalData.wx_ad_coming) {
      this.setData({
        showCollectPop: true,
      });
    }
    analytic.sensors.track('e_module_exposure', {
      fromPage: this.analyticProperties().fromPage,
      toPage: this.analyticProperties().fromPage,
      fromModule: 'm_guide_collect_window',
    });
    let collectTimer = setTimeout(() => {
      _this.setData({
        showCollectPop: false,
      });
      clearTimeout(collectTimer);
    }, 8000);
    app.globalData.listCollectPopState = true;
  },
  didCloseCollectPop() {
    this.setData({
      showCollectPop: false,
    });
    app.globalData.listCollectPopState = true;
  },
  //顶部的引导筛选弹窗
  judgeSelectPopShow() {
    if (app.globalData.listSelectPopState == true) return;
    this.setData({
      showSelectPop: true,
    });
    let _this = this;
    let selectTimer = setTimeout(() => {
      _this.setData({
        showSelectPop: false,
      });
      clearTimeout(selectTimer);
    }, 8000);
    app.globalData.listSelectPopState = true;
    analytic.sensors.track('e_module_exposure', {
      fromPage: this.analyticProperties().fromPage,
      toPage: this.analyticProperties().fromPage,
      fromModule: 'm_guide_filter_window',
    });
  },
  setBeforehandRequest() {
    beforehandRequest.setObjAttribute('projectList', 'selfFlag', false);
  },
  //第十个之后的快捷筛选
  didClickSelectFilter(e) {
    //清空之前的 已选的 featureList
    let _featureList = this.data.featureList;
    _featureList.map((item) => {
      item.checked = false;
    });
    this.setData({
      featureList: _featureList,
    });
    let item = e.currentTarget.dataset.item;
    let filter = {};
    let _list = [];
    let obj = {};
    if (item.parent_key != 'a') {
      obj.key = item.parent_key;
    }
    obj.value = item.son_key;
    _list.push(obj);
    filter[item.parent_key] = _list;
    dropdown.setFilter(filter, true);
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0,
    });
    analytic.sensors.track('e_click_select_tab', {
      fromPage: this.analyticProperties().fromPage,
      toPage: this.analyticProperties().fromPage,
      fromModule: 'm_quick_filter',
      fromItem: 'i_select_tab',
      fromItemIndex: String(e.currentTarget.dataset.index),
      tab_id: item.son_key,
    });
  },

  // 实验B的留电登陆调微信登陆逻辑
  passBackGetPhoneNumberBtn(e) {
    let {
      markOpType,
      markIndex
    } = e.detail;
    //底部悬浮的咨询按钮
    if (markOpType == '900508') {
      this.didClickService();
    } else if (markOpType == '900510') {
      this.didClickFindHouse(true);
    } else if (markOpType == '900509') {
      this.didTapAskEmployee('', markIndex);
    } else if (markOpType == '900706') {} else if (markOpType == '900708') {
      this.didConsultFullPop();
    } else if (markOpType == '900511') {
      //搜索未售罄的
      this.didClickHelpFindHouse();
    } else if (markOpType == '900512') {
      this.didClickSearchSellOut();
    }
  },
  passBackFastLoginCallBack(e) {
    if (e.detail.loginStatus) {
      this.makeOrder();
      this.setData({
        userLoginStatus: true,
      });
    }
    this.setData({
      showFullScreenPop: false,
    });
  },


  // end ------- 260列表页面方法



  onLoad270(options) {
    // 初始化进入拉取缓存判断
    this.setData({
      loginStatus: app.commonData.login_status ? true : false
    })
    app.watchCommonData('login_status', (newv) => {
      this.setData({
        loginStatus: newv ? true : false
      }, () => {
        this.getList('loadingMore');
        this.showBottomBarPop()
      })
    })
    // 切换卡片tips提示
    setTimeout(() => {
      this.setData({
        swithTips: false
      })
    }, 5000)
    this.getFilter();
    // 监听城市改变

    notification.addNotification('CityHadChanged', this.cityChange, this);
  },
  cityChange() {
    this.data.changeCity = true;
  },
  onShow270() {
    let {
      keywordTxt,
      isFirstLoad
    } = this.data;
    let keyword = app.globalData.searchKey;
    let searchCity = wx.getStorageSync('search_city');
    // app.globalData.searchKey = '';

    // 处理如果首页修改了收藏  并且当前不是首次进入该页面  当前页面上对应修改避免请求接口
    let collectState = app.commonData.homeChangeCollect;
    if (collectState && !isFirstLoad) {
      this.data.newPage = 1;
      this.data.originalList = [];
      this.getList('loadingMore');
      app.commonData.homeChangeCollect = false;
    }
    // 判断是否要刷新filter， 如上次筛选与全局存储不一致刷新
    this.data.isRenderFilter = false;
    if (JSON.stringify(this.data.defaultFilter) != JSON.stringify(app.globalData.newFilter)) {
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 0,
      });
      this.data.isRenderFilter = true;
    }
    if (keywordTxt != keyword && searchCity !== '') {
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 0,
      });
      this.data.isRenderFilter = true;
    }
    if (this.data.changeCity) {
      this.data.isRenderFilter = true;
    }
    // 判断是否需要 刷新筛选组件
    this.setData({
      city: app.commonData.city,
      // newPage: 1,
      // originalList: [],
      keywordTxt: keyword,
      defaultFilter: JSON.parse(JSON.stringify(app.globalData.newFilter))
    }, () => {
      // 如需要刷新筛选组件
      if (this.data.isRenderFilter) {
        this.getFilter();
      }
    })
  },

  onPageScroll270(e) {
    this.debounce(this.pageScroll, 15, e);
  },
  pageScroll(e) {
    let {
      scrollTop
    } = e;
    if (scrollTop < 0) return;
    if (scrollTop === 0) {
      this.setData({
        filterTop: 102,
        searchFixed: false
      });
    } else if (scrollTop > this.data.scrollTop) { // 向下滚动
      this.setData({
        filterTop: 0,
        searchFixed: true
      });
    } else if (scrollTop < this.data.scrollTop) { // 向上滚动
      this.setData({
        filterTop: 102,
        searchFixed: false
      });
    }

    this.setData({
      isShowBackTop: scrollTop === 0 ? false : true,
      scrollTop
    })
    // this.data.scrollTop = scrollTop;
  },
  // 防抖函数
  debounce(fn, interval) {
    var gapTime = interval || 1000;
    clearTimeout(this.tim);
    var context = this;
    var args = Array.prototype.slice.apply(arguments).slice(2);
    this.tim = setTimeout( ()=> {
      fn.call(context, ...args);
    }, gapTime);
  },
  // 270 Bc版本中关闭组件中 按钮 留电成功弹窗回调
  confirmCallbackVb() {
    this.data.newPage = 1;
    this.getList('loadingMore');
  },
  // 270 Bc版本中关闭组件中 叉号 留电成功弹窗回调
  hideModalCallbackVb() {
    this.data.newPage = 1;
    this.getList('loadingMore');
  },
  // 点击收藏 上报埋点
  clickCollect(data) {
    let {
      cardTypeA
    } = this.data;
    let {
      state,
      login,
      cardIndex,
      fromModule,
      projectId
    } = data.detail;
    console.log(data.detail);
    
    // 楼盘卡片收藏埋点 9151
    analytic.sensors.track('e_click_collect', {
      fromPage: 'p_project_list',
      fromModule: fromModule,
      fromItem: 'i_collect',
      toPage: 'p_project_list',
      login_state: login ? 1 : 2,
      collect_action: state,
      project_style: cardTypeA ? '1' : '2',
      project_id: projectId,
      fromItemIndex: cardIndex
    });
  },
  // 修改卡片收藏的回调
  changeCollect(data) {
    let {
      state,
      cardIndex,
    } = data.detail;

    app.commonData.listChangeCollect = true;
    let list = this.data.projectDataList
    list[cardIndex].is_collect = parseInt(state);
    this.setData({
      projectDataList: list
    })
  },
  // 获取筛选组件top数值
  getFilterTop() {
    const query = wx.createSelectorQuery();
    query.select('#home-filter').boundingClientRect((res) => {
      this.data.filterTop = res.top;
    }).exec();
  },
  // 价格筛选模块点击
  filterPrice(e) {
    // 点击更多范围
    if (e.detail === 'more') {
      this.setData({
        filterTop: 0
      }, () => {
        this.selectComponent("#list-filter").filterKey('price', 'c');
      })
      return;
    };
    // 点击价格
    this.data.isFilter = true;
    this.setData({
      ['defaultFilter.c']: [e.detail]
    }, () => {
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 0,
      });
      this.selectComponent("#list-filter").renderFilter('default', 'moduleClick');
    })
  },
  // 少筛选引导模块点击
  filterLittleRes(e) {
    let defaultFilter = this.data.defaultFilter;
    // 如果点击清空传空对象
    if (JSON.stringify(e.detail) !== "{}") {
      // 如果删除的是搜索词
      if (e.detail.key === 'key') {
        this.setData({
          keywordTxt: ''
        })
      } else if (Array.isArray(defaultFilter[e.detail.key])) {
        // 如果数组里只有一项 就直接删掉
        if (defaultFilter[e.detail.key].length === 1) {
          delete this.data.defaultFilter[e.detail.key];
        } else {
          defaultFilter[e.detail.key].splice(defaultFilter[e.detail.key].indexOf(e.detail.value), 1);
        }
      } else {
        delete this.data.defaultFilter[e.detail.key];
      }
    } else {
      defaultFilter = {};
      this.setData({
        keywordTxt: ''
      })
    }
    this.setData({
      defaultFilter: defaultFilter,
      isFilter: true
    }, () => {
      this.selectComponent("#list-filter").renderFilter('default', 'moduleClick');
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 0,
      });
    })
  },


  // 区域筛选模块点击
  filterRegion(e) {
    // 点击更多区域
    if (e.detail === 'more') {
      this.setData({
        filterTop: 0
      })
      this.selectComponent("#list-filter").filterKey('region', 'a');
      return;
    };
    // 点击区域
    this.setData({
      ['defaultFilter.a']: [e.detail],
      isFilter: true
    }, () => {
      this.selectComponent("#list-filter").renderFilter('default', 'moduleClick');
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 0,
      });
    })
  },
  // 提交数据
  submitFilter(e) {
    this.setData({
      defaultFilter: e.detail.appFilter,
      newPage: 1,
      originalList: [],
      isGetList: false
    }, () => {
      if (e.detail.isClick || this.data.keywordTxt !== '' || this.data.changeCity) {
        this.data.changeCity = false;
        this.getList('submit');
      } else {
        this.getList('loadingMore');
      }

      let {
        currentNeedArr,
        commonArr
      } = getFilterNames(this.data.allFilter, e.detail.appFilter);
      // 如果有关键词，也展示在少筛选模块里
      if (this.data.keywordTxt) {
        commonArr.unshift({
          name: this.data.keywordTxt,
          key: 'key',
          value: this.data.keywordTxt
        })
      }
      this.setData({
        currentNeed: currentNeedArr.join(' | '),
        littleResData: commonArr
      })
    })

  },
  // 点击二级筛选上报埋点 5464 选中时上报 取消时不上报
  quickFilter(data) {
    analytic.sensors.track('e_click_select_tab', {
      fromPage: 'p_project_list',
      toPage: 'p_project_list',
      fromItem: 'i_select_tab',
      fromModule: 'm_fast_filter',
      tab_id: data.detail.value,
      fromItemIndex: data.detail.index,
    });
  },
  // 点击筛选tab  2541
  clickFilterKey(e) {

    this.data.filterKey = e.detail.key;

    this.setData({
      filterTop: 0
    })
  },
  clearFiltertop() {
    this.setData({
      filterTop: this.data.searchFixed ? -1 : 102
    })
  },

  // 列表页面获取筛选项
  async getFilter() {
    let res = await getAssigned();
    if (res.code == 0) {
      let allFilter = res.data.filter;
      // 切换城市
      this.setData({
        allFilter
      })
    }
  },
  // 切换卡片样式
  swithCard() {
    let {
      keywordTxt,
      defaultFilter,
      cardTypeA,
      swithCardFlag,
      originalList,
      guessLikeProject
    } = this.data;
    if (swithCardFlag) {
      return
    }
    this.setData({
      cardTypeA: !this.data.cardTypeA
    }, () => {
      setTimeout(() => {
        this.data.swithCardFlag = false;
      }, 200)
    })
    // 清空监听的曝光 重新曝光
    this.data.observeS = [];
    this.data.observeLike = [];

    // 9176
    analytic.sensors.track('e_click_switch', {
      fromPage: 'p_project_list',
      toPage: 'p_project_list',
      fromItem: 'i_switch',
      fromModule: 'm_top_bar',
      switch_status: this.data.cardTypeA ? '2' : '1'
    });

    // 曝光楼盘卡片
    if (originalList.length > 0) {
      originalList.forEach((item, index) => {

        let observerName = `observer${index}`;
        this.data.observeS[observerName] = wx.createIntersectionObserver();
        let className = `.card-module${this.data.cardTypeA ? 'a':'b'}${index}`;
        this.data.observeS[observerName]
          .relativeToViewport('.house-list-wrap')
          .observe(className, (res) => {
            if (!this.data.observeS[observerName]) return;
            this.data.observeS[observerName].disconnect();
            delete this.data.observeS[observerName];
            // 9149  
            analytic.sensors.track('e_module_exposure', Object.assign({
              fromPage: 'p_project_list',
              fromItemIndex: index,
              fromModule: 'm_recommend_project',
              toPage: 'p_project_list',
              query: keywordTxt,
              project_id: res.dataset.id,
              project_style: this.data.cardTypeA ? '1' : '2'
            }, tarckFilter(defaultFilter)));
            // 9248 延迟曝光
            let timer = setTimeout(() => {
              wx.createSelectorQuery().select(`.card-module${this.data.cardTypeA ? 'a':'b'}${index}`).boundingClientRect( rect => {
                if (rect.top < app.globalData.hh) {
                  analytic.sensors.track('e_module_exposure_delay', Object.assign({
                    fromPage: 'p_project_list',
                    fromModule: 'm_recommend_project',
                    fromItemIndex: index,
                    toPage: 'p_project_list',
                    project_id: res.dataset.id,
                    project_style: this.data.cardTypeA ? '1' : '2'
                  }, tarckFilter(defaultFilter)));
                }
              }).exec()
              clearTimeout(timer);
            }, 300);
          });
      });
    }
    // 曝光猜你喜欢
    if (guessLikeProject.length > 0) {
      guessLikeProject.forEach((item, index) => {
        let observerName = `observer${index}`;
        this.data.observeLike[
          observerName
        ] = wx.createIntersectionObserver();
        let className = `.like-module${this.data.cardTypeA ? 'a':'b'}${index}`;

        this.data.observeLike[observerName]
          .relativeToViewport('.house-list-wrap')
          .observe(className, (res) => {
            if (!this.data.observeLike[observerName]) return;
            this.data.observeLike[observerName].disconnect();
            delete this.data.observeLike[observerName];
            // 9149 
            analytic.sensors.track('e_module_exposure', Object.assign({
              fromPage: 'p_project_list',
              fromItemIndex: index,
              fromModule: 'm_guess_like_list',
              toPage: 'p_project_list',
              query: keywordTxt,
              project_id: res.dataset.id,
              project_style: this.data.cardTypeA ? '1' : '2'
            }, tarckFilter(defaultFilter)));

            // 9248 延迟曝光
            let timer = setTimeout(() => {
              wx.createSelectorQuery().select(`.like-module${this.data.cardTypeA ? 'a':'b'}${index}`).boundingClientRect(rect=> {
                if (rect.top < app.globalData.hh) {
                  analytic.sensors.track('e_module_exposure_delay', Object.assign({
                    fromPage: 'p_project_list',
                    fromModule: 'm_guess_like_list',
                    fromItemIndex: index,
                    toPage: 'p_project_list',
                    project_id: res.dataset.id,
                    project_style: this.data.cardTypeA ? '1' : '2'
                  }, tarckFilter(defaultFilter)));
                }
              }).exec()
              clearTimeout(timer);
            }, 300);
          });
      });
    }

  },
  // 跳转搜索页面
  skipSearch() {
    // 9175
    analytic.sensors.track('e_click_search_entry', {
      fromPage: 'p_project_list',
      toPage: 'p_project_of_search',
      fromItem: 'i_search_entry',
      fromModule: 'm_top_bar'
    });
    wx.navigateTo({
      url: `/searchSubPK/pages/search/search?searchValue=${this.data.keywordTxt}&clickType=2`,
    });
  },
  // 清空搜索关键词
  emptyKeyword() {
    this.data.newPage = 1;
    this.data.isRenderFilter = false;
    wx.navigateTo({
      url: `/searchSubPK/pages/search/search?searchValue=${this.data.keywordTxt}&clickType=1`
    });
  },

  /**
   * 请求楼盘列表数据
   * @param {string} para  点击筛选submit
   */
  async getList(para) {
    try {
      let {
        keywordTxt,
        defaultFilter,
        newPage,
        originalList,
        isRenderFilter,
        isFilter,
        cardTypeA
      } = this.data;
      let params = {
        keyword: keywordTxt,
        location: app.commonData.location,
        page: newPage,
        filter: defaultFilter,
        total: para.detail ? parseInt(para.detail.value) : ''
      }
      let {
        data,
        code
      } = await getProjectList(params);
      if (code === 0) {
        // 处理展示模块
        let card = this.disposeCard();
        // originalList 原始楼盘列表 和新数据拼接后处理模块
        let projectArr = originalList.concat(data.list);
        let total = parseInt(data.total);
        // 应该插入四个模块 但首次20条不符合模块添加条数 删除最后一个
        if (parseInt(data.total) > 30 && newPage == 1 && card.length > 3) {
          card = card.slice(0, 3)
        }
        // 合并卡片
        let arr = this.moduleConcatProject(projectArr, total, card, 6);
        if (para != 'loadingMore' || isRenderFilter || isFilter) {
          wx.showToast({
            title: `共${data.total}个楼盘`,
            icon: "success",
            duration: 1200
          })
        }
        this.setData({
          isFilter: false,
          isGetList: true,
          isLoading: true,
          newHasMore: data.has_more ? data.has_more == 1 : false,
          originalList: originalList.concat(data.list),
          projectDataList: arr,
          isShowGuessList: originalList.concat(data.list).length < 16,
          guessLikeProject: data.guess_like,
          brandData: data.banner.branding || {},
          dynamicData: data.banner.dynamic_remind || {},
          regionData: data.banner.quick_search_1 || {},
          priceModuleData: data.banner.quick_search_2 || {},
          findRoomData: data.banner.booking_service || {}
        }, () => {
          // 筛选项曝光
          if (para == 'submit') {
            if (this.data.filterKey == 'sort') { 
              // 2549
              analytic.sensors.track('e_click_filter_sort', {
                fromPage: 'p_project_list',
                fromModule: 'm_filter',
                fromItem: 'i_filter_sort',
                toPage: 'p_project_list',
                filter_sort: app.globalData.newFilter.s || ''
              });
              // 2541
              analytic.sensors.track('e_filter_project', Object.assign({}, {
                fromPage: 'p_project_list',
                fromModule: 'm_filter',
                fromItem: 'i_filter_project',
                toPage: 'p_project_list',
                query: keywordTxt,
                result_cnt: data.total
              }, tarckFilter(defaultFilter)));
            } else { 
              // 2541
              analytic.sensors.track('e_filter_project', Object.assign({}, {
                fromPage: 'p_project_list',
                fromModule: 'm_filter',
                fromItem: 'i_filter_project',
                toPage: 'p_project_list',
                query: keywordTxt,
                result_cnt: data.total
              }, tarckFilter(defaultFilter)));
            }
          }
          // 加载底部以外别的返回顶部
          if (para !== 'loadingMore') {
            wx.pageScrollTo({
              scrollTop: 0,
              duration: 0,
            });
          }

          // 曝光楼盘卡片
          if (data.list.length > 0) {
            data.list.forEach((item, index) => {

              let observerName = `observer${originalList.length + index}`;
              this.data.observeS[observerName] = wx.createIntersectionObserver();
              let className = `.card-module${cardTypeA ? 'a':'b'}${originalList.length + index}`;
              this.data.observeS[observerName]
                .relativeToViewport('.house-list-wrap')
                .observe(className, (res) => {
                  if (!this.data.observeS[observerName]) return;
                  this.data.observeS[observerName].disconnect();
                  delete this.data.observeS[observerName];
                  // 9149  
                  analytic.sensors.track('e_module_exposure', Object.assign({
                    fromPage: 'p_project_list',
                    fromItemIndex: originalList.length + index,
                    fromModule: 'm_recommend_project',
                    toPage: 'p_project_list',
                    query: keywordTxt,
                    project_id: res.dataset.id,
                    project_style: cardTypeA ? '1' : '2'
                  }, tarckFilter(defaultFilter)));
                  // 9248 延迟曝光
                  let timer = setTimeout(() => {
                    wx.createSelectorQuery().select(`.card-module${cardTypeA ? 'a':'b'}${originalList.length + index}`).boundingClientRect((rect)=> {
                      if (rect.top < app.globalData.hh) {
                        analytic.sensors.track('e_module_exposure_delay', Object.assign({
                          fromPage: 'p_project_list',
                          fromModule: 'm_recommend_project',
                          fromItemIndex: originalList.length + index,
                          toPage: 'p_project_list',
                          project_id: res.dataset.id,
                          project_style: cardTypeA ? '1' : '2'

                        }, tarckFilter(defaultFilter)));
                      }
                    }).exec()
                    clearTimeout(timer);
                  }, 300);
                });
            });
          }
          // 曝光猜你喜欢
          if (data.guess_like.length > 0) {
            data.guess_like.forEach((item, index) => {
              let observerName = `observer${index}`;
              this.data.observeLike[
                observerName
              ] = wx.createIntersectionObserver();
              let className = `.like-module${cardTypeA ? 'a':'b'}${index}`;

              this.data.observeLike[observerName]
                .relativeToViewport('.house-list-wrap')
                .observe(className, (res) => {
                  if (!this.data.observeLike[observerName]) return;
                  this.data.observeLike[observerName].disconnect();
                  delete this.data.observeLike[observerName];
                  // 9149 
                  analytic.sensors.track('e_module_exposure', Object.assign({
                    fromPage: 'p_project_list',
                    fromItemIndex: index,
                    fromModule: 'm_guess_like_list',
                    toPage: 'p_project_list',
                    query: keywordTxt,
                    project_id: res.dataset.id,
                    project_style: cardTypeA ? '1' : '2'
                  }, tarckFilter(defaultFilter)));

                  // 9248 延迟曝光
                  let timer = setTimeout(() => {
                    wx.createSelectorQuery().select(`.like-module${cardTypeA ? 'a':'b'}${index}`).boundingClientRect((rect)=> {
                      if (rect.top < app.globalData.hh) {
                        analytic.sensors.track('e_module_exposure_delay', Object.assign({
                          fromPage: 'p_project_list',
                          fromModule: 'm_guess_like_list',
                          fromItemIndex: index,
                          toPage: 'p_project_list',
                          project_id: res.dataset.id,
                          project_style: this.data.cardTypeA ? '1' : '2'
                        }, tarckFilter(defaultFilter)));
                      }
                    }).exec()
                    clearTimeout(timer);
                  }, 300);
                });
            });
          }
          // 筛选曝光 只有第一页曝光
          if (this.data.newPage == 1) {
            let analyticObj = {
              fromPage: 'p_project_list',
              toPage: 'p_project_list'
            }
            // 区域模块曝光 9156
            this.exposureModule('.region-module', Object.assign({}, analyticObj, {
              fromModule: 'm_district_quick_filter'
            }));
            // 价格模块曝光 9158
            this.exposureModule('.price-module', Object.assign({}, analyticObj, {
              fromModule: 'm_price_quick_filter'
            }));
            // 少筛选模块曝光 9166
            this.exposureModule('.little-res-module', Object.assign({}, analyticObj, {
              fromModule: 'm_little_filter_guide'
            }));
            // 品宣模块  9169
            this.exposureModule('.brand-box', Object.assign({}, analyticObj, {
              fromModule: 'm_bottom_promotion'
            }));
            // 动态提醒 9163
            this.exposureModule('.dynamic-state-box', Object.assign({}, analyticObj, {
              fromModule: 'm_dynamic_tip'
            }, tarckFilter(defaultFilter)));
            // 预约找房曝光埋点 9160 
            this.exposureModule('.find-room-box', Object.assign({}, analyticObj, {
              fromModule: 'm_appoint_banner'
            }));
            // 领福利 9152
            this.exposureModule('.welfare-observe-box', Object.assign({}, analyticObj, {
              fromModule: 'm_login_gift_window'
            }));

          }
        })
      }
    } catch (e) {
      console.log(e)
    }
  },
  // 跳转详情页
  async skipDetail(e) {
    try {
      let {
        id,
        type,
        index
      } = e.currentTarget.dataset;
      let {
        defaultFilter,
        keywordTxt,
        cardTypeA
      } = this.data;
      // 5485
      analytic.sensors.track('e_click_project_card', Object.assign({
        fromPage: 'p_project_list',
        fromModule: type,
        fromItem: 'i_project_card',
        toPage: 'p_project_details',
        project_id: id,
        fromItemIndex: index + '',
        query: keywordTxt,
        project_style: cardTypeA ? '1' : '2'
      }, tarckFilter(defaultFilter)));

      let params = {
        project_id: id
      }
      if (params.project_id) {
        await viewProject(params);
      }
      wx.navigateTo({
        url: `/pages/web/web?url=${app.commonData.m_domain_project}${e.currentTarget.dataset.id}.html`
      });
    } catch (e) {
      console.log(e)
    }
  },
  // 处理插入的模块
  disposeCard() {
    let {
      defaultFilter,
      loginStatus,
      currentNeed
    } = this.data;
    let card = [];
    // 判断是否展示 快捷筛选1 区域筛选
    if (!defaultFilter.a) {
      card.push('1')
    }
    // 快捷筛选2  总价筛选
    if (!defaultFilter.c) {
      card.push('2')
    }
    // 预约找房 
    // 未登录 或者  登录 且 有未关闭的居理订单
    if (!loginStatus || (!app.commonData.userHasOrder && loginStatus)) {
      card.push('3')
    }
    // 动态提醒
    // 当用户触发筛选项选中（点击筛选，或搜索联想词命中筛选项），且当前用户当前城市无居理关闭订单
    if (currentNeed != '' && !app.commonData.userHasOrder) {
      card.push('4')
    }
    return card;
  },
  /**
   * 合并模块和楼盘list
   * @param {array} list    楼盘数组
   * @param {array} module  模块数组
   * @param {number} num    模块间隔的楼盘个数
   */
  moduleConcatProject(list = [], listTotal = 0, module = [], num) {
    let arr = [];
    let k = 0;
    let returnArr = [];
    // 小于直接返回
    if (listTotal <= num - 1) {
      return list;
    }

    // 分为二维数组 [ [6], a, [6],[4] ]
    for (let i = 0; i < listTotal; i += num) {

      let a = list.slice(i, i + num);
      arr.push(a);
      if (module[k] && listTotal - (i + num) > num) {
        arr.push(module[k]);
        k++;
      }
    }

    // 扁平化
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] instanceof Array) {
        for (let k = 0; k < arr[i].length; k++) {
          returnArr.push(arr[i][k])
        }
      } else {
        returnArr.push(arr[i])
      }
    }
    return returnArr;
  },
  // 返回顶部
  backTop() {
    this.setData({
      filterTop: 102,
      searchFixed: false
    });
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0,
    });
    // 9173
    analytic.sensors.track('e_click_top_tag', {
      fromPage: 'p_project_list',
      fromModule: 'm_bottom_floating_window',
      fromItem: 'i_top_tag',
      toPage: 'p_project_list'
    });
  },
  // 留电事件
  leavePhoneHandle(data) {
    let {
      defaultFilter,
      loginStatus
    } = this.data;
    let {
      state,
      type,
      opType,
      order_id,
      business_type
    } = data.detail;
    // 预约找房模块回调
    if (type == 'findRoom') {
      // state  0留电入口 1留电成功
      if (state == 0) {
        // id: 9161
        analytic.sensors.track('e_click_leave_phone_entry', {
          fromPage: 'p_project_list',
          fromModule: 'm_appoint_banner',
          fromItem: 'i_leave_phone_entry',
          toPage: 'p_project_list',
          login_state: loginStatus ? 1 : 2,
          op_type: opType,
        });
      } else {
        // id: 9162
        analytic.sensors.track('e_click_confirm_leave_phone', {
          fromPage: 'p_project_list',
          fromModule: 'm_appoint_banner',
          fromItem: 'i_confirm_leave_phone',
          toPage: 'p_project_list',
          op_type: opType,
          leave_phone_state: '1',
          order_id: order_id + '',
          business_type: business_type + ''
        });
      }
      // 品宣回调
    } else if (type == 'brand') {
      // state  0留电入口 1留电成功
      if (state == 0) {
        // id: 9170
        analytic.sensors.track('e_click_leave_phone_entry', {
          fromPage: 'p_project_list',
          fromModule: 'm_bottom_promotion',
          fromItem: 'i_leave_phone_entry',
          toPage: 'p_project_list',
          login_state: loginStatus ? 1 : 2,
          op_type: opType,
        });
      } else {
        // id: 9171
        analytic.sensors.track('e_click_confirm_leave_phone', {
          fromPage: 'p_project_list',
          fromModule: 'm_bottom_promotion',
          fromItem: 'i_leave_phone_entry',
          toPage: 'p_project_list',
          op_type: opType,
          leave_phone_state: '1',
          order_id: order_id + '',
          business_type: business_type + ''
        });
      }
    } else if (type == 'dynamic') {
      // 动态提醒模块回调
      // 留电入口
      if (state == 0) {
        // 9164
        // project_open_time  开盘时间
        analytic.sensors.track('e_click_leave_phone_entry', Object.assign({
          fromPage: 'p_project_list',
          fromModule: 'm_dynamic_tip',
          fromItem: 'i_leave_phone_entry',
          toPage: 'p_project_list',
          op_type: opType,
          login_state: loginStatus ? 1 : 2,
        }, tarckFilter(defaultFilter)));

      } else {
        // 留电成功  9165
        analytic.sensors.track('e_click_confirm_leave_phone', Object.assign({
          fromPage: 'p_project_list',
          fromModule: 'm_dynamic_tip',
          fromItem: 'i_confirm_leave_phone',
          toPage: 'p_project_list',
          leave_phone_state: '1',
          op_type: opType,
          order_id: order_id + '',
          business_type: business_type + ''
        }, tarckFilter(defaultFilter)));
      }
    }
  },

  /**
   * 点击授权登录
   * @param {string}  / type 1看过 2领取福利banner 3品牌宣传 4找房弹窗
   */
  allowSeeLogin(e) {
    let {
      type
    } = e.currentTarget.dataset;
    // 看过
    if (type == 1) {
      wx.navigateTo({
        url: '/myRelateSubPK/pages/myFavorite/myFavorite',
      });
    } else if (type == 2) {
      // 9154
      analytic.sensors.track('e_click_confirm_login', {
        fromPage: 'p_project_list',
        toPage: 'p_project_list',
        fromModule: 'm_login_gift_window',
        fromItem: 'i_confirm_login'
      });
      wx.showModal({
        content: '领取成功，可在我的查看',
        showCancel: false,
        complete: () => {
          // 没有订单跳转 购房报告
          if (!app.commonData.userHasOrder) {
            // 9155
            analytic.sensors.track('e_click_report_entry', {
              fromPage: 'p_project_list',
              toPage: 'p_buy_house_report',
              fromModule: 'm_login_gift_window',
              fromItem: 'i_report_entry'
            });

            wx.navigateTo({
              url: '/myRelateSubPK/pages/getReport/getReport'
            });

          }
        },
      });
    } else if (type == 3) {
      this.newMakeOrder();
    } else if (type == 4) {
      // 找房弹窗
      this.findHouseLoginSuccess();
    }

  },
  /**
   * 点击取消授权
   * @param {string}  / type 1看过 2领取福利banner 3品牌宣传 4找房弹窗
   */
  cancelSeeLogin(e) {
    let {
      type
    } = e.currentTarget.dataset;
    // 看过
    if (type == 1) {
      // 登录失败
      wx.showToast({
        title: "登录失败",
        icon: "none",
        duration: 2000
      });
      // 领取福利banner
    } else if (type == 2) {
      wx.showToast({
        title: "领取失败",
        icon: "none",
        duration: 2000
      });
    } else if (type == 3) {
      wx.showToast({
        title: "预约失败",
        icon: "none",
        duration: 2000
      });
    } else if (type == 4) {
      // 找房弹窗
      if (app.commonData.login_status) {
        this.findHouseLoginSuccess();
      }
    }
  },
  /**
   * 点击授权登录
   * @param {string}  / type 1看过 2领取福利banner 3品牌宣传 4找房弹窗
   */
  clickSeeLogin(e) {
    let {
      type
    } = e.currentTarget.dataset;
    let login = this.data.loginStatus;

    if (type == 1) {
      if (login) {
        wx.navigateTo({
          url: '/myRelateSubPK/pages/myFavorite/myFavorite',
        });
      }
      // 9172
      analytic.sensors.track('e_click_viewed', {
        fromPage: 'p_project_list',
        fromModule: 'm_bottom_floating_window',
        fromItem: 'i_viewed',
        toPage: 'p_my_follow',
        login_state: login ? 1 : 2
      });
    } else if (type == 2) {
      // 9153
      analytic.sensors.track('e_click_login_entry', {
        fromPage: 'p_project_list',
        toPage: 'p_project_list',
        fromModule: 'm_login_gift_window',
        fromItem: 'i_login_entry'
      });
    } else if (type == 3 && login) {
      this.newMakeOrder();
    } else if (type == 4) {
      this.findHouseLoginSuccess();
      // 留电口埋点8625
      analytic.sensors.track('e_click_leave_phone_entry', {
        fromPage: 'p_project_list',
        toPage: 'p_project_list',
        fromModule: 'm_help_find_window',
        fromItem: 'i_leave_phone_entry',
        op_type: '900706',
        login_state: app.commonData.login_status ? '1' : '2',
        district: this.data.wantRegion.value ? [this.data.wantRegion.value] : [],
        total_budget: this.data.wantPrice.value || '',
      });
    }

  },
  // 处理品宣留电
  newMakeOrder() {
    // 向他咨询按钮
    order.makeOrder({
        op_type: this.data.orderSucccessObj.op_type,
      },
      this.data.orderSucccessObj,
      () => {
        this.setData({
          showOrderSuccessAlert: true,
          alertTitle: '预约成功',
          popType: '1',
          alertContent: '您已用手机号' +
            app.commonData.user.mobile +
            '预约了咨询服务，稍后咨询师将来电为您解答疑问，请注意接听电话',
          showLoginModal: false,
          userLoginStatus: true,
        });
      })
  },


  // don't move 不要动 start ----- 专用于抽离弹窗代码
  // 关闭升级服务弹窗
  closeServiceDialog() {
    app.dialogMapData('close');
    this.setData({
        isShowJuliveService: false,
      },
      () => {
        // 8888
        analytic.sensors.track('e_click_close', {
          fromPage: 'p_project_list',
          toPage: 'p_project_list',
          fromModule: 'm_update_service_window',
          fromItem: 'i_close',
        });
      }
    );
  },
  // 升级服务弹窗 帮我找房按钮
  clicksjService() {
    // 8889
    analytic.sensors.track('e_click_leave_phone_entry', {
      fromPage: 'p_project_list',
      fromModule: 'm_update_service_window',
      fromItem: 'i_leave_phone_entry',
      toPage: 'p_project_list',
      login_state: app.commonData.login_status ? 1 : 2,
      op_type: '900741'
    });
  },
  // 升级服务弹窗 允许登陆
  async allowService() {
    try {
      app.dialogMapData('close');
      this.setData({
        isShowJuliveService: false
      })
      wx.showLoading({
        title: '预约中...',
      });
      let res = await userDiscount({
        op_type: '900741'
      });
      wx.hideLoading();
      if (res.code == 0) {
        // 8921
        analytic.sensors.track('e_click_confirm_leave_phone', {
          fromPage: 'p_project_list',
          fromModule: 'm_update_service_window',
          fromItem: 'i_confirm_leave_phone',
          toPage: 'p_project_list',
          login_state: app.commonData.login_status ? 1 : 2,
          op_type: '900741',
          order_id: res.data.order_id,
          leave_phone_state: '1',
          business_type: res.data.business_type
        });
        app.dialogMapData('set', 'list-orderSuccess');
        // 留电成功弹窗弹出
        this.setData({
          isShowLeavePhone: true,
          leavePhoneDialogBtnText: '好的',
          leavePhoneDialogText: `您已用手机号${app.commonData.user.mobile}预约了咨询服务，稍后咨询师将来电为您解答疑问，请注意接听电话`,
        });
      }
    } catch (e) {
      console.log(e);
    }
  },
  // 升级服务弹窗 取消登录
  cancelService() {
    app.dialogMapData('close');
    this.setData({
      isShowJuliveService: false
    })
  },

  // 关闭留电成功弹窗
  closeLeavePhone(e) {
    let {
      type
    } = e.currentTarget.dataset;
    app.dialogMapData('close');
    // 预约找房弹窗 -- 留电成功
    if (type === '1') {
      //跳转至 app
      analytic.sensors.track('e_click_open_app', {
        fromPage: this.data.fromPage,
        fromModule: 'm_leave_phone_success_window',
        fromItem: 'i_open_app',
        toPage: 'p_online_service'
      });
    }
    // 筛选联动 只有BC实验联动
    if (this.data.leavePhoneDialogType === '1') {
      if (app.abTest.p_project_list_optimization !== 'A') {
        let obj = {};
        if (this.data.wantRegion.value != '0') {
          obj.a = [this.data.wantRegion.value]
        }
        if (this.data.wantPrice.value != '0') {
          obj.c = [this.data.wantPrice.value]
        }
        this.setData({
          defaultFilter: Object.assign({}, this.data.defaultFilter, obj)
        }, () => {
          wx.pageScrollTo({
            scrollTop: 0,
            duration: 0,
          });
          this.selectComponent("#list-filter").renderFilter('default');
        })
      }
    }
    this.setData({
      isShowLeavePhone: false,
    });
  },
  //v2.5.0 列表页面弹窗接口
  async getProjectListPopup() {
    try {
      let res = await listPopup();
      if (res.code == 0) {
        // 有未关闭的居理订单
        // if (res.data.has_order == 1) {
        //   return;
        // }
        let _employee = Object.assign({}, this.data.barTypeData, {
          popup: res.data.employee_block_popup,
        });
        let _bottomBar = Object.assign({}, this.data.bottomBarData, {
          popup: res.data.employee_block_popup_b,
        });
        this.setData({
            project_match_popup: res.data.project_match_popup,
            julive_server_intro_popup: res.data.julive_server_intro_popup,
            barTypeData: _employee,
            bottomBarData: _bottomBar,
          },
          () => {
            this.judgeFindHousePopShow(res);
            if (app.abTest.p_project_list_optimization == "A") {
              this.setData({
                employeeFullData: res.data.employee_full_screen_popup
              })
              this.listEmployeePopState();
            } else {
              this.showBottomBarPop()
            }
          }
        );
      }
    } catch (e) {
      console.log(e)
    }
  },

  /**
   * 实验A：弹窗A、B的展示逻辑
   */
  // BUG
  listEmployeePopState() {
    let _this = this;
    let dataA = this.data.barTypeData;
    if (dataA.popup && dataA.popup.avatar && dataA.popup.title) {
      wx.createIntersectionObserver()
        .relativeToViewport({
          bottom: 0,
        })
        .observe('.exposure6', (res) => {
          if (_this.data.showEmployeePopFlag == false) return;
          _this.setData({
            ['barTypeData.isShow']: res.intersectionRatio > 0 ? true : false,
            showEmployeePopFlag: false,
          });
          analytic.sensors.track('e_module_exposure', {
            fromPage: this.analyticProperties().fromPage,
            toPage: this.analyticProperties().fromPage,
            fromModule: 'm_guide_leave_phone_window',
            guide_window_type: 'A',
          });
        });
    }

    if (JSON.stringify(_this.data.employeeFullData) !== '{}') {
      wx.createIntersectionObserver()
        .relativeToViewport({
          bottom: 0,
        })
        .observe('.exposure24', (res) => {
          if (_this.data.showFullScreenPopFlag == false) return;
          _this.setData({
            showFullScreenPop: res.intersectionRatio > 0 ? true : false, //limengge
            showFullScreenPopFlag: false,
          });
          this.data.guide_window_type = 'B';
          //曝光
          analytic.sensors.track('e_module_exposure', {
            fromPage: this.analyticProperties().fromPage,
            toPage: this.analyticProperties().fromPage,
            fromModule: 'm_guide_leave_phone_window',
            guide_window_type: 'B',
            expo_type: '2',
          });
        });
    }
  },

  showBottomBarPop() {
    if (app.commonData.userHasOrder) {
      return
    }
    let _this = this;
    wx.createIntersectionObserver().relativeToViewport({
      bottom: 0
    }).observe(`.card-module${this.data.cardTypeA ? 'a':'b'}19`, (res) => {
      // 这句return 要写在observe 里面，不然下面的setdata会一只执行
      if (_this.data.bottomBarData.isOnce) {
        return
      }
      _this.setData({
        ['bottomBarData.isShow']: true,
        ['bottomBarData.isOnce']: true
      });
      //曝光-8640
      analytic.sensors.track('e_module_exposure', {
        fromPage: 'p_project_list',
        toPage: 'p_project_list',
        fromModule: 'm_guide_leave_phone_window',
        guide_window_type: 'A',
        expo_type: '2'
      });
    })
  },

  // 实验B的弹窗A 关闭事件--8642
  didCloseBottomBarPop() {
    this.setData({
      ['bottomBarData.isShow']: false,
      ['bottomBarData.isOnce']: true
    });
    analytic.sensors.track('e_click_close', {
      fromPage: 'p_project_list',
      toPage: 'p_project_list',
      fromModule: 'm_guide_leave_phone_window',
      guide_window_type: 'A',
      fromItem: 'i_close'
    });
    L
  },

  // 开始列表页弹窗
  judgeFindHousePopShow(res) {
    // 升级服务弹出弹出
    new Promise(async (resolve, reject) => {
      // 弹出升级服务弹窗
      if (app.dialogMapData('dialog') == 'list-service' && app.dialogMapData('get', 'list-service') == 1) {
        this.setData({
            isShowJuliveService: true
          },
          () => {
            // 8887
            analytic.sensors.track('e_module_exposure', {
              fromPage: 'p_project_list',
              toPage: 'p_project_list',
              fromModule: 'm_update_service_window',
            });
          }
        );
      }

      if (app.dialogMapData('dialog') == 'list-orderSuccess') {
        // 留电成功弹窗弹出
        this.setData({
          isShowLeavePhone: true,
          leavePhoneDialogBtnText: '好的',
          leavePhoneDialogText: `您已用手机号${app.commonData.user.mobile}预约了咨询服务，稍后咨询师将来电为您解答疑问，请注意接听电话`,
        });
      }
      resolve();
    }).then(() => {
      // 有未关闭订单 或是裂变分享卡片进入的
      if (app.commonData.userHasOrder) {
        return
      }

      // 弹出找房弹窗
      if (app.abTest.help_find_home_optimization != 'C') {
        if (app.dialogMapData('get', 'home-ground') == 0 && app.dialogMapData('get', 'list-findhouse') == 0 && !app.dialogMapData('status') && app.dialogMapData('get', 'home-fission') == 0) {
          app.dialogMapData('set', 'list-findhouse');
          this.setData({
            isShowFindHouse: true
          })
          // 8624
          analytic.sensors.track('e_module_exposure', {
            fromPage: 'p_project_list',
            toPage: 'p_project_list',
            fromModule: 'm_help_find_window',
            fromItem: 'i_activity_window'
          });
        }
      }

      // 弹出列表页面cms配置  落地页弹窗
      if (
        app.abTest.help_find_home_optimization == 'C' &&
        !app.dialogMapData('status') &&
        app.dialogMapData('get', 'home-ground') == 0 &&
        app.dialogMapData('get', 'list-ground') == 0 &&
        app.dialogMapData('get', 'home-fission') == 0 && 
        res.data.tanceng.length > 0
      ) {
        app.dialogMapData('set', 'list-ground');
        this.setData({
          cmsDialog: true,
          cmsDialogInfo: res.data.tanceng.length > 0 ? res.data.tanceng[0] : {}
        }, () => {
          // 6225
          analytic.sensors.track('e_show_activity_window', {
            fromPage: 'p_project_list',
            toPage: 'p_project_list',
            fromModule: 'm_activity_window',
            fromItem: 'i_activity_window',
            banner_id: this.data.cmsDialogInfo.id || '',
            window_type: this.data.cmsDialogInfo.show_banner_type
          });
        })
      }
    });
  },
  // 关闭cms弹窗
  closeCmsDialog() {
    app.dialogMapData('close');
    this.setData({
      cmsDialog: false
    });
    // 6227
    analytic.sensors.track('e_click_close', {
      fromPage: 'p_project_list',
      toPage: 'p_project_list',
      fromModule: 'm_activity_window',
      fromItem: 'i_close',
      banner_id: this.data.cmsDialogInfo.id || '',
      window_type: this.data.cmsDialogInfo.show_banner_type
    });
  },
  // cms弹窗跳转到h5
  cmsJump() {
    if (this.data.cmsDialogInfo.url) {
      route.transfer(this.data.cmsDialogInfo.url);
      // 6226
      analytic.sensors.track('e_click_activity_window', {
        fromPage: 'p_project_list',
        toPage: 'p_project_list',
        fromModule: 'm_activity_window',
        fromItem: 'i_activity_window',
        banner_id: this.data.cmsDialogInfo.id || '',
        window_type: this.data.cmsDialogInfo.show_banner_type,
        to_url: this.data.cmsDialogInfo.url,
        click_position: "1"
      });
    }
  },
  // don't move 不要动  end  ---------   专用于抽离弹窗代码
  // 点击找房弹窗option
  clickOption(e) {
    let {
      option,
      type
    } = e.currentTarget.dataset;
    option.isShowOption = false;
    if (type === 'region') {
      this.setData({
        wantRegion: option
      })
    } else if (type === 'price') {
      this.setData({
        wantPrice: option
      })
    }

  },
  // 点击预约找房中 区域/总价 出现下拉框
  clickSelect(e) {
    let {
      type
    } = e.currentTarget.dataset;
    // 如果点击区域 区域下拉框出现 总价隐藏
    if (type === "region") {
      let regionStatus = this.data.wantRegion.isShowOption;
      this.setData({
        ['wantRegion.isShowOption']: !regionStatus,
        ['wantPrice.isShowOption']: false
      })
    } else {
      let priceStatus = this.data.wantPrice.isShowOption;
      this.setData({
        ['wantPrice.isShowOption']: !priceStatus,
        ['wantRegion.isShowOption']: false
      })
    }
  },
  // 预约找房 中登陆成功后留电
  // 登陆成功后 / 已登陆点击
  async findHouseLoginSuccess() {
    if (app.commonData.login_status) {
      // 向他咨询按钮
      wx.showLoading({
        title: '预约中...',
        mask: true,
      });
      var _this = this;
      // 请求留电接口
      let params = {
        op_type: '900706',
        city_id: app.commonData.city.city_id,
        channel_id: app.commonData.channel.channel_id,
        channel_put: wx.getStorageSync('julive_channel_put') || '',
        require: {
          district_ids: this.data.wantRegion.value,
          min_price: this.data.wantPrice.value
        }
      }
      // 埋点基础字段
      this.data.loginUserInfo = {
        op_type: '900706',
        fromModule: 'm_help_find_window',
        fromItem: 'i_confirm_leave_phone',
        district: this.data.wantRegion.value ? [this.data.wantRegion.value] : [],
        total_budget: this.data.wantPrice.value || '',
      };
      let analyticProperties = this.data.loginUserInfo;

      try {
        let {
          code,
          data,
          errMsg
        } = await userDiscount(params);
        wx.hideLoading();
        _this.setData({
          leavePhoneDialogBtnText: '打开APP 找房更流畅',
          leavePhoneDialogBtnType: '1',
          leavePhoneDialogType: '1',
          leavePhoneDialogText: `您已用手机号${app.commonData.user.mobile}预约了咨询服务，稍后咨询师将来电为您解答疑问，请注意接听电话`,
          isShowLeavePhone: true,
          isShowFindHouse: false
        })
        if (code === 0) {
          // order文件里的留电埋点8628
          analyticProperties.op_type = params.op_type || '';
          analyticProperties.source = params.source || '';
          analyticProperties.order_id = String(data.order_id);
          analyticProperties.business_type = String(data.business_type);
          analyticProperties.fromPage = 'p_project_list';
          analyticProperties.toPage = 'p_project_list';
          analyticProperties.leave_phone_state = '1';
          analytic.sensors.track('e_click_confirm_leave_phone', analyticProperties);
          user.fetchUserHasOrder();
        } else {
          analyticProperties.leave_phone_state = '2';
          analytic.sensors.track('e_click_confirm_leave_phone', analyticProperties);
        }
      } catch (error) {
        console.log(error);
        analyticTrack(analyticProperties, false);
      }
    }
  },
  // 预约找房弹窗关闭
  hideFindHouse() {
    // 8660
    analytic.sensors.track('e_click_close', {
      fromPage: 'p_project_list',
      toPage: 'p_project_list',
      fromModule: 'm_help_find_window',
      fromItem: 'i_close',
    });
    this.setData({
      isShowFindHouse: false
    })
  },
  /**
   * 模块曝光
   * @param {string} moduleClass 需要监听的类名
   * @param {object} analyticObj 埋点字段
   */
  exposureModule(moduleClass, analyticObj) {
    let Observer = wx.createIntersectionObserver();
    Observer.relativeToViewport({
      bottom: 0
    }).observe(moduleClass, () => {
      Observer.disconnect();
      // 9156 9158 9166
      analytic.sensors.track('e_module_exposure', analyticObj);
    });
  }
});