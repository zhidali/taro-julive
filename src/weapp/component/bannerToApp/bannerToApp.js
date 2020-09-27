/*
 * @Author: limengge
 * @Date: 2020-02-26 14:35:48
 * @LastEditTime: 2020-02-28 16:34:44
 * @LastEditors: limengge
 * @Description: 跳转🈯至app 组件
 */

const app = getApp();
Component({
  properties: {
    url: {
      type: String,
      value: ''
    },
    showBanner: {
      type: Boolean,
      value: ''
    },
    width: {
      type: Number,
      value: ''
    },
    page: {
      type: String,
      value: ''
    }
  },

  data: {},
  attached: function() {},
  methods: {
    didClickOPen() {
      this.triggerEvent('OpenApp', {});
    },
    didClickContact() {
      this.triggerEvent('CustomerCenter', {});
    }
  }
});
