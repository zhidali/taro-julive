import {
  updInfo
} from "../../../../../api/common";
import {
  helpUserList,
  seeUserList,
  signUserList,
} from "../../../../../api/fissionActivity";
const analytic = require("../../../../../analytic/analytic");
const app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    helpCardThousand: {
      type: Object,
      value: {},
    },
    isCanHelp: {
      type: String,
      value: "",
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    img: "https://imgs.julive.com/l?p=eyJpbWdfcGF0aCI6IlwvbWluaW1ncy9maXNzaW9uLWpkLWJhY2syLnBuZz93YXRlcm1hcmssdF8wIn0=",
    userLoginStatus: false, // 登录状态 false 未登录 true 已登录
    userHeaderStatus: false, // 微信用户头像信息
    text: "", // 默认文本
    selectNum: "0", // 选择tab 0 邀请新用户 1咨询师带看 2 已认购好友
    helpPage: 1, // 新用户页数
    help_has_more: false, // 是否还有分页
    helpList: {}, // 助力数据
    seePage: 1, // 带看页书
    see_has_more: false, // 是否还有分页
    seeList: {}, // 带看
    singPage: 1, // 认购页数
    sing_has_more: false, // 是否还有分页
    singList: {}, // 认购数据
    list: [], // 页面展示助力  带看 认购 的list
    scrollIntoViewSign: "a0", // scroll 所使用标记
  },
  attached() {
    this.fetchHelpUserList(true);
    this.fetchSeeUserList();
    this.fetchSignUserList();
    if (app.commonData.user.userId) {
      this.setData({
        userLoginStatus: true,
      });
    }
    app.watchCommonData("login_status", (newv) => {
        this.data.helpPage = 1;
        this.data.seePage = 1;
        this.data.singPage = 1;
        this.data.list = [];
        this.fetchHelpUserList(true);
        this.fetchSeeUserList();
        this.fetchSignUserList();
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
  observers: {
    helpCardThousand: function () {
      let ob = this.data.helpCardThousand.tab.help.empty_desc;
      let text = `${ob[0]}\n${ob[1]}`;
      this.setData({
        text,
      });
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 跳转登录页面
     * @return void
     */
    clickDidNavLogin() {
      if (this.data.helpCardThousand.btn.clickable == 2) {
        return;
      }
      wx.navigateTo({
        url: "/loginSubPK/pages/register/register?isFission=1",
      });
      analytic.sensors.track("e_click_invite_help", {
        id: 9329,
        fromPage: "p_help_activity",
        fromModule: "m_invite_2000_activity",
        fromItem: "i_invite_help",
        toPage: "p_choose_login",
        login_state: app.commonData.user.userId ? 1 : 2,
        invite_status: this.data.helpCardThousand.tab.help.number < 9 ? "1" : "2",
        user_info_status: app.commonData.wxUserHeadInfo.nickname ? "1" : "2",
      });
    },
    /**
     * 微信用户头像名字等信息
     * @return void
     */
    fetchUserInfo(e) {
      let event = "e_click_cancel";
      let fromItem = "i_cancel";
      if (e.detail.userInfo) {
        let ob = e.detail.userInfo;
        event = "e_click_confirm";
        fromItem = "i_confirm";
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
    didClickgGetUserInfo() {
        analytic.sensors.track("e_click_invite_help", {
          id: 9329,
          fromPage: "p_help_activity",
          fromModule: "m_invite_2000_activity",
          fromItem: "i_invite_help",
          toPage: "p_help_activity",
          login_state: app.commonData.user.userId ? 1 : 2,
          invite_status: this.data.helpCardThousand.tab.help.number < 9 ? "1" : "2",
          user_info_status: 2,
        });

    },
    /**
     * 选择带看 tab
     * @return void
     */
    selectActivityNum(e) {
      let {
        num
      } = e.currentTarget.dataset;
      if (this.data.selectNum === num) {
        return;
      }
      let list = [];
      let ob;
      switch (num) {
        case "0":
          list = this.data.helpList;
          ob = this.data.helpCardThousand.tab.help.empty_desc;
          break;
        case "1":
          list = this.data.seeList;
          ob = this.data.helpCardThousand.tab.see.empty_desc;
          break;
        case "2":
          list = this.data.singList;
          ob = this.data.helpCardThousand.tab.sign.empty_desc;
          break;
        default:
          list = [];
      }
      let text = `${ob[0]}\n${ob[1]}`;
      this.setData({
        selectNum: num,
        list,
        text,
        scrollIntoViewSign: "a0",
      });
    },
    /**
     * 滑动到底部下拉数据
     * @return void
     */
    fetchScrollList() {
      let flag = false;
      let num = this.data.selectNum;
      switch (num) {
        case "0":
          flag = this.data.help_has_more;
          if (!flag) {
            return;
          }
          this.data.helpPage++;
          this.fetchHelpUserList(true);
          break;
        case "1":
          flag = this.data.see_has_more;
          if (!flag) {
            return;
          }
          this.data.seePage++;
          this.fetchSeeUserList(true);
          break;
        case "2":
          flag = this.data.sing_has_more;
          if (!flag) {
            return;
          }
          this.data.singPage++;
          this.fetchSignUserList(true);
          break;
        default:
          flag = false;
      }
    },
    /**
     * 获取邀请新用户数据
     * @param  {Boolean} 赋值list 吗
     * @return void
     */
    async fetchHelpUserList(flag = false) {
      try {
        let res = await helpUserList({
          page: this.data.helpPage,
        });
        if (res.code !== 0) return;
        let { list, has_more } = res.data;
        if (flag) {
          let _list = this.data.list.concat(list);
          this.setData({
            list: _list,
            helpList: _list,
            help_has_more: has_more === 1 ? true : false,
          });
        } else {
          this.setData({
            helpList: list,
            help_has_more: has_more === 1 ? true : false,
          });
        }
      } catch {}
    },
    /**
     * 获取好友看房数据
     * @param  {Boolean} 赋值list 吗
     * @return void
     */
    async fetchSeeUserList(flag = false) {
      try {
        let res = await seeUserList({
          page: this.data.seePage,
        });
        if (res.code !== 0) {
          return;
        }
        let { list, has_more } = res.data;
        if (flag) {
          let _list = this.data.list.concat(list);
          this.setData({
            list: _list,
            seeList: _list,
            see_has_more: has_more === 1 ? true : false,
          });
        } else {
          this.setData({
            seeList: list,
            see_has_more: has_more === 1 ? true : false,
          });
        }
      } catch {}
    },
    /**
     * 获取交易达成数据
     * @param  {Boolean} 赋值list 吗
     * @return void
     */
    async fetchSignUserList(flag = false) {
      try {
        let res = await signUserList({
          page: this.data.singPage,
        });
        if (res.code !== 0) {
          return;
        }
        let { list, has_more } = res.data;
        if (flag) {
          let _list = this.data.list.concat(list);
          this.setData({
            list: _list,
            singList: _list,
            sing_has_more: has_more === 1 ? true : false,
          });
        } else {
          this.setData({
            singList: list,
            sing_has_more: has_more === 1 ? true : false,
          });
        }
      } catch {}
    },
    /**
     * 微信用户头像名字等信息
     * @return void
     */
    didClickShareBtn() {
      this.triggerEvent("didClickShareBtn", {
        fromModule: "m_invite_2000_activity",
      });
    },
  },
});
