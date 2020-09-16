const boyImg = '/image/placeholder_consult_avater_man.png';
const girlImg = '/image/placeholder_consult_avater_woman.png';
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
    employePhoneNumber: {
      value: '',
      type: String,
    },
    employeName: {
      value: '',
      type: String
    },
    employeImg: {
      value: '',
      type: String,
    },
    employeCode: {
      value: '',
      type: String
    },
    employeSex: {
      value: 1,
      type: Number
    },
    dipperLoginFlag: {
      value: false,
      type: Boolean
    },
    employeId: {
      value: '',
      type: String
    },
    awardImgFlag: {
      value: false,
      type: Boolean
    },
    page: {
      type: Number,
      value: ''
    },
    order_id: {
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
    coverImgError() {
      // sex 0  性别未知 默认男
      this.setData({
        employeImg: this.data.sex === 2 ? girlImg : boyImg
      })
    },
    didTapPhoneCall() {
      console.log()
      wx.makePhoneCall({
        phoneNumber: this.data.employePhoneNumber ||  getApp().commonData.channel.phone
      })
      this.triggerEvent('employeCardPhoneCall', {});
    },
    didTapEmployeCode() {
      console.log(this.data.employeCode)
      wx.previewImage({
        current: this.data.employeCode, // 当前显示图片的http链接
        urls: [this.data.employeCode] // 需要预览的图片http链接列表
      })
      this.triggerEvent('employeCardEmployeCod', {});
    },
    didTapShare() {
      this.triggerEvent('employeCardShare', {});
    },
    didTapNavigateTo() {
      this.triggerEvent('employeNavigateTo', {});
    },
    didTapPayAward() {
      var _this = this;
      wx.showLoading({
        title: '打赏中...'
      })
      console.log(this.data.page)
      app.request('/v1/reward/index', {
        money: 9.9,
        order_id: this.data.order_id,
        employee_id: this.data.employeId,
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