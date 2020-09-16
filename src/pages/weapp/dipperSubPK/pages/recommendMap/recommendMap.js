// dipperSubPK/pages/recommendMap/recommendMap.js
const analytic = require('../../../analytic/analytic.js');
let recommendMap;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    recommendMapScale: 10,
    ePageViewFlag: false
  },
  onLoad: function(options) {
    recommendMap = wx.createMapContext('recommendMap')
    let {
      share_id,
      mobile,
      o_id,
      employeeId
    } = options
    this.data.share_id = share_id
    this.data.o_id = o_id
    this.data.employeeId = employeeId
    let pages = getCurrentPages();
    let _this = this
    pages.find(item => {
      if (item.route === "dipperSubPK/pages/multiProject/multiProject") {
        recommendMap.includePoints({
          padding: [40],
          points: item.data.recommendMapIncludePointList,
          success: function(res) {
            console.log(res)
          }
        })
     
        console.log(item.data.recommendMapMarkerProjectBubble)
        _this.setData({
          markerProjectBubble: item.data.recommendMapMarkerProjectBubble,
          latitude: item.data.recommendMapMarkerProjectBubble[0].latitude,
          longitude: item.data.recommendMapMarkerProjectBubble[0].longitude
        }, () => {
        })
        _this.analyticPageView('e_page_view')
        setTimeout(() => {
          _this.data.ePageViewFlag = true;
        }, 500);
        return true
      }
    })
  },
  didClickMapScale(e) {
    let type = e.currentTarget.dataset.type
    let _this = this
    recommendMap.getScale({
      success: function(res) {
        let event;
        let fromItem;
        if (type === 'add') {
          _this.setData({
            recommendMapScale: res.scale + 1
          })
          event = 'e_click_enlarge_map'
          fromItem = 'i_enlarge_map'
        } else {
          _this.setData({
            recommendMapScale: res.scale - 1
          })
          event = 'e_click_reduce_map'
          fromItem = 'i_reduce_map'
        }
   
        analytic.sensors.track(event, {
          'fromPage': 'p_recommend_project',
          'fromModule': 'm_map',
          'fromItem': fromItem,
          'toPage': 'p_recommend_project',
          'material_id': _this.data.share_id,
          'adviser_id': _this.data.employeeId,
          'order_id': _this.data.o_id,
        });
      }
    })
  },
  didiClickcallouttap(e) {
    let index = e.markerId

    analytic.sensors.track('e_click_project_bubble', {
      'fromPage': 'p_recommend_project',
      'fromModule': 'm_map',
      'fromItem': 'i_project_bubble',
      'toPage': 'p_recommend_project',
      'material_id': this.data.share_id,
      'adviser_id': this.data.employeeId,
      'order_id': this.data.o_id,
      'project_id': this.data.markerProjectBubble[index].project_id
    });
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

  analyticPageView: function(eventName = 'e_page_quit') {
    // analytic 
    // 以秒为单位,所以除以1000
    let analyticProperties = {}
    if (eventName != 'e_page_view') {
      var viewTime = (Date.parse(new Date()) - this.data.startViewTime) / 1000;
      analyticProperties.view_time = viewTime;
    }
    analyticProperties.fromPage = 'p_recommend_project'
    analyticProperties.material_id = this.data.share_id
    analyticProperties.adviser_id = this.data.employeeId
    analyticProperties.order_id = this.data.o_id
    analyticProperties.toPage = 'p_recommend_project';
    analytic.sensors.track(eventName, analyticProperties);
  },

})