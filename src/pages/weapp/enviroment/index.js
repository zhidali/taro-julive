const julive_local_config = require('../julive-local-config.js');
const analytic = require('../analytic/analytic.js');
const util = require('../utils/util.js');
const notification = require('../utils/notification.js');
const coordtransform = require("../utils/coordtransform");

export default class Enviroment {
  constructor(app) {
    // 传递app实例
    this.app = app;
    let properties = {
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
      channel_put: '',
      // 广点通ID 即广告ID
      gdt_vid: '',
      // 扫码进来标志
      code_come: false,
      // install 返回data 信息
      julive_label: {},
      // 网络类型
      network_type: '',
      wx_version: '', // 7.0.18
      platform: '',
      sdk_version: '',
      system: '', // Android 8.1.0
      brand: '', // "Meizu"
      model: '', // 16th Plus
    };
    Object.assign(this, properties)
    this.initEnviroment();
    this.initUser();
    this.initLocation();
    analytic.sensors.init();

    this.app.setConf();
    this.app.setUser();
    // 初始化拉取实验
    this.app.getAbtest();

    // 切换城市
    notification.addNotification('CityHadChanged', this.changeCity, this);
  }
  // 初始化enviroment
  initEnviroment() {
    this.getWxConfig();
    let storage_channel_put = wx.getStorageSync('julive_channel_put') || '';
    let storage_channel = wx.getStorageSync('julive_channel') || julive_local_config.channel;
    this.channel_put = storage_channel_put;
    analytic.sensors.registerApp({
      channel_put: storage_channel_put,
    });
    this.channel = storage_channel;
  }


