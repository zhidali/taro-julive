const app = getApp();
const notification = require('../../../utils/notification.js');
const analytic = require('../../../analytic/analytic.js');
const enviroment = require('../../../enviroment/enviroment.js');

import Palette from './palette/palette.js';
let appPage = getApp();

Component({
  properties: {},
  data: {
    pickList: null,
    currentBannerIndex: 0,
    categoryList: null,
    currentCategory: {}, //当前情报tab对象
    activeIndex: 0,
    essayList: [],
    hasMoreList: false,
    essayListMap: {},
    essayHasMoreMap: {},
    essayPageMap: {},
    shareEssay: {},
    fixedCategoryView: false,
    pickListViewHeight: 0,
    loadingHidden: false,
    tabId: 1,
    listNone: false,
    showBanner: false,
    barTypeData: {
      isShow: false,
      type: 1,
    }, // 登录条
    loginBackType: {
      flag: false,
    },
  },

  lifetimes: {
    attached: function () {
      var windowHeight = 568;
      try {
        var res = wx.getSystemInfoSync();
        windowHeight = res.windowHeight;
        this.setData({
          scrollViewHeight: windowHeight - 30,
        });
      } catch (e) {
        console.error('getSystemInfoSync failed!');
      }
      this.getViewHeight();
      this.fetchCategory();
      this.data.startViewTime = Date.parse(new Date());
      notification.addNotification('CityHadChanged', this.fetchCategory, this);
      if (enviroment.getCodeComeIn()) {
        this.setData({
          showBanner: true,
        });
      }
      // 只弹出一次
      if (appPage.globalData.essayModuleLoginOnce || app.commonData.user.userId) return;
      this.setData({
        ['barTypeData.isShow']: true,
      });
    },

    //组件实例被从页面节点树移除时执行
    detached() {
      var analyticProperties = {};
      var viewTime = (Date.parse(new Date()) - this.data.startViewTime) / 1000;
      analyticProperties.view_time = viewTime;
      analyticProperties.fromPage = 'p_julive_info_agency';
      analyticProperties.toPage = 'p_julive_info_agency';
      analyticProperties.tab_id = '1';
      analytic.sensors.track('e_page_quit_details', analyticProperties);
    },
  },

  methods: {
    analyticProperties() {
      return {
        fromPage: 'p_info_agency',
      };
    },

    getViewHeight() {
      var _this = this;
      _this.timeoutId = setTimeout(function () {
        var query = wx.createSelectorQuery().in(_this);
        query
          .select('.essay-banenr-view')
          .boundingClientRect(function (res) {
            if (res) {
              _this.setData({
                pickListViewHeight: res.height,
                fixedCategoryView: false,
              });
            } else {
              _this.setData({
                fixedCategoryView: true,
                pickListViewHeight: 0,
              });
            }
            delete _this.timeoutId;
          })
          .exec();
      }, 1000);
    },

    onBannerSwiperChange: function (e) {
      this.setData({
        currentBannerIndex: e.detail.current,
      });

      if (e.detail.source == 'touch') {
        // 人为滑动
        var analyticProperties = this.analyticProperties();
        analyticProperties.toPage = analyticProperties.fromPage;
        analyticProperties.fromModule = 'm_banner';
        analyticProperties.fromItemIndex = String(e.detail.current);
        analyticProperties.fromItem = 'i_banner';
        analytic.sensors.track('e_slide_banner', analyticProperties);
      }
    },

    didClickPickEssay: function (e) {
      wx.navigateTo({
        url: '/otherRelateSubPK/pages/essayDetail/detail?essayId=' +
          e.currentTarget.dataset.essayId,
      });
      var analyticProperties = this.analyticProperties();
      analyticProperties.fromModule = 'm_banner banner';
      analyticProperties.banner_id = e.currentTarget.dataset.essayId;
      analyticProperties.to_url = '/otherRelateSubPK/pages/essayDetail/detail';
      analyticProperties.fromItem = 'i_banner';
      analytic.sensors.track('e_click_banner', analyticProperties);
    },

    tabChange: function (e) {
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 300,
      });
      var index = e.currentTarget.dataset.index;
      this.changeTabToIndex(index);
      this.setData({
        tabId: index + 1,
      });
      var analyticProperties = this.analyticProperties();
      analyticProperties.toPage = analyticProperties.fromPage;
      analyticProperties.fromModule = 'm_top_bar';
      analyticProperties.fromItemIndex = String(index);
      analyticProperties.fromItem = 'i_select_tab';
      analyticProperties.tab_id = index + 1;
      analytic.sensors.track('e_click_select_tab', analyticProperties);
    },

    changeTabToIndex: function (index) {
      var category = this.data.categoryList[index];
      this.setData({
        activeIndex: index,
        currentCategory: category,
        scrollLeft: index * 50,
      });
      this.fetchList(true);
    },

    fetchCategory: function (x, observer) {
      var _this = this;
      if (observer) {
        _this = observer;
      }
      app
        .request('/v3/information/index', {})
        .then((result) => {
          if (result.data && result.data.tag) {
            var filters = [];
            result.data.tag.forEach((item) => {
              filters.push(item.value);
            });
            _this.setData({
              categoryList: result.data.tag,
              filters: filters,
              currentCategory: result.data.tag[0],
              activeIndex: 0,
              pickList: result.data.shuffling_content ?
                result.data.shuffling_content : [],
            });
            _this.fetchList(true);
          }
        })
        .catch((e) => {
          _this.setData({
            loadingHidden: true,
          });
        });
    },

    fetchList: function (refresh) {
      var _this = this;
      var page = _this.data.essayPageMap[_this.data.currentCategory.key];
      if (!page || refresh) {
        page = 1;
      } else {
        page++;
      }
      app
        .request('/v3/information/list', {
          tag: _this.data.currentCategory.key,
          page: page,
        })
        .then(function (result) {
          wx.stopPullDownRefresh();
          if (page == 1) {
            if (!result.data.list || result.data.list.length == 0) {
              _this.setData({
                listNone: true,
                essayList: [],
                loadingHidden: true,
              });
              return;
            }
          }
          var list = _this.data.essayList;
          if (refresh) {
            list = result.data.list ? result.data.list : [];
          } else {
            list = list.concat(result.data.list);
          }
          _this.data.essayListMap[_this.data.currentCategory.key] = list;
          var essayHasMoreMap = _this.data.essayHasMoreMap;
          essayHasMoreMap[_this.data.currentCategory.key] =
            result.data.has_more;
          _this.data.essayPageMap[_this.data.currentCategory.key] = page;
          _this.setData({
            essayList: list,
            essayHasMoreMap: essayHasMoreMap,
            loadingHidden: true,
            listNone: false,
            hasMoreList: result.data.has_more == 2 ? false : true,
          });

          if (
            _this.data.currentCategory.key === _this.data.categoryList[0].key
          ) {
            _this.getViewHeight();
          }
        })
        .catch((e) => {
          wx.stopPullDownRefresh();
        });
    },

    filterSelectCallback: function (e) {
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 300,
      });
      this.changeTabToIndex(e.detail.index);
    },

    didTapCell: function (e) {
      if (e.target.id == 'share') {
        return;
      }
      // var url = e.currentTarget.dataset.url;
      var essay = e.currentTarget.dataset.essay;
      wx.navigateTo({
        url: '/otherRelateSubPK/pages/essayDetail/detail?essayId=' + essay.id,
      });
      var analyticProperties = this.analyticProperties();
      analyticProperties.toPage = 'p_article_details ';
      analyticProperties.fromModule = 'm_article_list';
      analyticProperties.fromItem = 'i_article_card';
      analyticProperties.fromItemIndex = String(e.currentTarget.dataset.index);
      analyticProperties.article_card_id = essay.id;
      analyticProperties.tab_id = this.data.tabId;
      analytic.sensors.track('e_click_article_card', analyticProperties);
    },

    onPullRefreshMore: function () {
      if (
        this.data.essayHasMoreMap[this.data.currentCategory.key] &&
        this.data.hasMoreList
      ) {
        this.fetchList(false);
      }
    },

    didTapShare: function (e) {
      var essay = e.currentTarget.dataset.essay;
      var index = e.currentTarget.dataset.index;
      this.setData({
        paintInfo: {
          article_card_id: essay.id,
          tab_id: this.data.tabId,
          fromPage: 'p_info_agency',
          toPage: 'p_info_agency',
          fromModule: 'm_poster_window',
          fromItemIndex: String(index),
          pageName: 'essayPage',
        },
        shareEssay: essay,
        popEssayCard: true,
        template: new Palette().palette(essay),
      });
      appPage.globalData.essayModuleShare.popEssayCard = true;
      appPage.globalData.essayModuleShare.id = essay.id;

      var analyticProperties = this.analyticProperties();
      analyticProperties.toPage = analyticProperties.fromPage;
      analyticProperties.fromModule = 'm_article_list';
      analyticProperties.toModule = 'm_poster_window';
      analyticProperties.fromItem = 'i_share';
      analyticProperties.fromItemIndex = String(index);
      analyticProperties.article_card_id = essay.id;
      analyticProperties.tab_id = this.data.tabId;
      analytic.sensors.track('e_click_share', analyticProperties);
    },

    dismissShare: function () {
      appPage.globalData.essayModuleShare.popEssayCard = false;
    },

    shareImagePath: function (e) {
      appPage.globalData.essayModuleShare.imagePath = e.detail.imagePath;
    },

    preventTouchMove: function (e) {
      //do nothing
    },

    //banner app
    OpenApp() {
      analytic.sensors.track('e_click_open_app', {
        fromPage: this.analyticProperties().fromPage,
        fromModule: 'm_article_list',
        fromItem: 'i_open_app',
        toPage: 'p_online_service',
        tab_id: this.data.tabId,
      });
    },
    didPageScroll(event) {
      if (this.data.pickListViewHeight == 0) return;
      this.setData({
        showBanner: false,
      });
      if (event.scrollTop > this.data.pickListViewHeight) {
        if (this.data.fixedCategoryView) return;
        this.setData({
          fixedCategoryView: true,
        });
      } else {
        if (!this.data.fixedCategoryView) return;
        this.setData({
          fixedCategoryView: false,
        });
      }
    },

    //关闭 一键登录出
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
      appPage.globalData.essayModuleLoginOnce = true;
    },

    //点击微信登陆。允许或者拒绝 回调
    passBackGetPhoneNumberBtn(e) {
      if (e.detail.markType === '261') {
        analytic.sensors.track('e_click_onekey_login', {
          fromPage: 'p_julive_info_agency',
          toPage: 'p_julive_info_agency',
          fromModule: 'm_onekey_tip_window',
          fromItem: 'i_onekey_login',
          tab_id: '1'
        });
      }
    },
    //微信登陆 拒绝后回调 和允许后调用完fast-login 回调，允许loginStatus=true
    passBackFastLoginCallBack(e) {
      let {
        loginStatus
      } = e.detail;
      if (loginStatus) {
        this.data.loginBackType.flag = false;
        this.setData({
          ['barTypeData.isShow']: false,
        });
        app.commonData.mineTabPurchase = true;
        //如果是一键登录弹窗
        if (e.detail.markType == "261") {
          wx.showModal({
            content: '领取成功，可在我的查看',
            showCancel: false,
            complete: () => {
              if (app.commonData.userHasOrder) return;
              wx.navigateTo({
                url: '/myRelateSubPK/pages/getReport/getReport',
              });
              analytic.sensors.track('e_click_report_entry', {
                fromPage: 'p_julive_info_agency',
                fromModule: 'm_onekey_tip_window',
                fromItem: 'i_report_entry',
                toPage: 'p_buy_house_report',
                tab_id: '1'
              });
            }
          });
          analytic.sensors.track('e_click_confirm_login', {
            fromPage: 'p_julive_info_agency',
            toPage: 'p_julive_info_agency',
            fromModule: 'm_onekey_tip_window',
            fromItem: 'i_confirm_login',
            tab_id: '1'
          });
        } else {
          this.makeOrder();
        }
      }

    },
  },
});