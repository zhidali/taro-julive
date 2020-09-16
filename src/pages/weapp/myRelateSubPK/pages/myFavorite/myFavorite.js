/*
 * @author: limengge
 * @Date: 2020-09-01 16:22:13
 * @description: 
 * @LastEditTime: 2020-09-15 13:47:20
 * @LastEditors: limengge
 */

const analytic = require('../../../analytic/analytic.js');
const order = require('../../../order/order.js');
var app = getApp();

import {
  viewProject
} from '../../../api/common';
import {
  getmyViewProject,
  getmyFavoriteProject
} from '../../../api/mine';


Page({
  data: {
    loadingHidden: false,
    favoriteTab: ['我的浏览', '我的收藏'],
    currentTabIndex: 0, //当前展示的tab，0是浏览，1是收藏
    viewPage: 1, //浏览的当前页面参数
    viewList: [], //浏览列表
    viewHasMore: false, //浏览是否有下一页

    favoritePage: 1, //收藏当前页面参数
    favoriteList: [], //收藏列表
    favoriteHasMore: false, //收藏是否有下一页

    isShowFavoritePK: false, //对比弹窗
    userLoginStatus: false, //用户是否登陆
    showOrderSuccessAlert: false, //留电成功弹出弹窗
    viewPageOpreate: false, //在我的浏览页面是否有操作
    favoritePageOpreate: false, //在收藏页面是否有操作
    firstGetFavorite: true, //是否是第一次进收藏页，true 是就要调接口
    ePageViewFlag: false, //是否执行onShow中的e_page_view，true 执行
  },

  onLoad: function () {
    this.analyticPageView('e_page_view');
    setTimeout(() => {
      this.data.ePageViewFlag = true;
    }, 500);
    this.getViewData()
  },

  onShow: function () {
    this.setData({
      userLoginStatus: app.commonData.user.userId ? true : false,
    })
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

  /**
   * 页面相关事件处理函数--epageView与ePaveQuit埋点
   */
  analyticPageView: function (eventName = 'e_page_quit') {
    var analyticProperties = {};
    if (eventName != 'e_page_view') {
      var viewTime = (Date.parse(new Date()) - this.data.startViewTime) / 1000;
      analyticProperties.view_time = viewTime;
    }
    analyticProperties.fromPage = 'p_my_follow';
    analyticProperties.toPage = 'p_my_follow';
    analytic.sensors.track(eventName, analyticProperties);
  },


  /**
   * 获取我的浏览数据
   * @param {Boolean} isRefresh 是否是刷新的，true重新刷新，请求第一页数据
   */
  getViewData: async function (isRefresh = true) {
    if (isRefresh) {
      this.data.viewPage = 1;
    } else {
      this.data.viewPage++;
    }
    let _this = this;
    try {
      let res = await getmyViewProject({
        page: _this.data.viewPage,
      });
      let _data = res.data;
      let hasMore = _data && _data.has_more ? _data.has_more == 1 : false;
      this.setData({
        loadingHidden: true,
        viewHasMore: hasMore,
        viewList: isRefresh ? _data.list : _this.data.viewList.concat(_data.list),
        favoritePageOpreate: false
      })
      wx.stopPullDownRefresh()
    } catch (e) {
      console.log(e)
    }
  },


  /**
   * 获取我的收藏数据
   * @param {Boolean} isRefresh 是否是刷新的，true重新刷新，请求第一页数据
   */
  getFavoriteData: async function (isRefresh = true) {
    if (isRefresh) {
      this.data.favoritePage = 1;
    } else {
      this.data.favoritePage++;
    }
    let _this = this;
    try {
      let res = await getmyFavoriteProject({
        page: _this.data.favoritePage,
      });
      let _data = res.data;
      let hasMore = _data && _data.has_more ? _data.has_more == 1 : false;
      this.setData({
        loadingHidden: true,
        favoriteHasMore: hasMore,
        favoriteList: isRefresh ? _data.list : _this.data.favoriteList.concat(_data.list),
        viewPageOpreate: false
      })
      wx.stopPullDownRefresh()
    } catch (e) {
      console.log(e)
    }
  },


  /**
   * 页面相关事件处理函数--tab 点击事件
   */
  didClickChangeTab(e) {
    let _this = this;
    let _index = e.target.dataset.index;
    _this.setData({
      currentTabIndex: _index,
    })
    //如果在我的收藏页面有 浏览的操作，或者在浏览页面有收藏操作就重新请求数据
    if (_index == 0 && _this.data.favoritePageOpreate) {
      _this.getViewData(true);
      _this.setData({
        loadingHidden: false,
        viewList: [],
        viewPage: 1
      })
    }
    //如果在我的关注页面有收藏或者浏览的操作就重新请求数据
    if (_index == 1 && (_this.data.viewPageOpreate || _this.data.firstGetFavorite)) {
      this.getFavoriteData(true);
      this.setData({
        loadingHidden: false,
        favoriteList: [],
        favoritePage: 1,
        firstGetFavorite: false
      })
    }
    analytic.sensors.track('e_click_tab', {
      fromPage: 'p_my_follow',
      fromModule: 'm_top_bar',
      fromItem: 'i_tab',
      toPage: 'p_my_follow',
      tab_id: String(_index + 1)
    });
  },

  /**
   * 页面相关事件处理函数--楼盘卡片的点击事件，点我的浏览不上报浏览
   */
  async didTapProjectCellView(e) {
    let _id = e.currentTarget.dataset.id;
    let _index = e.currentTarget.dataset.index;
    if (!_id) {
      wx.showToast({
        title: '跳转失败',
        icon: "none",
        duration: 2000
      });
      return
    }
    if (this.data.currentTabIndex == 0) {
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
        this.setData({
          favoritePageOpreate: true
        })
      } catch (e) {
        console.log(e)
      }
    }
    analytic.sensors.track('e_click_project_card', {
      fromPage: 'p_my_follow',
      fromModule: 'm_project_list',
      fromItem: 'i_project_card',
      toPage: 'p_project_details',
      fromItemIndex: String(_index),
      project_id: _id,
      tab_id: String(this.data.currentTabIndex + 1)
    });
  },


  /**
   * 页面相关事件处理函数--点击收藏按钮
   */
  changeCollect(data) {
    app.commonData.homeChangeCollect = true;
    if (this.data.currentTabIndex == 0) {
      this.setData({
        viewPageOpreate: true,
      })
    } else if (this.data.currentTabIndex == 1) {
      if (data.detail.state == '0') { //取消失败

      } else { //取消成功
        let _list = this.data.favoriteList
        _list.splice(data.currentTarget.dataset.index, 1);
        this.setData({
          favoriteList: _list
        })
      }
    }
    let {
      state,
      projectId
    } = data.detail;
    // state 0失败 1收藏状态  2未收藏
    analytic.sensors.track('e_click_collect', {
      fromPage: 'p_my_follow',
      fromModule: 'm_project_list',
      fromItem: 'i_collect',
      toPage: 'p_my_follow',
      project_id: projectId,
      login_state: '1',
      collect_action: state,
      tab_id: String(this.data.currentTabIndex + 1)
    });
  },

  /**
   * 页面相关事件处理函数--监听用户页面滑到底部
   */
  onReachBottom: function () {
    let _index = this.data.currentTabIndex;
    if (this.data.viewHasMore && _index == 0) {
      this.getViewData(false);
    } else if (this.data.favoriteHasMore && _index == 1) {
      this.getFavoriteData(false)
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉刷新动作
   */
  onPullDownRefresh: function () {
    let _index = this.data.currentTabIndex;
    if (_index == 0) {
      this.getViewData(true);
    } else if (_index == 1) {
      this.getFavoriteData(true)
    }
  },


  /**
   * 页面相关事件处理函数--点击右侧的pk按钮
   */
  didClickFavoritePK() {
    this.setData({
      isShowFavoritePK: true
    })
    analytic.sensors.track('e_click_leave_phone_entry', {
      fromPage: 'p_my_follow',
      fromModule: 'm_project_compare',
      fromItem: 'i_leave_phone_entry',
      toPage: 'p_my_follow',
      login_state: this.data.userLoginStatus ? '1' : '2',
      op_type: '900767'
    });
  },


  /**
   * 页面相关事件处理函数--点击关闭 pk弹窗
   */
  closeLeavePhone() {
    this.setData({
      isShowFavoritePK: false
    })
  },

  /**
   * 页面相关事件处理函数--pk弹窗的留电事件
   */
  onCloseFavoritePK() {
    if (app.commonData.user.userId) {
      this.setData({
        isShowFavoritePK: false
      })
      this.makeOrder()
    }
  },

  /**
   * 页面相关事件处理函数--留电的事件
   */
  makeOrder: function () {
    // 向他咨询按钮
    wx.showLoading({
      title: '预约中...',
      mask: true,
    });
    var _this = this;
    order.makeOrder({
        op_type: '900767',
      }, {
        fromModule: 'm_project_compare',
        fromItem: 'i_confirm_leave_phone',
        op_type: '900767'
      },
      function () {
        wx.hideLoading();
        _this.setData({
          showOrderSuccessAlert: true,
          alertTitle: '预约成功',
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

});