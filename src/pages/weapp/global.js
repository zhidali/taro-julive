import {
  request,
  install
} from './network/request';
import Observer from './utils/watch/index';
let observer = new Observer();
import {
  versonTest,
  getConf,
  updInfo
} from './api/common';

import {
  getUser
} from './api/mine';

import Enviroment from './enviroment/index';
import Func from './enviroment/func';
// const location = require('./location/location.js');
const user = require('./user/user.js');
// const enviroment = require('./enviroment/enviroment.js');
const analytic = require('./analytic/analytic.js');
const wxUserInfo = require('./user/wxUserInfo.js');
// const notification = require('./utils/notification.js');

const oldGetApp = getApp;

let options = {
  request: request,
  recordFlag: {
    browseFlag: false,
  },
  // abTest 重复请求 true表示可拉取 abTest false表示不可拉取
  flagTest: true,
  // ab测试结果
  abTest: {},
  // 原来enviroment 存储数据， 方法
  enviroment: {},
  func: {},
  // userinfo 重复请求
  getUserFlag: true,
  // 接口下发全局变量
  commonData: {
    // 首页收藏修改
    homeChangeCollect: false,
    // 列表页面收藏是否修改
    listChangeCollect: false,
    // 登录状态
    login_status: false,
    // 城市
    city: {
      city_id: "2",
      city_name: "北京",
    },
    // 定位经纬度 以, 隔开
    location: "",
    // 是否手动切换城市
    isSelectCity: false,
    // 用户信息
    user: {
      // 判断登录 不为空登录
      userId: "",
      name: "",
      mobile: "",
      avatar: "",
      report: {
        status: 2,
      },
    },
    //  微信用户头像  名字相关信息
    wxUserHeadInfo: {
      nickname: "", // 姓名
      sex: "", // 性别
      wechat_city: "", // 所在城市
      country: "", // 用户所在国家
      wechat_province: "", // 所在省份
      headimgurl: "", // 用户头像url
    },
    // 用户是否有订单 true有未关闭订单 false无未关闭订单
    userHasOrder: false,
    // conf 接口channel
    channel: {
      channel_id: "",
      phone: "",
    },
    // conf 接口m_domain_project 字段 用来跳转h5 详情页用
    m_domain_project: "",
    // 我的页面'我的购房福利'tab是否显示
    mineTabPurchase: false,
    // 裂变活动shareID
    fissionShareId: "",
  },
  // 功能性全局变量
  globalData: {
    userInfo: null,
    isIpx: false,
    isIos: false,
    filter: {},
    firstNotWifi: true, // 默认第一次使用4g 提醒  北斗资料包
    wx_ad_click_id: null,
    listCollectPopState: false, //列表页面的顶部收藏弹窗状态
    listSelectPopState: false, //列表页面的筛选引导弹窗状态
    wx_ad_coming: false, //当前是不是微信广告进来的
    informationPageIndex: 0, //情报页面当前要显示的子页面
    essayModuleLoginOnce: false, //情报页面（下面两个变量）3个子页面的一键登录展示逻辑
    questionAnswerLoginOnce: false,
    houseDynamicLoginOnce: false,
    showWxPhoneNumberAleat: false, // 首页微信授权手机号弹窗 是否弹起 只有在wxlogin 触发
    essayModuleShare: {
      popEssayCard: false,
      essayId: "",
      imagePath: "",
    }, //情报列表页面分享参数
    houseDynamicShare: {
      showPainter: false,
      essayId: "",
      imagePath: "",
    }, //楼盘动态页面分享参数
    // 264存储 判断投放是否带城市
    commonQrInfo: false,
    // 270筛选
    newFilter: {
      // c: ['c1', 'c2'],
      // h: ['h3', 'h10'],
      // a: ['tongzhou', 'daxing'],
      // s: 's1',
      // g: '11,0'
    },
    // 弹窗互斥字段 key city_2  item {}
    dialogMap: new Map(),
    // 搜索词
    searchKey: "",
  },
  onLaunch: async function (e) {
    
    install(true, this);
    // Enviroment 文件更改 ------star
    this.func = new Func(this);
    this.enviroment = new Enviroment(this);
    
    if(e.scene == (1045 || 1067)){
      this.globalData.wx_ad_coming = true;
    }
    // ----------end

    // 设置监听
    observer.Observe(this.commonData);
    // 获取投放页channel_id
    let { channel_id } = e.query;
    if (channel_id) {
      this.commonData.channel.channel_id = String(channel_id);
      wx.setStorage({
        key: "julive_channelId",
        data: String(channel_id),
      });
    } else {
      this.commonData.channel.channel_id =
        wx.getStorageSync("julive_channelId") || "";
    }

    
    // location.startLocate(this);
    wxUserInfo.init();
    //获取微信用户头像等信息
    this.upDataWxUserHeadInfo();
    user.init(this);

    // 更新到最新版本
    const updateManager = wx.getUpdateManager();

    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: "更新提示",
        content: "新版本已经准备好，是否重启应用？",
        showCancel: false, // 关闭强更
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate();
          }
        },
      });
    });
    // var _this = this;
    // wx.getSystemInfo({
    //   success: function (res) {
    //     let phoneModel = [
    //       'iPhone X',
    //       'iPhone XR',
    //       'iPhone XS Max',
    //       'iPhone 11',
    //       'iPhone 11 Pro',
    //       'iPhone 11 Pro Max',
    //     ];
    //     phoneModel.findIndex((item) => {
    //       if (res.model.indexOf(item) != -1) {
    //         _this.globalData.isIpx = true;
    //         return;
    //       }
    //     });
    //     if (res.system.indexOf('iOS') != -1) {
    //       _this.globalData.isIos = true;
    //     }
    //     _this.globalData.platform = res.platform;
    //     _this.globalData.ww = res.windowWidth;
    //     _this.globalData.hh = res.windowHeight;
    //   },
    // });
    this.changePagesPath(e);
    // 监听我的购房福利tab是否显示
    this.watchCommonData("mineTabPurchase", (newVal) => {
      wx.setStorage({
        key: "julive_minetab_purchase",
        data: newVal,
      });
    });
    // 初始化拉取conf  切换城市拉取
    // this.setConf();
    // 初始化同步 后台登录状态
    // this.setUser();
    // 初始化拉取实验
    // this.getAbtest();

    // notification.addNotification('CityHadChanged', this.setConf, this);
  },
 
  onShow: function(e) {
    this.enviroment.appShow(e);
    console.log('当前页面是', e.path,  e.path === 'pages/home/home')
    if (e.path === 'pages/home/home') {
      let { fissionShareId } = e.query;
      console.log('获取邀请人分享ID', fissionShareId)
      this.commonData.fissionShareId = fissionShareId || "";
    }
  },
  changePagesPath(res) {
    let changePages = [
      {
        prePage: "/otherSubPK/pages/houseDynamic/houseDynamic",
        curPage: "pages/information/information",
        index: 2,
      },
      {
        prePage: "/otherSubPK/pages/questionAnswer/questionAnswer",
        curPage: "pages/information/information",
        index: 1,
      },
      {
        prePage: "pages/question/list/questionList",
        curPage: "/questionRelateSubPK/pages/detail/questionDetail",
      },
      {
        prePage: "pages/question/detail/questionDetail",
        curPage: "/questionRelateSubPK/pages/detail/questionDetail",
      },
      {
        prePage: "pages/question/ask/questionAsk",
        curPage: "/questionRelateSubPK/pages/ask/questionAsk",
      },
      {
        prePage: "pages/houseType/list/houseTypeList",
        curPage: "/houseTypeSubPK/pages/list/houseTypeList",
      },
      {
        prePage: "pages/houseType/detail/houseTypeDetail",
        curPage: "/houseTypeSubPK/pages/detail/houseTypeDetail",
      },
      {
        prePage: "pages/dynamic/list/dynamicList",
        curPage: "/dynamicSubPK/pages/list/dynamicList",
      },
      {
        prePage: "pages/essay/detail/detail",
        curPage: "/otherRelateSubPK/pages/essayDetail/detail",
      },
      {
        prePage: "pages/home/essayTabModule/essayModule",
        curPage: "pages/information/information",
        index: 0,
      },
      {
        prePage: "/questionRelateSubPK/pages/questionAnswer/questionAnswer",
        curPage: "pages/information/information",
        index: 1,
      },
      {
        prePage: "/dynamicSubPK/pages/houseDynamic/houseDynamic",
        curPage: "pages/information/information",
        index: 2,
      },
    ];
    changePages.map((item) => {
      if (item.prePage == res.path) {
        if (item.index) app.globalData.informationPageIndex = item.index;
        let _url = "";
        if (JSON.stringify(res.query) === "{}") {
          _url = item.curPage;
        } else {
          let param = "";
          for (let i in res.query) {
            param += `?${i}=${res.query[i]}&`;
          }
          _url = item.curPage + param;
        }
        if (item.index) {
          wx.switchTab({
            url: _url,
          });
        } else {
          wx.redirectTo({
            url: _url,
          });
        }
      }
    });
  },
  /**
   * @description: 订阅监听commonData
   * @param {string} key commonData的key 例如 login_status | city.city_id
   * @param {func} fn 回调方法
   */
  watchCommonData(key, fn) {
    observer.makeWatcher(key, this.commonData, fn);
  },
  // 初始化进入小程序拉取登录状态
  async setUser() {
    try {
      let timer = null;
      return new Promise(async (resolve, reject) => {
        if (this.getUserFlag) {
          let res = await getUser();
          if (res.code == 0) {
            if (res.data.user_id) {
              // 已登录
              let userInfo = {
                userId: String(res.data.user_id),
                name: res.data.nickname,
                mobile: res.data.mobile,
                avatar: res.data.avatar,
              };
              // 埋点注入 julive_id
              analytic.sensors.registerApp({
                julive_id: res.data.user_id,
              });
              this.commonData.user = userInfo;
              this.commonData.login_status = res.data.user_id ? true : false;
              this.getUserFlag = false;
            }
            resolve(this.commonData.login_status);
          } else {
            // 判断登录 不为空登录
            this.commonData.user = {
              userId: "",
              name: "",
              mobile: "",
              avatar: "",
              report: {
                status: 2,
              },
            };
            this.commonData.login_status = false;
            this.getUserFlag = false;
            resolve(this.commonData.login_status);
          }
        } else {
          timer = setInterval(() => {
            if (!this.getUserFlag) {
              clearInterval(timer);
              resolve(this.commonData.login_status);
            }
          }, 50);
        }
      });
    } catch (e) {
      console.log(e);
    }
  },
  /**
   * 如果用户已经授权过 微信头像名字等信息 上报API
   * @return void
   */
  upDataWxUserHeadInfo() {
    let _this = this;
    wx.getUserInfo({
      success: function (res) {
        let ob = res.userInfo;
        _this.commonData.wxUserHeadInfo = {
          nickname: ob.nickName,
          sex: ob.gender,
          wechat_city: ob.city,
          country: ob.country,
          wechat_province: ob.province,
          headimgurl: ob.avatarUrl,
        };
        updInfo(_this.commonData.wxUserHeadInfo);
        wxUserInfo.setNickName(res.userInfo.nickName);
      },
    });
  },
}

let res = Object.assign(options, oldGetApp());
getApp = () => { return res; };