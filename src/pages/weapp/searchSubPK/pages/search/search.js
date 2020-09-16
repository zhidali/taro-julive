const app = getApp();
const location = require("../../../location/location.js");
const analytic = require('../../../analytic/analytic.js');
import {
  searchQuick,
  searchSuggest
} from '../../../api/search'
import { viewProject} from '../../../api/common'
Page({
  data: {
    // 获取焦点
    focus: true,
    // 最近搜索
    nearlySearchList: [],
    // 是否计算了最近搜索的高度
    isComputedHeight: false,
    // 搜索关键词
    searchValue: '',
    // 上一个页面传过来的搜索词
    fromPrePageSearchKey: '',
    // 防抖定时器
    timer: '',
    // 更多消息记录
    moreHistory: false,
    // 历史记录单行高度
    rowHeight: 0,
    // 联想词
    wordSuggestList: [],
    // 联想城市
    citySuggestList: [],
    // 联想特征
    typeSuggestList: [],
    // 联想楼盘
    projectSuggestList: [],
    // 热门搜索
    hotSearchList: [],
    // 热门搜索总页数
    pageTotal: 0,
    // 热门搜索页码
    page: 0,
    // 进入页面记录时间
    startViewTime: '',
    // 1点击关键词跳转 2点击左上角返回/点击取消跳转
    navigateType: '2'
  },

  onLoad(options) {
    // 初始进入页面有值 searchValue搜索值 clickType点击区域 1点击x 2搜索框
    if (options.searchValue) {
      this.setData({
        searchValue: options.clickType == '2' ? options.searchValue : '',
        fromPrePageSearchKey: options.searchValue
      }, () => {
        this.didSearch()
      })
    }
    // 获取历史搜索记录
    var historySearchList = wx.getStorageSync('history_search_list') || {};
    var cityId = app.commonData.city.city_id;
    this.setData({
      nearlySearchList: historySearchList[cityId] || []
    })
    // 获取热门搜索
    this.getHotSearchList();
  },
  onShow: function () {
    // 9177埋点
    this.analyticPageView('e_page_view', {});
    this.setData({
      startViewTime: Date.parse(new Date())
    })
  },
  onHide: function () {
    // 9178埋点
    var viewTime = (Date.parse(new Date()) - this.data.startViewTime) / 1000;
    this.analyticPageView('e_page_quit', {
      view_time: viewTime
    })
  },

  onUnload: function () {
    // 点击左上角返回或取消 且 带着搜索词进入搜索页的
    if (this.data.navigateType === '2' && this.data.fromPrePageSearchKey) {
      app.globalData.searchKey = this.data.fromPrePageSearchKey;
    }
    // 9178埋点
    var viewTime = (Date.parse(new Date()) - this.data.startViewTime) / 1000;
    this.analyticPageView('e_page_quit', {
      view_time: viewTime
    })
  },
  // 埋点方法
  analyticPageView(eventName, analyticObj) {
    analyticObj.fromPage = 'p_project_of_search';
    analyticObj.toPage = analyticObj.toPage || 'p_project_of_search';
    analytic.sensors.track(eventName, analyticObj);
  },
  onReady: function () {
    if (this.data.nearlySearchList.length > 0 && !this.data.searchValue && !this.data.isComputedHeight) {
      this.computedHeightFun();
      this.setData({
        isComputedHeight: true
      })
    }
  },
  // 计算历史搜索的高度
  computedHeightFun() {
    // 计算比例
    var ratio = app.globalData.ww / 750;
    // 计算最近搜索一行的高度
    var rowHeight = Math.floor(52 * ratio) + Math.floor(16 * ratio);
    this.setData({
      rowHeight: rowHeight
    })
    var that = this;
    // 计算最近搜索渲染的高度
    wx.createSelectorQuery()
      .selectAll('.nearly-search-main')
      .boundingClientRect(function (rect) {
        // 如果渲染的高度高于两行，则显示全部搜索记录
        if (rect[0].height > rowHeight * 2) {
          that.setData({
            moreHistory: true
          })
        }
      })
      .exec();
  },
  // 获取热门搜索
  async getHotSearchList() {
    wx.showLoading({
      title: "加载中..."
    });
    try {
      var {
        code,
        msg,
        data
      } = await searchQuick();
      if (code === 0) {
        // 计算总页数
        let pageTotal = Math.ceil(data.hot_word.length / 6);
        this.setData({
          hotSearchList: data.hot_word,
          pageTotal
        })
      }
      wx.hideLoading();
    } catch (error) {
      wx.hideLoading();
    }
  },
  // 点击换一换
  refreshHotSearch() {
    let page = this.data.page;
    if (page < this.data.pageTotal - 1) {
      page++;
    } else {
      page = 0;
    }
    this.setData({
      page
    })
    // 9183埋点
    this.analyticPageView('e_click_exchange', {
      fromModule: 'm_hot_search',
      fromItem: 'i_exchange'
    })
  },
  // 搜索内容
  didInputSearchVal(e) {
    var searchValue = e.detail.value.trim();
    var preSearchValue = this.data.searchValue;
    this.setData({
      searchValue: searchValue,
    }, () => {
      if (!searchValue && !this.data.isComputedHeight && this.data.nearlySearchList.length > 0) {
        this.computedHeightFun();
        this.setData({
          isComputedHeight: true
        })
      }
    });
    if (preSearchValue === searchValue) return;
    // 防抖300ms
    this.debounce(this.didSearch, 300)
  },
  // 防抖函数
  debounce(fn, interval) {
    var gapTime = interval || 1000;
    clearTimeout(this.data.timer);
    var context = this;
    var args = arguments;
    this.data.timer = setTimeout(function () {
      fn.call(context, args);
    }, gapTime);
  },
  // 根据搜索词获取搜索联想
  async didSearch() {
    if (!this.data.searchValue) {
      this.setData({
        wordSuggestList: [],
        citySuggestList: [],
        typeSuggestList: [],
        projectSuggestList: []
      });
      return;
    }
    try {
      var params = {
        keyword: this.data.searchValue
      };
      let {
        code,
        msg,
        data
      } = await searchSuggest(params);
      if (code == 0) {
        this.setData({
          wordSuggestList: data.word_suggest,
          citySuggestList: this.lightHigh(data.city_suggest),
          typeSuggestList: this.lightHigh(data.type_suggest),
          projectSuggestList: this.lightHigh(data.project_suggest)
        });
      }
    } catch (e) {
      console.log(e);
    }
  },
  // 关键词高亮
  lightHigh(arr) {
    arr.forEach(item => {
      let name = item.name;
      var newStr = '';
      for (var i = 0; i < name.length; i++) {
        var newNameItem = /[A-Z]/.test(name[i]) ? name[i].toLowerCase() : name[i];
        if (this.data.searchValue.indexOf(name[i]) !== -1 || this.data.searchValue.indexOf(newNameItem) !== -1) {
          newStr += `<span class="high-light-color">${name[i]}</span>`;
        } else {
          newStr += name[i];
        }
      }
      item.nameKeyLight = newStr;
    });
    return arr;
  },
  // 点击取消
  cancelSearch() {
    wx.navigateBack({
      delta: 1
    })
  },
  // 点击输入框内删除icon
  removeSearchValue() {
    this.setData({
      focus: false
    }, () => {
      setTimeout(() => {
        this.setData({
          searchValue: ''
        }, () => {
          if (!this.data.isComputedHeight && this.data.nearlySearchList.length > 0) {
            this.computedHeightFun();
            this.setData({
              isComputedHeight: true
            })
          }
        })
      }, 100)
    })
  },
  // 跳转页面 楼盘列表页/楼盘详情页
  toResPage(e, isCityChange) {
    let {
      name,
      filter,
      type,
      typename,
      analytic,
      analyticindex,
      cityid,
      id
    } = e.currentTarget.dataset;
    // 标识是走了关键词 跳转的
    this.setData({
      navigateType: '1'
    })
    // 如果搜索词有值，则存入缓存
    if (name) {
      var historySearchList = wx.getStorageSync('history_search_list') || {};
      var cityId = app.commonData.city.city_id;
      historySearchList[cityId] = historySearchList[cityId] || [];
      var index = historySearchList[cityId].indexOf(name);
      // 如果搜索词已经在缓存里存在 把旧的记录删掉 重新存储到数组第一位
      if (index != -1) {
        historySearchList[cityId].splice(index, 1);
      }
      historySearchList[cityId].unshift(name);
      // 只保存最近30条数据
      if (historySearchList[cityId].length > 30) {
        historySearchList[cityId] = historySearchList[cityId].slice(0, 30);
      }
      wx.setStorage({
        key: 'history_search_list',
        data: historySearchList
      })
    }
    // 跳转页面 type 1跳到列表页 2跳到h5详情页
    if (type === '1') {
      // 跳转到列表页
      wx.setStorage({
        key: 'search_city',
        data: isCityChange ? cityid : 0,
      })
      // 如果点击的是区域 筛选项联动
      if (typename == 2) {
        app.globalData.newFilter = Object.assign({}, app.globalData.newFilter, {
          a: filter ? [filter.value] : ''
        });
      }
      app.globalData.searchKey = isCityChange || typename == 2 ? '' : name;
      wx.switchTab({
        url: '/pages/project/list/projectList'
      });
    } else {
      // 上报浏览详情页接口
      if(id) {
        this.reportViewProject(id);
      };
      wx.navigateTo({
        url: `/pages/web/web?url=${app.commonData.m_domain_project}${id}.html`
      });
    }
    // 埋点
    let analyticObj = {};
    if (analytic === '9179') {
      analyticObj = {
        fromModule: 'm_recently_search',
        fromItem: 'i_search_query',
        toPage: 'p_project_list',
        fromItemIndex: analyticindex,
        query: name
      }
    } else if (analytic == '9182') {
      analyticObj = {
        fromModule: 'm_hot_search',
        fromItem: 'i_search_query',
        fromItemIndex: analyticindex,
        query: name,
        query_type: typename,
        to_type: type,
        project_id: id || ''
      }
    } else if (analytic == '9184') {
      analyticObj = {
        fromModule: 'm_keyboard_search',
        fromItem: 'i_search_query',
        toPage: 'p_project_list',
        query: name,
        input_query: this.data.searchValue
      }
    } else if (analytic == '9185') {
      analyticObj = {
        fromModule: 'm_recommend_query',
        fromItem: 'i_search_query',
        fromItemIndex: analyticindex,
        query: name,
        input_query: this.data.searchValue,
        query_type: typename,
        project_id: id || ''
      }
    }
    this.analyticPageView('e_click_search_query', analyticObj)
  },
  // 上报浏览详情页接口
  async reportViewProject(project_id) {
    try {
      let params = {
        project_id
      }
      await viewProject(params);
    } catch (e) {
      console.log(e)
    }
  },
  // 更多消息记录显示
  moreHistoryShow() {
    // 9180埋点
    this.analyticPageView('e_click_view_search_record', {
      fromModule: 'm_recently_search',
      fromItem: 'i_view_search_record'
    })
    this.setData({
      moreHistory: false
    })
  },
  // 清空历史记录
  removeSearchHistory() {
    var that = this;
    wx.showModal({
      title: "提示",
      content: "确认删除全部搜索记录？",
      cancelColor: "#8D9799",
      confirmColor: "#00C0EB",
      success(res) {
        if (res.confirm) {
          // 点击确定
          var historySearchList = wx.getStorageSync('history_search_list');
          historySearchList[app.commonData.city.city_id] = [];
          that.setData({
            nearlySearchList: []
          })
          wx.setStorage({
            key: 'history_search_list',
            data: historySearchList
          })
          // 9181埋点
          that.analyticPageView('e_click_clear', {
            fromModule: 'm_recently_search',
            fromItem: 'i_clear'
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      },
      fail(err) {
        console.log(err)
      }
    });
  },
  // 切换城市
  searchCity(e) {
    let cityInfo = {
      city_id: String(e.currentTarget.dataset.cityid),
      city_name: e.currentTarget.dataset.name
    };
    app.commonData.city = cityInfo;
    location.cityChanged(cityInfo);
    this.toResPage(e, true);
  }
});