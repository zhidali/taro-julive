/*
 * @Author: limengge
 * @Date: 2019-11-23 16:18:19
 * @LastEditTime: 2020-08-27 17:59:22
 * @LastEditors: zhidl
 * @Description:
 */
const analytic = require('../analytic/analytic.js');
const app = getApp();
Component({
  properties: {
    showModal: {
      type: Boolean,
      value: false,
      observer(newVal) {
        if (newVal) {
          app.dialogMapData('set', 'home-orderSuccess');
        } else {
          app.dialogMapData('close');
        }
      }
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
      value: '打开APP 找房更流畅'
    },
    fromPage: {
      type: String,
      value: ''
    },
    isOpenTypeBtn: {
      type: Boolean,
      value: true
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
    preventTouchMove: function () {},

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
      this.triggerEvent('confirmCallback', obj);
      //跳转至 app
      analytic.sensors.track('e_click_open_app', {
        fromPage: this.data.fromPage,
        fromModule: 'm_leave_phone_success_window',
        fromItem: 'i_open_app',
        toPage: 'p_online_service'
      });
    },
    bindPickerChangeMoney: function (e) {
      this.setData({
        index: e.detail.value
      });
    },
    bindPickerChangeCity: function (e) {
      this.setData({
        cityIndex: e.detail.value
      });
    }
  }
});