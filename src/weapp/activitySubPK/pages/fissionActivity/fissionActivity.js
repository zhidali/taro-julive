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
    userLoginStatus: false, // 当前登录状态，true 已登录 false 未登录 
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
    countdownText: '', //倒计时文案
    countdownTime: 0, //倒计时时间
    countdownEnd: false, //倒计时是否结束，true 结束
    startViewTime: 0, // 埋点时间
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
    // 监听登录状态变化
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
    wx.hideShareMenu();
    setTimeout(() => {
      this.data.ePageViewFlag = true;
    }, 500);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.ePageViewFlag) {
      this.analyticPageView('e_page_view');
    }
    this.data.startViewTime = Date.parse(new Date());
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
      if (res.code !== 0) {
        return;
      }
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
        //京东卡片弹窗
        if (this.data.reward_popup && this.data.reward_popup.length > 0) {
          this.setData({
            showJDCardPop: true,
            jDCardPopData: this.data.reward_popup[this.data.rewardIdx]
          })
          analytic.sensors.track('e_module_exposure', {
            id: 9345,
            fromPage: 'p_help_activity',
            fromModule: 'm_reward_tip',
            toPage: 'p_help_activity',
            window_type: String(this.data.reward_popup[this.data.rewardIdx].type)
          });

        }
        //无资质弹窗
        if (this.data.is_can_help == 3 && this.data.userLoginStatus) {
          this.setData({
            showQualificationsPop: true
          })
          analytic.sensors.track('e_module_exposure', {
            id: 9323,
            fromPage: 'p_help_activity',
            fromModule: 'm_no_qualification_tip_window',
            toPage: 'p_help_activity',
          });
        }

      });
      //倒计时判断
      this.getCountdownJudge(res.data.activity_time);
    } catch {}
  },
  /**
   * 获取未登录 裂变活动公共信息
   * @return void
   */
  async fethcActivityCommon() {
    try {
      const res = await activityCommon();
      if (res.code !== 0) {
        return;
      }
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
      //倒计时判断
      this.getCountdownJudge(res.data.activity_time);
    } catch {}
  },

  /**
   * 头部banner：处理倒计时显示内容
   * @return void
   */
  getCountdownJudge(time) {
    let timeNow = parseInt(time.now);
    let timeStart = parseInt(time.start);
    let timeEnd = parseInt(time.end);
    if (timeNow < timeStart) {
      this.setData({
        countdownText: '距离活动开始还有',
        countdownTime: timeStart - timeNow,
        countdownEnd: false
      })
    } else if (timeEnd > timeNow) {
      this.setData({
        countdownText: '距离活动结束仅剩',
        countdownTime: timeEnd - timeNow,
        countdownEnd: false
      })
    } else if (timeEnd == timeNow) {
      this.setData({
        countdownText: '距活动结束时间仅剩',
        countdownEnd: true
      })
    } else {
      this.setData({
        countdownText: '距活动结束时间仅剩',
        countdownEnd: true
      })
    }
  },

  /**
   * 查看活动规则弹窗
   */
  onClickActRule(e) {
    this.setData({
      showActRulePop: true,
    });
    analytic.sensors.track('e_click_activity_rule', {
      id: 9327,
      fromPage: 'p_help_activity',
      fromItem: 'i_activity_rule',
      toPage: 'p_help_activity',
      click_position: e.currentTarget.dataset.type
    });
  },
  /**
   * 关闭活动规则弹窗
   */
  didCloseActRulePop() {
    this.setData({
      showActRulePop: false,
    });
  },
  /**
   * 关闭京东卡弹窗，根据接口返回的数组长度
   */
  didCloseJDCardPop() {
    let _contentList = this.data.reward_popup.length; //共有几个弹窗
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
        id: 9345,
        fromPage: 'p_help_activity',
        fromModule: 'm_reward_tip',
        toPage: 'p_help_activity',
        window_type: String(this.data.reward_popup[_index].type)
      });
    }
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
   * 个人信息模块：登录事件
   */
  didPersonalInfoLogin() {
    wx.navigateTo({
      url: "/loginSubPK/pages/register/register?isFission=1",
    });
    analytic.sensors.track('e_click_head_picture', {
      id: 9350,
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
      toPage: "",
      login_state: app.commonData.user.userId ? 1 : 2,
      invite_status: this.data.help_card_100.help.help_num < 9 ? "1" : "2",
      user_info_status: app.commonData.wxUserHeadInfo.nickname ? "1" : "2",
    });
  },
});