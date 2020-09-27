import { updInfo } from "../../../../../api/common";
const app = getApp();
const analytic = require("../../../../../analytic/analytic");

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    helpCardHundred: {
      type: Object,
      value: {},
    },
    isCanHelp: {
      type: String,
      value: "",
    },
  },
  observers: {
    helpCardHundred: function () {
      this.computeHelpNum();
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    list: [], // 助力人数
    userLoginStatus: false, // 登录状态 false 未登录 true 已登录
    userHeaderStatus: false, // 微信用户头像信息
  },
  attached() {
    if (app.commonData.user.userId) {
      this.setData({
        userLoginStatus: true,
      });
    }
    app.watchCommonData("login_status", (newv) => {
      this.setData({
        userLoginStatus: newv ? true : false,
      });
    });
    setTimeout(() => {
      if (app.commonData.wxUserHeadInfo.nickname) {
        this.setData({
          userHeaderStatus: true,
        });
      }
    }, 1000);
    // 监听用户授权头像后
    app.watchCommonData("wxUserHeadInfo", (newv) => {
      this.setData({
        userHeaderStatus: newv.headimgurl ? true : false,
      });
    });
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 计算助力人数 卡片list 前端维护
     * @return void
     */
    computeHelpNum() {
      let personNum = this.data.helpCardHundred.help.help_num;
      personNum = personNum > 9 ? 9 : personNum ;
      let v = 0;
      this.data.list = [];
      for (let i = 0; i < personNum; i++) {
        v++;
        this.data.list.push({
          flag: true,
          id: v,
        });
      }
      for (let x = 0; x < 9 - personNum; x++) {
        this.data.list.push({
          flag: false,
          id: v,
        });
      }
      this.setData({
        list: this.data.list,
      });
    },
    /**
     * 跳转登录页面
     * @return void
     */
    clickDidNavLogin() {
      if (this.data.helpCardHundred.btn.clickable == 2) {
        return;
      }
      wx.navigateTo({
        url: "/loginSubPK/pages/register/register?isFission=1",
      });
      analytic.sensors.track("e_click_invite_help", {
        id: 9328,
        fromPage: "p_help_activity",
        fromModule: "m_invite_100_activity",
        fromItem: "i_invite_help",
        toPage: "p_choose_login",
        login_state: app.commonData.user.userId ? 1 : 2,
        invite_status: this.data.helpCardHundred.help.help_num < 9 ? "1" : "2",
        user_info_status: app.commonData.wxUserHeadInfo.nickname ? "1" : "2",
      });
    },
    /**
     * 微信用户头像名字等信息
     * @return void
     */
    fetchUserInfo(e) {
      let event = 'e_click_cancel';
      let fromItem = 'i_cancel';
      if (e.detail.userInfo) {
        let ob = e.detail.userInfo;
        event = 'e_click_confirm';
        fromItem = 'i_confirm';
        app.commonData.wxUserHeadInfo = {
          nickname: ob.nickName,
          sex: ob.gender,
          wechat_city: ob.city,
          country: ob.country,
          wechat_province: ob.province,
          headimgurl: ob.avatarUrl,
        };
        updInfo(app.commonData.wxUserHeadInfo);
        this.setData({
          userHeaderStatus: true,
        });
      }
      analytic.sensors.track(event, {
        id: 9320,
        fromPage: "p_help_activity",
        fromModule: "m_basic_info_authorize_window",
        fromItem: fromItem,
        toPage: "p_help_activity",
      });
    },
    didClickgGetUserInfo(){
      analytic.sensors.track("e_click_invite_help", {
        id: 9328,
        fromPage: "p_help_activity",
        fromModule: "m_invite_100_activity",
        fromItem: "i_invite_help",
        toPage: "p_help_activity",
        login_state: app.commonData.user.userId ? 1 : 2,
        invite_status: this.data.helpCardHundred.help.help_num < 9 ? "1" : "2",
        user_info_status: 2,
      });
    },
    /**
     * 微信用户头像名字等信息
     * @return void
     */
    didClickShareBtn() {
      this.triggerEvent("didClickShareBtn", {
        fromModule: "m_invite_100_activity",
      });
    },
  },
});
