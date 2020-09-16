
let weappJson = {
  "pages": [
    "pages/home/home",
    "pages/project/list/projectList",
    "pages/information/information",
    "pages/mine/mine",
    "pages/project/detail/projectDetail",
    "pages/report/firstReport/firstReport",
    "pages/sceneWeb/sceneWeb",
    "pages/web/web"
  ],
  "subpackages": [
    {
      "root": "nearbySubPK",
      "pages": [
        "pages/nearbyAnalytic/nearbyAnalytic",
        "pages/nearbyMap/nearbyMap"
      ]
    },
    {
      "root": "loginSubPK",
      "pages": [
        "pages/register/register",
        "pages/phoneNumberLogin/phoneNumberLogin"
      ]
    },
    {
      "root": "searchSubPK",
      "pages": [
        "pages/search/search"
      ]
    },
    {
      "root": "dipperSubPK",
      "pages": [
        "pages/recordBox/recordBox",
        "pages/cityReport/cityReport",
        "pages/singleProject/singleProject",
        "pages/multiProject/multiProject",
        "pages/navigationMap/navigationMap",
        "pages/employeDetails/employeDetails",
        "pages/orderConfig/orderConfig",
        "pages/clientMessage/clientMessage",
        "pages/recommendMap/recommendMap"
      ]
    },
    {
      "root": "questionRelateSubPK",
      "pages": [
        "pages/detail/questionDetail",
        "pages/ask/questionAsk"
      ]
    },
    {
      "root": "houseTypeSubPK",
      "pages": [
        "pages/list/houseTypeList",
        "pages/detail/houseTypeDetail"
      ]
    },
    {
      "root": "dynamicSubPK",
      "pages": [
        "pages/list/dynamicList",
        "pages/detail/dynamicDetail"
      ]
    },
    {
      "root": "otherRelateSubPK",
      "pages": [
        "pages/city/cityList",
        "pages/employee/employeeReviewList",
        "pages/essayDetail/detail",
        "pages/specialCar/specialCar"
      ]
    },
    {
      "root": "myRelateSubPK",
      "pages": [
        "pages/getReport/getReport",
        "pages/myFavorite/myFavorite"
      ]
    },
    {
      "root": "debugSubPK",
      "pages": [
        "dist/appInformation/appInformation",
        "dist/debug/debug",
        "dist/h5door/h5door",
        "dist/logs/logs",
        "dist/positionSimulation/positionSimulation",
        "dist/storage/storage",
        "dist/index/index"
      ]
    },
    {
      "root": "activitySubPK",
      "pages": [
        "pages/fissionActivity/fissionActivity"
      ]
    }
  ],
  "permission": {
    "scope.userLocation": {
      "desc": "以便精确获取您附近的楼盘信息"
    }
  },
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#fff",
    "navigationBarTitleText": "居理新房",
    "navigationBarTextStyle": "black",
    "backgroundColor": "#f2f2f2"
  },
  "tabBar": {
    "color": "#9d9d9d",
    "selectedColor": "#333",
    "borderStyle": "black",
    "backgroundColor": "#ffffff",
    "list": [
      {
        "pagePath": "pages/home/home",
        "iconPath": "image/tab_home.png",
        "selectedIconPath": "image/tab_home_selected.png",
        "text": "首页"
      },
      {
        "pagePath": "pages/project/list/projectList",
        "iconPath": "image/tab_house.png",
        "selectedIconPath": "image/tab_house_selected.png",
        "text": "楼盘"
      },
      {
        "pagePath": "pages/information/information",
        "iconPath": "image/tab_info.png",
        "selectedIconPath": "image/tab_info_selected.png",
        "text": "情报"
      },
      {
        "pagePath": "pages/mine/mine",
        "iconPath": "image/tab_mine.png",
        "selectedIconPath": "image/tab_mine_selected.png",
        "text": "我的"
      }
    ]
  },
  "sitemapLocation": "sitemap.json"
}

let swanJson = {};
export default {
  outputAppJson: process.env.TARO_ENV == 'weapp' ? weappJson : swanJson,
  pages: [
    'pages/indexs/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  }
}
