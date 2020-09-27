const app = getApp();
const from_url_list = ["dipperSubPK/pages/cityReport/cityReport", "dipperSubPK/pages/singleProject/singleProject",
  "dipperSubPK/pages/multiProject/multiProject"
]
const business_type = ['cityReport', 'singleProject', 'multiProject']
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    dipperLoginFlag: {
      type: Boolean,
      value: false
    },
    order_id: {
      type: Number,
      value: ''
    },
    employee_id: {
      type: Number,
      value: ''
    },
    page: {
      type: Number,
      value: ''
    },
    business_id: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    payMoney() {
      var _this = this;
      wx.showLoading({
        title: '打赏中...'
      })
      app.request('/v1/reward/index', {
        money: 9.9,
        order_id: this.data.order_id,
        employee_id: this.data.employee_id,
        nick_name: '', // 现在没有获取用户的信息
        from_url: from_url_list[this.data.page],
        business_id: this.data.business_id,
        business_type: business_type[this.data.page]
      }).then(res => {
        var payload = res.data.res;
        payload.success = () => {
          wx.hideLoading()
          wx.showToast({
            title: '打赏成功',
            icon: 'success',
            duration: 1500,
          });
          this.triggerEvent('hostPayAward', {
            pay_state: 1
          });
        }
        payload.fail = ({
          errMsg
        }) => {
          wx.hideLoading()
          if (errMsg == 'requestPayment:fail cancel') {
            wx.showToast({
              title: '您已取消支付',
              icon: 'none'
            })
          } else {
            wx.showToast({
              title: errMsg,
              icon: 'none'
            })
          }
          this.triggerEvent('hostPayAward', {
            pay_state: 2
          });
        }
        wx.requestPayment(payload)
      }).catch(e => {
        wx.hideLoading()
        console.error(e);
      })
    }
  }
})