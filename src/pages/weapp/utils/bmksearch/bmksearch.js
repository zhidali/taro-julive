var bmap = require('./bmap-wx.min.js');
const mapAK = 'cxtRX1TTQ7EIe5H63sTupP6jG0KDS5Wh';

const config = 
  [{
    'key':'subway',
    'category':'traffic',
    'name':'地铁'
  }, {
    'key':'bus',
    'category': 'traffic',
    'name':'公交'
  },{
    'key':'shopping',
    'category':'life',
    'name':'购物'
  }, {
    'key':'bank',
    'category': 'life',
    'name':'银行'
  }, {
    'key':'food',
    'category': 'life',
    'name':'美食'
  }, {
    'key':'entertainment',
    'category': 'life',
    'name':'娱乐'
  }, {
    'key':'work',
    'category': 'life',
    'name':'办公'
  }, {
    'key':'school',
    'category': 'school',
    'name':'学校'
  }, {
    'key':'hospital',
    'category': 'hospital',
    'name':'医院'
  }
];

const BMap = new bmap.BMapWX({
  ak: mapAK
});
var wxMarkerData = {};
var index = 0;

function search(lat, lng, callback) {
  wxMarkerData = {};
  index = 0;
  var that = this;
  var fail = function (data) {
    console.log(data)
  };
  var success = function (data) {
    var item = config[index];
    var dict = wxMarkerData[item.category];
    if (!dict) {
      dict = {};
      wxMarkerData[item.category] = dict;
    }
    var arr1 = wxMarkerData[item.category]['originalData'];
    if (!arr1) {
      arr1 = [{
        iconPath: "/image/icon_map_location.png",
        id: -1,
        latitude: lat,
        longitude: lng,
        width: 16,
        height: 20
      }];
      wxMarkerData[item.category]['originalData'] = arr1;
    }
    var arr2 = wxMarkerData[item.category]['wxMarkerData'];
    if (!arr2) {
      arr2 = [{
        iconPath: "/image/icon_map_location.png",
        id: -1,
        latitude: lat,
        longitude: lng,
        width: 16,
        height: 20
      }];
      wxMarkerData[item.category]['wxMarkerData'] = arr2;
    }
    wxMarkerData[item.category]['originalData'] = wxMarkerData[item.category]['originalData'].concat(data.originalData.results);

    var markerData = data.wxMarkerData;
    markerData.forEach(item=>{
      item.callout = {
        'content': item.title,
        'color':'#3E4A59',
        'fontSize':'14',
        'borderRadius':16,
        'borderWidth':1,
        'borderColor': '#F3F6F9',
        'bgColor':'#ffffff',
        'padding':8,
        'display':'ALWAYS',
        'textAlign':'center'
      };
      item.distance = getDistance({ 'lat': lat, 'lng': lng }, { 'lat': item.latitude, 'lng':item.longitude});
    });
    wxMarkerData[item.category]['wxMarkerData'] = wxMarkerData[item.category]['wxMarkerData'].concat(markerData);

    if (index == config.length - 1) {
      callback(wxMarkerData);
    } else {
      index ++;
      __bmksearchRequest(lat, lng, fail, success, index);
    }
  };
  
  __bmksearchRequest(lat, lng, fail, success, index);
};

function getMarkerData() {
  return wxMarkerData;
}

// 方法定义 lat,lng, 单位为m
function getDistance(location1 = { 'lat': '34.001524', 'lng': '114.112345' }, location2) {
  var lat1 = location1.lat;
  var lng1 = location1.lng;
  var lat2 = location2.lat;
  var lng2 = location2.lng;
  var radLat1 = lat1 * Math.PI / 180.0;
  var radLat2 = lat2 * Math.PI / 180.0;
  var a = radLat1 - radLat2;
  var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
  var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
  s = s * 6378.137;// EARTH_RADIUS;
  s = Math.round(s * 10000) / 10;
  return s;
}

// private -help function
function __bmksearchRequest(lat, lng, fail, success, index) {
  var item = config[index]
  var iconpath = __iconPathForCategory(item.category);
  BMap.search({
    'location': lat + ',' + lng,
    "query": item.name,
    fail: fail,
    success: success,
    iconPath: iconpath,
    iconTapPath: iconpath,
    width: 0.5,
    height: 0.5
  });
}

function __iconPathForCategory(category) {
  var map = {
    'hospital':'/image/icon_life_pin.png',
    'school':'/image/icon_life_pin.png',
    'life':'/image/icon_life_pin.png',
    'traffic':'/image/icon_life_pin.png'
  }
  return map[category];
}

module.exports = {
  search: search,
  getMarkerData: getMarkerData,
  getDistance: getDistance
}