/*
 * @Author: limengge
 * @Date: 2020-02-27 16:14:20
 * @LastEditTime: 2020-03-04 21:50:20
 * @LastEditors: limengge
 * @Description:
 */
const analytic = require('../../analytic/analytic.js');

Component({
  properties: {
    showModal: {
      type: Boolean,
      value: false
    },
    title: {
      type: String,
      value: '预约成功'
    },
    content: {
      type: String,
      value: ''
    },
    popType: {
      type: String,
      value: '1'
    },
    opType: {
      type: String,
      value: ''
    },
    region: {
      type: Array,
      value: []
    },
    allPrice: {
      type: Array,
      value: []
    },
    buttonTitle: {
      type: String,
      value: '我知道了'
    },
    fromPage: {
      type: String,
      value: ''
    }
  },

  data: {
    showModal: false
  },

  methods: {
    hideModal(e) {
      this.setData({
        showModal: false
      });
      this.triggerEvent('hideModalCallback', {});
    },

    /**
     * 弹出框蒙层截断touchmove事件
     */
    preventTouchMove: function() {},

    onConfirm(e) {
      let obj = {};
      if (
        this.data.popType === '3' &&
        (!(this.data.index >= 0) || !(this.data.cityIndex >= 0))
      )
        return;
      if (this.data.popType === '3') {
        obj.min_price = this.data.allPrice[this.data.index];
        obj.district_ids = this.data.region[this.data.cityIndex];
      }
      this.setData({
        showModal: false
      });
      // this.triggerEvent('confirmCallback', obj);
      //跳转至 app
      analytic.sensors.track('e_click_open_app', {
        fromPage: this.data.fromPage,
        fromModule: 'm_leave_phone_success_window',
        fromItem: 'i_open_app',
        toPage: 'p_online_service'
      });
    },

    bindPickerChangeMoney: function(e) {
      this.setData({
        index: e.detail.value
      });
    },
    bindPickerChangeCity: function(e) {
      this.setData({
        cityIndex: e.detail.value
      });
    }
  }
});
