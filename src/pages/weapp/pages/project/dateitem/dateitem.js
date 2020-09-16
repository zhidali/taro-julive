const order = require('../../../order/order.js');
const analytic = require('../../../analytic/analytic.js');
const app = getApp();

Component({
  properties: {
    icon:{
      type:String,
      value:''
    },
    title:{
      type:String,
      value:''
    },
    content:{
      type:String,
      value:''
    },
    buttontitle:{
      type:String,
      value:''
    },
    projectId:{
      type:String,
      value:''
    },
    opType:{
      type:String,
      value:''
    },
    source:{
      type:String,
      value:''
    }
  },

  data: {
    showLoginModal: false,
    showOrderSuccessAlert: false,
    popType:1
  },

  methods: {
    didTapButton:function() {
      var toModule = '';
      if (app.commonData.user.userId) {
        this.makeOrder();
        toModule = 'm_leave_phone_success_window';
      } else {
        toModule = 'm_login_window';
        var loginTitle='';
        var loginContent = '';
        var loginButtonTitle = ''; 
        var popType = 1;
        if (this.data.opType == '900071') {
          // 专车券
          loginTitle = '免费专车';
          loginContent = "专车券将与您的手机绑定，在居理咨询师带您实地看房时可使用，专车看房不怕累！";
          loginButtonTitle = '享专车券';
          popType = 1;
        } else if (this.data.opType == '900070') {
          // 抢优惠
          loginTitle = "登录享优惠";
          loginContent = this.data.content;
          loginButtonTitle = '享优惠';
          popType = 2
        }
        this.setData({
          showLoginModal: true,
          loginTitle: loginTitle,
          loginContent: loginContent,
          loginButtonTitle: loginButtonTitle,
          popType: popType,
          loginUserInfo: {
            'op_type': this.data.opType,
            'project_id': this.data.projectId,
            'source': this.data.source
          }
        });
      }

      var analyticProperties = {
        'fromPage': analytic.page.currentPage(),
        'toPage': analytic.page.currentPage()
      }
      analyticProperties.source = this.data.source;
      analyticProperties.op_type = this.data.opType;
      analyticProperties.toModule = toModule;
      analyticProperties.fromItem = 'i_leave_phone_entry';
      analytic.sensors.track('e_click_leave_phone_entry', analyticProperties);
    },

    loginSuccessCallback() {
      this.makeOrder();
    },

    // 留电
    makeOrder() {
      var _this = this;
      wx.showLoading({
        title: '预约中...'
      });
      order.makeOrder({
        'project_id': this.data.projectId,
        'source': this.data.source,
        'op_type': this.data.opType
      }, { 
        'project_id': this.data.projectId
      }, function () {
        wx.hideLoading()
        var popType = 1;
        var alertContent = '';
        if (_this.data.opType == '900071') {
          // 专车券
          alertContent = '您已经使用' + app.commonData.user.mobile +'收获了专车券，稍后我们专业的咨询师会联系您';
          popType = 1;
        } else if (_this.data.opType == '900070') {
          // 领优惠
          alertContent = '您已经使用' + app.commonData.user.mobile +'收获了楼盘优惠，稍后我们专业的咨询师会联系您';
          popType = 2;
        } else {
          alertContent = '您已用手机号' + app.commonData.user.mobile + '预约了咨询服务，稍后咨询师将来电为您解答疑问，请注意接听电话'
        }
        _this.setData({
          showOrderSuccessAlert: true,
          alertContent: alertContent,
          popType:popType
        })
      });
    }
  }
})
