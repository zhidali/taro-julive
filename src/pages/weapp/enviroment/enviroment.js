const util = require('../utils/util.js');
const julive_local_config = require('../julive-local-config.js');
const analytic = require('../analytic/analytic.js');
var app;
var _ = {};
var enviroment = {};

/**
 * app.onLaunch 启动 时候触发 
 * @return void
 */
enviroment.init = function () {
  this._.info.getSystem();
  let julive_channel_put = getChannelPut();
  this._.info.properties.channel_put = julive_channel_put;
  analytic.sensors.registerApp({ channel_put: julive_channel_put });
  this._.info.properties.channel = getChannel();
  analytic.sensors.init();
};

/**
 * 获取微信的openid
 * @return  string openId
 */
enviroment.getOpenId = function () {
  return this._.info.properties.openId || '';
};

/**
 * 设置微信的openid
 * @return void
 */
enviroment.setOpenId = function (openId) {
  if (openId) {
    // if (!this._.info.properties.openId) {
      // abTest.setClientId(openId);
    // }
    this._.info.properties.openId = openId;
  }
};

/**
 * 返回API下发的uuid
 * @return string  uuid
 */
enviroment.getUUID = function () {
  return this._.info.properties.uuid || '';
};

/**
 * 设置API下发的uuid&& 并且注册到神策的distinct_id
 * @return void 
 */
enviroment.setUUID = function (uuid) {
  if (uuid) {
    this._.info.properties.uuid = uuid;
    analytic.sensors.identify(uuid, true);
  }
};

/**
 * 设置API下发的unionId
 * @return void 
 */
enviroment.setUnionId = function (unionId) {
  if (unionId) {
    this._.info.properties.unionId = unionId;
  }
};

/**
 * 获取API下发的token
 * @return string 
 */
enviroment.getJuliveToken = function () {
  return this._.info.properties.token || '';
};

/**
 * 设置API下发的token&& 并且存储到storage里面
 * @return void 
 */
enviroment.setJuliveToken = function (token, flag) {
  this._.info.properties.token = token;
  if (flag) {
    let _obj = this._.info.properties.julive_label;
    _obj.token = token;
    
    wx.setStorage({
      key: 'julive_label',
      data: _obj,
    });
  }
};
//julive_label  install 返回相关信息，内含有居理token
enviroment.setJuliveLabel = function (julive_label, sourceType) {
  if (!julive_label) return;
  this._.info.properties.julive_label = julive_label;
  enviroment.setJuliveToken(julive_label.token);
  enviroment.setUnionId(julive_label.unionid);
  enviroment.setOpenId(julive_label.openid);
  enviroment.setUUID(julive_label.uuid);
  //  新增加 comjia_unique_id 就是openId 数据需要 即 需要comjia_unique_id 使用原先 getOpenId
  let temporaryObj = {
    visitor_id: julive_label.openid,
    comjia_unique_id: julive_label.openid,
    union_id: julive_label.openid,
  };
  analytic.sensors.registerApp(temporaryObj);
  if (sourceType === 1) return;
  wx.setStorage({
    key: 'julive_label',
    data: julive_label,
  });
};

/**
 * 返回微信广告ID，广告只有投放时候才有
 * @return string
 */
enviroment.getGDTId = function () {
  return this._.info.properties.gdt_vid || '';
};

/**
 * 设置微信广告ID，广告只有投放时候才有
 * @return void
 */
enviroment.setGDTId = function (gdt_vid) {
  this._.info.properties.gdt_vid = gdt_vid;
};

enviroment.getVersion = function () {
  return this._.info.properties.versionName;
};

/**
 * 获取channel 即 utm_source
 * @return string
 */
function getChannel() {
  return wx.getStorageSync('julive_channel') || julive_local_config.channel;
}

/**
 * 获取channel 即 utm_source
 * @return string
 */
enviroment.getChannel = function () {
  return this._.info.properties.channel || '';
};

/**
 * 设置channel 即 utm_source
 * @return void
 */
enviroment.setChannel = function (channel) {
  if (channel && channel.length > 0) {
    wx.setStorage({
      key: 'julive_channel',
      data: channel,
    });
    this._.info.properties.channel = channel;
  }
};

// 新增微信市场投放
function getChannelPut() {
  return wx.getStorageSync('julive_channel_put') || '';
}

/**
 * 获取市场投放 channel_put
 * @return string
 */
enviroment.getChannelPut = function () {
  return this._.info.properties.channel_put || '';
};

/**
 * 设置市场投放 channel_put
 * @return void
 */
enviroment.setChannelPut = function (channel_put) {
  if (channel_put && channel_put.length > 0) {
    wx.setStorage({
      key: 'julive_channel_put',
      data: channel_put,
    });
    this._.info.properties.channel_put = channel_put;
  }
};

enviroment.getPlatform = function () {
  return this._.info.properties.platform;
};
enviroment.setCodeComeIn = function (state) {
  this._.info.properties.code_come = state;
};
enviroment.getCodeComeIn = function () {
  return this._.info.properties.code_come;
};

