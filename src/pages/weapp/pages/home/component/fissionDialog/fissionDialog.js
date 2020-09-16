const analytic = require('../../../../analytic/analytic.js');
const app = getApp();
import { fissionSubmit } from '../../../../api/activity';
import { updInfo } from '../../../../api/common';
Component({
  /**
   * 
   */
  properties: {
    // 助力弹窗相关数据
    fissionData: {
      type: Object,
      value: {},
      observer(newVal) {
        // 处理弹窗数据
        this.handleData(newVal);
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 登陆状态
    loginStatus: false,
    // 助力弹窗
    fissionDialogShow: false,
    // 助力弹窗数据
    fissionDialogData: {},
    // 助力结果弹窗显示
    resFissionShow: false,
    // 弹窗类型 1成功 2失败 3已助力过
    resFissionType: '',
    // 助力结果data
    fissionResult: {},
    // 结果弹窗倒计时
    timeInterval: 3,
    // 避免重复提交标识
    flag: true
  },
  attached() {
    // 初始化进入组件
    this.setData({
      loginStatus: app.commonData.login_status
    })
    app.watchCommonData('login_status', (newv) => {
      this.setData({
        loginStatus: newv
      })
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 处理弹窗数据
     * @param data [Object] 父组件传入的裂变活动数据
     */
    handleData(data) {
      // 弹窗类型 1是toast 2是弹窗
      if (data.pop_type == '1') {
        app.dialogMapData('set', 'home-fission');
        wx.showToast({
          title: data.toast.text,
          icon: "none",
          duration: 2000
        })
        app.dialogMapData('close');
      } else if (data.pop_type == '2') {
        let title = '';
        data.pop.title.forEach((item, index) => {
          title += index == 1 ? `<span class="red">${item}</span>` : item;
        }, )
        data.pop.title = title;
        this.setData({
          fissionDialogShow: true,
          fissionDialogData: data.pop
        })
        app.dialogMapData('set', 'home-fission');
        //埋点 9330 9333
        let analyticObj = {
          fromPage: 'p_home',
          toPage: 'p_home',
          fromModule: data.pop.type == '1' ? 'm_help_window' : 'm_more_help_window',
          invite_customer_id: app.commonData.fissionShareId
        }
        analytic.sensors.track('e_module_exposure', analyticObj);
      }
    },
    // 点击帮TA助力/我也看看
    clickFissionBtn(e) {
      // 判断是否登陆
      if (this.data.loginStatus) {
        this.getResFission();
      } else {
        wx.navigateTo({
          url: '../../loginSubPK/pages/register/register?isFission=1'
        })
      }
      //埋点 9332 9335
      let analyticObj = {
        fromPage: 'p_home',
        toPage: this.data.loginStatus ? 'p_home' : 'p_choose_login',
        fromModule: this.data.fissionDialogData.type == '1' ? 'm_help_window' : 'm_more_help_window',
        fromItem: this.data.fissionDialogData.type == '1' ? 'i_help' : 'i_go_see',
        login_state: this.data.loginStatus ? '1' : '2',
        invite_customer_id: app.commonData.fissionShareId
      }
      // 9332
      analytic.sensors.track('e_click_help', analyticObj);
      // 9335
      analytic.sensors.track('e_click_go_see', analyticObj);
    },
    // 获取微信个人信息授权
    getUserInfo(e) {
      // 如果授权了userInfo有值
      let userInfo = e.detail.userInfo;
      if (userInfo) {
        app.commonData.wxUserHeadInfo = {
          avatarUrl: userInfo.avatarUrl,
          city: userInfo.city,
          country: userInfo.country,
          nickName: userInfo.nickName,
          province: userInfo.province,
        };
        updInfo(app.commonData.wxUserHeadInfo);
      }
      this.getResFission(userInfo);

    },
    // 请求助力结果接口
    async getResFission(e) {
      if (!this.data.flag) return;
      this.setData({
        flag: false
      })
      let params = {
        share_id: app.commonData.fissionShareId
      }
      let {code, data, msg} = await fissionSubmit(params);
      console.log('submit接口数据', data);
      if (code == 0) {
        this.setData({
          fissionDialogShow: false
        })
        // 结果类型是跳转
        if (data.type == '3') {
          wx.navigateTo({
            url: data.url.type == 1 ? data.url.url : '/activitySubPK/pages/fissionActivity/fissionActivity'
          })
          app.dialogMapData('close');
          // 结果类型是toast
        } else if (data.type == '1') {
          wx.showToast({
            title: data.toast.text,
            icon: "none",
            duration: 2000
          })
          app.dialogMapData('close');
          // 结果类型是弹窗
        } else {
          this.setData({
            resFissionShow: true,
            resFissionType: data.result,
            resFissionPopData: data.pop
          }, () => {
            // 按钮文案倒计时
            this.timer = setInterval(() => {
              this.setData({
                timeInterval: --this.data.timeInterval
              })
              // 如果提前关闭了弹窗 及时关掉计时器
              if (!this.data.resFissionShow) {
                clearInterval(this.timer);
                return;
              }
              if (this.data.timeInterval == 0) {
                clearInterval(this.timer);
                // 跳转页面
                this.seeMoreDiscount(data.pop.url);
              }
            }, 1000)
          })
          // 埋点 9336 9339 9342
          let analyticObj = {
            fromPage: 'p_home',
            toPage: 'p_home',
            invite_customer_id: app.commonData.fissionShareId
          }
          if (data.result == '1') { // 9336
            analyticObj.fromModule = 'm_help_success_window';
          } else if (data.result == '2') { // 9339
            analyticObj.fromModule = 'm_help_fail_window';
          } else if (data.result == '3') { // 9342
            analyticObj.fromModule = 'm_helped_window';
          }
          analytic.sensors.track('e_module_exposure', analyticObj);
        }

      }
      this.setData({
        flag: true
      })
    },
    // 手动点击查看更多优惠
    seeMoreDiscount(url) {
      this.setData({
        resFissionShow: false
      }, () => {
        app.dialogMapData('close');
        wx.navigateTo({
          url
        })
      })
      //埋点 9338 9341 9344
      let analyticObj = {
        fromPage: 'p_home',
        toPage: 'p_webview',
        fromItem: 'i_more_discount',
        invite_customer_id: app.commonData.fissionShareId,
        to_url: url
      }
      if (this.data.resFissionType == '1') { // 9338
        analyticObj.fromModule = 'm_help_success_window';
      } else if (this.data.resFissionType == '2') { // 9341
        analyticObj.fromModule = 'm_help_fail_window';
      } else if (this.data.resFissionType == '3') { // 9344
        analyticObj.fromModule = 'm_helped_window';
      }
      analytic.sensors.track('e_click_more_discount', analyticObj);
    },
    // 关闭弹窗
    closeDialog(e) {
      let {
        type
      } = e.currentTarget.dataset;
      app.dialogMapData('close');
      // 助力弹窗
      if (type === '1') {
        this.setData({
          fissionDialogShow: false
        })
        //埋点 9331 9334
        let analyticObj = {
          fromPage: 'p_home',
          toPage: 'p_home',
          fromModule: this.data.fissionDialogData.type == '1' ? 'm_help_window' : 'm_more_help_window',
          fromItem: 'i_close',
          invite_customer_id: app.commonData.fissionShareId
        }
        analytic.sensors.track('e_click_close', analyticObj);
      } else {
        // 助力结果弹窗
        this.setData({
          resFissionShow: false
        })
        //埋点 9337 9340 9343
        let analyticObj = {
          fromPage: 'p_home',
          toPage: 'p_home',
          fromItem: 'i_close',
          invite_customer_id: app.commonData.fissionShareId
        }
        if (this.data.resFissionType == '1') { // 9337
          analyticObj.fromModule = 'm_help_success_window';
        } else if (this.data.resFissionType == '2') { // 9340
          analyticObj.fromModule = 'm_help_fail_window';
        } else if (this.data.resFissionType == '3') { // 9343
          analyticObj.fromModule = 'm_helped_window';
        }
        analytic.sensors.track('e_click_close', analyticObj);
      }
    }
  }
})