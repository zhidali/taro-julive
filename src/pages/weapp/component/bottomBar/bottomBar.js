// const enviroment = require('../../enviroment/enviroment.js');
const notification = require('../../utils/notification.js');
const app = getApp();
Component({
  properties: {
    share_id: {
      type: String,
      value: '',
    },
    show_type: {
      type: String,
      value: '',
    },
    order_id: {
      type: String,
      value: '',
    },
    isCollect: {
      type: Boolean,
      value: false,
    },
    dipperLoginFlag: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    detailserver:
      'https://m.julive.com/topic/zxserweima.html?utm_source=zxs_erweima_1',
  },
  attached: function () {
    var _this = this;
    wx.getSystemInfo({
      success: function (res) {
        if (res.model.indexOf('iPhone X') != -1) {
          _this.setData({
            isIpx: true,
          });
        }
      },
    });
  },
  methods: {
    didClickCollect(e) {
      if (this.data.isCollect) {
        this.triggerEvent('touchOnGoods', {
          isCollect: false,
        });
      } else {
        this.triggerEvent('touchOnGoods', {
          sonE: e,
          isCollect: true,
        });
      }
      app
        .request('/v1/beidou/collect', {
          // open_id: enviroment.getOpenId(),
          open_id: app.enviroment.openId,
          share_id: this.data.share_id,
          show_type: this.data.show_type,
          order_id: this.data.order_id,
          action_type: this.data.isCollect ? '1' : '2',
        })
        .then(() => {
          notification.postNotificationName('filterCollectData', true);
        });
    },
    didClickPhone(e) {
      this.triggerEvent('hostPhoneCall', {});
    },
    didClickDownApp(e) {
      let pathUrl = `${this.data.detailserver}&share_id=${this.data.share_id}&share_type=${this.data.show_type}&id=${this.data.order_id}`;
      wx.navigateTo({
        url: '/pages/web/web?url=' + pathUrl,
      });
      this.triggerEvent('hostDownApp', {});
    },
  },
});
