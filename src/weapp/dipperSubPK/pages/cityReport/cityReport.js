var WxParse = require('../../../utils/wxParse/wxParse.js');
// const enviroment = require('../../../enviroment/enviroment.js');
const bezierCurve = require('../../../utils/bezierCurve.js');
const wxUserInfo = require('../../../user/wxUserInfo.js');
const autoanalysis = require('../autoanalysis/autoanalysis.js');
const analytic = require('../../../analytic/analytic.js');
const videoControlInit = require('./videoControl.js');
const app = getApp();
Page({
  onReady: function (res) {
    this.videoContext = wx.createVideoContext('myVideo');
  },
  data: {
    dipperLoginFlag: false,
    hide_good_box: true,
    videoFullScreen: true,
    ePageViewFlag: false,
    employee: {}
  },
  acquireWxLogin(res) {
    this.setData({
      dipperLoginFlag: true,
    });
    wxUserInfo.getWxUserInfo(res.detail);
    autoanalysis.elementTracker(
      'cityReport',
      {
        wechat_authorization: wxUserInfo.getNickName() ? '1' : '2',
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
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
      'cityReport',
      {
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
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
  didClicklookMorkReferral() {
    let pathUrl = `${this.data.detailserver}&share_id=${this.data.share_id}&share_type=${this.data.type}&id=${this.data.o_id}`;
    wx.navigateTo({
      url: '/pages/web/web?url=' + pathUrl,
    });
    autoanalysis.elementTracker(
      'cityReport',
      {
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
        city_id: app.commonData.city.city_id,
        article_type: this.data.plate_id,
      },
      4026
    );
  },
  async browse(o_id, share_id, type) {
    if (!this.data.browseFlag) return;
    let res = app.request('/v1/beidou/browse', {
      user_id: app.commonData.user.userId || '',
      share_id: share_id,
      show_type: 5,
      order_id: o_id,
      nickname: wxUserInfo.getNickName(),
    });
  },
  async getCityArea(o_id, share_id, type) {
    let res = await app.request('/v1/beidou/city-area', {
      share_id: share_id,
    });
    let data = res.data;
    let _this = this;
    WxParse.wxParse('content', 'html', data.content, _this, 5);
    if (data.video_name && data.video_name.length > 20) {
      data.video_name = data.video_name.substring(0, 20) + '...';
    }
    _this.setData(
      {
        employee: data.employee || {mobile: '', id: ''},
        detailserver: data.detailserver,
        // open_id: enviroment.getOpenId(),
        open_id: app.enviroment.openId,
        title: data.title,
        loadingHidden: true,
        district_id: data.id,
        plate_id: data.category_id,
        isCollect: data.is_collect == 2 ? true : false,
        shareMessage: data.share,
        src: data.video_url,
        video_name: data.video_name,
        video_pic: data.video_pic,
        recommend_project: data.recommend_project,
      },
      () => {
        videoControlInit(_this);
        _this.analyticPageView('e_page_view');
        _this.autoExposure(_this.data.recommend_project);
        setTimeout(() => {
          _this.data.ePageViewFlag = true;
        }, 500);
      }
    );
    wx.setNavigationBarTitle({
      title: data.title,
    });
    if (data.video_url) {
      _this._observer = wx.createIntersectionObserver(_this);
      _this._observer
        .relativeToViewport('.container')
        .observe('.report-video-box', (res) => {
          if (
            res.intersectionRatio == 0 &&
            _this.data.videoData.videoPlayStatus
          ) {
            _this._didClickVideoPause();
          }
        });
    }
  },
  autoExposure(projectCardList = []) {
    if (!projectCardList) return;
    let _this = this;
    projectCardList.forEach((item, index) => {
      console.log(item);
      let observerName = `exposure${index}`;
      let className = `.exposure${index}`;
      _this[observerName] = wx.createIntersectionObserver(_this);
      console.log(observerName);
      _this[observerName]
        .relativeToViewport('.container')
        .observe(className, (res) => {
          autoanalysis.elementTracker(
            'cityReport',
            {
              order_id: _this.data.o_id,
              adviser_id: _this.data.employee.id,
              material_id: _this.data.share_id,
              city_id: app.commonData.city.city_id,
              article_type: _this.data.plate_id,
              project_id: _this.data.recommend_project[index].project_id,
              fromItemIndex: index,
            },
            5536
          );
          _this[observerName].disconnect();
        });
    });
  },
  onLoad: async function (options) {
    this.busPos = {};
    this.busPos['x'] = app.globalData.ww - 49;
    this.busPos['y'] = app.globalData.hh * 0.83;
    // 启动进入
    wx.hideShareMenu();
    this.getUserInfo();
    var scene = options.scene;
    let o_id, share_id, type;
    if (scene) {
      scene = decodeURIComponent(scene);
      var params = scene.split(',');
      share_id = params[0].split('_')[1];
      o_id = params[1].split('_')[1];
      type = params[2].split('_')[1];
    } else {
      o_id = options.o_id;
      share_id = options.share_id;
      type = 5;
    }
    // 宝典进来 或者 分享进来 进行上报  否则 不上报
    if (
      app.recordFlag.browseFlag ||
      (options.sampshare && options.sampshare.length >= 1)
    ) {
      this.data.browseFlag = true;
    }
    // 启动进入 end
    this.setData({
      share_id: share_id,
      o_id: o_id,
      type: type,
      isIpx: app.globalData.isIpx,
    });
    this.getCityArea(o_id, share_id, type);
    this.browse(o_id, share_id, type);
    wx.showShareMenu({
      withShareTicket: true,
    });
  },
  touchOnGoods: async function (e, x) {
    let { isCollect } = e.detail;
    if (isCollect) {
      bezierCurve.touchOnGoods(e, this);
      this.setData({
        isCollect: true,
      });
    } else {
      this.setData({
        isCollect: false,
      });
    }
    autoanalysis.elementTracker(
      'cityReport',
      {
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
        collection_action: isCollect ? 1 : 2,
        city_id: app.commonData.city.city_id,
        article_type: this.data.plate_id,
      },
      4029
    );
  },
  navToRecordBox() {
    wx.navigateTo({
      url: '../recordBox/recordBox',
    });
    autoanalysis.elementTracker(
      'cityReport',
      {
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
        login_state: app.commonData.user.userId ? '1' : '2',
        city_id: app.commonData.city.city_id,
        article_type: this.data.plate_id,
      },
      4031
    );
  },
  wxParseTagATap(e) {
    let src = decodeURIComponent(e.currentTarget.dataset.src);
    let pathUrl = `${src}&share_id=${this.data.share_id}&share_type=${this.data.type}&id=${this.data.o_id}`;
    wx.navigateTo({
      url: '/pages/web/web?url=' + pathUrl,
    });
  },
  hostPhoneCall() {
    wx.makePhoneCall({
      phoneNumber: this.data.employee.mobile || getApp().commonData.channel.phone,
    });
    autoanalysis.elementTracker(
      'cityReport',
      {
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
        city_id: app.commonData.city.city_id,
        article_type: this.data.plate_id,
      },
      4030
    );
  },
  hostOnShare() {
    autoanalysis.elementTracker(
      'cityReport',
      {
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
        city_id: app.commonData.city.city_id,
        article_type: this.data.plate_id,
      },
      4028
    );
  },
  onShareAppMessage: function () {
    autoanalysis.elementTracker(
      'cityReport',
      {
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
        city_id: app.commonData.city.city_id,
        article_type: this.data.plate_id,
      },
      4028
    );
    return {
      title: this.data.shareMessage.title,
      path: `dipperSubPK/pages/cityReport/cityReport?o_id=${this.data.o_id}&share_id=${this.data.share_id}&type=3`,
      imageUrl: this.data.shareMessage.img,
    };
  },
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
    // 重置
    this._unloadSendPoints();
    this._resetData();
  },

  analyticPageView: function (eventName = 'e_page_quit') {
    // analytic
    // 以秒为单位,所以除以1000
    let analyticProperties = {};
    if (eventName != 'e_page_view') {
      var viewTime = (Date.parse(new Date()) - this.data.startViewTime) / 1000;
      analyticProperties.view_time = viewTime;
    }
    analyticProperties.fromPage = 'p_knowledge_article';
    analyticProperties.toPage = 'p_knowledge_article';
    analyticProperties.article_type = this.data.plate_id;
    analyticProperties.material_id = this.data.share_id;
    analyticProperties.adviser_id = this.data.employee.id;
    analyticProperties.order_id = this.data.o_id;
    analytic.sensors.track(eventName, analyticProperties);
  },
  employeNavigateTo() {
    wx.navigateTo({
      url: `../employeDetails/employeDetails?o_id=${this.data.o_id}&share_id=${this.data.share_id}&type=${this.data.type}&frompage=p_knowledge_article`,
    });
    autoanalysis.elementTracker(
      'cityReport',
      {
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
        city_id: app.commonData.city.city_id,
        article_type: this.data.plate_id,
      },
      4653
    );
  },
  employeCardShare() {
    console.log('employeCardShare');
  },
  employeCardEmployeCod() {
    console.log('employeCardEmployeCod');
    autoanalysis.elementTracker(
      'cityReport',
      {
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
        city_id: app.commonData.city.city_id,
        article_type: this.data.plate_id,
      },
      4659
    );
  },
  employeCardPhoneCall() {
    console.log('employeCardPhoneCall');
    autoanalysis.elementTracker(
      'cityReport',
      {
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
        city_id: app.commonData.city.city_id,
        article_type: this.data.plate_id,
      },
      4656
    );
  },
  hostDownApp() {
    autoanalysis.elementTracker(
      'cityReport',
      {
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
        city_id: app.commonData.city.city_id,
        article_type: this.data.plate_id,
      },
      4833
    );
    console.log('hostDownApp');
  },
  hostPayAward(e) {
    let pay_state = e.detail.pay_state;
    autoanalysis.elementTracker(
      'cityReport',
      {
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
        city_id: app.commonData.city.city_id,
        article_type: this.data.plate_id,
        pay_state: pay_state,
      },
      4666
    );
  },
  didClickSkipProject(e) {
    let { id, index } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/project/detail/projectDetail?projectId=${id}`,
    });
    autoanalysis.elementTracker(
      'cityReport',
      {
        order_id: this.data.o_id,
        adviser_id: this.data.employee.id,
        material_id: this.data.share_id,
        city_id: app.commonData.city.city_id,
        article_type: this.data.plate_id,
        project_id: id,
        fromItemIndex: index,
      },
      5537
    );
  },
  // didClickProjectUnfold(e) {
  //   let index = e.currentTarget.dataset.index
  //   let item = this.data.recommend_project[index]
  //   let contentSummaryShow = `recommend_project[${index}].show_project_desc`
  //   let contentSummaryFlag = `recommend_project[${index}].descFlag`
  //   if (item.descFlag) {
  //     this.setData({
  //       [contentSummaryShow]: item.project_desc,
  //       [contentSummaryFlag]: false,
  //       posiTop:0
  //     })
  //   } else {
  //     this.setData({
  //       [contentSummaryShow]: item.project_desc_short,
  //       [contentSummaryFlag]: true,
  //       posiTop: 0
  //     })
  //   }
  // }
});
