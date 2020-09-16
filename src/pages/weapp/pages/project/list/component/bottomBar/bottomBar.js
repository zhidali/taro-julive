/*
 * @author: limengge
 * @Date: 2020-08-19
 * @description: 列表页 270 底部展示的tar
 * @LastEditTime: 2020-09-03 11:28:42
 */
const analytic = require('../../../../../analytic/analytic.js');
const order = require('../../../../../order/order.js');
const app = getApp();
Component({
  externalClasses: ['my-class'],

  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的属性列表
   * 用于组件自定义设置 
   */
  properties: {
    bottomBarData: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    //留电成功弹出弹窗
    showOrderSuccessAlert: false,
    // 登录状态 true已登录,不显示授权登录  false未登录,显示授权登录
    loginStatus: false,
    //是否有未关闭的居理订单
    userHasOrder: false,
  },

  attached() {
    // 初始化进入拉取缓存判断
    // let user = wx.getStorageSync('julive_user') || {}
    // this.setData({
    //   loginStatus: user.userId ? true : false
    // })
    this.setData({
      loginStatus: app.commonData.login_status ? true : false
    })
    app.watchCommonData('login_status', (newv) => {
      this.setData({
        loginStatus: newv ? true : false
      })
    })

    app.watchCommonData('userHasOrder', (newv) => {
      this.setData({
        userHasOrder: newv ? true : false
      })
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    didCloseBottomBarPop() {
      this.setData({
        isCloseBar: true,
        ['bottomBarData.isShow']: false,
      })
      this.triggerEvent('didCloseBottomBarPop')
    },

    // 允许登陆
    allowLogin(e) {
      this.makeOrder();
      this.setData({
        isCloseBar: true,
        ['bottomBarData.isShow']: false,
      })
      this.triggerEvent('didCloseBottomBarPop')
    },
    // 取消登陆
    cancelLogin() {
      wx.showToast({
        title: "预约失败",
        icon: "none",
        duration: 2000
      })
    },
    // 点击
    clickLogin() {
      if (this.data.loginStatus) {
        this.makeOrder();
        this.setData({
          ['bottomBarData.isShow']: false,
        })
      }
      analytic.sensors.track('e_click_leave_phone_entry', {
        fromPage: 'p_project_list',
        fromModule: 'm_guide_leave_phone_window',
        fromItem: 'i_leave_phone_entry',
        toPage: 'p_project_list',
        login_state: this.data.userLoginStatus ? '1' : '2',
        op_type: '900707',
        guide_window_type: 'A'
      });
    },
    // 处理留电
    makeOrder() {
      // 向他咨询按钮
      wx.showLoading({
        title: '预约中...',
      });
      order.makeOrder({
          op_type: '900707',
        }, {
          fromModule: 'm_guide_leave_phone_window',
          op_type: '900707',
          guide_window_type: 'A'
        },
        () => {
          wx.hideLoading();
          this.setData({
            showOrderSuccessAlert: true,
            alertTitle: '预约成功',
            popType: '1',
            alertContent: '您已用手机号' +
              app.commonData.user.mobile +
              '预约了咨询服务，稍后咨询师将来电为您解答疑问，请注意接听电话',
            showLoginModal: false,
            userLoginStatus: true,
          });
        })

    }
  }
})