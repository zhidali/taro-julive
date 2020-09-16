const analytic = require('../../../analytic/analytic.js');
const autoanalysis = require('../autoanalysis/autoanalysis.js');
const qqmapNavigation = require('../qqmap-wx-jssdk/qqmap-navigation.js');
Page({
  data: {
    pushPullFlag: false,
    commuteActionShow: [],
    ePageViewFlag: false
  },
  selectTraffic(e) {
    let flag = !!Number(e.currentTarget.dataset.index)
    if (this.data.selectTrafficFlag == flag) return;
    let list;
    let houseTrafficIndex;
    if (this.data.selectDestinationFlag) {
      list = flag ? this.data.polylineB.transit : this.data.polylineB.driving
      houseTrafficIndex = this.data.polylineB.houseTrafficIndex
      this.data.polylineB.selectTrafficFlag = flag
    } else {
      list = flag ? this.data.polylineA.transit : this.data.polylineA.driving
      houseTrafficIndex = this.data.polylineA.houseTrafficIndex
      this.data.polylineA.selectTrafficFlag = flag
    }
    this.setData({
      selectTrafficFlag: flag,
      polyline: list
    })
    if (flag) {
      autoanalysis.elementTracker('navigationMap', {
        'project_ids': this.data.project_ids,
        'order_id': this.data.o_id,
        'adviser_id': this.data.employee.id,
        'material_id': this.data.share_id,
      }, 4110)
    } else {
      autoanalysis.elementTracker('navigationMap', {
        'project_ids': this.data.project_ids,
        'order_id': this.data.o_id,
        'adviser_id': this.data.employee.id,
        'material_id': this.data.share_id,
      }, 4111)
    }

  },
  selectDestination(e) {
    let flag = !!Number(e.currentTarget.dataset.index)
    if (this.data.selectDestinationFlag == flag) return;
    if (flag) {
      let obj = this.data.polylineB
      this.setData({
        selectDestinationFlag: flag,
        selectTrafficFlag: obj.selectTrafficFlag,
        commuteAction: this.data.commute[1],
        houseTrafficIndex: obj.houseTrafficIndex,
        polyline: obj.selectTrafficFlag ? obj.transit : obj.driving,
        marker: obj.marker
      })
    } else {
      let obj = this.data.polylineA
      this.setData({
        selectDestinationFlag: flag,
        selectTrafficFlag: obj.selectTrafficFlag,
        commuteAction: this.data.commute[0],
        houseTrafficIndex: obj.houseTrafficIndex,
        polyline: obj.selectTrafficFlag ? obj.transit : obj.driving,
        marker: obj.marker
      })
    }
    autoanalysis.elementTracker('navigationMap', {
      'project_ids': this.data.project_ids,
      'order_id': this.data.o_id,
      'adviser_id': this.data.employee.id,
      'material_id': this.data.share_id,
      'fromItemIndex': flag ? 1 : 0
    }, 4663)

  },
  selectHouseTraffic(e) {
    let index = e.currentTarget.dataset.index
    if (index == this.data.houseTrafficIndex) return;
    let obj = this.data.selectDestinationFlag ? this.data.polylineB : this.data.polylineA // true 第二个终点  flase 第一个终点
    let key = this.data.selectTrafficFlag ? 'transit' : 'driving' // true 公交  flase自驾
    let list = obj[key]
    list.forEach((item, idx) => {
      if (index == idx) {
        item.width = 10
      } else {
        item.width = 5
      }
    })
    obj.houseTrafficIndex = index
    this.setData({
      houseTrafficIndex: index,
      polyline: list
    })
    autoanalysis.elementTracker('navigationMap', {
      'project_id': this.data.commuteAction[index].project_id,
      'order_id': this.data.o_id,
      'adviser_id': this.data.employee.id,
      'material_id': this.data.share_id,
      'fromItemIndex': index
    }, 4842)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //获取页面栈
    var pages = getCurrentPages();
    let _this = this
    pages.forEach(item => {
      if (item.route === "dipperSubPK/pages/multiProject/multiProject" || item.route === "dipperSubPK/pages/singleProject/singleProject") {
        let data = item.data
      qqmapNavigation.includePoints(data.marker)
        _this.setData({
          lng: data.lng,
          lat: data.lat,
          marker: data.marker,
          polyline: data.polyline,
          polylineA: data.polylineA,
          polylineB: data.polylineB,
          commute: data.commute,
          commuteAction: data.commuteAction,
          selectDestinationFlag: data.selectDestinationFlag,
          selectTrafficFlag: data.selectTrafficFlag,
          houseTrafficIndex: data.houseTrafficIndex,
          share_id: data.share_id,
          employee: data.employee,
          o_id: data.o_id,
          commuteActionShow: data.commuteAction.length > 2 ? data.commuteAction.slice(0, 2) : data.commuteAction,
          project_ids: data.project_ids ? data.project_ids : [data.projectId]
        },()=>{
          _this.analyticPageView('e_page_view')
          setTimeout(() => {
            this.data.ePageViewFlag = true;
          }, 500);
        })

      }
    })
  },
  onShow: function() {
    this.data.startViewTime = Date.parse(new Date());
    if (this.data.ePageViewFlag) {
      this.analyticPageView("e_page_view");
    }
  },

  onHide: function() {
    this.analyticPageView()
  },

  onUnload: function() {
    this.analyticPageView()
  },

  analyticPageView: function (eventName = 'e_page_quit') {
    // analytic 
    // 以秒为单位,所以除以1000
    let analyticProperties = {}
    if (eventName != 'e_page_view') {
      var viewTime = (Date.parse(new Date()) - this.data.startViewTime) / 1000;
      analyticProperties.view_time = viewTime;
    }
    analyticProperties.fromPage = 'p_commuting_route'
    analyticProperties.toPage = 'p_commuting_route';
    analyticProperties.material_id = this.data.share_id
    analyticProperties.adviser_id = this.data.employee.id,
    analyticProperties.order_id = this.data.o_id
    analytic.sensors.track(eventName, analyticProperties);
  },
  didTapPushPull() {
    this.setData({
      // commuteActionShow: this.data.pushPullFlag ? this.data.commuteAction : this.data.commuteAction.slice(0, 2),
      pushPullFlag: !this.data.pushPullFlag
    })
  }
})