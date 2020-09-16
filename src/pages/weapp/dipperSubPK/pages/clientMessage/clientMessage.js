const regeneratorRuntime = require('../regeneratorRuntime.js');
const enviroment = require('../../../enviroment/enviroment.js');
const util = require('../../../utils/util.js')
const analytic = require('../../../analytic/analytic.js');
const app = getApp();

Page({
  data: {
    page_num: 1,
    pages: [],
    has_more: true,
    flag: true,
    loadingHidden:false,
    isIpx:false
  },
  async fetchGetUserRequiredFeedback() {
    let res = await app.request('/v3/beidou/get-user-required-feedback', {
      share_id: this.data.share_id,
      open_id: enviroment.getOpenId(),
      order_id: this.data.order_id,
      page_num: this.data.page_num,
    })
    this.setData({
      pages: res.data.data,
      has_more: res.data.has_more,
      loadingHidden:true
    })
  },
  async againSavetUserRequiredFeedback(e) {
    let index = e.currentTarget.dataset.index
    let obj = `pages[${index}].isFail`
    this.setData({
      [obj]: false
    })
    let res = await app.request('/v3/beidou/save-user-required-feedback', {
      share_id: this.data.share_id,
      open_id: enviroment.getOpenId(),
      order_id: this.data.order_id,
      feedback_type: '2', // 目前只有 文字类别
      feedback_info: this.data.pages[index].feedback_info
    })
    if (res.code != 0) {
      this.data.pages.push({
        [obj]: true
      })
    }
  },
  async sendSavetUserRequiredFeedback() {
    if (!this.data.flag || !this.data.textareaVal || this.data.textareaVal == '') return;
    this.data.flag = false
    let res = await app.request('/v3/beidou/save-user-required-feedback', {
      share_id: this.data.share_id,
      open_id: enviroment.getOpenId(),
      order_id: this.data.order_id,
      feedback_type: '2', // 目前只有 文字类别
      feedback_info: this.data.textareaVal
    })

    if (res.code === 0) {
      this.data.pages.push(res.data)
    } else {
      this.data.pages.push({
        create_datetime: util.formatTime(new Date),
        feedback_info: this.data.textareaVal,
        isFail: true
      })
    }

    this.sendPoint('e_click_send_message', {
      'fromModule': 'm_bottom_bar',
      'fromItem': 'i_send_message',
      'material_id': this.data.share_id,
      'adviser_id': this.data.employeeId,
      'order_id': this.data.order_id,
      'query': this.data.textareaVal
    })
    this.setData({
      pages: this.data.pages,
      textareaVal: '',
      flag : true
    })
  },
  sendPoint(event, obj = {}) {
    const baseObj = {
      'fromPage': 'p_feedback',
      'toPage': 'p_feedback',
    }
    obj = Object.assign(obj, baseObj)
    analytic.sensors.track(event, obj);
  },
  onLoad: function(options) {
    this.data.order_id = options.order_id
    this.data.share_id = options.share_id
    this.data.employeeId = options.employeeId
    this.fetchGetUserRequiredFeedback()
    this.setData({
      isIpx: app.globalData.isIpx
    })
    this.analyticPageView('e_page_view')
    setTimeout(() => {
      this.data.ePageViewFlag = true;
    }, 500);
  },

  bindTextAreaBlur(e) {
    this.setData({
      textareaVal: e.detail.value,
      focusFlagIOS: false,
      focusFlagAND: false
    })
    this.sendPoint('e_click_send_message_entry', {
      'fromModule': 'm_bottom_bar',
      'fromItem': 'i_send_message_entry',
      'material_id': this.data.share_id,
      'adviser_id': this.data.employeeId,
      'order_id': this.data.order_id
    })
  },
  didClickbindfocus(){
    if (this.data.isIpx){
      this.setData({
        focusFlagIOS: true
      })
    } else {
      this.setData({
        focusFlagAND: true
      })
    }
 
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
    analyticProperties.fromPage = 'p_feedback'
    analyticProperties.material_id = this.data.share_id
    analyticProperties.adviser_id = this.data.employeeId
    analyticProperties.order_id = this.data.order_id
    analyticProperties.toPage = 'p_feedback';
    analytic.sensors.track(eventName, analyticProperties);
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: async function(e) {
    if (!this.data.has_more){
      wx.stopPullDownRefresh();
      wx.showLoading({
        title: '没有更多信息了',
        mask: true
      })
      setTimeout(function () {
        wx.hideLoading()
      }, 500)
      return
    }
    ++this.data.page_num;
    let res = await app.request('/v3/beidou/get-user-required-feedback', {
      share_id: this.data.share_id,
      open_id: enviroment.getOpenId(),
      order_id: this.data.order_id,
      page_num: this.data.page_num
    })

    this.data.pages.push(res.data.data)
    this.setData({
      data: this.data.pages,
      has_more: res.data.has_more
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})