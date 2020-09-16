const analytic = require('../../../../analytic/analytic.js');
const order = require('../../../../order/order.js');
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    employee: {
      type: Object,
      value: {
        list: []
      },
      observer(newVal) {
        let {
          list = []
        } = newVal;
        if (list.length) {
          this.exposureEmployee();
        }
      }
    },
    userLoginStatus: {
      type: Boolean,
      value: true
    }
  },
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的初始数据
   */
  data: {
    // 留电成功弹窗状态
    isShowLeavePhone: false,
    alertContent: '',
    loginStatus: false
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
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //----------咨询师跳转到咨询师列表页面-----------
    goEmployee(e) {
      if (this.data.employee.jump_h5_url) {
        // 5461
        let {
          key,
          item,
          index
        } = e.currentTarget.dataset;
        if (key != 'card') {
          analytic.sensors.track('e_click_view_more', {
            fromPage: 'p_home ',
            toPage: 'p_web_view',
            fromModule: 'm_adviser',
            fromItem: 'm_adviser',
            to_url: this.data.employee.jump_h5_url,
          });
        } else {
          analytic.sensors.track('e_click_adviser_card', {
            fromPage: 'p_home ',
            toPage: 'p_webview',
            fromModule: 'm_adviser',
            fromItem: 'i_adviser_card',
            to_url: this.data.employee.jump_h5_url,
            fromItemIndex: index,
            adviser_id: item.employee_id,
          });
        }
        wx.navigateTo({
          url: '/pages/web/web?url=' + this.data.employee.jump_h5_url,
        });
      }
    },


    allowLogin(e) {
      this.makeOrder();
      // 8925
      let {
        item,
        index,
        key
      } = e.currentTarget.dataset;
      // 5462
      console.log('allowLogin---', item)
      if (key == 'btn-service') {
        analytic.sensors.track('e_click_leave_phone_entry', {
          fromPage: 'p_home ',
          toPage: 'p_home',
          fromModule: 'm_adviser',
          fromItem: 'i_leave_phone_entry',
          fromItemIndex: index,
          login_state: app.commonData.user.userId ? 1 : 2,
          adviser_id: item.employee_id,
          op_type: '900740',
        });
      }
      this.data.loginUserInfo = {
        fromItem: 'i_confirm_leave_phone',
        fromItemIndex: index,
        login_state: app.commonData.user.userId ? 1 : 2,
        adviser_id: item.employee_id,
        op_type: '900740',
      }
      app.dialogMapData('set', 'home-orderSuccess');
    },

    cancelLogin() {
      wx.showToast({
        title: "预约失败",
        icon: "none",
        duration: 2000
      })
      this.setData({
        isShowLeavePhone: false,
      });
      app.dialogMapData('close')
    },
    clickLogin() {
      if (this.data.loginStatus) {
        this.makeOrder()
      }
    },

    makeOrder() {
      wx.showLoading({
        title: '预约中...',
      });
      var _this = this;
      order.makeOrder({
          op_type: '900740',
        },
        _this.data.loginUserInfo,
        (res) => {
          wx.hideLoading();
          _this.setData({
            isShowLeavePhone: true,
            alertContent: `您已用手机号${app.commonData.user.mobile}预约了咨询服务，稍后咨询师将来电为您解答疑问，请注意接听电话`,
            userLoginStatus: true,
          });
        }
      );
      app.dialogMapData('set', 'home-orderSuccess');
    },

    closeLeavePhone() {
      this.setData({
        isShowLeavePhone: false,
      });
      app.dialogMapData('close')
    },

    // 曝光咨询师模块
    exposureEmployee() {
      let Observer = this.createIntersectionObserver();
      Observer.relativeToViewport({
        bottom: -250,
      }).observe(`.employee-wrap`, () => {
        Observer.disconnect();
        analytic.sensors.track('e_module_exposure', {
          fromPage: 'p_home',
          fromModule: 'm_adviser',
          toPage: 'p_home',
        });
      });
    },
  }
})