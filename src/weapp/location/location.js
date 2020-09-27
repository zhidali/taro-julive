const notification = require("../utils/notification.js");
const analytic = require("../analytic/analytic.js");
const coordtransform = require("../utils/coordtransform");
var location = {};
var app;

location.cityChanged = function (city) {
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
  // 切换城市再次拉取conf
  // app.getAbtest();
  notification.postNotificationName("CityHadChanged", {
    city: city
  });
};

location.startLocate = function (that) {
  app = that;
  var _this = this;
  var city = wx.getStorageSync("julive_city")||'';
  if (city) {
    app.commonData.city = city;
    location.cityChanged(city);
  }
  wx.getLocation({
    type: 'gcj02',
    success: function (res) {
      let [longitude, latitude] = coordtransform.gcj02tobd09(res.longitude, res.latitude);
      app.commonData.location = longitude + "," + latitude;
      _this.fetchCityInfo(latitude, longitude);
      analytic.sensors.registerApp({
        latitude: latitude,
        longitude: longitude
      });
      let currentPage = analytic.page.currentPage();

      analytic.sensors.track('e_click_button', {
        fromModule: 'm_wx_position_authorization_window',
        tab_id: '2',
        fromPage: currentPage,
        toPage: currentPage,
      });
    },
    fail: function (err) {
      // 如果全局city_id无值，给默认城市北京
      if (!app.commonData.city.city_id) {
        app.commonData.city = {
          city_name: '北京',
          city_id: '2'
        }
        location.cityChanged({
          city_name: '北京',
          city_id: '2'
        })
      }
      let currentPage = analytic.page.currentPage();
      analytic.sensors.track('e_click_button', {
        fromModule: 'm_wx_position_authorization_window',
        tab_id: '1',
        fromPage: currentPage,
        toPage: currentPage,
      });
      notification.postNotificationName("CityLocateComplete", {});
    }
  });
};

location.fetchCityInfo = function (lat, lng) {
  app.request("/v1/common/location", {
      lat: lat,
      lng: lng
    })
    .then(d => {
      var data = d.data;
      if (d.code == 0 && data != null) {
        // 避免用户 缓存已存在沈阳，然后二次打开小程序  fetchCityInfo  后重新触发 
        if (app.commonData.city.city_id && data.city_id === app.commonData.city.city_id) return;
        app.commonData.city = data
        location.cityChanged(data)

        //需要通知首页。列表页面刷新数据,首页列表页面的方法名字是一样的
        if (app.globalData.commonQrInfo) {
          var pages = getCurrentPages()
          var currentPage = pages[pages.length - 1];
          currentPage.refreshPage()
        }

      } else {
        if (!app.commonData.city.city_id) {
          app.commonData.city = {
            city_name: '北京',
            city_id: '2'
          }
          location.cityChanged({
            city_name: '北京',
            city_id: '2'
          })
        }
        notification.postNotificationName("CityLocateComplete", {});
      }
    })
    .catch(e => {
      console.error(e);
      if (!app.commonData.city.city_id) {
        app.commonData.city = {
          city_name: '北京',
          city_id: '2'
        }
        location.cityChanged({
          city_name: '北京',
          city_id: '2'
        })
      }
      notification.postNotificationName("CityLocateComplete", {});
    });
};

module.exports = location;