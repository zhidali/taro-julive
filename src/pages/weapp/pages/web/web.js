const juliveConfig = require('../../julive-local-config.js');
const enviroment = require('../../enviroment/enviroment.js');
const analytic = require('../../analytic/analytic.js');
const wxUserInfo = require('../../user/wxUserInfo.js');
const app = getApp();

Page({
  data: {
    url: '',
    originalUrl: '',
  },
  browse(type, orderId, wxshare_id) {
    app
      .request('/v1/beidou/browse', {
        open_id: enviroment.getOpenId(),
        user_id: app.commonData.user.userId || '',
        share_id: wxshare_id,
        show_type: type,
        order_id: orderId,
        nickname: wxUserInfo.getNickName(),
      })
      .then((res) => {
        console.log(res);
      });
  },
  onLoad: function (options) {
    var url = decodeURIComponent(options.url);
    this.data.originalUrl = url;
    let wxshare_id = options.share_id;
    let wxshare_type = options.share_type;
    let wx_id = options.id;
    if (url.indexOf('julive.com') != -1 || url.indexOf('comjia.com') != -1) {
      url += url.indexOf('?') == -1 ? '?' : '&';
      var params = {
        appid: juliveConfig.appid,
        version_code: juliveConfig.versionCode,
        version_name: juliveConfig.versionName,
        agency: enviroment.getChannel(),
        channel_id: app.commonData.channel.channel_id,
        token: enviroment.getJuliveToken(),
        comjia_platform_id: juliveConfig.comjiaPlatformId,
        comjia_unique_id: enviroment.getOpenId(),
        channel_put: enviroment.getChannelPut(),
        click_id: enviroment.getGDTId(),
      };
      Object.keys(params).forEach(function (key) {
        if (url.indexOf(key) == -1) {
          url += key;
          url += '=';
          url += params[key];
          url += '&';
        }
      });
      url = url.substring(0, url.length - 1);
    }
    this.setData({
      url: url,
      wxshare_id: wxshare_id,
      wxshare_type: wxshare_type,
      wx_id: wx_id,
    });
    this.browse(wxshare_type, wxshare_id, wx_id);
    wx.showShareMenu({
      withShareTicket: true,
    });
  },
  onShareAppMessage() {
    var _this = this;
    return {
      title: '海量优惠房源，省钱买好房',
      path:
        '/pages/web/web?url=' +
        this.data.url +
        '&wxshare_id=' +
        this.data.wxshare_id +
        '&wxshare_type=' +
        this.data.wxshare_type +
        '&id=' +
        this.data.wx_id,
      complete(res) {
        // share result
        var transpond_result = '2';
        if (res.errMsg === 'shareAppMessage:ok') {
          transpond_result = '1';
        }
        // share type
        var transpond_differentiate = '1';
        if (res.shareTickets && res.shareTickets.length > 0) {
          transpond_differentiate = '2';
        }

        var analyticProperties = {};
        analyticProperties.fromPage = 'p_webview';
        analyticProperties.fromItem = 'i_transpond';
        analyticProperties.transpond_result = transpond_result;
        analyticProperties.transpond_differentiate = transpond_differentiate;
        analyticProperties.share_url = _this.data.originalUrl;
        analytic.sensors.track('e_click_transpond', analyticProperties);
      },
    };
  }
});