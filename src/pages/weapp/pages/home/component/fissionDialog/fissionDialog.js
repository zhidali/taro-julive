const analytic = require('../../../../analytic/analytic.js');
const app = getApp();
import { fissionSubmit } from '../../../../api/fissionActivity';
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
        if (JSON.stringify(newVal) !== '{}') {
          // 处理弹窗数据
          this.handleData(newVal);
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 登录状态
    loginStatus: false,
    // 助力弹窗
    fissionDialogShow: false,
    // 助力弹窗数据
    fissionDialogData: {},
    // 助力结果弹窗显示
    resFissionShow: false,
    // 弹窗类型 1成功 2失败 3已助力过
    resFissionType: '',
    // 主会场活动时间是否结束
    resFissionIsTime: false,
    // 助力结果data
    fissionResult: {},
    // 结果弹窗倒计时
    timeInterval: 3,
    // 避免重复提交标识
    flag: true,
    // 是否授权微信个人信息
    wxUserHeadInfoStatus: false
  },
  attached() {
    // 初始化进入组件
    this.setData({
      loginStatus: app.commonData.login_status,
      wxUserHeadInfoStatus: app.commonData.wxUserHeadInfo.headimgurl,
    })
    app.watchCommonData('login_status', (newv) => {
      this.setData({
        loginStatus: newv
      })
    })
    app.watchCommonData("wxUserHeadInfo", (newv) => {
      if (newv.headimgurl) {
       this.setData({
        wxUserHeadInfoStatus: newv.headimgurl
       })
      }
    });
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
    clickFissionBtn() {
      // 判断是否登陆
      if (this.data.loginStatus) {
        this.getResFission();
      } else {
        wx.navigateTo({
          url: '../../loginSubPK/pages/register/register?isFission=1'
        })
        //埋点 9332 9335
        let analyticObj = {
          fromPage: 'p_home',
          toPage: 'p_choose_login',
          login_state: '2',
          invite_customer_id: app.commonData.fissionShareId
        }
        if (this.data.fissionDialogData.type == '1') {
          // 9332 未登陆
          analytic.sensors.track('e_click_help', Object.assign({}, analyticObj, {
            fromModule: 'm_help_window',
            fromItem: 'i_help'
          }));
        } else {
          // 9335 未登陆
          analytic.sensors.track('e_click_go_see', Object.assign({}, analyticObj, {
            fromModule: 'm_more_help_window',
            fromItem: 'i_go_see'
          }));
        }
      }
    },
    // 获取微信个人信息授权
    getUserInfo(e) {
      // 如果授权了userInfo有值
      let ob = e.detail.userInfo;
      if (ob) {
        app.commonData.wxUserHeadInfo = {
          nickname: ob.nickName,
          sex: ob.gender,
          wechat_city: ob.city,
          country: ob.country,
          wechat_province: ob.province,
          headimgurl: ob.avatarUrl,     
        };
        updInfo(app.commonData.wxUserHeadInfo);
        // 9321
        analytic.sensors.track('e_click_confirm', {
          id: 9321,
          fromPage: "p_home",
          fromModule: "m_basic_info_authorize_window",
          fromItem: 'i_confirm',
          toPage: "p_home",
        });
      } else {
        // 9320
        analytic.sensors.track('e_click_cancel', {
          id: 9320,
          fromPage: "p_home",
          fromModule: "m_basic_info_authorize_window",
          fromItem: 'i_cancel',
          toPage: "p_home",
        });
      }
      this.getResFission();

    },
    // 请求助力结果接口
    async getResFission() {
      if (!this.data.flag) return;
      this.setData({
        flag: false
      })
      let params = {
        pop_type: this.data.fissionDialogData.type,
        share_id: app.commonData.fissionShareId
      }
      try {
        let {code, data } = await fissionSubmit(params);
        console.log('submit接口数据', data);
        if (code == 0) {
          this.setData({
            fissionDialogShow: false
          })
          // 结果类型是跳转
          if (data.type == '3') {
            let url = '';
            if (data.url.type == 1){
              url = data.is_in_activity_time ? '/pages/web/web?url=' + data.url.url : '';
            } else {
              url = '/activitySubPK/pages/fissionActivity/fissionActivity';
            }
            if (url) {
              wx.navigateTo({
                url
              })
            }
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
              resFissionIsTime: data.is_in_activity_time,
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
                  this.seeMoreDiscount();
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
          //埋点 9332 9335
          let analyticObj = {
            fromPage: 'p_home',
            login_state: '1',
            invite_customer_id: app.commonData.fissionShareId
          }
          if (this.data.fissionDialogData.type == '1') {
            // 9332 已登陆
            analytic.sensors.track('e_click_help', Object.assign({}, analyticObj, {
              fromModule: 'm_help_window',
              fromItem: 'i_help',
              toPage: data.type == 3 && data.url.type == 2 ? 'p_help_activity' : 'p_home',
            }));
          } else {
            // 9335 已登陆
            analytic.sensors.track('e_click_go_see', Object.assign({}, analyticObj, {
              fromModule: 'm_more_help_window',
              fromItem: 'i_go_see',
              toPage: data.type == 3 && data.url.type == 2 ? 'p_help_activity' : 'p_home',
              to_url: data.type == 3 && data.url.type == 1 && data.is_in_activity_time ? data.url.url : ''
            }));
          }
        }
        this.setData({
          flag: true
        })
      } catch (error) {
        console.log(error)
      }
    },
    // 手动点击/倒计时结束查看更多优惠
    seeMoreDiscount() {
      console.log('/pages/web/web?url=' + this.data.resFissionPopData.url)
      this.setData({
        resFissionShow: false
      }, () => {
        app.dialogMapData('close');
        // 如果主会场时间没结束
        if (this.data.resFissionIsTime) {
          wx.navigateTo({
            url: '/pages/web/web?url=' + this.data.resFissionPopData.url
          })
        }
      })
      //埋点 9338 9341 9344
      let url = this.data.resFissionPopData.url;
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