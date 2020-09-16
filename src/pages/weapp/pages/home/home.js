const app = getApp();
const notification = require('../../utils/notification.js');
const route = require('../../route/route.js');
const analytic = require('../../analytic/analytic.js');
const order = require('../../order/order.js');
const reportPerformance = require('../../reportPerformance/reportPerformance');
const enviroment = require('../../enviroment/enviroment.js');
const utilGetQr = require('../../utils/utilGetQr.js');

import {
  getHomeData,
  getHomeCityNews,
  getCondition,
  getHomePopup,
  getHomeRecommendProject,
  getHomeSubscribe
} from '../../api/home';
import {
  getAssigned,
  getProjectList
} from '../../api/projectList';
import {
  viewProject
} from '../../api/common';
import {
  tarckFilter,
  getFilterNames
} from './component/filter/getFilterNames';

Page({
  data: {
    // 是否显示骨架屏 false显示 true
    loadingHidden: false,
    //是否执行onShow中的e_page_view，true 执行
    ePageViewFlag: false,
    //顶部的banner
    bannerList: [],
    //顶部banner 当前轮播项
    currentBannerIndex: 0,
    //顶部banner 当前滑块阴影
    currentBannerIndexShadow: 0,
    // 留电成功弹窗，true展示
    showOrderSuccessAlert: false,
    //右边的悬浮窗，true展示
    showHotline: false,
    //悬浮窗的展开折叠，true展开
    showTabModule: true,
    //落地页弹窗的数据
    tanceng: '',
    //底部的一键登录，type==1，代表是底部一键登陆弹窗，
    barTypeData: {
      isShow: false,
      type: 1,
      once: false,
    },
    userLoginStatus: false, // 当前登陆状态，true是登陆
    bannerOne: [], // banner 1
    currentBannerOneIndexShadow: 0, //banner1 的当前展示的index加阴影
    bannerTwo: [], //banner 2
    currentBannerTwoIndexShadow: 0, //banner2 的当前展示的index 加阴影
    hotHouse: [], // 热销楼盘
    saleHouse: [], // 特价楼盘
    openTimeHouse: [], // 新开楼盘
    weekend: 0, // 距离周末时间 秒
    little_king_kong: [], // 金刚位置
    employee: {}, // 咨询师信息
    alertContent: '', // 弹窗提示
    isTakeParam: false, // 楼盘列表位置筛选项条件判断 是否携带筛选项
    bannerOneplay: false, // banner one 上面 是否轮播
    bannerTwoplay: false, //bannner two 上面 是否轮播
    showHomePoProjectSub: true, //避免用户切换城市 后避免订阅楼市动态弹窗执行
    // ------- 270使用
    isShowNumToast: false, //筛选的时候展示toast提示，true 提示
    findRoomState: false, //找房弹窗的判断
    homeAllFilter: {}, // condition接口下发的filter
    homeDefaultFilter: {}, // 列表的筛选项，数据同步app.globalData.newFilter 
    findHouseFilter: {}, // A实验埋点所用首页查找房源
    listAllFilter: {}, // assigned接口下发的filter
    // oPenDebug: true, // 上线必须关闭 && 并且要在onload&html  里面注释掉代码 ！！！
    // 列表筛选项距离顶部距离
    filterTop: 0,
    pageScrollTop: 0, // 页面滚动高度
    // filter吸顶 relative | fixed 
    filterPosition: 'relative',
    abTest: {}, //实验
    showHomeLandPop: false, //首页落地页弹窗展示
    showHomeSubscriptionPop: false, //订阅弹窗展示
    changeCity: false,
    // 裂变活动相关弹窗数据
    fissionData: {},
    // 筛选项头部key
    filterKey: ''
  },

  onLoad: async function (options) {
    await app.getAbtest();
    this.setData({
      abTest: app.abTest,
      userLoginStatus: app.commonData.user.userId ? true : false,
      findRoomState: (app.commonData.user.userId && !app.commonData.userHasOrder) || !app.commonData.user.userId
    })
    // 如果是裂变活动分享卡片进来的 且没有登陆则直接跳转登陆页
    if (app.commonData.fissionShareId) {
      setTimeout(() => {
        // 要等/v1/user/user-info接口返回数据 所以加setTimeout
        if (!app.commonData.login_status) {
          wx.navigateTo({
            url: '../../loginSubPK/pages/register/register?isFission=1'
          })
        }
      }, 500);
    }
    // 监听登陆状态变化
    app.watchCommonData('login_status', (newv) => {
      this.setData({
        userLoginStatus: newv ? true : false,
        findRoomState: (newv && !app.commonData.userHasOrder) || !newv
      })
    })
    if (options.scene && options.scene.indexOf('ju') !== -1) {
      utilGetQr.getCommonQrInfo(options.scene.split('_')[1]);
      app.globalData.commonQrInfo = true;
    }
    reportPerformance.setInitTime(2001);
    wx.showShareMenu({
      withShareTicket: true,
    });
    this.setData({
      city: app.commonData.city,
    });
    this.refreshPage();

    notification.addNotification('CityHadChanged', this.refreshPage, this);
    // 首页弹窗接口
    this.getHomePopupData();

    this.analyticPageView('e_page_view');
    setTimeout(() => {
      this.data.ePageViewFlag = true;
    }, 500);
  },

  /**
   * @description:  刷新页面需要的调用请求
   */
  refreshPage: async function () {
    this.setData({
      city: app.commonData.city,
      loadingHidden: false,
      changeCity: true
    });
    await this.fetchHomeData();
    this.fetchCityNews();
    this.getRecommendProject();
  },
  onShow: async function () {
    await app.getAbtest();
    this.setData({
      userLoginStatus: app.commonData.user.userId ? true : false,
    })
    // 判断是否需要 刷新筛选组件 如城市切换， 或者筛选项不一样需刷新
    let isRenderFilter = (JSON.stringify(this.data.homeDefaultFilter) != JSON.stringify(app.globalData.newFilter)) || this.data.changeCity;

    // 联动筛选组件
    this.setData({
      userLoginStatus: app.commonData.user.userId ? true : false,
      homeDefaultFilter: JSON.parse(JSON.stringify(app.globalData.newFilter))
    }, () => {
      if (isRenderFilter) {
        this.data.changeCity = false;
        this.fetchAttionCondition();
        this.fetchAssigned();
      }
    });

    // 吸底部 登陆弹窗 他处登陆后关闭
    if (this.data.userLoginStatus && this.data.barTypeData.type == '1') {
      this.setData({
        ['barTypeData.isShow']: false,
      });
    }
    if (
      this.data.bannerOne.length >= 1 &&
      this.data.userLoginStatus &&
      this.data.bannerOne[0].is_login
    ) {
      this.data.bannerOne.splice(0, 1);
      this.setData({
        bannerOne: this.data.bannerOne,
      });
    }
    this.data.startViewTime = Date.parse(new Date());
    if (this.data.ePageViewFlag) {
      this.analyticPageView('e_page_view');
    }
    // 处理如果首页修改了收藏的话  当前页面上对应修改避免请求接口
    let listCollState = app.commonData.listChangeCollect;
    if (listCollState && app.abTest.p_project_list_optimization != 'A') {
      this.fetchHousesData(true);
      app.commonData.listChangeCollect = false;
    }
  },

  onHide: function () {
    this.analyticPageView();
    this.setData({
      showHomeLandPop: false,
      showHomeSubscriptionPop: false
    })
    if (app.dialogMapData('dialog') == 'list-service') {
      return
    }
    app.dialogMapData('close');
  },

  onUnload: function () {
    this.analyticPageView();
  },

  /**
   * @description:  进入。离开页面埋点
   */
  analyticPageView: function (eventName = 'e_page_quit') {
    let analyticProperties = {
      fromPage: 'p_home'
    }
    if (eventName == 'e_page_view') {
      analyticProperties.channel_id = app.commonData.channel.channel_id;
      analyticProperties.channel_put = enviroment.getChannelPut();
    } else {
      var viewTime = (Date.parse(new Date()) - this.data.startViewTime) / 1000;
      analyticProperties.view_time = viewTime;
    }
    analyticProperties.toPage = analyticProperties.fromPage;
    analytic.sensors.track(eventName, analyticProperties);
  },
  analyticProperties() {
    return {
      fromPage: 'p_home',
    };
  },

  /**
   * @description:  页面滚动事件
   */
  onPageScroll(e) {
    // 页面滚动条高度
    this.data.pageScrollTop = e.scrollTop;
    const query = wx.createSelectorQuery();
    query.select('#home-filter').boundingClientRect((res) => {
      if (res && res.top < 0) {
        this.setData({
          filterPosition: 'fixed'
        })
      } else {
        this.setData({
          filterPosition: 'relative'
        })
      }
    }).exec();
  },

  /**
   * @description:  获取筛选项接口
   */
  async fetchAttionCondition() {
    try {
      let res = await getCondition();
      if (res.code == 0) {
        let homeAllFilter = res.data.filter;
        this.setData({
          homeAllFilter
        })
      }
    } catch (e) {
      console.log(e);
    }
  },

  /**
   * @description:  获取筛选项接口
   */
  async fetchAssigned() {
    try {
      let listRes = await getAssigned();
      if (listRes.code == 0) {
        let listAllFilter = listRes.data.filter;
        this.setData({
          listAllFilter
        })
      }
    } catch (e) {
      console.log(e);
    }
  },

  judgeBannerOneIsAvailable(banner_one) {
    let isAvailable = this.data.userLoginStatus;
    if (!banner_one || banner_one.length === 0 || !isAvailable)
      return banner_one;
    if (banner_one[0].is_login) {
      banner_one.splice(0, 1);
      return banner_one;
    }
  },

  /**
   * @description:  请求home
   */
  async fetchHomeData() {
    var _this = this;
    let res = await getHomeData();
    
    if(res.code != 0){
      return;
    }
    let data = res.data;
    
    // BUG
    let bannerOne = [];
    if(data.banner_one && data.banner_one.length > 1){
      bannerOne = _this.judgeBannerOneIsAvailable(data.banner_one);
    }

    _this.setData({
        bannerList: data.top_banner || [],
        bannerOne: bannerOne || [],
        bannerTwo: data.banner_two || [],
        loadingHidden: true,
        employee: data.employee || {},
        little_king_kong: data.little_king_kong || [], // 金刚位
        bannerOneplay: false, // banner one 上面 是否轮播
        bannerTwoplay: false, //bannner two 上面 是否轮播
        tanceng: res.data.tanceng.length > 0 ? res.data.tanceng[0] : '',
        newPage: true,
      },
      () => {
        
        //落地页弹窗，当接口返回的type=3且列表页面没有弹找房弹窗且当前城市没弹 且不是裂变页面进来的
        if (!app.commonData.fissionShareId && _this.data.tanceng.show_banner_type == '3' && app.dialogMapData('get', 'home-ground') == 0 && app.dialogMapData('get', 'list-ground') == 0 && app.dialogMapData('get', 'list-findhouse') == 0) {
          if (!app.dialogMapData('status')) {
            app.dialogMapData('set', 'home-ground');
            _this.setData({
              showHomeLandPop: true
            })
            //埋点 曝光
            analytic.sensors.track('e_show_activity_window', {
              fromPage: 'p_home',
              fromModule: 'm_activity_window',
              window_type: '3',
              banner_id: _this.data.tanceng.id
            });
          }
        }
        reportPerformance.sendMsg(2001);
        // 引导收藏弹窗
        _this.judgeCollectPopShow();
        // banner one & two曝光后播放
        _this.exposureBannerModuleTwoPlay();
        // 只弹出一次
        if (_this.data.barTypeData.once || this.data.userLoginStatus) return;
        _this.setData({
          ['barTypeData.isShow']: true,
          ['barTypeData.once']: true,
        });
        analytic.sensors.track('e_module_exposure', {
          fromPage: 'p_home',
          fromModule: 'm_onekey_tip_window',
          toPage: 'p_home',
        });
      }
    );
  },

  /**
   * @description:  获取 热销 特价 新开等楼盘
   */
  async getRecommendProject() {
    try {
      let res = getHomeRecommendProject();
      if (res.code == 0) {
        this.setData({
          hotHouse: res.data.default,
          saleHouse: res.data.sale,
          openTimeHouse: res.data.open_time,
          weekend: res.data.weekend - res.data.timestamp,
        });
      }
    } catch (e) {
      console.log(e);
    }
  },
  async fetchCityNews() {
    let res = await getHomeCityNews();
    if (res.code != 0) return;
    this.setData({
      house_sign: res.data.house_sign || {},
      latest_news: res.data.latest_news || [],
    });
  },

  /**
   * @description: 搜索接口-实验ABC
   * @param {Boolean} isRefresh true表示从page1 请求，  false表示 page++
   */
  async fetchHousesData(isRefresh) {
    let _this = this;
    if (isRefresh) {
      this.data.page = 1;
      _this.data.observeLike = {};
      _this.data.observeS = {};
    } else {
      this.data.page++;
    }
    let _params = {
      keyword: '',
      filter: _this.data.homeDefaultFilter,
      location: app.commonData.location,
      page: _this.data.page,
    }
    //区分实验 
    if (app.abTest.p_project_list_optimization == 'A') {
      this.projectSearchA(_params, isRefresh)
    } else {
      this.projectSearchBC(_params, isRefresh)
    }
  },

  /**
   * @description:  实验A 请求楼盘列表接口
   * @param {Object} params 请求接口的参数对象
   * @param {Boolean} isRefresh true表示从page1 请求，  false表示 page++
   */
  async projectSearchA(params, isRefresh) {
    try {
      let d = await app.request('/v1/project/search', params);
      if (d.code != 0) {
        return;
      }
      let data = d.data;
      let list = data && data.list ? data.list : [];
      let hasMore = data && data.has_more ? data.has_more == 1 : false;
      // 筛选埋点
      if (isRefresh) {
        if (this.data.filterKey == 'sort') { // 8883
          analytic.sensors.track('e_click_filter_sort', {
            fromPage: 'p_home',
            fromModule: 'm_filter',
            fromItem: 'i_sort',
            toPage: 'p_home',
            filter_sort: app.globalData.newFilter.s || ''
          });
        }
        // 8881
        analytic.sensors.track('e_filter_project', Object.assign({}, {
          fromPage: 'p_home',
          toPage: 'p_home',
          fromModule: 'm_filter',
          fromItem: 'i_filter_project',
          result_cnt: Number(d.data.total)
        }, tarckFilter(app.globalData.newFilter)));

      }
      this.setData({
          houseList: isRefresh ? list : this.data.houseList.concat(list),
          hasMore: hasMore,
          guess_you_like: data.guess_you_like || [],
          is_all_sell_out: data.is_all_sell_out ? data.is_all_sell_out : '',
        },
        () => {
          this.isShowHomeHotlineModule();
          if (this.data.page == 1 && app.abTest.p_project_list_optimization == 'A') {
            this.exposureFindHouseModuleBox();
          }
          // 曝光为你推荐的楼盘
          let leg = isRefresh ? 0 : this.data.houseList.length;
          this.exposurRecommendProject(list, leg);
          // 猜你喜欢曝光
          this.exposurGuessYouLike(this.data.isTakeParam, data.guess_you_like);
        }
      );
    } catch (e) {
      console.log(e);
    }
  },

  /**
   * @description:  实验BC 请求楼盘列表接口
   * @param {Object} params 请求接口的参数对象
   * @param {Boolean} isRefresh true表示从page1 请求，  false表示 page++
   */
  async projectSearchBC(params, isRefresh) {
    try {
      let d = await getProjectList(params);
      if (d.code != 0) {
        return;
      }
      // 筛选埋点
      if (isRefresh) {
        if (this.data.filterKey == 'sort') { // 8883
          analytic.sensors.track('e_click_filter_sort', {
            fromPage: 'p_home',
            fromModule: 'm_filter',
            fromItem: 'i_sort',
            toPage: 'p_home',
            filter_sort: app.globalData.newFilter.s || ''
          });
        }
        // 8881
        analytic.sensors.track('e_filter_project', Object.assign({}, {
          fromPage: 'p_home',
          toPage: 'p_home',
          fromModule: 'm_filter',
          fromItem: 'i_filter_project',
          result_cnt: Number(d.data.total)
        }, tarckFilter(app.globalData.newFilter)));
      }

      let data = d.data;
      let list = data && data.list ? data.list : [];
      let hasMore = data && data.has_more ? data.has_more == 1 : false;
      if (this.data.isShowNumToast && isRefresh) {
        wx.showToast({
          title: `共${data.total}个楼盘`,
          icon: "success",
          duration: 800
        });
      }
      this.setData({
          houseList: isRefresh ? list : this.data.houseList.concat(list),
          hasMore: hasMore,
          guess_you_like: data.guess_like || [],
          is_all_sell_out: data.is_all_sell_out ? data.is_all_sell_out : '',
          findRoomData: data.banner.booking_service || {},
          brandData: data.banner.branding || {},
        },
        () => {
          this.isShowHomeHotlineModule();
          // 曝光为你推荐的楼盘
          let leg = isRefresh ? 0 : this.data.houseList.length;
          this.exposurRecommendProject(list, leg);
          // 猜你喜欢曝光
          this.exposurGuessYouLike(this.data.isTakeParam, data.guess_like);
          //曝光帮你找房
          if (this.data.findRoomState && this.data.houseList.length > 11) {
            this.exposurFindRoomModule();
          }
          //少筛选曝光
          if (this.data.isTakeParam && this.data.houseList.length <= 15) {
            this.exposurLittleModule();
          }
          this.exposurBrandPublicModule();
        }
      );
    } catch (e) {
      console.log(e);
    }
  },
  /**
   * @description: 滑动到页面底部，如果有下一页，触发加载下一页
   */
  onReachBottom: function () {
    if (this.data.hasMore) {
      this.fetchHousesData(false);
    }
  },

  /**
   * @description: 页面中的确认留电调用方法
   */
  makeOrder: function (type = 1, flag = false) {
    wx.showLoading({
      title: '预约中...',
    });
    var _this = this;
    app.dialogMapData('set', 'home-orderSuccess');
    order.makeOrder({
        op_type: _this.data.loginUserInfo.op_type,
      },
      _this.data.loginUserInfo,
      function () {
        wx.hideLoading();
        var alertTitle = '预约成功';
        if (_this.data.loginUserInfo.op_type == '900070') {
          alertTitle = '优惠到手';
        }
        let text = flag ? '安排看房行程' : '解答疑问';
        let isOpenTypeBtn = true;
        let buttonTitle = '打开APP 找房更流畅';
        if (_this.data.loginUserInfo.op_type === '900207') {
          buttonTitle = '好的';
          isOpenTypeBtn = false;
        }
        app.dialogMapData('set', 'home-orderSuccess');
        _this.setData({
          showOrderSuccessAlert: true,
          popType: type,
          alertTitle: alertTitle,
          alertContent: `您已用手机号${app.commonData.user.mobile}预约了咨询服务，稍后咨询师将来电为您${text}，请注意接听电话`,
          isOpenTypeBtn: isOpenTypeBtn,
          buttonTitle: buttonTitle,
          userLoginStatus: true,
        });
      }
    );
  },

  /**
   * @description: 顶部搜索框点击事件
   */
  didTapSearch: function (e) {
    if (app.abTest.p_project_list_optimization == 'A') {
      wx.switchTab({
        url: '../project/list/projectList',
      });
    } else {
      wx.navigateTo({
        url: '/searchSubPK/pages/search/search',
      });
    }
    // 9174
    analytic.sensors.track('e_click_search_entry', {
      fromPage: 'p_home',
      toPage: 'p_project_of_search',
      fromItem: 'i_search_entry',
      fromModule: 'm_top_bar'
    });
  },

  /**
   * @description: 切换城市点击事件
   */
  didClickSwitchCity: function () {
    wx.navigateTo({
      url: '/otherRelateSubPK/pages/city/cityList',
    });
    analytic.sensors.track('e_click_select_city_entry', {
      fromPage: 'p_home',
      toPage: 'p_select_city',
      fromItem: 'i_select_city_entry',
    });
  },

  /**
   * @description: 顶部轮播图 滑动事件
   */
  onBannerSwiperChange: function (e) {
    if (e.detail.source == 'touch') {
      this.setData({
        currentBannerIndex: e.detail.current,
        currentBannerIndexShadow: e.detail.current,
      });
    } else {
      this.setData({
        currentBannerIndexShadow: e.detail.current,
      });
    }
  },

  /**
   * @description: 顶部轮播图 点击事件
   */
  didClickBannerItem: function (e) {
    var index = e.currentTarget.dataset.index;
    var bannerItem = this.data.bannerList[index];
    let to_url;
    let banner_id;
    to_url = bannerItem.url;
    banner_id = bannerItem.id || '';
    route.transfer(to_url);
    analytic.sensors.track('e_click_banner', {
      fromPage: 'p_home',
      fromModule: 'm_banner',
      fromItem: 'i_banner',
      fromItemIndex: String(index),
      to_url: to_url,
      banner_id: banner_id,
    });
  },

  /**
   * bannerone： 轮播事件
   */
  onNewBannerSwiperChange(e) {
    let {
      type
    } = e.currentTarget.dataset;
    if (type == 1) {
      this.setData({
        currentBannerOneIndexShadow: e.detail.current,
      });
    } else {
      this.setData({
        currentBannerTwoIndexShadow: e.detail.current,
      });
    }
  },

  /**
   * bannerone： 点击bannerone第一个登陆时候 暂停轮播
   */
  pauseBannerOneplay(e) {
    this.setData({
      bannerOneplay: false,
    });
    let ob = {
      fromPage: 'p_home',
      fromItem: 'i_operation_card',
      toPage: 'p_buy_house_report',
      fromModule: 'm_operation_banner_1',
      banner_id: this.data.bannerOne[0].id,
    };
    analytic.sensors.track('e_click_operation_card', ob);
  },

  /**
   * 点击新的小轮播 banner
   */
  didClickNewBannerItem(e) {
    let bannerItem;
    let {
      index,
      type
    } = e.currentTarget.dataset;
    let fromModule = '';
    if (type == 1) {
      bannerItem = this.data.bannerOne[index];
      fromModule = 'm_operation_banner_1';
    } else {
      bannerItem = this.data.bannerTwo[index];
      fromModule = 'm_operation_banner_2';
    }
    route.transfer(bannerItem.url);
    analytic.sensors.track('e_click_operation_card', {
      fromPage: 'p_home',
      fromModule: fromModule,
      fromItem: 'i_operation_card',
      fromItemIndex: String(index),
      to_url: bannerItem.url,
      banner_id: String(bannerItem.id),
    });
  },

  /**
   * 城市新闻模块，留电事件
   */
  didClickCityNewsLeavePhone(flag = false) {
    this.data.loginUserInfo = {
      op_type: '900739',
      fromModule: 'm_market_quotation',
    };
    let analyticProperties = {};
    analyticProperties.fromPage = 'p_home';
    analyticProperties.fromModule = 'm_market_quotation';
    analyticProperties.fromItem = 'i_leave_phone_entry';
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.op_type = '900739';
    analyticProperties.login_state = this.data.userLoginStatus ? '1' : '2';
    analytic.sensors.track('e_click_leave_phone_entry', analyticProperties);
    if (flag === true) return;
    if (this.data.userLoginStatus) {
      this.makeOrder();
    } else {
      this.setData({
        showLoginModal: true,
        loginTitle: '楼盘动态',
        loginContent: '楼盘动态及时通过短信和推送通知您',
        loginButtonTitle: '确认',
        popType: 1,
      });
    }
  },
  /**
   * 城市新闻模块，跳转到情报页面
   */
  didClicCityCondition() {
    wx.switchTab({
      url: '../information/information',
    });
    analytic.sensors.track('e_click_view_more', {
      fromPage: 'p_home',
      fromModule: 'm_market_quotation',
      fromItem: 'i_view_more',
      toPage: 'p_julive_info_agency',
    });
  },
  /**
   * 城市新闻模块，卡片点击事件
   */
  didClicCityCard() {
    route.transfer(this.data.house_sign.url);
    analytic.sensors.track('e_click_market_analysis_entry', {
      fromPage: 'p_home',
      fromModule: 'm_market_quotation',
      fromItem: 'i_market_analysis_entry',
      toPage: 'p_webview',
      to_url: this.data.house_sign.url,
    });
  },
  /**
   * 城市新闻模块，点击新闻事件
   */
  didClicCityInfo(e) {
    //  1动态 2情报 3问答
    let {
      type,
      fatherIndex,
      sonIndex
    } = e.currentTarget.dataset;
    let ob = {
      fromPage: 'p_home',
      fromModule: 'm_market_quotation',
      fromItem: 'i_content_card',
      toPage: 'p_julive_info_agency',
    };
    // informationPageIndex 0是资讯，1 是问问 2 动态
    if (type == 1) {
      app.globalData.informationPageIndex = 2;
      ob.project_dynamic_id = String(
        this.data.latest_news[fatherIndex][sonIndex].id
      );
    } else if (type == 3) {
      app.globalData.informationPageIndex = 1;
      ob.question_id = [this.data.latest_news[fatherIndex][sonIndex].id];
    } else if (type == 2) {
      app.globalData.informationPageIndex = 0;
      ob.article_id = Number(this.data.latest_news[fatherIndex][sonIndex].id);
    }
    wx.switchTab({
      url: '../information/information',
    });
    analytic.sensors.track('e_click_content_card', ob);
  },
  stopTouchMove: function () {
    return false;
  },


  /**
   * 楼盘卡片模块：卡片跳转，区分实验 8886
   */
  async didTapProjectCellView(e) {
    let _id = e.currentTarget.dataset.id;
    if (!_id) {
      wx.showToast({
        title: '跳转失败',
        icon: "none",
        duration: 2000
      });
      return
    }
    if (app.abTest.p_project_list_optimization == 'A') {
      wx.navigateTo({
        url: `/pages/web/web?url=${app.commonData.m_domain_project}${_id}.html`
      });
    } else {
      try {
        await viewProject({
          project_id: _id
        });
        wx.navigateTo({
          url: `/pages/web/web?url=${app.commonData.m_domain_project}${_id}.html`
        });
      } catch (e) {
        console.log(e)
      }
    }
    analytic.sensors.track('e_click_project_card', Object.assign({
      fromPage: 'p_home',
      toPage: 'p_project_details',
      fromModule: e.currentTarget.dataset.frommodule,
      fromItem: 'i_project_card',
      project_id: _id,
      fromItemIndex: e.currentTarget.dataset.index,
    }, tarckFilter(app.globalData.newFilter)));
  },

  /**
   * 顶部收藏模块：判断是否展示及展示逻辑
   */
  judgeCollectPopShow() {
    let _this = this;
    if (app.globalData.listCollectPopState == true) return;
    if (app.globalData.wx_ad_coming) {
      this.setData({
        showCollectPop: true,
      });
    }
    analytic.sensors.track('e_module_exposure', {
      fromPage: 'p_home',
      fromModule: 'm_guide_collect_window',
      toPage: 'p_home',
    });
    this.collectTimer = setTimeout(() => {
      _this.setData({
        showCollectPop: false,
      });
    }, 8500);
    app.globalData.listCollectPopState = true;
  },
  /**
   * 顶部收藏模块：关闭事件
   */
  didCloseCollectPop() {
    this.setData({
      showCollectPop: false,
    });
    app.globalData.listCollectPopState = true;
    analytic.sensors.track('e_click_close', {
      fromPage: 'p_home',
      fromModule: 'm_guide_collect_window',
      fromItem: 'i_close',
      toPage: 'p_home',
    });
  },

  /**
   * 右侧的悬浮窗：展示逻辑判断
   */
  isShowHomeHotlineModule() {
    let _this = this;
    // 避免重复请求时候执行
    if (this.data.page != 1) return;
    wx.createIntersectionObserver()
      .relativeToViewport({
        bottom: -130,
      })
      .observe('.project-list-content-view', (res) => {
        _this.setData({
          showHotline: res.intersectionRatio > 0,
        });
      });
  },

  /**
   * 右侧的悬浮窗：点击去app
   */
  didClickToApp() {
    analytic.sensors.track('e_click_open_app', {
      fromPage: 'p_home',
      fromModule: 'm_floating_window',
      fromItem: 'i_open_app',
      toPage: 'p_online_service',
    });
  },
  /**
   * 右侧的悬浮窗：折叠事件
   */
  didClickFold() {
    this.setData({
      showTabModule: false,
    });
    analytic.sensors.track('e_click_fold', {
      fromPage: 'p_home',
      fromModule: 'm_floating_window',
      fromItem: 'i_fold',
      toPage: 'p_home',
    });
  },
  /**
   * 右侧的悬浮窗：展开事件
   */
  didClickUnFold() {
    this.setData({
      showTabModule: true,
    });
    analytic.sensors.track('e_click_fast_navigation', {
      fromPage: 'p_home',
      fromModule: 'm_floating_window',
      fromItem: 'i_fast_navigation',
      toPage: 'p_home',
    });
  },
  /**
   * 右侧的悬浮窗：点击咨询
   */
  didClickService() {
    this.setData({
      loginUserInfo: {
        op_type: '900507',
        fromModule: 'm_floating_window',
      },
    });
    if (this.data.userLoginStatus) {
      this.makeOrder();
    }
    var analyticProperties = {};
    analyticProperties.fromPage = 'p_home';
    analyticProperties.fromModule = 'm_floating_window';
    analyticProperties.fromItem = 'i_leave_phone_entry';
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.login_state = this.data.userLoginStatus ? '1' : '2';
    analyticProperties.op_type = this.data.loginUserInfo.op_type;
    analytic.sensors.track('e_click_leave_phone_entry', analyticProperties);
  },

  /**
   * 右侧的悬浮窗：拨打电话热线和咨询
   */
  didClickHotline() {
    var _this = this;
    wx.makePhoneCall({
      phoneNumber: app.commonData.channel.phone || '',
      success: function () {
        var analyticProperties = _this.analyticProperties();
        analyticProperties.fromPage = analytic.page.currentPage();
        analyticProperties.toPage = analytic.page.currentPage();
        analyticProperties.fromModule = 'm_floating_window';
        analyticProperties.fromItem = 'i_dial_service_call';
        analytic.sensors.track('e_click_dial_service_call', analyticProperties);
        order.reportOrder();
      },
      fail: function () {},
    });
  },

  /**
   * 底部一键登陆：点击蒙层 
   */
  didClickCloseBarType() {
    let _this = this;
    this.setData({
        ['barTypeData.animation']: true,
      },
      () => {
        let timer = setTimeout(() => {
          _this.setData({
            ['barTypeData.isShow']: false,
          });
          clearTimeout(timer);
        }, 1500);
      }
    );
    analytic.sensors.track('e_click_close', {
      fromPage: 'p_home',
      fromModule: 'm_onekey_tip_window',
      fromItem: 'i_close',
      toPage: 'p_home',
    });
  },
  /**
   * 底部一键登陆：点击一键登陆
   */
  didClickBarTypeLogin() {
    analytic.sensors.track('e_click_onekey_login', {
      fromPage: 'p_home',
      fromModule: 'm_onekey_tip_window',
      fromItem: 'i_onekey_login',
      toPage: 'p_choose_login',
    });
  },
  /**
   * 底部一键登陆：登陆成功的回调事件
   */
  bottomToLoginPageCallBack() {
    this.setData({
      ['barTypeData.isShow']: false,
    });
    wx.showModal({
      content: '领取成功，可在我的查看',
      showCancel: false,
      complete: () => {
        this.toOtherRelateSubPK(1);
      },
    });
    app.commonData.mineTabPurchase = true;
  },

  /**
   * banner1 点击事件
   */
  bannerOneLogin(bannerOneLogin) {
    if (bannerOneLogin) {
      this.data.bannerOne.splice(0, 1);
      this.setData({
        bannerOne: this.data.bannerOne,
        bannerOneplay: true,
        userLoginStatus: true,
        ['barTypeData.isShow']: false,
      });
      wx.showModal({
        content: '领取成功，可在我的查看',
        showCancel: false,
        complete: () => {
          this.toOtherRelateSubPK();
        },
      });
      app.commonData.mineTabPurchase = true;
    } else {
      this.setData({
        bannerOneplay: true,
      });
    }
  },
  /**
   * 落地页弹窗的 点击事件
   */
  toOtherRelateSubPK(type) {
    if (app.commonData.userHasOrder) return;
    wx.navigateTo({
      url: '/myRelateSubPK/pages/getReport/getReport',
    });
    // type: 1 底部登陆后 埋点
    let ob = {
      fromPage: 'p_home',
      fromItem: 'i_report_entry',
      toPage: 'p_buy_house_report',
    };
    if (type == 1) {
      ob.fromModule = 'm_onekey_tip_window';
    } else {
      ob.fromModule = 'm_operation_banner_1';
      ob.banner_id = this.data.bannerOne[0].id;
    }
    analytic.sensors.track('e_click_report_entry', ob);
  },


  /**
   * 落地页弹窗的 点击事件
   */
  didClickLandPop() {
    this.setData({
      showHomeLandPop: false,
    });
    route.transfer(this.data.tanceng.url);
    app.dialogMapData('close');
    analytic.sensors.track('e_click_activity_window', {
      fromPage: this.analyticProperties().fromPage,
      fromModule: 'm_activity_window',
      fromItem: 'i_activity_window',
      to_url: this.data.tanceng.url,
      banner_id: this.data.tanceng.id,
      window_type: 3,
      click_position: 1,
    });
  },

  /**
   * 落地页弹窗的关闭事件
   */
  didCloseHomeLandPop(e) {
    this.setData({
      showHomeLandPop: false,
    });
    app.dialogMapData('close');
    let _ob = {
      fromPage: 'p_home',
      toPage: 'p_home',
      fromItem: 'i_close',
      fromModule: 'm_activity_window',
      banner_id: this.data.tanceng.id,
      window_type: this.data.tanceng.show_banner_type,
    };
    analytic.sensors.track('e_click_close', _ob);
  },

  /**
   * 我要订阅弹窗 18s之后且当前页面中没有弹窗显示
   */
  async getHomePopupData() {
    try {
      let params = {
        share_id: app.commonData.fissionShareId
      }
      let res = await getHomePopup(params);
      if (res.code == 0) {
        // 如果从裂变活动进入小程序的
        if (app.commonData.fissionShareId) {
          console.log('首页弹窗数据', res.data.activity_pop)
          this.setData({
            fissionData: res.data.activity_pop
          })
          return;
        }
        // 如当前没有未关闭订单，走我要订阅弹窗逻辑
        if (app.commonData.userHasOrder) {
          return
        }
        let homeSubscriptionData = res.data.market_subscribe_popup;
        this.setData({
          homeSubscriptionData
        })
        // 如果之前已经弹出过直接return
        if (app.dialogMapData('get', 'home-subscribe') != 0) {
          return;
        }
        new Promise((resolve, reject) => {
          let s = 0;
          this.timer = setInterval(() => {
            s++;
            if (s == 18 && !app.dialogMapData('status')) {
              resolve();
            }
            if (app.dialogMapData('status')) {
              s = 0;
            }
          }, 1000)
        }).then(() => {
          clearInterval(this.timer);
          app.dialogMapData('set', 'home-subscribe');
          this.setData({
            showHomeSubscriptionPop: true
          })
          //订阅 曝光
          analytic.sensors.track('e_module_exposure', {
            fromPage: 'p_home',
            fromModule: 'm_guide_follow_window',
            toPage: 'p_home',
          });

        })
      }
    } catch (e) {
      console.log(e);
    }
  },

  /**
   * 我要订阅弹窗：点击订阅
   */
  didClickAleatSub() {
    let _this = this;
    let template_id = _this.data.homeSubscriptionData.subscribe_template_id;
    wx.requestSubscribeMessage({
      tmplIds: [template_id],
      success(res) {
        if (res[template_id] === 'accept') {
          _this.addSubscribe(template_id, '2', app.commonData.city.city_id);
        }
        _this.didLikeSubscribeAnalytic('1', template_id);
      },
      fail(err) {
        console.log(err);
        _this.didLikeSubscribeAnalytic('1', template_id);
      },
      complete() {
        _this.setData({
          showHomeSubscriptionPop: false,
        });
        app.dialogMapData('close');
      },
    });
    analytic.sensors.track('e_click_follow_dynamic', {
      fromPage: 'p_home',
      fromModule: 'm_guide_follow_window',
      fromItem: 'i_follow_dynamic',
      toPage: 'p_home',
    });
  },
  /**
   * 我要订阅弹窗 获取订阅接口
   */
  async addSubscribe(template_id, obj_type, obj_id) {
    try {
      await getHomeSubscribe({
        template_id,
        obj_type,
        obj_id,
      });
    } catch (e) {
      console.log(e)
    }
  },

  /**
   * 我要订阅弹窗 埋点
   */
  didLikeSubscribeAnalytic(button_id, tab_ids) {
    analytic.sensors.track('e_click_button', {
      fromPage: 'p_home',
      fromModule: 'm_subscribe_notice_window',
      fromItem: 'i_button',
      toPage: 'p_home',
      button_id: button_id,
      tab_ids: [tab_ids],
    });
  },
  /**
   * 我要订阅弹窗 关闭订阅弹窗
   */
  onCloseSubscriptionPop() {
    this.setData({
      showHomeSubscriptionPop: false,
    })
    app.dialogMapData('close');
    analytic.sensors.track('e_click_close', {
      fromPage: 'p_home',
      fromModule: 'm_guide_follow_window',
      fromItem: 'i_close',
      toPage: 'p_home',
    });
  },


  /**
   * 留电弹窗：成功回调事件
   */
  alertconfirmCallback(e) {
    let _this = this;
    app.dialogMapData('close');
    _this.setData({
      showOrderSuccessAlert: false,
    });
    app.dialogMapData('close');
    if (this.data.loginUserInfo.op_type == '900207') {
      wx.switchTab({
        url: '../project/list/projectList',
      });
      analytic.sensors.track('e_click_query_match', {
        fromPage: 'p_home',
        toPage: 'p_project_list',
        fromModule: 'm_help_find_house',
        fromItem: 'i_query_match',
      });
    } else if (_this.data.loginUserInfo.op_type == '900205') {
      let {
        detail: {
          district_ids,
          min_price
        },
      } = e;
      order.makeOrder({
          note: district_ids.name + min_price.name,
          op_type: _this.data.loginUserInfo.op_type,
          source: _this.data.loginUserInfo.source,
        },
        _this.data.loginUserInfo,
        function () {}
      );
    }
  },
  /**
   * 留电弹窗：关闭事件
   */
  cancelCallback: function () {
    this.setData({
      showLoginModal: false,
    });
    app.dialogMapData('close');
  },


  /**
   * 微信授权登陆：
   */
  loginSuccessCallback: function () {
    this.setData({
      showLoginModal: false,
    });
    app.dialogMapData('close');
    this.makeOrder();
  },
  /**
   * 微信授权登陆：登陆成功的回调事件
   */
  passBackFastLoginCallBack(e) {
    let {
      loginStatus,
      markType
    } = e.detail;
    if (loginStatus && markType === '261') {
      // markType 261 点击底部登陆条幅 成功回调
      this.bottomToLoginPageCallBack();
      analytic.sensors.track('e_click_confirm_login', {
        fromPage: 'p_home',
        toPage: 'p_home',
        fromModule: 'm_onekey_tip_window',
        fromItem: 'i_confirm_login',
      });
    } else if (markType === '262') {
      // 点击bannerone 第一个img 登陆成功
      this.bannerOneLogin(loginStatus);
      if (!loginStatus) return;
      analytic.sensors.track('e_click_confirm_login', {
        fromPage: 'p_home',
        toPage: 'p_home',
        fromModule: 'm_operation_banner_1',
        fromItem: 'i_confirm_login',
      });
    } else if (loginStatus) {
      this.makeOrder();
      this.setData({
        userLoginStatus: true,
        ['barTypeData.isShow']: false,
      });
    }
    if (
      this.data.bannerOne &&
      this.data.userLoginStatus &&
      this.data.bannerOne[0].is_login
    ) {
      this.data.bannerOne.splice(0, 1);
      this.setData({
        bannerOne: this.data.bannerOne,
      });
    }
  },

  /**
   * 微信授权登陆：授权允许的成功回调
   */
  passBackGetPhoneNumberBtn(e) {
    let {
      markOpType,
      markType
    } = e.detail;
    if (markOpType == '900507') {
      this.didClickService();
    } else if (markOpType == '900207') {
      this.didTapSearchProjectList(true);
    } else if (markOpType == '900505') {
      this.didClickDynamicNotice(true);
    } else if (markOpType == '900739') {
      this.didClickCityNewsLeavePhone(true);
    } else if (markOpType == '900510') {
      this.didClickFindHouse();
    } else if (markType === '261') {
      analytic.sensors.track('e_click_onekey_login', {
        fromPage: 'p_home',
        toPage: 'p_choose_login',
        fromModule: 'm_onekey_tip_window',
        fromItem: 'i_onekey_login',
      });
    }
  },

  /**
   * 实验A：楼盘列表第5个之后的 帮我找房点击事件
   */
  didClickFindHouse() {
    this.data.loginUserInfo = {
      op_type: '900510',
      fromModule: 'm_help_find_room',
    };
    if (this.data.userLoginStatus) {
      this.makeOrder();
    }
    var analyticProperties = {};
    analyticProperties.fromPage = 'p_home';
    analyticProperties.fromModule = 'm_help_find_room';
    analyticProperties.fromItem = 'i_leave_phone_entry';
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.op_type = this.data.loginUserInfo.op_type;
    analyticProperties.login_state = this.data.userLoginStatus ? '1' : '2';
    analytic.sensors.track('e_click_leave_phone_entry', analyticProperties);
  },

  /**
   * 实验A：楼盘列表第5个之后的 帮我找房 曝光
   */
  exposureFindHouseModuleBox() {
    let Observer = wx.createIntersectionObserver();
    Observer.relativeToViewport({
      bottom: -80,
    }).observe(`.find-house-module-box`, () => {
      Observer.disconnect();
      analytic.sensors.track('e_module_exposure', {
        fromPage: 'p_home',
        fromModule: 'm_help_find_room',
        toPage: 'p_home',
      });
    });
  },

  /**
   * 判断 banner one & two
   */
  exposureBannerModuleTwoPlay() {
    if (this.data.bannerOne.length > 1) {
      this.bannerCreateIntersectionObserver(1);
    }
    if (this.data.bannerTwo.length > 1) {
      this.bannerCreateIntersectionObserver(2);
    }
  },

  /**
   * banner one & two曝光后播放
   */
  bannerCreateIntersectionObserver(type) {
    let _this = this;
    let Observer = wx.createIntersectionObserver();
    Observer.relativeToViewport({
      bottom: -80,
    }).observe(`.banner-module-two-${type}`, (res) => {
      Observer.disconnect();
      let timer = setTimeout(() => {
        let _name = type == 1 ? 'bannerOneplay' : 'bannerTwoplay';
        _this.setData({
          [_name]: true,
        });
        if (type == 1) {
          _this.exposureBannerOneLoginImg(_this);
        } else {
          _this.exposureBannerTwo();
        }
        clearTimeout(timer);
      }, 3000);
    });
  },
  /**
   * banner one 曝光
   */
  exposureBannerOneLoginImg(_this) {
    if (!_this.data.bannerOne[0].is_login) return;
    analytic.sensors.track('e_module_exposure', {
      fromPage: 'p_home',
      fromModule: 'm_operation_banner_1',
      toPage: 'p_home',
      banner_id: _this.data.bannerOne[0].id,
    });
  },
  /**
   * banner  two曝光
   */
  exposureBannerTwo(_this) {
    analytic.sensors.track('e_module_exposure', {
      fromPage: 'p_home',
      fromModule: 'm_operation_banner_2',
      toPage: 'p_home',
    });
  },

  /**
   * 曝光为你推荐
   *  @param {Array} list 推荐列表
   *  @param {Number} leg 列表长度
   */
  // BUG
  exposurRecommendProject(list, leg) {
    try {
      let _this = this;
    if (list.length <= 0) return;
    list.forEach((item, index) => {
      if (leg >= 20) {
        index = leg + index;
      }
      let observerName = `observer${index}`;
      _this.data.observeS[observerName] = wx.createIntersectionObserver(_this);
      let className = `.exposure${index}`;
      _this.data.observeS[observerName]
        .relativeToViewport('.container')
        .observe(className, (res) => {
          if (!_this.data.observeS[observerName]) return;
          _this.data.observeS[observerName].disconnect();
          delete _this.data.observeS[observerName];
          _this.exposurUseanAlyticProperties(item.project_id, 'm_recommend_project', index);

          //有效的 延迟 曝光
          let _timer = setTimeout(() => {
            wx.createSelectorQuery().select(`.exposure${index}`).boundingClientRect(function (rect) {
              if (rect.top < app.globalData.hh) {
                // console.log(rect.top, app.globalData.hh, `曝光元素----.exposure${index}`)
                analytic.sensors.track('e_module_exposure_delay', Object.assign({
                  fromPage: 'p_home',
                  fromModule: 'm_recommend_project',
                  fromItemIndex: index,
                  toPage: 'p_home',
                  project_id: item.project_id,
                }, tarckFilter(app.globalData.newFilter)));
              }
            }).exec()
            clearTimeout(_timer);
          }, 300);
        });
    });
    } catch(e){
      console.log(e)
    }
  },

  /**
   * 曝光猜你喜欢
   *  @param {Boolean} isTakeParam 是否是携带参数 true是
   *  @param {Array}} guess_you_like 列表长度
   */
  // BUG
  exposurGuessYouLike(isTakeParam, guess_you_like) {
    try {
      if (!isTakeParam || guess_you_like.length <= 0) return;
    let _this = this;
    guess_you_like.forEach((item, index) => {
      let observerName = `observer${index}`;
      _this.data.observeLike[observerName] = wx.createIntersectionObserver(
        _this
      );
      let className = `.exposure_like${index}`;
      _this.data.observeLike[observerName]
        .relativeToViewport('.container')
        .observe(className, (res) => {
          if (!_this.data.observeLike[observerName]) return;
          _this.data.observeLike[observerName].disconnect();
          delete _this.data.observeLike[observerName];
          _this.exposurUseanAlyticProperties(item.project_id, 'p_guess_like_list', index);

          //有效的 延迟 曝光
          let _timer = setTimeout(() => {
            wx.createSelectorQuery().select(`.exposure_like${index}`).boundingClientRect(function (rect) {
              if (rect.top < app.globalData.hh) {
                // console.log(rect.top, app.globalData.hh, `曝光元素----.exposure_like${index}`)
                analytic.sensors.track('e_module_exposure_delay', Object.assign({
                  fromPage: 'p_home',
                  fromModule: 'p_guess_like_list',
                  fromItemIndex: index,
                  toPage: 'p_home',
                  project_id: item.project_id,
                }, tarckFilter(app.globalData.newFilter)));
              }
            }).exec()
            clearTimeout(_timer);
          }, 300);
        });
    });
    } catch(e){
      console.log(e)
    }
  },

  //8885
  exposurUseanAlyticProperties(project_id, fromModule, index) { //
    analytic.sensors.track('e_module_exposure', Object.assign({
      fromPage: 'p_home',
      fromModule: fromModule,
      fromItemIndex: index,
      toPage: 'p_home',
      project_id: String(project_id),
    }, tarckFilter(app.globalData.newFilter)));

  },
  /**
   * 实验B：曝光帮我找房模块，9160
   */
  exposurFindRoomModule() {
    wx.createIntersectionObserver().relativeToViewport({
      bottom: -80
    }).observe('.find-house-component-box', (res) => {
      analytic.sensors.track('e_module_exposure', {
        fromPage: 'p_home',
        fromModule: 'm_appoint_banner',
        toPage: 'p_home',
      });
    })
  },
  /**
   * 实验B：曝光少少选模块，9166
   */
  exposurLittleModule() {
    wx.createIntersectionObserver().relativeToViewport({
      bottom: -80
    }).observe('.little-res-module-component', (res) => {
      analytic.sensors.track('e_module_exposure', {
        fromPage: 'p_home',
        fromModule: 'm_little_filter_guide',
        toPage: 'p_home',
      });
    })
  },

  /**
   * 实验B：品宣曝光，9169
   */
  exposurBrandPublicModule() {
    if(!this.data.hasMore){
      wx.createIntersectionObserver().relativeToViewport({
        bottom: -80
      }).observe('.brand-public-component', (res) => {
        analytic.sensors.track('e_module_exposure', {
          fromPage: 'p_home',
          fromModule: 'm_bottom_promotion',
          toPage: 'p_home',
        });
      })
    }
  },

  /**
   * 查找房源模块：点击查找房源事件
   */
  homeFindHouseSubmit(e) {
    let {
      homeDefaultFilter
    } = this.data;
    let {
      appFilter
    } = e.detail;
    // 如果不是A 实验的话联动
    if (app.abTest.p_project_list_optimization != 'A') {
      // 查找房源联动
      if (Object.keys(appFilter).indexOf('c') == -1) {
        delete app.globalData.newFilter.c
        delete homeDefaultFilter.c
      }
      if (Object.keys(appFilter).indexOf('d') == -1) {
        delete app.globalData.newFilter.d
        delete homeDefaultFilter.d
      }
      if (Object.keys(appFilter).indexOf('a') == -1) {
        delete app.globalData.newFilter.a
        delete homeDefaultFilter.a
      }
      for (let k in appFilter) {
        homeDefaultFilter[k] = appFilter[k];
        app.globalData.newFilter[k] = appFilter[k];
      }
      this.setData({
        homeDefaultFilter,
        findHouseFilter: appFilter
      }, () => {
        this.selectComponent("#home-filter").renderFilter('default');
      })
    }
    // A实验不联动
    if (app.abTest.p_project_list_optimization == 'A') {
      this.setData({
        findHouseFilter: appFilter
      })
    }
  },

  /**
   * 筛选模块：确定回调事件
   */
  submitListFilter(e) {
    // if (JSON.stringify(e.detail) === '{}') {
    //   return
    // }
    let {
      commonArr
    } = getFilterNames(this.data.listAllFilter, e.detail.appFilter);

    this.setData({
      homeDefaultFilter: e.detail.appFilter,
      littleResData: commonArr
    }, () => {
      this.selectComponent("#home-find-house").renderFilter('default');
      // 需要toast 提示
      if (e.detail.isClick) {
        this.setData({
          isTakeParam: true,
          isShowNumToast: true
        })
        this.clickFilterKeyToTop()
      }
      this.fetchHousesData(true)
    })
  },

  // 列表筛选栏，点击filter key 下拉回调,回顶部
  clickFilterKeyToTop() {
    const query = wx.createSelectorQuery();
    query.select('#home-filter').boundingClientRect((res) => {
      wx.pageScrollTo({
        scrollTop: res.top + this.data.pageScrollTop + 2
      })
    }).exec();
  },

  clickFilterKey(e) {
    this.data.filterKey = e.detail.key;
    if (this.data.filterPosition == 'relative') {
      this.clickFilterKeyToTop();
    }
  },
  /**
   * 筛选模块：二级少筛选的 埋点
   */
  quickFilter(data) {
    analytic.sensors.track('e_click_select_tab', {
      fromPage: 'p_home',
      fromModule: 'm_fast_filter',
      fromItem: 'i_select_tab',
      toPage: 'p_home',
      tab_id: String(data.detail.value),
      fromItemIndex: String(data.detail.index - 1),
    });

  },


  /**
   * 少筛选模块：确定回调事件,9167,9168
   */
  filterLittleRes(e) {
    let defaultFilter = this.data.homeDefaultFilter;
    // 如果点击清空传空对象
    if (JSON.stringify(e.detail) !== "{}") {
      if (Array.isArray(defaultFilter[e.detail.key])) {
        // 如果数组里只有一项 就直接删掉
        if (defaultFilter[e.detail.key].length === 1) {
          delete this.data.homeDefaultFilter[e.detail.key];
        } else {
          defaultFilter[e.detail.key].splice(defaultFilter[e.detail.key].indexOf(e.detail.value), 1);
        }
        analytic.sensors.track('e_click_delete_filter', {
          fromPage: 'p_home',
          fromModule: 'm_little_filter_guide',
          fromItem: 'i_delete_filter',
          toPage: 'p_home',
          filter_id: [e.detail.key]
        });
      } else {
        delete this.data.homeDefaultFilter[e.detail.key];
      }
    } else {
      analytic.sensors.track('e_click_reset', {
        fromPage: 'p_home',
        fromModule: 'm_little_filter_guide',
        fromItem: 'i_reset',
        toPage: 'p_home'
      });
      defaultFilter = {};
    }
    this.setData({
      homeDefaultFilter: defaultFilter,
      isShowNumToast: true,
    }, () => {
      this.selectComponent("#home-filter").renderFilter('default');
      this.clickFilterKeyToTop()
    })
  },

  /**
   *楼盘卡片：点击收藏上报埋点，9150
   * @param {Object} data 需要的参数
   */
  clickCollect(data) {
    let {
      state,
      projectId,
      fromModule,
      cardIndex
    } = data.detail;
    // state 0失败 1收藏状态  2未收藏
    analytic.sensors.track('e_click_collect', {
      fromPage: 'p_home',
      fromModule: fromModule,
      fromItem: 'i_collect',
      toPage: 'p_home',
      project_id: projectId,
      fromItemIndex: cardIndex,
      login_state: this.data.userLoginStatus ? '1' : '2',
      collect_action: !this.data.userLoginStatus ? '1' : state
    });
  },

  /**
   *楼盘卡片：收藏状态改变时的回调
   */
  changeCollect() {
    app.commonData.homeChangeCollect = true;
  },

  /**
   * 组件内部的留电 回调事件
   * @param {Object} data 需要的参数
   */
  leavePhoneHandle(data) {
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
          fromPage: 'p_home',
          fromModule: 'm_appoint_banner',
          fromItem: 'i_leave_phone_entry',
          toPage: 'p_home',
          login_state: app.commonData.loginStatus ? '1' : '2',
          op_type: opType,
        });
      } else {
        // id: 9162
        analytic.sensors.track('e_click_confirm_leave_phone', {
          fromPage: 'p_home',
          fromModule: 'm_appoint_banner',
          fromItem: 'i_confirm_leave_phone',
          toPage: 'p_home',
          op_type: opType,
          leave_phone_state: '1',
          order_id,
          business_type
        });
      }
      // 品宣回调
    } else if (type == 'brand') {
      // state  0留电入口 1留电成功
      if (state == 0) {
        // id: 9170
        analytic.sensors.track('e_click_leave_phone_entry', {
          fromPage: 'p_home',
          fromModule: 'm_bottom_promotion',
          fromItem: 'i_leave_phone_entry',
          toPage: 'p_home',
          login_state: app.commonData.loginStatus ? '1' : '2',
          op_type: opType,
        });
      } else {
        // id: 9171
        analytic.sensors.track('e_click_confirm_leave_phone', {
          fromPage: 'p_home',
          fromModule: 'm_bottom_promotion',
          fromItem: 'i_leave_phone_entry',
          toPage: 'p_home',
          op_type: opType,
          leave_phone_state: '1',
          order_id,
          business_type
        });
      }
    }
  },

  //测试工具代码
  // didClickQaTool() {
  //   wx.navigateTo({
  //     url: '/debugSubPK/dist/debug/debug',
  //   });
  // },

})