//请求接口公共字段函数
enviroment.getEnviromentParams = function () {
  return {
    // 平台ID 小程序是301 内部定义 
    app_id: this._.info.properties.appId,
    // 平台ID 小程序是301 内部定义
    platform_id: this._.info.properties.appId,
    // 微信appID
    wx_appid: julive_local_config.wxappid,
    // 版本号 270
    version_code: this._.info.properties.versionCode,
    // 版本号 2.有7.0
    version_name: this._.info.properties.versionName,
    // 时间戳
    timestamp: Date.parse(new Date()),
    // 请求网管携带的token
    token: this._.info.properties.token,
    // API下发的uuid
    uuid: this._.info.properties.uuid,
    // 网络类型
    net: this._.info.properties.network_type,
    // 微信系统版本号
    wx_version: this._.info.properties.wx_version,
    // 客户端平台
    platform: this._.info.properties.platform,
    // 微信使用基本版本库
    sdk_version: this._.info.properties.sdk_version,
    // 系统信息
    system: this._.info.properties.system,
    // 品牌信息
    brand: this._.info.properties.brand,
    // 手机型号
    model: this._.info.properties.model,
    // 城市经纬度
    location: app.commonData.location,
    // 城市ID
    city_id: app.commonData.city.city_id,
    // 市场投放携带的utm_source
    agency: this._.info.properties.channel,
    // 市场投放携带的channel_put
    channel_put: this._.info.properties.channel_put,
    // 微信的openid 
    adhoc_client_id: this._.info.properties.openId,
    // 市场投放或则conf接口下发的channel_id
    channel_id: app.commonData.channel.channel_id || ''
  };
};

_.info = {
  properties: {
    // 微信appID 唯一的
    appId: julive_local_config.appid,
    // 版本号 270
    versionCode: julive_local_config.versionCode,
    // 版本号 2.7.0
    versionName: julive_local_config.versionName,
    // API下发的token
    token: '',
    // API下发的uuid
    uuid: '',
    // API下发的微信的openID
    openId: '',
    // API下发的unionId
    unionId: '',
    // 市场投放的utm_source
    channel: '',
    gdt_vid: '', // 广点通ID 即广告ID
    code_come: false, //扫码进来标志
    julive_label: {}, //install 返回data 信息
  },

  // 获取手机相关信息
  getSystem: function () {
    var e = this.properties;
    var that = this;
  
    wx.startWifi({
      success() {
        wx.getConnectedWifi({
          success: (wifiRes) => {
            analytic.sensors.registerApp({
              wifi_name: wifiRes.wifi.SSID,
            });
          },
        });
      },
    });

    // 获取网络相关信息
    function getNetwork() {
      wx.getNetworkType({
        success: function (t) {
          e.network_type = t['networkType'];
        },
        complete: getSystemInfo,
      });
    }

    //获取手机设备相关信息 
    function getSystemInfo() {
      wx.getSystemInfo({
        success: function (t) {
          e.model = t['model'];
          e.brand = t['brand'];
          e.system = t['system'];
          e.wx_version = t['version'];
          e.platform = t['platform'];
          e.sdk_version = t['SDKVersion'];

          var deviceType = 0;
          var platform = e.platform;
          if (platform == 'ios') {
            deviceType = 4;
          } else if (platform == 'android') {
            deviceType = 3;
          }
          if (deviceType > 0) {
            analytic.sensors.registerApp({
              device_type: deviceType,
            });
          }
        },
      });
    }
    getNetwork();
  },
};
// TODO func e 更改
function e(t, n, o) {
  if (t[n]) {
    const tt = Object.assign({}, {...t});
    var e = tt[n];
    //debugger
    tt[n] = function (tt) {
      o.call(this, tt, n);
      e.call(this, tt);
    };
  } else {
    tt[n] = function (tt) {
      o.call(this, tt, n);
    };
  }
}

var p = App;
App = function (t) {
  e(t, 'onLaunch', appLaunch);
  e(t, 'onShow', appShow);
  p(t);
};

function appLaunch(options) {
  console.log(options, 'options');
  app = this;
  enviroment.init();
  // console.log('options=====', options);
  if (options.scene == (1045 || 1067)) {
    this.globalData.wx_ad_coming = true;
  }
}

function appShow(res) {
  var query = {};
  if (res && res.query && res.query.q) {
    // 扫普通链接二维码码模式进来的
    var url = decodeURIComponent(res.query.q);
    query = util.parseQueryString(url);
    enviroment.setCodeComeIn(true);
  } else if (res && res.query) {
    query = res.query;
    if (query.scene) {
      let scene = decodeURIComponent(query.scene);
      let params = scene.split(',');
      params.forEach(function (item) {
        if (item.indexOf('utm_') != -1) {
          enviroment.setChannel(item.split('_')[1]);
          return;
        }
      });
    }
  }

  if (query && query.utm_source) {
    var channel = query.utm_source;
    enviroment.setChannel(channel);
  }

  if (query && query.city_id && query.city_name) {
    let city_name = decodeURIComponent(query.city_name);
    this.commonData.city = {
      city_id: query.city_id,
      city_name: city_name
    }
  }

  let clickId_storage = wx.getStorageSync('julive_click_id')||'';
  if (query && query.gdt_vid) {
    enviroment.setGDTId(query.gdt_vid);
    wx.setStorage({
      key: 'julive_click_id',
      data: query.gdt_vid,
    });
  } else if (clickId_storage && clickId_storage.length > 0) {
    enviroment.setGDTId(clickId_storage);
  }
  // 投放列表页携带筛选信息
  if (query && query.filter) {
    // 事例 filter=h,h5;e,e1;
    let list = query.filter.split(';');
    let allFilter = {};
    list.forEach((strList, index) => {
      let strArr = strList.split(',');
      let filterValueList = [];
      strArr.findIndex((itm, idx) => {
        if (idx === 0) {
          let obj = {};
          obj.value = strArr[1];
          // 区域a 不需要携带key
          if (itm != 'a') {
            obj.key = itm;
          }
          filterValueList.push(obj);
          allFilter[itm] = filterValueList;
          return true;
        }
      });
    });
    this.globalData.filter = allFilter;
  }

  if (query && query.channel_put) {
    let channel_put = decodeURIComponent(query.channel_put);
    enviroment.setChannelPut(channel_put);
    analytic.sensors.registerApp({ channel_put: query.channel_put });
  }
}

enviroment._ = _;

module.exports = enviroment;
