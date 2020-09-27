Component({
  properties: {
    dipperLoginFlag:{
      type: Boolean,
      value: true
    }
  },

  data: {
  },
  attached: function () {
    var _this = this;
    wx.getSystemInfo({
      success: function (res) {
        if (res.model.indexOf('iPhone X') != -1) {
          _this.setData({
            isIpx: true
          });
        }
      }
    })
  },
  methods: {
    didClickPhone(e) {
      this.triggerEvent('hostPhoneCall', {});
    },
    didClickShare(e) {
      this.triggerEvent('hostShare', {});
    }
  }
})