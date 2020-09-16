const enviroment = require('../../../enviroment/enviroment.js');
const app = getApp();
const analytic = require('../../../analytic/analytic.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showModelFlag: false,
    showModelType: 2,
    textareaVal: '',
    postSaveRequiredFlag: true,
    loadingHidden: false,
    textareaValLng: 0,
    ePageViewFlag: false,
    pageHeight: '',
    selectProjectType: {
      key: ''
    },
    selectqualifications: {
      key: ''
    },
    selectPurchasePurpose: {
      key: ''
    }
  },
  bindTextAreaBlur(e) {
    this.setData({
      textareaVal: e.detail.value,
      focusFlag: false
    })
    this.sendPoint({
      input_other_requirements: e.detail.value
    })

  },
  didClickChangeTotalPrice(e) {
    let obj = 'total_price.default_val'
    if (this.data.total_price.default_val != e.detail.value) {
      this.sendPoint({
        input_total_price: e.detail.value
      })
    }
    this.setData({
      [obj]: e.detail.value
    })
  },
  didClickChangeFirstPrice(e) {
    let obj = 'first_price.default_val'
    if (this.data.first_price.default_val != e.detail.value) {
      this.sendPoint({
        input_downpay: e.detail.value
      })
    }
    this.setData({
      [obj]: e.detail.value
    })
  },
  didClickChangeAcreage(e) {
    let obj = 'acreage.default_val'
    if (this.data.acreage.default_val != e.detail.value) {
      this.sendPoint({
        input_proportion: e.detail.value
      })
    }
    this.setData({
      [obj]: e.detail.value
    })
  },
  didClickCloseShowModal(e) {
    this.setData({
      showModelFlag: false
    })

  },
  didClickBackPage() {
    this.setData({
      showModelFlag: false
    })
    wx.navigateBack({
      delta: 1
    })
    analytic.sensors.track('e_click_close', {
      'fromPage': 'p_buy_house_demand',
      'fromModule': 'm_submit_window',
      'fromItem': 'i_button',
      'toPage': 'p_multi_project_analysis',
      'material_id': this.data.share_id || '',
      'adviser_id': this.data.employeeId || '',
      'order_id': this.data.o_id || '',
    });
  },
  async getfecthRequiredInfo() {
    let {
      data
    } = await app.request('/v3/beidou/required-info', {
      share_id: this.data.share_id,
      open_id: enviroment.getOpenId()
    })
    if (data.project_type && data.project_type.label.length > 0) {
      data.project_type.label.findIndex(item => {
        if (item.key === data.project_type.default_val) {
          item.flag = true
          this.data.selectProjectType = item
          return
        }
      })
    }

    if (data.qualifications && data.qualifications.label.length > 0) {
      data.qualifications.label.findIndex(item => {
        if (item.key === data.qualifications.default_val) {
          item.flag = true
          this.data.selectqualifications = item
          return
        }
      })
    }

    if (data.house_type && data.house_type.label.length > 0) {
      data.house_type.label.findIndex(item => {
        data.house_type.default_val.forEach(itm => {
          if (item.key === itm) {
            item.flag = true
            return
          }
        })

      })
    }

    if (data.purchase_purpose && data.purchase_purpose.label.length > 0) {
      data.purchase_purpose.label.findIndex(item => {
        if (item.key === data.purchase_purpose.default_val) {
          item.flag = true
          this.data.selectPurchasePurpose = item
          return
        }
      })
    }
    let _this = this
    this.setData({
      total_price: data.total_price,
      first_price: data.first_price,
      acreage: data.acreage,
      project_type_list: data.project_type.label,
      qualifications_list: data.qualifications.label,
      house_type_list: data.house_type.label,
      purchase_purpose_list: data.purchase_purpose.label,
      textareaVal: data.other_require.default_val,
      loadingHidden: true
    }, () => {
      _this.createSelectorQuery().select('.container').boundingClientRect(function(rect) {
        _this.data.pageHeight = rect.height
      }).exec()
    })
  },
  didClickMuchHouseType(e) {
    let index = e.currentTarget.dataset.index
    this.data.house_type_list[index].flag = !this.data.house_type_list[index].flag
    this.setData({
      house_type_list: this.data.house_type_list
    })
    let house_type = []
    this.data.house_type_list.forEach(item => {
      if (item.flag) {
        house_type.push(item.key)
      }
    })
    this.sendPoint({
      house_type: house_type
    })
  },
  didClickPurchasePurpose(e) {
    let index = e.currentTarget.dataset.index
    this.data.purchase_purpose_list.forEach((item, idx) => {
      if (index == idx) {
        item.flag = !item.flag
        if (item.flag) {
          this.sendPoint({
            purchase_purpose: String(item.key)
          })
        }
      } else {
        item.flag = false
      }
    })
    this.setData({
      purchase_purpose_list: this.data.purchase_purpose_list,
      selectPurchasePurpose: this.data.purchase_purpose_list[index].flag ? this.data.purchase_purpose_list[index] : {
        key: ''
      }
    })
  },
  didClickProjectType(e) {
    let index = e.currentTarget.dataset.index
    this.data.project_type_list.forEach((item, idx) => {
      if (index == idx) {
        item.flag = !item.flag
        if (item.flag) {
          this.sendPoint({
            project_type: [item.key]
          })
        }
      } else {
        item.flag = false
      }
    })
    this.setData({
      project_type_list: this.data.project_type_list,
      selectProjectType: this.data.project_type_list[index].flag ? this.data.project_type_list[index] : {
        key: ''
      }
    })
  },
  didClickQualifications(e) {
    let index = e.currentTarget.dataset.index
    this.data.qualifications_list.forEach((item, idx) => {
      if (index == idx) {
        item.flag = !item.flag
        if (item.flag) {
          this.sendPoint({
            purchase_qualification: String(item.key)
          })
        }
      } else {
        item.flag = false
      }
    })
    this.setData({
      qualifications_list: this.data.qualifications_list,
      selectqualifications: this.data.qualifications_list[index].flag ? this.data.qualifications_list[index] : {
        key: ''
      }
    })
  },
  didClickEmployeeMobile() {
    wx.makePhoneCall({
      phoneNumber: this.data.mobile || getApp().commonData.channel.phone
    })
    analytic.sensors.track('e_click_dial_adviser_call', {
      'fromPage': 'p_buy_house_demand',
      'fromModule': 'm_submit_window',
      'fromItem': 'i_dial_adviser_call',
      'toPage': 'p_buy_house_demand',
      'material_id': this.data.share_id || '',
      'adviser_id': this.data.employeeId || '',
      'order_id': this.data.o_id || '',
    });
  },
  async didClicksendSaveRequiredInfo() {
    if (!this.data.postSaveRequiredFlag) return;
    let data = this.data
    let house_type = []
    data.house_type_list.forEach(item => {
      if (item.flag) {
        house_type.push(item.key)
      }
    })
    let res = await app.request('/v3/beidou/save-required-info', {
      total_price: data.total_price.default_val,
      first_price: data.first_price.default_val,
      acreage: data.acreage.default_val,
      project_type: data.selectProjectType.key,
      qualifications: data.selectqualifications.key || '',
      house_type: house_type,
      purchase_purpose: data.selectPurchasePurpose.key || '',
      other_require: this.data.textareaVal,
      share_id: this.data.share_id,
      open_id: enviroment.getOpenId()
    })

    analytic.sensors.track('e_click_submit', {
      'event': 'e_click_submit',
      'fromPage': 'p_buy_house_demand',
      'fromItem': 'i_submit',
      'toPage': 'p_buy_house_demand',
      'material_id': this.data.share_id || '',
      'adviser_id': this.data.employeeId || '',
      'order_id': this.data.o_id || '',
      'input_total_price': data.total_price.default_val || '',
      'input_downpay': data.first_price.default_val || '',
      'input_proportion': data.acreage.default_val || '',
      'project_type': [data.selectProjectType.key] || '',
      'purchase_qualification': data.selectqualifications.key || '',
      'house_type': house_type || '',
      'purchase_purpose': data.selectPurchasePurpose.key || '',
      'input_other_requirements': this.data.textareaVal || ''
    });
    this.setData({
      showModelFlag: true,
      showModelType: 2,
    })
    this.data.postSaveRequiredFlag = true
  },
  sendPoint(obj = {}) {
    const baseObj = {
      'fromPage': 'p_buy_house_demand',
      'fromModule': 'm_buy_house_demand',
      'fromItem': 'i_modify_demand',
      'toPage': 'p_buy_house_demand',
      'material_id': this.data.share_id || '',
      'adviser_id': this.data.employeeId || '',
      'order_id': this.data.o_id || '',
    }
    obj = Object.assign(obj, baseObj)
    analytic.sensors.track('e_click_modify_demand', obj);
  },
  changeFontNum(e) {
    let txt = e.detail.value
    this.setData({
      textareaValLng: txt.length,
      textareaVal: txt
    })

  },
  onLoad: function(options) {
    let {
      share_id,
      mobile,
      o_id,
      employeeId
    } = options
    this.data.share_id = share_id
    this.data.mobile = mobile
    this.data.o_id = o_id
    this.data.employeeId = employeeId
    this.getfecthRequiredInfo()
    this.analyticPageView('e_page_view')
    setTimeout(() => {
      this.data.ePageViewFlag = true;
    }, 500);
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
    analyticProperties.fromPage = 'p_buy_house_demand'
    analyticProperties.material_id = this.data.share_id
    analyticProperties.adviser_id = this.data.employeeId
    analyticProperties.order_id = this.data.o_id
    analyticProperties.toPage = 'p_buy_house_demand';
    analytic.sensors.track(eventName, analyticProperties);
  },
  didClickbindfocus(e) {
    this.setData({
      focusFlag: true
    }, () => {
      wx.pageScrollTo({
        scrollTop: this.data.pageHeight + 100,
      });
    })
  }
})