import { request, install } from "./network/request";
import Observer from './utils/watch/index';
let observer = new Observer();
import { versonTest, getConf, updInfo } from "./api/common";
import { getUser } from "./api/mine";
const location = require("./location/location.js");
const user = require("./user/user.js");
const enviroment = require("./enviroment/enviroment.js");
const analytic = require("./analytic/analytic.js");
const wxUserInfo = require("./user/wxUserInfo.js");
const notification = require("./utils/notification.js");

App({
  request: request,
  recordFlag: {
    browseFlag: false,
  },
  // abTest 重复请求 true表示可拉取 abTest false表示不可拉取
  flagTest: true,
  // ab测试结果
  abTest: {},
  // userinfo 重复请求
  getUserFlag: true,
  // 接口下发全局变量
  commonData: {
    // 首页收藏修改
    homeChangeCollect: false,
    // 列表页面收藏是否修改
    listChangeCollect: false,
    // 登陆状态
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
    essayModuleLoginOnce: false, //情报页面（下面两个变量）3个子页面的一键登陆展示逻辑
    questionAnswerLoginOnce: false,
    houseDynamicLoginOnce: false,
    defaultHomeABtest: false, //是不是 进入首页默认实现里面了, true   默认B实验
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
    // 设置监听
    observer.Observe(this.commonData);
    // 获取投放页channel_id
    let { channel_id, fissionShareId } = e.query;
    console.log('获取邀请人分享ID', fissionShareId)
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
    this.commonData.fissionShareId = fissionShareId || "";
    install(true);
    location.startLocate(this);
    //获取微信用户头像等信息
    this.upDataWxUserHeadInfo();
    user.init(this);
    // 更新到最新版本
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {
      console.log(res.hasUpdate);
    });

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
    var _this = this;
    wx.getSystemInfo({
      success: function (res) {
        let phoneModel = [
          "iPhone X",
          "iPhone XR",
          "iPhone XS Max",
          "iPhone 11",
          "iPhone 11 Pro",
          "iPhone 11 Pro Max",
        ];
        phoneModel.findIndex((item) => {
          if (res.model.indexOf(item) != -1) {
            _this.globalData.isIpx = true;
            return;
          }
        });
        if (res.system.indexOf("iOS") != -1) {
          _this.globalData.isIos = true;
        }
        _this.globalData.platform = res.platform;
        _this.globalData.ww = res.windowWidth;
        _this.globalData.hh = res.windowHeight;
      },
    });
    this.changePagesPath(e);
    // 监听我的购房福利tab是否显示
    this.watchCommonData("mineTabPurchase", (newVal) => {
      wx.setStorage({
        key: "julive_minetab_purchase",
        data: newVal,
      });
    });
    // 初始化拉取conf  切换城市拉取
    this.setConf();
    // 初始化同步 后台登录状态
    this.setUser();
    // 初始化拉取实验
    this.getAbtest();
    notification.addNotification("CityHadChanged", this.setConf, this);
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
  /**
   * @description:  拉取conf接口 获取abtest
   * @param {string} key abtest key值
   */
  async getAbtest(key = "") {
    let timer = null;
    try {
      return new Promise(async (resolve, reject) => {
        let resolveObj = this.abTest;
        if (Object.keys(resolveObj).length <= 0 && this.flagTest) {
          this.flagTest = false;
          const ab = await versonTest();
          if (ab.code != 0) {
            this.abTest = {};
            resolveObj = {};
          }
          if (ab.code == 0) {
            // 缓存abtest
            this.abTest = ab.data.abtest;
            resolveObj = ab.data.abtest;
            analytic.sensors.track("e_page_view_abtest", {
              abtest_name: "p_project_list_optimization",
              abtest_value: ab.data.abtest.p_project_list_optimization || "",
            });

            if (ab.data.abtest.p_home_strategy) {
              analytic.sensors.track("e_page_view_abtest", {
                abtest_name: "p_home_strategy",
                abtest_value: ab.data.abtest.p_home_strategy,
              });
            }

            if (ab.data.abtest.p_home_strategy_01) {
              analytic.sensors.track("e_page_view_abtest", {
                abtest_name: "p_home_strategy_01",
                abtest_value: ab.data.abtest.p_home_strategy_01,
              });
            }

            analytic.sensors.track("e_page_view_abtest", {
              abtest_name: "help_find_home_optimization",
              abtest_value: ab.data.abtest.help_find_home_optimization || "",
            });
            
            this.abTest.p_project_list_optimization = "B";
            // this.abTest.p_home_strategy="A"
          }
        }

        timer = setInterval(() => {
          if (Object.keys(this.abTest).length != 0) {
            clearInterval(timer);
            timer = null;
            if (key == "") {
              resolve(this.abTest);
            }
            if (key != "") {
              resolve(this.abTest[key]);
            }
          }
        }, 50);
      });
    } catch (e) {
      console.log(e);
    }
  },
  // 获取渠道id
  async setConf() {
    try {
      let params = {
        city_id: this.commonData.city.city_id,
        channel_id: this.commonData.channel.channel_id || "",
      };
      const conf = await getConf(params);
      if (conf.code == 0) {
        // 若没有拿到投放页的channel_id 则取接口的channel_id
        if (!this.commonData.channel.channel_id) {
          this.commonData.channel.channel_id = String(
            conf.data.channel.channel_id
          );
          wx.setStorage({
            key: "julive_channelId",
            data: String(conf.data.channel.channel_id),
          });
        }
        // 400电话
        this.commonData.channel.phone = conf.data.channel.phone;

        // 注入埋点channel_id
        analytic.sensors.registerApp({
          channel_id: this.commonData.channel.channel_id,
        });

        // 存入m站跳转域名
        this.commonData.m_domain_project = conf.data.m_domain_project;
      }
    } catch (e) {
      console.log(e);
    }
  },
  // 页面调用 弹出时必须使用次方法 用于记录弹出状态 当前名字 app.dialogMapData('set', wx-login')
  // 判断使用  app.dialogMapData('get', 'wx-login'), 返回0 表示未弹出过
  // app.dialogMapData('status') 获取当前项目有无其他弹层在弹出状态
  // app.dialogMapData('dialog') 获取当前弹出名
  // app.dialogMapData('close')  关闭弹窗时 使用， 用于清空弹出状态

  /**
   * @description: 设置当前城市弹窗 弹出
   * @param {String} type  set get status close dialog
   * @param {String} dialogKey 弹窗对应标示
   */
  dialogMapData(type, dialogKey = "none") {
    // home-subscribe   首页订阅弹窗 上一个弹窗弹出关闭后18s后弹出
    // home-ground  首页cms配置落地页面弹窗 进入符合逻辑就弹
    // home-orderSuccess 首页留电成功弹窗
    // home-findHouse 首页查找房源弹出 手动触发弹出
    // home-filter 首页filter弹出
    // home-fission 首页助力相关弹窗 包括（助力toast/帮TA助力/我也看看）

    // list-findhouse  列表页面帮我找房 AB实验弹出 与首页cms配置页互斥
    // list-service 列表升级服务 首页查找房源弹窗触发 列表页弹出
    // list-orderSuccess 列表页面留电成功弹窗
    // list-ground 列表页面 cms配置弹窗 C实验弹出 与首页cms配置页互斥

    // wx-login 微信授权弹窗

    // 设置 获取 状态
    let typeStatus = ["set", "get", "status", "close", "dialog"];
    // 弹窗标示符 有城市区分数组
    let hasCityDialog = [
      "home-subscribe",
      "home-ground",
      "home-findHouse",
      "home-filter",
      "list-findhouse",
      "list-service",
      "list-ground",
    ];

    // 无城市区分数组
    let noCityDialog = [
      "wx-login",
      "list-orderSuccess",
      "home-orderSuccess",
      "home-fission",
    ];
    let dialogMap = this.globalData.dialogMap;

    if (
      hasCityDialog.indexOf(dialogKey) != -1 &&
      noCityDialog.indexOf(dialogKey) != -1 &&
      dialogKey != "none" &&
      type != "dialog"
    ) {
      return;
    }
    if (typeStatus.indexOf(type) == -1) {
      return;
    }
    // 如果是无城市区分的弹窗查找 noCityDialog  ， key为 common

    let key = "";
    if (noCityDialog.indexOf(dialogKey) != -1) {
      key = "common";
    } else {
      key = `city_${this.commonData.city.city_id}`;
    }

    let dialogMapValue = dialogMap.get(key);

    if (dialogMap.has(key)) {
      if (
        type == "set" &&
        (hasCityDialog.indexOf(dialogKey) != -1 ||
          noCityDialog.indexOf(dialogKey) != -1)
      ) {
        dialogMapValue[dialogKey]++;

        dialogMap.currentStatus = true;
        dialogMap.currentDialog = dialogKey;

        dialogMap.set(key, dialogMapValue);
      }

      if (type == "get") {
        return dialogMapValue[dialogKey];
      }

      if (type == "status") {
        return dialogMap.currentStatus;
      }

      if (type == "close") {
        dialogMap.currentStatus = false;
        dialogMap.currentDialog = "";
      }
      if (type == "dialog") {
        return dialogMap.currentDialog;
      }
    } else {
      let obj = {};

      dialogMap.currentDialog =
        type == "set" ? dialogKey : dialogMap.currentDialog;
      // 记录弹窗名字 状态

      if (!dialogMap.currentStatus) {
        dialogMap.currentStatus = type == "set" ? true : false;
      }
      // 获取为0
      if (type == "get") {
        return 0;
      }
      if (type == "status") {
        return dialogMap.currentStatus;
      }
      if (type == "close") {
        dialogMap.currentStatus = false;
        dialogMap.currentDialog = "";
      }
      if (type == "dialog") {
        return dialogMap.currentDialog;
      }
      if (noCityDialog.indexOf(dialogKey) != -1) {
        noCityDialog.forEach((item) => {
          // 如果为set 表示弹出1
          if (type == "set" && item == dialogKey) {
            obj[item] = 1;
          } else {
            obj[item] = 0;
          }
        });
      } else {
        hasCityDialog.forEach((item) => {
          // 如果为set 表示弹出1
          if (type == "set" && item == dialogKey) {
            obj[item] = 1;
          } else {
            obj[item] = 0;
          }
        });
      }
      dialogMap.set(key, obj);
    }
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
});
