import {
  activityCommon,
  activityUserInfo
} from "../../../api/fissionActivity";
const app = getApp();
const analytic = require("../../../analytic/analytic");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    //页面加载中判断，默认false，true是加载完
    loadingHidden: false,
    userLoginStatus: false, // 当前登陆状态，true 已登陆
    help_card_100: {}, // 京东卡 100元 活动相关信息
    help_card_2000: {}, // 京东卡 2000元 活动相关信息
    how_to_participant: {}, // 参与流程
    user_info: {}, //用户信息
    latest_reward: {}, //banner 上面的获奖信息
    ranking_list: {}, //奖励排行榜
    no_priority_popup: {}, //无资质弹窗数据
    is_can_help: 0, //1单资质，2双资质，3无资质
    //是否展示活动规则弹窗,true 展示
    showActRulePop: false,
    //是否展示京东卡弹窗,true 展示
    showJDCardPop: false,
    //是否展示无资质弹窗，true 展示
    showQualificationsPop: false,
    share_info: {}, // 分享相关数据
    activity_rule: {}, // 免责声明
    componentShareFromModule: "", // 分享区分模块使用
    rewardIdx: 0, //京东卡弹窗，当前展示的弹窗的index
    reward_popup: [], //京东卡弹窗数据
    ePageViewFlag: false, // 避免analyticPageView 重复触发
    activity_rule_popup: {}, //活动规则弹窗
    // reward_popup: [{
    //     "bg": "//comjia_apiclient_wxmini.static.comjia.com/api_client/wxmini/activity/hundred.png",
    //     "content": [{
    //         "text": "恭喜你获得",
    //         "style": 1
    //       },
    //       {
    //         "text": "100元京东卡",
    //         "style": 2
    //       },
    //       {
    //         "text": "请联系咨询师领取",
    //         "style": 1
    //       }
    //     ],
    //     "button": "确定"
    //   }
    // ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    await app.setUser();
    if (app.commonData.user.userId) {
      this.fetchActivityUserInfo();
      this.setData({
        userLoginStatus: true,
      });
    } else {
      this.fethcActivityCommon();
      wx.navigateTo({
        url: "/loginSubPK/pages/register/register?isFission=1",
      });
    }
    // 监听登陆状态变化
    app.watchCommonData("login_status", (newv) => {
      if (newv) {
        this.fetchActivityUserInfo();
      } else {
        this.fethcActivityCommon();
      }
      this.setData({
        userLoginStatus: newv ? true : false,
      });
    });
    // 监听用户授权头像后
    app.watchCommonData("wxUserHeadInfo", (newv) => {
      if (!newv.headimgurl) return
       let val = 'user_info.avatar';
       this.setData({
         [val]: newv.headimgurl
       })
    });
    this.analyticPageView('e_page_view');
    setTimeout(() => {
      this.data.ePageViewFlag = true;
    }, 500);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.ePageViewFlag) {
      this.analyticPageView('e_page_view');
    }
  },

  onHide: function () {
    this.analyticPageView();
  },

  onUnload: function () {
    this.analyticPageView();
  },
  analyticProperties() {
    return {
      fromPage: 'p_help_activity',
    };
  },
  analyticPageView: function (eventName = 'e_page_quit') {
    var analyticProperties = this.analyticProperties();
    if (eventName != 'e_page_view') {
      var viewTime = (Date.parse(new Date()) - this.data.startViewTime) / 1000;
      analyticProperties.view_time = viewTime;
    }
    analyticProperties.toPage = analyticProperties.fromPage;
    analytic.sensors.track(eventName, analyticProperties);
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    setTimeout(() => {
      this.sensorsShare();
    }, 800);
    console.log('分享的邀请人share_id' + this.data.share_info.share_id)
    return {
      title: this.data.share_info.desc,
      path: `/pages/home/home?fissionShareId=${this.data.share_info.share_id}`,
      imageUrl: this.data.share_info.img,
    };
  },
  /**
   * 获取已登录 用户裂变活动内信息
   * @return void
   */
  async fetchActivityUserInfo() {
    try {
      const res = await activityUserInfo();
      // console.log(res);
      if (res.code !== 0) return;
      let {
        help_card_100,
        help_card_2000,
        how_to_participant,
        activity_rule,
        user_info,
        latest_reward,
        ranking_list,
        activity_time,
        no_priority_popup, //无资质弹窗数据
        share_info,
        is_can_help, //1单资质，2双资质，3无资质
        reward_popup,
        activity_rule_popup
      } = res.data;
      is_can_help = 2;
      this.setData({
        help_card_100,
        help_card_2000,
        how_to_participant,
        activity_rule,
        loadingHidden: true,
        no_priority_popup,
        share_info,
        user_info,
        activity_time,
        latest_reward,
        ranking_list,
        no_priority_popup,
        is_can_help,
        reward_popup,
        activity_rule_popup
      }, () => {
        //京东卡片弹窗，9345
        if (this.data.reward_popup && this.data.reward_popup.length > 0) {
          this.setData({
            showJDCardPop: true,
            jDCardPopData: this.data.reward_popup[this.data.rewardIdx]
          })
          analytic.sensors.track('e_module_exposure', {
            fromPage: 'p_help_activity',
            fromModule: 'm_reward_tip',
            toPage: 'p_help_activity',
            window_type: '1'
          });
        }
        //无资质弹窗，9323
        if (this.data.is_can_help === 3 && this.data.userLoginStatus) {
          this.setData({
            showQualificationsPop: true
          })
          analytic.sensors.track('e_module_exposure', {
            fromPage: 'p_help_activity',
            fromModule: 'm_no_qualification_tip_window',
            toPage: 'p_help_activity',
          });
        }
      });
    } catch {}
  },
  /**
   * 获取未登录 裂变活动公共信息
   * @return void
   */
  async fethcActivityCommon() {
    try {
      const res = await activityCommon();
      // console.log(res);
      if (res.code !== 0) return;
      let {
        help_card_100,
        help_card_2000,
        activity_rule,
        how_to_participant,
        activity_rule_popup,
        activity_time,
        user_info,
        latest_reward,
        ranking_list,
      } = res.data;
      this.setData({
        loadingHidden: true,
        help_card_100,
        help_card_2000,
        how_to_participant,
        activity_rule,
        activity_rule_popup,
        activity_time,
        user_info,
        latest_reward,
        ranking_list,
      });
    } catch {}
  },
  /**
   * 查看活动规则
   */
  onClickActRule(e) {
    this.setData({
      showActRulePop: true,
    });
    analytic.sensors.track('e_click_activity_rule', {
      fromPage: 'p_help_activity',
      fromItem: 'i_activity_rule',
      toPage: 'p_help_activity',
      click_position: e.currentTarget.dataset.type
    });
  },
  /**
   * 关闭活动规则
   */
  didCloseActRulePop() {
    this.setData({
      showActRulePop: false,
    });
  },
  /**
   * 关闭京东卡弹窗
   */
  didCloseJDCardPop() {
    let _contentList = this.data.reward_popup.length;
    if (_contentList - 1 == this.data.rewardIdx) {
      this.setData({
        showJDCardPop: false
      })
    }
    if (_contentList > 1 && _contentList - this.data.rewardIdx > 1) {
      let _index = this.data.rewardIdx + 1;
      this.setData({
        rewardIdx: _index,
        showJDCardPop: true,
        jDCardPopData: this.data.reward_popup[_index]
      })
      analytic.sensors.track('e_module_exposure', {
        fromPage: 'p_help_activity',
        fromModule: 'm_reward_tip',
        toPage: 'p_help_activity',
        window_type: '2'
      });
    }
  },
  /**
   * 关闭京东卡弹窗2000元
   */
  didCloseJDCardPop2() {
    this.setData({
      showJDCardPop: false,
      showCloseJDCardPop2: false
    })
  },
  /**
   * 关闭无资质弹窗
   */
  didCloseQualificationsPop() {
    this.setData({
      showQualificationsPop: false
    })
  },
  /**
   * 关闭无资质弹窗,跳转登录页面
   */
  didCloseQualificationsPopHome() {
    this.setData({
      showQualificationsPop: false
    })
    wx.switchTab({
      url: "/pages/home/home",
    });
  },
  /**
   * 个人信息模块：登录事件，9350
   */
  didPersonalInfoLogin() {
    wx.navigateTo({
      url: "/loginSubPK/pages/register/register?isFission=1",
    });
    analytic.sensors.track('e_click_head_picture', {
      fromPage: 'p_help_activity',
      fromModule: 'm_top_bar',
      fromItem: 'i_head_picture',
      toPage: 'p_choose_login',
    });
  },


  /**
   * 100 2000  分享之后callback fromModule 用于埋点
   * @return void
   */
  didClickShareBtn(e) {
    this.data.componentShareFromModule = e.detail.fromModule;
  },
  /**
   * 分享后的埋点
   * @return void
   */
  sensorsShare() {
    analytic.sensors.track("e_click_invite_help", {
      id: 9328,
      fromPage: "p_help_activity",
      fromModule: this.data.componentShareFromModule,
      fromItem: "i_invite_help",
      toPage: "p_choose_login",
      login_state: app.commonData.user.userId ? 1 : 2,
      invite_status: this.data.help_card_100.help.help_num < 9 ? "1" : "2",
      user_info_status: app.commonData.wxUserHeadInfo.nickName ? "1" : "2",
    });
  },
});