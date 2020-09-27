const autoanalysis = require('../autoanalysis/autoanalysis.js');
const wxUserInfo = require('../../../user/wxUserInfo.js');
var analytic = require('../../../analytic/analytic.js');
const app = getApp();
Page({
  data: {
    loadingHidden: false,
    dipperLoginFlag: false,
    imglist: [
      'http://imgs.julive.com/l?p=eyJpbWdfcGF0aCI6IlwvbWluaW1ncy9qdWxpdmVfbmV3X2FwcC5wbmcifQ==',
    ],
    ePageViewFlag: false,
  },
  acquireWxLogin(res) {
    this.setData({
      dipperLoginFlag: true,
    });
    wxUserInfo.getWxUserInfo(res.detail);
    autoanalysis.elementTracker(
      'employeDetails',
      {
        wechat_authorization: wxUserInfo.getNickName() ? '1' : '2',
        order_id: this.data.o_id,
        adviser_id: this.data.id,
        material_id: this.data.share_id,
      },
      3931
    );
  },
  skipOut() {
    this.setData({
      dipperLoginFlag: true,
    });
    autoanalysis.elementTracker(
      'employeDetails',
      {
        order_id: this.data.o_id,
        adviser_id: this.data.id,
        material_id: this.data.share_id,
      },
      3932
    );
  },
  getUserInfo() {
    if (wxUserInfo.getNickName()) {
      this.setData({
        dipperLoginFlag: true,
      });
    }
  },
  didTapWxCode(e) {
    let index = e.currentTarget.dataset.index;
    wx.previewImage({
      current: this.data.imglist[index], // 当前显示图片的http链接
      urls: this.data.imglist, // 需要预览的图片http链接列表
    });
    autoanalysis.elementTracker(
      'employeDetails',
      {
        order_id: this.data.o_id,
        adviser_id: this.data.id,
        material_id: this.data.share_id,
        fromItemIndex: index,
        click_type: index == 0 ? '1' : '2',
      },
      4840
    );
  },
  hostPhoneCall() {
    wx.makePhoneCall({
      phoneNumber: this.data.mobile ||  getApp().commonData.channel.phone,
    });
    autoanalysis.elementTracker(
      'employeDetails',
      {
        order_id: this.data.o_id,
        adviser_id: this.data.id,
        material_id: this.data.share_id,
      },
      4669
    );
  },
  hostShare() {},
  diaTapPhone() {
    wx.makePhoneCall({
      phoneNumber: this.data.mobile ||  getApp().commonData.channel.phone,
    });
    autoanalysis.elementTracker(
      'employeDetails',
      {
        order_id: this.data.o_id,
        adviser_id: this.data.id,
        material_id: this.data.share_id,
      },
      4668
    );
  },
  async fetchEmployeeIntroduce(share_id, type) {
    const res = await app.request('/v1/employee/introduce', {
      share_id: share_id,
      share_type: type,
    });
    let data = res.data;
    if (res.code == 1115) {
      let pathUrl = `${data.url}&share_id=${this.data.share_id}&share_type=${this.data.type}&id=${this.data.o_id}`;
      wx.showModal({
        title: '',
        content:
          '您好，咨询师目前已经不负责咨询业务啦，您可以在官网挑选其他更好的咨询师哟~',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/web/web?url=' + encodeURIComponent(pathUrl),
            });
          }
        },
      });
      return;
    }
    if (data.wx_qrcode) {
      this.data.imglist.push(data.wx_qrcode);
    }
    let clockNum = 0;
    if (data.see_num < 10) {
      clockNum++;
    }
    if (data.order_num < 10) {
      clockNum++;
    }
    if (parseInt(data.high_rate) < 95) {
      clockNum++;
    }
    let starNum = data.comment.employee_grade;
    if (starNum && starNum >= 1) {
      let starList = [];
      for (let i = 1; i < 6; i++) {
        if (i <= starNum) {
          starList.push({
            url: '/image/icon_star.png',
          });
        } else {
          starList.push({
            url: '/image/icon_srat_gray.png',
          });
        }
      }
      data.comment.starList = starList;
    }
    this.setData(
      {
        employee_name: data.employee_name,
        avatar: data.avatar,
        academy: data.academy,
        see_num: data.see_num,
        order_num: data.order_num,
        high_rate: parseFloat(data.high_rate),
        high_rate_int: parseInt(data.high_rate),
        mobile: data.mobile,
        tag: data.tag,
        introduce: data.introduce,
        qa: data.qa,
        comment: data.comment,
        employee_url: data.employee_url,
        id: data.id,
        loadingHidden: true,
        clockNum: clockNum,
        imglist: this.data.imglist,
      },
      () => {
        // 二维码 模块 m_two_dimensional_code
        this.m_two_dimensional_code = wx.createIntersectionObserver(this);
        this.m_two_dimensional_code
          .relativeToViewport('.container')
          .observe('.m_two_dimensional_code', (res) => {
            this.exposure('m_two_dimensional_code');
            this.m_two_dimensional_code.disconnect();
          });
        // 用户点评 模块
        this.m_user_comment = wx.createIntersectionObserver(this);
        this.m_user_comment
          .relativeToViewport('.container')
          .observe('.m_user_comment', (res) => {
            this.exposure('m_user_comment');
            this.m_user_comment.disconnect();
          });
        // 问答列  模块
        this.m_qa_list = wx.createIntersectionObserver(this);
        this.m_qa_list
          .relativeToViewport('.container')
          .observe('.m_qa_list', (res) => {
            this.exposure('m_qa_list');
            this.m_qa_list.disconnect();
          });
      }
    );
  },
  exposure(fromModule, param) {
    let obj = Object.assign(
      {},
      {
        order_id: this.data.o_id,
        adviser_id: this.data.id,
        material_id: this.data.share_id,
        fromModule: fromModule,
      },
      param
    );
    autoanalysis.elementTracker('employeDetails', obj, 5838);
  },
  onLoad: function (options) {
    let { o_id, share_id, type, frompage } = options;
    this.setData({
      o_id: o_id,
      share_id: share_id,
      type: type,
      fromPage: frompage,
    });
    this.fetchEmployeeIntroduce(share_id, type);
    if (wxUserInfo.getNickName()) {
      this.setData({
        dipperLoginFlag: true,
      });
    }
    wx.showShareMenu({
      withShareTicket: true,
    });
    this.analyticPageView('e_page_view');
    setTimeout(() => {
      this.data.ePageViewFlag = true;
    }, 500);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},
  onShow: function () {
    this.data.startViewTime = Date.parse(new Date());
    if (this.data.ePageViewFlag) {
      this.analyticPageView('e_page_view');
    }
  },

  onHide: function () {
    this.analyticPageView();
  },

  onUnload: function () {
    this.analyticPageView();
  },

  analyticPageView: function (eventName = 'e_page_quit') {
    // analytic
    // 以秒为单位,所以除以1000
    let analyticProperties = {};
    if (eventName != 'e_page_view') {
      var viewTime = (Date.parse(new Date()) - this.data.startViewTime) / 1000;
      analyticProperties.view_time = viewTime;
    }
    analyticProperties.fromPage = this.data.fromPage;
    analyticProperties.material_id = this.data.share_id;
    analyticProperties.adviser_id = this.data.id;
    analyticProperties.order_id = this.data.o_id;
    analyticProperties.toPage = 'p_exclusive_adviser_details';
    analytic.sensors.track(eventName, analyticProperties);
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    autoanalysis.elementTracker(
      'employeDetails',
      {
        order_id: this.data.o_id,
        adviser_id: this.data.id,
        material_id: this.data.share_id,
      },
      4838
    );
    return {
      title: '您好，这是我的名片，请惠存！',
      path: `dipperSubPK/pages/employeDetails/employeDetails?o_id=${this.data.o_id}&share_id=${this.data.share_id}&type=${this.data.type}`,
      imageUrl: '',
    };
  },
});
