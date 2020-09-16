const notification = require('../../../utils/notification.js');
const wxUserInfo = require('../../../user/wxUserInfo.js');
const autoanalysis = require('../autoanalysis/autoanalysis.js');
var analytic = require('../../../analytic/analytic.js');
const app = getApp();
Page({
  data: {
    delBtnWidth: 160,
    windowHeight: 0,
    collectList: [],
    activeFlag: true,
    page: 1,
    reachBottomFlag: false,
    fixedFlag: false,
    ePageViewFlag: false,
  },
  selectActive(e) {
    let flag = !!Number(e.currentTarget.dataset.flag);
    if (this.data.activeFlag == flag) return;
    if (this.data.activeFlag) {
      this.setData({
        activeFlag: false,
      });
    } else {
      this.setData({
        activeFlag: true,
      });
    }
    autoanalysis.elementTracker(
      'record',
      {
        tab_id: flag ? '1' : '2',
        fromItemIndex: flag ? '1' : '2',
      },
      3982
    );
  },
  didClickItem(e) {
    let item = e.currentTarget.dataset.item;
    let { index } = e.currentTarget.dataset;
    if (item.url) {
      let encodeUrl = encodeURIComponent(item.url);
      let pathUrl = `${encodeUrl}&share_id=${item.order_id}&share_type=${item.type}&id=${item.id}`;
      if (item.type === 1 || item.type === 11) {
        // 签约前提醒
        autoanalysis.elementTracker(
          'record',
          {
            fromItemIndex: index,
            adviser_id: this.data.employee.id,
            order_id: item.order_id,
            tab_id: this.data.activeFlag ? '1' : '2',
            project_id: item.project_id,
            to_url: item.url,
          },
          3971
        );
      } else if (item.type === 2) {
        // 认购前提醒
        autoanalysis.elementTracker(
          'record',
          {
            fromItemIndex: index,
            adviser_id: this.data.employee.id,
            order_id: item.order_id,
            tab_id: this.data.activeFlag ? '1' : '2',
            project_id: item.project_id,
            to_url: item.url,
          },
          3972
        );
      } else if (item.type === 3) {
        // 看房报告
        autoanalysis.elementTracker(
          'record',
          {
            fromItemIndex: String(index),
            adviser_id: this.data.employee.id,
            order_id: item.order_id,
            tab_id: this.data.activeFlag ? '1' : '2',
            to_url: item.url,
            project_ids: item.project_ids,
            see_id: item.id,
          },
          3973
        );
      } else if (item.type === 4) {
        // 带看前行程确认
        autoanalysis.elementTracker(
          'record',
          {
            fromItemIndex: String(index),
            adviser_id: this.data.employee.id,
            order_id: item.order_id,
            tab_id: this.data.activeFlag ? '1' : '2',
            project_ids: item.project_ids,
            to_url: item.url,
          },
          3974
        );
      }
      wx.navigateTo({
        url: '/pages/web/web?url=' + encodeURIComponent(pathUrl),
      });
    } else if (item.type === 5) {
      autoanalysis.elementTracker(
        'record',
        {
          fromItemIndex: String(index),
          adviser_id: this.data.employee.id,
          article_type: String(item.category_id / 10),
          tab_id: this.data.activeFlag ? '1' : '2',
        },
        3994
      );
      wx.navigateTo({
        url: `../cityReport/cityReport?share_id=${item.id}&o_id=${item.order_id}&type=${item.type}`,
      });
    } else if (item.type === 7) {
      autoanalysis.elementTracker(
        'record',
        {
          fromItemIndex: String(index),
          adviser_id: this.data.employee.id,
          order_id: item.order_id,
          project_id: item.project_id,
          material_id: item.id,
          tab_id: this.data.activeFlag ? '1' : '2',
        },
        3979
      );
      wx.navigateTo({
        url: `../singleProject/singleProject?share_id=${item.id}&o_id=${item.order_id}&type=${item.type}`,
      });
    }
  },
  didClickMultiItem(e) {
    let { orderid, shareid, type, index } = e.currentTarget.dataset;
    autoanalysis.elementTracker(
      'record',
      {
        fromItemIndex: String(index),
        adviser_id: this.data.employee.id ? this.data.employee.id : '',
        order_id: orderid,
        project_ids: this.data.activeFlag
          ? this.data.list[index].project_id
          : this.data.collectList[index].project_id,
        material_id: shareid,
        tab_id: this.data.activeFlag ? '1' : '2',
      },
      3980
    );
    wx.navigateTo({
      url: `../multiProject/multiProject?share_id=${shareid}&o_id=${orderid}&type=${type}`,
    });
  },
  async filterCollectData(flag = false) {
    let _this = this;
    if (flag) {
      _this.setData({
        collectList: [],
        page: 1,
        reachBottomFlag: false,
      });
    }
    let res = await app.request('/v1/beidou/my-collect', {
      nick_name: wxUserInfo.getNickName(),
      page: _this.data.page,
    });
    let data = res.data;
    _this.data.reachBottomFlag = data.has_more == 2;
    data.list.forEach((item) => {
      if (item.type === 6) {
        item.leixing = 3;
        item.infoName = 'multiHouseDataCollect';
      } else if (item.type === 7) {
        item.leixing = 2;
        item.infoName = 'singleHouseDataCollect';
      } else {
        if (item.type === 1 || item.type === 11) {
          // 签约前提醒
          item.myKey = '签约前提醒';
          item.myVal = item.name;
          item.leixing = 1;
        } else if (item.type === 2) {
          // 认购前提醒
          item.myKey = '预约认购楼盘';
          item.myVal = item.project_name;
          item.leixing = 1;
        } else if (item.type === 3) {
          // 看房报告
          item.myKey = '楼盘';
          item.myVal = item.project_name;
          item.leixing = 1;
        } else if (item.type === 4) {
          // 带看前行程确认
          item.myKey = '约见地点';
          item.myVal = item.meet_address;
          item.leixing = 1;
        } else if (item.type === 5) {
          // 文章简介
          item.myKey = false;
          item.myVal = item.desc;
          item.leixing = 1;
        }
      }
    });
    let newList = _this.data.collectList.concat(data.list);
    _this.setData({
      collectList: newList,
    });
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!this.data.activeFlag && !this.data.reachBottomFlag) {
      this.filterCollectData();
      this.data.page++;
    }
  },
  async filterHouseBook() {
    let res = await app.request('/v1/beidou/house-book', {
      nick_name: wxUserInfo.getNickName(),
    });
    let data = res.data;
    let _this = this;
    data.list.forEach((item) => {
      if (item.type === 6) {
        item.leixing = 3;
      } else if (item.type === 7) {
        item.leixing = 2;
      } else {
        if (item.type === 1 || item.type === 11) {
          // 签约前提醒
          item.myKey = '签约前提醒';
          item.myVal = item.name;
          item.leixing = 1;
        } else if (item.type === 2) {
          // 认购前提醒
          item.myKey = '预约认购楼盘';
          item.myVal = item.project_name;
          item.leixing = 1;
        } else if (item.type === 3) {
          // 看房报告
          item.myKey = '楼盘';
          item.myVal = item.project_name;
          item.leixing = 1;
        } else if (item.type === 4) {
          // 带看前行程确认
          item.myKey = '约见地点';
          item.myVal = item.meet_address;
          item.leixing = 1;
        } else if (item.type === 5) {
          // 文章简介
          item.myKey = false;
          item.myVal = item.desc;
          item.leixing = 1;
        }
        // _this.data.remindData.push(item)
      }
    });
    _this.setData({
      employee: data.employee,
      windowHeight: app.globalData.hh,
      list: data.list,
      loadingHidden: true,
    });
  },
  onLoad: async function (options) {
    this.filterHouseBook();
    this.filterCollectData();
    let _this = this;
    this.setData({
      isIpx: app.globalData.isIpx,
    });
    notification.addNotification(
      'filterCollectData',
      _this.filterCollectData,
      _this
    );
    app.recordFlag.browseFlag = true; //  给子页面使用 说明可以上报
    this.analyticPageView('e_page_view');
    setTimeout(() => {
      this.data.ePageViewFlag = true;
    }, 500);
  },
  drawStart: function (e) {
    var touch = e.touches[0];
    // for (var index in this.data.collectList) {
    //   var item = this.data.collectList[index]
    //   item.right = 0
    // }
    this.setData({
      // collectList: this.data.collectList,
      startX: touch.clientX,
    });
  },
  drawMove: function (e) {
    var touch = e.touches[0];
    let index = e.currentTarget.dataset.index;
    var item = this.data.collectList[index];
    var disX = this.data.startX - touch.clientX;
    let connect = `collectList[${index}].right`;
    if (disX >= 20) {
      if (disX > this.data.delBtnWidth) {
        disX = this.data.delBtnWidth;
      }
      this.setData({
        [connect]: disX,
      });
    } else {
      this.setData({
        [connect]: 0,
      });
    }
  },
  drawEnd: function (e) {
    let index = e.currentTarget.dataset.index;
    var item = this.data.collectList[index];
    let topConnect;
    if (
      Object.prototype.toString.call(this.data.recordTopIndex) ===
      '[object Number]'
    ) {
      topConnect = `collectList[${this.data.recordTopIndex}].right`;
    }
    //  滑动
    let project_id, project_ids, order_id;
    order_id = item.order_id;
    if ('singleHouseDataCollect' === item.infoName) {
      project_id = item.project_id;
    } else if ('multiHouseDataCollect' === item.infoName) {
      project_ids = item.project_id;
    }

    let connect = `collectList[${index}].right`;
    if (item.right >= this.data.delBtnWidth / 2) {
      item.right = this.data.delBtnWidth;
      if (
        Object.prototype.toString.call(this.data.recordTopIndex) ===
          '[object Number]' &&
        this.data.recordTopIndex != index
      ) {
        this.setData({
          [connect]: this.data.delBtnWidth,
          [topConnect]: 0,
        });
      } else {
        this.setData({
          [connect]: this.data.delBtnWidth,
        });
      }

      autoanalysis.elementTracker(
        'record',
        {
          tab_id: '2',
          project_id: project_id ? project_id : '',
          project_ids: project_ids ? project_ids : '',
          order_id: order_id ? order_id : '',
          adviser_id: this.data.employee.id ? this.data.employee.id : '',
        },
        3993
      );
    } else {
      this.setData({
        [connect]: 0,
      });
    }
    this.data.recordTopIndex = index;
  },

  delItem: function (e) {
    let { index, type } = e.currentTarget.dataset;
    let item = this.data.collectList[index];
    app
      .request('/v1/beidou/collect', {
        share_id: item.id,
        show_type: item.type,
        order_id: item.order_id,
        action_type: '2',
      })
      .then((res) => {
        wx.showToast({
          title: '删除成功',
          duration: 2000,
        });
      });
    autoanalysis.elementTracker(
      'record',
      {
        fromItemIndex: String(index),
        tab_id: '2',
        project_id: item.project_id,
        order_id: item.order_id,
        adviser_id: this.data.employee.id,
      },
      3983
    );
    this.data.collectList.splice(index, 1);
    this.setData({
      collectList: this.data.collectList,
    });
  },
  phoneCall() {
    wx.makePhoneCall({
      phoneNumber: this.data.employee.mobile || getApp().commonData.channel.phone,
    });
    autoanalysis.elementTracker(
      'record',
      {
        adviser_id: this.data.employee.id,
        order_id: this.data.employee.order_num,
        tab_id: this.data.activeFlag ? '1' : '2',
        is_adviser_phone: this.data.employee.mobile ? '1' : '2',
      },
      3981
    );
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

  analyticPageView: function (eventName = 'e_page_quit') {
    // analytic
    // 以秒为单位,所以除以1000
    let analyticProperties = {};
    if (eventName != 'e_page_view') {
      var viewTime = (Date.parse(new Date()) - this.data.startViewTime) / 1000;
      analyticProperties.view_time = viewTime;
    }
    analyticProperties.fromPage = 'p_user_housing_treasured_book';
    (analyticProperties.tab_id = this.data.activeFlag ? '1' : '2'),
      (analyticProperties.toPage = 'p_user_housing_treasured_book');
    analytic.sensors.track(eventName, analyticProperties);
  },
});
