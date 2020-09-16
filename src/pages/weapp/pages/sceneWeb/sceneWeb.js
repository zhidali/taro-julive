const juliveConfig = require('../../julive-local-config.js');
const enviroment = require('../../enviroment/enviroment.js');
const analytic = require('../../analytic/analytic.js');
const app = getApp();
Page({
  data: {
    url: '',
    originalUrl: ''
  },
  onLoad: function(options) {
    // 方便查看
    console.log(options)
    // 分享进来
    if (options.url && options.url.length> 10){
      let url = decodeURIComponent(options.url)
      this.data.originalUrl = url 
      this.tool(url)
      console.log('onshare')
    }
    if (!options.scene)return;
    let scene = decodeURIComponent(options.scene);
    scene = scene.split(',')
    let obj = {}
    scene.forEach(item => {
      let o = item.split("_")
      let key = o[0]
      let value = o[1]
      Object.assign(obj, {
        [key]: value
      })
    })
    app.request('/v1/common/get-url-by-scene', obj).then(res => {
      let url = res.data.url
      this.data.originalUrl = url;
      this.tool(url)
      wx.showShareMenu({
        withShareTicket: true
      })
    })
  },

  tool(url){
    if (url.indexOf('julive.com') != -1 || url.indexOf('comjia.com') != -1) {
      url += (url.indexOf('?') == -1 ? '?' : '&');
      var params = {
        'appid': juliveConfig.appid,
        'version_code': juliveConfig.versionCode,
        'version_name': juliveConfig.versionName,
        'agency': enviroment.getChannel(),
        'channel_id': app.commonData.channel.channel_id,
        'token': enviroment.getJuliveToken(),
        'comjia_platform_id': juliveConfig.comjiaPlatformId,
        'comjia_unique_id': enviroment.getOpenId(),
        'channel_put': enviroment.getChannelPut()
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
      this.setData({
        url: url,
      });
    }
  },

  onShareAppMessage() {
    const _this = this;
    let url = encodeURIComponent(this.data.originalUrl)
    return {
      'title': '海量优惠房源，省钱买好房',
      'path': 'pages/sceneWeb/sceneWeb?url='+url,
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
      }
    }
  }
})