  // 初始化user
  initUser() {

  }
  // 初始化location
  initLocation() {
    let city = wx.getStorageSync("julive_city");
    if (city) {
      this.app.commonData.city = city;
      this.setCityInfo(city);
    }
    // 拉取城市定位相关信息
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        let [longitude, latitude] = coordtransform.gcj02tobd09(res.longitude, res.latitude);
        this.app.commonData.location = longitude + "," + latitude;
        // 拉取后台location接口
        this.app.getLocation(latitude, longitude);
        analytic.sensors.registerApp({
          latitude,
          longitude
        });
        let currentPage = analytic.page.currentPage();
        analytic.sensors.track('e_click_button', {
          fromModule: 'm_wx_position_authorization_window',
          tab_id: '2',
          fromPage: currentPage,
          toPage: currentPage,
        });
      },
      fail: (err) => {
        if (!this.app.commonData.city.city_id) {
          let cityInfo = {
            city_name: '北京',
            city_id: '2'
          }
          this.app.commonData.city = cityInfo;
          this.setCityInfo(cityInfo);
          let currentPage = analytic.page.currentPage();
          analytic.sensors.track('e_click_button', {
            fromModule: 'm_wx_position_authorization_window',
            tab_id: '1',
            fromPage: currentPage,
            toPage: currentPage,
          });
          notification.postNotificationName("CityLocateComplete", {});
        }
      }
    })
  }
  // 切换城市设置city
  setCityInfo(city) {
    analytic.sensors.registerApp({
      select_city: String(city.city_id)
    });
    wx.setStorage({
      key: "julive_city",
      data: city
    })
    // 如果默认城市和返回城市测City_id一样，不通知，但是选择的城市和默认城市一样要通知
    if (city.city_id === '2' && wx.getStorageSync("julive_citySelect") == false) {
      return;
    }
    // 通知切换城市
    notification.postNotificationName("CityHadChanged", {
      city: city
    });
  }

  // 城市切换需重新执行
  changeCity() {
    // 判断是否可以获取到 getApp() 
    if (getApp()) {
      // 拉取 conf 接口
      getApp().setConf();
      // 拉取 abTest 接口
      getApp().getAbtest();
    }
    
  }

  // 拉去微信的 配置信息
  getWxConfig() {
    // 获取wifi 信息
    wx.startWifi({
      success() {
        wx.getConnectedWifi({
          success: (wifiRes) => {
            analytic.sensors.registerApp({
              wifi_name: wifiRes.wifi.SSID,
            });
          }
        });
      }
    });

    // 获取网络相关信息
    wx.getNetworkType({
      success: (res) => {
        this.network_type = res.networkType;
      },
      complete: () => {
        // 获取手机设备相关信息 
        wx.getSystemInfo({
          success: (systemInfo) => {
            this.model = systemInfo.model; // 16th Plus
            this.brand = systemInfo.brand; // "Meizu"
            this.system = systemInfo.system; // Android 8.1.0
            this.wx_version = systemInfo.version; // 7.0.18
            this.platform = systemInfo.platform; // "android" | ios
            this.sdk_version = systemInfo.SDKVersion; // 2.13.0

            let deviceType = 0;
            switch (systemInfo.platform) {
              case 'ios':
                deviceType = 4;
                break;
              case 'android':
                deviceType = 3;
                break;
              default:
                deviceType = 0;
            }
            if (deviceType !== 0) {
              analytic.sensors.registerApp({
                device_type: deviceType,
              });
            }

            let phoneModel = [
              'iPhone X',
              'iPhone XR',
              'iPhone XS Max',
              'iPhone 11',
              'iPhone 11 Pro',
              'iPhone 11 Pro Max',
            ];
            phoneModel.findIndex((item) => {
              if (systemInfo.model.indexOf(item) != -1) {
                this.app.globalData.isIpx = true;
                return;
              }
            });
            if (systemInfo.system.indexOf('iOS') != -1) {
              this.app.globalData.isIos = true;
            }
            this.app.globalData.platform = systemInfo.platform;
            this.app.globalData.ww = systemInfo.windowWidth;
            this.app.globalData.hh = systemInfo.windowHeight;
          }
        })
      },
    });


  }


  // app.js onShow执行 
  appShow(res) {
    let query = {};
    if (res && res.query && res.query.q) {
      // 扫普通链接二维码码模式进来的
      let url = decodeURIComponent(res.query.q);
      query = util.parseQueryString(url);
      this.code_come = true;
    } else if (res && res.query) {
      query = res.query;
      if (query.scene) {
        let scene = decodeURIComponent(query.scene);
        let params = scene.split(',');
        params.forEach(function (item) {
          // utm_ 表示 utm_source
          if (item.indexOf('utm_') != -1) {
            this.setChannel(item.split('_')[1]);
            return;
          }
        });
      }
    }

    if (query && query.utm_source) {
      this.setChannel(query.utm_source)
    }
    // 投放城市
    if (query && query.city_id && query.city_name) {
      this.commonData.city = {
        city_id: query.city_id,
        city_name: decodeURIComponent(query.city_name)
      }
    }

    // 投放广告 获取广告id  始终获取最近一次广告id
    let clickId_storage = wx.getStorageSync('julive_click_id') || '';
    if (query && query.gdt_vid) {
      this.gdt_vid = query.gdt_vid;
      wx.setStorage({
        key: 'julive_click_id',
        data: query.gdt_vid,
      });
    } else if (clickId_storage) {
      this.gdt_vid = clickId_storage;
    }

    // channel_put
    if (query && query.channel_put) {
      let channel_put = decodeURIComponent(query.channel_put);
      this.setChannelPut(channel_put);
      analytic.sensors.registerApp({
        channel_put: query.channel_put
      });
    }
  }
  /**
   * @description: 设置channel 
   * @param {string} channel 即 utm_source
   */
  setChannel(channel) {
    if (channel && channel.length > 0) {
      wx.setStorage({
        key: 'julive_channel',
        data: channel,
      });
      this.channel = channel;
    }
  }
  /**
   * @description: 设置channelPut
   * @param {string} channel_put
   */
  setChannelPut(channel_put) {
    if (channel_put && channel_put.length > 0) {
      wx.setStorage({
        key: 'julive_channel_put',
        data: channel_put,
      });
      this.channel_put = channel_put;
    }
  }
  // install接口
  setJuliveLabel(julive_label = {}, sourceType) {
    if (!julive_label) {
      return;
    }
    this.julive_label = julive_label;
    this.setJuliveToken(julive_label.token);
    this.unionId = julive_label.unionid || '';
    this.openId = julive_label.openid || '';
    this.uuid = julive_label.uuid || '';
    analytic.sensors.identify(julive_label.uuid, true);

    analytic.sensors.registerApp({
      visitor_id: julive_label.openid,
      comjia_unique_id: julive_label.openid,
      union_id: julive_label.openid
    });
    if (sourceType === 1) {
      return
    };
    wx.setStorage({
      key: 'julive_label',
      data: julive_label,
    });
  }
  // 设置token
  setJuliveToken(token, flag) {
    this.token = token;
    if (flag) {
      this.julive_label.token = token
      wx.setStorage({
        key: 'julive_label',
        data: this.julive_label,
      });
    }
  }
  // 设置request请求 common
  getRequestCommon() {
    return {
      // 平台ID 小程序是301 内部定义 
      app_id: this.appId,
      // 平台ID 小程序是301 内部定义
      platform_id: this.appId,
      // 微信appID
      wx_appid: julive_local_config.wxappid,
      // 版本号 270
      version_code: julive_local_config.versionCode,
      // 版本号 2.7.0
      version_name: julive_local_config.versionName,
      // 时间戳
      timestamp: Date.parse(new Date()),
      // 请求网管携带的token
      token: this.token,
      // API下发的uuid
      uuid: this.uuid,
      // 网络类型
      net: this.network_type,
      // 微信系统版本号
      wx_version: this.wx_version,
      // 客户端平台
      platform: this.platform,
      // 微信使用基本版本库
      sdk_version: this.sdk_version,
      // 系统信息
      system: this.system,
      // 品牌信息
      brand: this.brand,
      // 手机型号
      model: this.model,
      // 城市经纬度
      location: this.app.commonData.location,
      // 城市ID
      city_id: this.app.commonData.city.city_id || '2',
      // 市场投放携带的utm_source
      agency: this.channel,
      // 市场投放携带的channel_put
      channel_put: this.channel_put,
      // 微信的openid 
      adhoc_client_id: this.openId,
      // 市场投放或则conf接口下发的channel_id
      channel_id: this.app.commonData.channel.channel_id || ''
    }
  }
}