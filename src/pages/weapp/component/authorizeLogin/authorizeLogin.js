const app = getApp();
const analytic = require('../../analytic/analytic.js');
// const enviroment = require('../../enviroment/enviroment');
const user = require('../../user/user');

import {
  fastLogin
} from '../../api/common'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 扩展字段 默认true需要正常使用授权登录， 可由外部控制实际场景
    hasLogin: {
      type: Boolean,
      value: true
    }
  },
  options: {
    // 受父文件css 影响 
    addGlobalClass: true,
    // 启用插槽
    multipleSlots: true
  },
  externalClasses: ['my-class'],
  /**
   * 组件的初始数据
   */
  data: {
    // 登录状态 true已登录,不显示授权登录  false未登录,显示授权登录
    loginStatus: false
  },
  // 组件生命周期函数-在组件实例进入页面节点树时执行)
  attached() {
    // 初始化进入拉取缓存判断

    // let user =  wx.getStorageSync('julive_user') || {}

    this.setData({
      loginStatus: app.commonData.login_status ? true : false
    })

    app.watchCommonData('login_status', (newv) => {
      this.setData({
        loginStatus: newv ? true : false
      })
    })
  },
  // 组件生命周期函数-在组件布局完成后执行)
  ready() { },
  //组件生命周期函数-在组件实例被从页面节点树移除时执行)
  detached() { },
  // 组件数据字段监听器，用于监听 properties 和 data 的变化， 类似vue watch
  observers: { },

  // app.userInfoReadyCallback = res => {
  //   this.setData({
  //     userInfo: res.userInfo,
  //     hasUserInfo: true
  //   })
  // }
  /**
   * 组件的方法列表
   */
  methods: {
    async getPhoneNumber(e) {
      app.dialogMapData('close');
      // 允许 or 拒绝
      let {
        errMsg,
        iv,
        encryptedData
      } = e.detail;

      // 点击允许
      if (errMsg.indexOf('ok') != -1) {
        // 3062
        analytic.sensors.track('e_click_wechat_confirm_authorization', {
          fromPage: analytic.page.currentPage(),
          toPage: analytic.page.currentPage(),
          fromItem: 'i_confirm_authorization',
          wechat_authorization: '1'
        });
        try {
          wx.showLoading({
            title: "登录中..."
          });
          let res = await fastLogin({
            iv,
            cryp: encryptedData,
            channel_id: app.commonData.channel.channel_id
          })

          wx.hideLoading();
          if (res.code == 0) {
            // 登录成功
            // enviroment.setJuliveToken(res.data.token, true);

            app.enviroment.setJuliveToken(res.data.token, true);

            analytic.sensors.registerApp(res.data.user_id);
            // 拉取 有无订房单接口
            user.fetchUserHasOrder();
            let _user = {
              userId: res.data.user_id,
              name: res.data.nickname,
              mobile: res.data.mobile,
              avatar: res.data.avatar ? res.data.avatar : '',
              report: res.data.report ? res.data.report : {
                status: 2
              },
            };
            // app.commonData.user = res.data.user_id;
            // _user.userId = res.data.user_id;
            app.commonData.user = _user;
            this.setData({
              loginStatus: true
            })
            app.commonData.login_status = res.data.user_id ? true : false;

            // wx.setStorage({
            //   key: 'julive_user',
            //   data: _user,
            // });
            analytic.sensors.registerApp({
              julive_id: _user.userId,
            });
            
            this.triggerEvent('allow', e.detail);
          } else {
            // 登录失败
            wx.showToast({
              title: "登录失败，请稍后重试～",
              icon: "none",
              duration: 1500
            });
          }
        } catch (e) {
          console.log(e);
        }
        // wx.showLoading();
      } else {
        this.triggerEvent('cancel', e.detail);
        // 3063
        analytic.sensors.track('e_click_wechat_cancel_authorization', {
          fromItem: 'i_cancel_authorization',
          wechat_authorization: '2',
          fromPage: analytic.page.currentPage(),
          toPage: analytic.page.currentPage()
        });
      }
    },
    clickWrap() {
      // 表示有授权登录弹窗展开
      if(!app.commonData.login_status){
        app.dialogMapData('set', 'wx-login');
      }
      this.triggerEvent('click');
    }
  }
})