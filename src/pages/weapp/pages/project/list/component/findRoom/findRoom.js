/*
 * @author: wangshuaixue
 * @Date: 2020-08-19
 * @description: 列表页 270帮我找房模块
 * @LastEditTime: 2020-09-07 18:19:52
 */

import {
  userDiscount
} from '../../../../../api/common';
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
    findRoomData: {
      type: Object,
      value: {}
    },
    opType: {
      type: String,
      value: ''
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    //留电成功弹出弹窗
    showOrderSuccessAlert: false,
    alertTitle: '',
    alertContent: '',
    // 登录状态 true已登录,不显示授权登录  false未登录,显示授权登录
    loginStatus: false,
    // 留电后数据
    order_id: '',
    business_type: ''
  },

  attached() {
    // 初始化进入拉取缓存判断
    this.setData({
      loginStatus: app.commonData.login_status ? true : false
    })
    app.watchCommonData('login_status', (newv) => {
      this.setData({
        loginStatus: newv ? true : false
      })
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 点击叉号关闭
    hideModalCallback(){
        this.triggerEvent('hideModalCallbackVb');
    },
    // 点击帮我找房关闭
    confirmCallback() {
        this.triggerEvent('confirmCallbackVb');
    },
    // 允许登录
    allowLogin(e) {
      this.makeOrder();
    },
    // 取消登录
    cancelLogin() {
      wx.showToast({
        title: "预约失败",
        icon: "none",
        duration: 2000
      })
    },
    // 点击
    clickLogin() {
      let {opType, order_id, business_type}  = this.data;
      if (this.data.loginStatus) {
        this.makeOrder();
      }
      this.triggerEvent('leavePhone', {
        state: 0,
        type: 'findRoom',
        opType,
        business_type,
        order_id
      });
      
    },
    // 处理留电
    async makeOrder() {
      wx.showLoading({
        title: '预约中...',
      });
      let res = await userDiscount({
        op_type: this.data.opType
      });
      wx.hideLoading();
      if(res.code == 0){
        this.data.business_type = res.data.business_type;
        this.data.order_id = res.data.order_id;
        // state  0 留电入口  1 留电成功
        this.triggerEvent('leavePhone', {
          state: 1,
          type: 'findRoom',
          opType: this.data.opType,
          business_type: res.data.business_type,
          order_id: res.data.order_id
        });
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
      }
    }
  }
})