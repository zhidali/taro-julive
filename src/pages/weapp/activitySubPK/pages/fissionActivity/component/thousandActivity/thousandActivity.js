import { updInfo } from "../../../../../api/common";
import {
  helpUserList,
  seeUserList,
  signUserList,
} from "../../../../../api/fissionActivity";
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
    img:
      "https://imgs.julive.com/l?p=eyJpbWdfcGF0aCI6IlwvbWluaW1ncy9maXNzaW9uLWpkLWJhY2syLnBuZz93YXRlcm1hcmssdF8wIn0=",
    userLoginStatus: false, // 登录状态
    userHeaderStatus: false, // 微信用户头像信息
    text: "", // 默认文本
    selectNum: "0", // 选择tab
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
      if (newv) {
        this.fetchHelpUserList(true);
        this.fetchSeeUserList();
        this.fetchSignUserList();
      }
      this.setData({
        userLoginStatus: newv ? true : false,
      });
    });
    if (app.commonData.wxUserHeadInfo.nickName) {
      this.setData({
        userHeaderStatus: true,
      });
    }
    this.fetchHelpUserList();
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
      if (this.data.helpCardThousand.btn.clickable == 2)  return;
      wx.navigateTo({
        url: "/loginSubPK/pages/register/register?isFission=1",
      });
      analytic.sensors.track('e_click_invite_help', {
        id: 9329,
        fromPage: 'p_help_activity',
        fromModule: 'm_invite_100_activity',
        fromItem: 'i_invite_help',
        toPage: 'p_choose_login',
        login_state: app.commonData.user.userId ? 1 : 2,
        invite_status: this.data.helpCardThousand.help.number < 9 ? '1' : '2',
        user_info_status: app.commonData.wxUserHeadInfo.nickName ? '1' : '2'
      });
    },
    /**
     * 微信用户头像名字等信息
     * @return void
     */
    fetchUserInfo(e) {
      let user_info_status = 2
      if (e.detail.userInfo) {
        let ob = e.detail.userInfo;
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
        user_info_status = 1
      }
      analytic.sensors.track('e_click_invite_help', {
        id: 9329,
        fromPage: 'p_help_activity',
        fromModule: 'm_invite_100_activity',
        fromItem: 'i_invite_help',
        toPage: 'p_choose_login',
        login_state: app.commonData.user.userId ? 1 : 2,
        invite_status: this.data.helpCardThousand.help.number < 9 ? '1' : '2',
        user_info_status: user_info_status
      });
    },
    /**
     * 选择带看 tab
     * @return void
     */
    selectActivityNum(e) {
      let { num } = e.currentTarget.dataset;
      if (this.data.selectNum === num) return;
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
          if (!flag) return;
          this.data.helpPage++;
          this.fetchHelpUserList(true);
          break;
        case "1":
          flag = this.data.see_has_more;
          if (!flag) return;
          this.data.seePage++;
          this.fetchSeeUserList();
          break;
        case "2":
          flag = this.data.sing_has_more;
          if (!flag) return;
          this.data.singPage++;
          this.fetchSignUserList();
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
        let res = await helpUserList({ page: this.data.helpPage });
        if (res.code !== 0) return;
        let { list, has_more } = res.data;
        if (flag) {
          this.setData({
            list: this.data.list.concat(list),
            helpList: list,
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
        let res = await seeUserList({ page: this.data.seePage });
        if (res.code !== 0) return;
        let { list, has_more } = res.data;
        if (flag) {
          this.setData({
            list: this.data.list.concat(list),
            seeList: list,
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
        let res = await signUserList({ page: this.data.singPage });
        if (res.code !== 0) return;
        let { list, has_more } = res.data;
        if (flag) {
          this.setData({
            list: this.data.list.concat(list),
            singList: list,
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
    didClickShareBtn(){
      this.triggerEvent('didClickShareBtn', {
        fromModule: 'm_invite_2000_activity'
      });
    }
  },
});
