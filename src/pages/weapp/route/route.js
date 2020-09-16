const tool = require('../utils/util.js');
const notification = require('../utils/notification.js');
const app = getApp();

const config = {
  'comjia://app.comjia.com/home': {
    path: '/pages/home/home',
    root: true,
  }, // 首页

  'comjia://app.comjia.com/project_list': {
    path: '/pages/project/list/projectList',
    root: true,
    params: {
      filter: 'filter',
    },
  }, // 楼盘列表

  'comjia://app.comjia.com/h5': {
    path: '/pages/web/web',
    root: false,
    params: {
      url: 'url',
    },
  }, // 网页

  'comjia://app.comjia.com/information': {
    path: '/pages/information/information',
    root: true,
    index: 2,
  }, // 动态列表

  'comjia://app.comjia.com/project_info': {
    path: '/pages/project/detail/projectDetail',
    root: false,
    params: {
      projectId: 'project_id',
    },
  }, // 楼盘详情页

  'comjia://app.comjia.com/qa_list': {
    path: '/pages/information/information',
    root: true,
    index: 0,
    params: {
      projectId: 'project_id',
    },
  }, // 某个楼盘的问问列表

  'comjia://app.comjia.com/contract_car': {
    path: '/otherRelateSubPK/pages/specialCar/specialCar',
    root: false,
  }, // 专车

  'comjia://app.comjia.com/get_report': {
    path: '/myRelateSubPK/pages/getReport/getReport',
    root: false,
  }, //获取报告页

  'comjia://app.comjia.com/information': {
    path: '/pages/information/information',
    root: true,
    index: 0,
  }, //情报页面

  'comjia://app.comjia.com/questionAnswer': {
    path: '/pages/information/information',
    root: true,
    index: 1,
  }, //问答列表页面

  'comjia://app.comjia.com/myFavorite': {
    path: '/myRelateSubPK/pages/myFavorite/myFavorite',
    root: false,
  }, //我的关注页面
};

function projectListTransfer(pathMap, keyValus) {
  if (
    pathMap.path == '/pages/project/list/projectList' &&
    !tool.isEmptyObject(keyValus.filter)
  ) {
    Object.keys(keyValus.filter).map(function (key, index) {
      var filterValue = keyValus.filter[key];
      if (typeof filterValue != `object`) {
        var itemObject = {};
        itemObject.value = filterValue;
        itemObject.key = key;
        app.globalData.filter[key] = [itemObject];
      } else {
        var filterValueList = [];
        filterValue.forEach((item) => {
          if (typeof item != `object`) {
            var itemObject = {};
            itemObject.value = item;
            itemObject.key = key;
            filterValueList.push(itemObject);
          }
        });
        app.globalData.filter[key] = filterValueList;
      }
    });
  }
}

function transfer(url) {
  if (!url || url.length == 0) return;

  var pages = getCurrentPages();
  var currentPage = pages[pages.length - 1];
  var count = currentPage.route.split('/').length - 1;
  if (url.indexOf('http') == 0 || url.indexOf('https') == 0) {
    wx.navigateTo({
      url: '/pages/web/web?url=' + encodeURIComponent(url),
    });
    return;
  }

  var query = tool.parseQueryString(url);
  if (!tool.isEmptyObject(query) && query.data) {
    query = JSON.parse(decodeURIComponent(query.data));
  }
  var urlPath = tool.parsePathString(url);
  var pathMap = config[urlPath];
  if (pathMap) {
    var params = pathMap.params;
    var keyValus = {};
    var transferPath = pathMap.path;
    if (params && !tool.isEmptyObject(params)) {
      transferPath += '?';
      Object.keys(params).forEach(function (key) {
        if (query[params[key]]) {
          transferPath += key;
          transferPath += '=';
          transferPath += query[params[key]];
          transferPath += '&';
          keyValus[key] = query[params[key]];
        }
      });
      transferPath = transferPath.substring(0, transferPath.length - 1);
    }

    if (currentPage.route == pathMap.path) {
      // 需要相应页面实现通知回调
      notification.postNotificationName('RouteNotification', {
        path: pathMap.path,
        params: keyValus,
      });
    } else {
      if (pathMap.root) {
        if (pathMap.index) {
          app.globalData.informationPageIndex = pathMap.index;
        }
        projectListTransfer(pathMap, keyValus);
        wx.switchTab({
          url: transferPath,
        });
        // 需要相应页面实现通知回调
        notification.postNotificationName('RouteNotification', {
          path: pathMap.path,
          params: keyValus,
        });
      } else {
        wx.navigateTo({
          url: transferPath,
        });
      }
    }
  }
}

module.exports = {
  transfer: transfer,
};
