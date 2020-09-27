var app = getApp();
// const location = require("../../../location/location.js");
var analytic = require("../../../analytic/analytic.js");

Page({
  data: {
    loadingHidden: false,
    city: {},
    cityList: [],
    startViewTime: 0,
    ePageViewFlag: false,
    is_selectCity: false, //是否是选择的城市
    visitedCity: [],
    searchLetter: [],
    searchCityList: [],
    windownHeight: (app.globalData.hh - 80) * 2,
    cityList: null,
    isShowLetter: false,
    toastShowLetter: "", //点击的字母
    scrollTopId: "", // 置顶id
    getInputFocus: false,
    keyword: "",
    confirmSearch: false,
    fixTopLetter: "",
    firstLetterFix: false,
    letterTopAll: []
  },

  onLoad: function(options) {
    this.fetchCityList();
    this.analyticPageView("e_page_view");
    setTimeout(() => {
      this.data.ePageViewFlag = true;
    }, 500);
    this.setData({
      city: app.commonData.city,
      visitedCity: wx.getStorageSync("julive_visitedCity")||[]
    });
  },

  onShow: function() {
    var _select = wx.getStorageSync("julive_citySelect")||'';
    var is_selectCity = _select ? _select : app.commonData.isSelectCity;
    this.setData({
      city: app.commonData.city,
      is_selectCity: is_selectCity,
      visitedCity: wx.getStorageSync("julive_visitedCity")||[]
    });
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
    var analyticProperties = this.analyticProperties();
    if (eventName != "e_page_view") {
      var viewTime = (Date.parse(new Date()) - this.data.startViewTime) / 1000;
      analyticProperties.view_time = viewTime;
    }
    analyticProperties.toPage = analyticProperties.fromPage;
    analytic.sensors.track(eventName, analyticProperties);
  },

  analyticProperties() {
    return {
      fromPage: "p_select_city",
      toPage: "p_select_city"
    };
  },
  // 切换城市
  didSelectCity: function(e) {
    let cityId = e.currentTarget.dataset.cityid;
    let cityName = e.currentTarget.dataset.cityname;
    var position = e.currentTarget.dataset.position;
    var index = e.currentTarget.dataset.index;
    if (app.commonData.city.city_id == cityId) {
      wx.navigateBack({
        delta: 1
      });
      return;
    }
    var cityInfo = {
      city_id: cityId,
      city_name: cityName
    };
    // 存储全局变量，手动切换城市
    app.commonData.isSelectCity = true;
    wx.setStorageSync("julive_citySelect", true);
    app.commonData.city = cityInfo;
    // 切换城市筛选项联动清空
    app.globalData.newFilter = {};
    
    // location.cityChanged(cityInfo)
    app.enviroment.setCityInfo(cityInfo);
    
    this.setData({
      city: cityInfo
    });
    this.setStorageVisitedCity(cityInfo);
    wx.navigateBack({
      delta: 1
    });
    var pages = getCurrentPages();
    var prePages = pages[pages.length - 2].route;
    let _toPage = prePages == "pages/home/home" ? "p_home" : "p_project_list";
    if (position == 3) {
      analytic.sensors.track("e_click_search_result", {
        fromPage: this.analyticProperties().fromPage,
        fromItem: "i_search_result",
        toPage: _toPage,
        click_position: String(position),
        city_id: cityId,
        query: this.data.keyword
      });
    } else {
      analytic.sensors.track("e_click_select_city", {
        fromPage: this.analyticProperties().fromPage,
        fromItem: "i_select_city",
        toPage: _toPage,
        fromItemIndex: String(index),
        city_id: cityId,
        click_position: String(position)
      });
    }
  },
  setStorageVisitedCity(cityInfo) {
    let visitedCity = wx.getStorageSync("julive_visitedCity")
      ? wx.getStorageSync("julive_visitedCity")
      : [];
    visitedCity.unshift(cityInfo);
    var hash = {};
    visitedCity = visitedCity.reduce(function(item, next) {
      hash[next.city_id] ? "" : (hash[next.city_id] = true && item.push(next));
      return item;
    }, []);
    let storageCity = visitedCity.slice(0, 4);
    wx.setStorageSync("julive_visitedCity", storageCity);
  },

  fetchCityList: function() {
    var _this = this;
    app.request("/v2/common/citys", {}).then(d => {
      if (d.code == 0) {
        _this.setData(
          {
            cityList: d.data.list,
            loadingHidden: true
          },
          () => {
            let _letterTopAll = [];
            _this.data.cityList.map(item => {
              const query = wx.createSelectorQuery();
              query.select("#" + item.letter).boundingClientRect();
              query.exec(function(res) {
                _letterTopAll.push({
                  top: res[0].top - 46,
                  letter: item.letter
                });
                _this.setData({
                  letterTopAll: _letterTopAll
                });
              });
            });
          }
        );
      }
    });
  },

  //点击字母
  didClickLetter(e) {
    const _this = this;
    const showLetter = e.currentTarget.dataset.letter;
    _this.setData({
      toastShowLetter: showLetter,
      isShowLetter: true,
      scrollTopId: showLetter
    });
    setTimeout(() => {
      _this.setData({
        isShowLetter: false
      });
    }, 500);
    _this.data.cityList.forEach(function(item, index) {
      if (item.letter == showLetter) {
        wx.pageScrollTo({
          scrollTop: _this.data.letterTopAll[index].top
        });
      }
    });
  },
  didFocusSearch() {
    this.setData({
      getInputFocus: true
    });
    var analyticProperties = this.analyticProperties();
    analyticProperties.fromItem = "i_search_entry";
    analyticProperties.fromModule = "m_top_bar";
    analyticProperties.toPage = "p_city_search";
    analytic.sensors.track("e_click_search_entry", analyticProperties);
  },

  didCancelSearch() {
    //在安卓手机上 点击取消会触发到didConfirmSearch  避免2次渲染
    this.data.stopConfirmSearch = true;
    this.setData({
      getInputFocus: false,
      keyword: "",
      confirmSearch: false
    });
    var analyticProperties = this.analyticProperties();
    analyticProperties.fromItem = "i_cancel";
    analyticProperties.fromModule = "m_top_bar";
    analytic.sensors.track("e_click_cancel", analyticProperties);
  },
  didInputSearchVal(e) {
    this.data.keyword = e.detail.value;
    this.debounce(this.didConfirmSearch, 500);
  },
  didConfirmSearch() {
    let _this = this;
    app
      .request("/v2/common/search-cities", { keyword: _this.data.keyword })
      .then(d => {
        if (_this.data.stopConfirmSearch) {
          _this.data.stopConfirmSearch = false;
          return;
        } else if (d.code == 0) {
          _this.setData({
            searchCityList: d.data.list,
            confirmSearch: true
          });
        }
      });
  },
  /*函数防抖*/
  debounce(fn, interval) {
    var gapTime = interval || 1000;
    clearTimeout(this.data.timer);
    var context = this;
    var args = arguments;
    this.data.timer = setTimeout(function() {
      fn.call(context, args);
    }, gapTime);
  },
  onPageScroll: function(event) {
    let _this = this;
    let scrollTop = event.scrollTop;

    if(this.data.letterTopAll.length > 0){

      this.setData({
        firstLetterFix: scrollTop > this.data.letterTopAll[0].top ? true : false
      });
      let _scrollTop = scrollTop + 4;
      _this.data.letterTopAll.forEach(function(item, index) {
        if (
          _scrollTop >= item.top &&
          _scrollTop <= _this.data.letterTopAll[index + 1].top
        ) {
          _this.setData({
            fixTopLetter: _this.data.letterTopAll[index].letter
          });
        }
      });
      
    }
  }
});
