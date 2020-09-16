const app = getApp();
const WxParse = require('../../../utils/wxParse/wxParse.js');
const tool = require('../../../utils/util.js');
const order = require('../../../order/order.js');
const location = require('../../../location/location.js');
const route = require('../../../route/route.js');
const analytic = require('../../../analytic/analytic.js');
const bmksearch = require('../../../utils/bmksearch/bmksearch.js');
const coordtransform = require('../../../utils/coordtransform.js');
const util = require('../utils/util.js');
const notification = require('../../../utils/notification.js');
const reportPerformance = require('../../../reportPerformance/reportPerformance');

import Card from './palette/projectDetailPalette';

let subscribe_type = '';
let toastTimer = '';

Page({
  data: {
    projectId: '',
    info: {},
    qa: {},
    specialCar: '',
    imageList: {},
    recommendList: [],
    juliveServiceUrl: '',
    curImageIndex: 1,
    screenWidth: 375,
    expandItemList: [],
    isPageShow: true,
    isIpx: app.globalData.isIpx,
    isIos: app.globalData.isIos,
    currentBannerIndex: 0,
    optionsList: [
      {
        tag: '交通',
        icon: '../../../image/icon_map_traffic.png',
        key: 'traffic',
      },
      {
        tag: '生活',
        icon: '../../../image/icon_map_life.png',
        key: 'life',
      },
      {
        tag: '医疗',
        icon: '../../../image/icon_map_medical.png',
        key: 'hospital',
      },
      {
        tag: '学校',
        icon: '../../../image/icon_map_school.png',
        key: 'school',
      },
    ],
    markers: [],
    popType: 1,
    contactOptype: '900069',
    animationData: {},
    contentTxt:
      '带有“安全购”标识的楼盘享受低价保障、五证齐全、维权协助三项保障，保障您的购房权益！',
    ePageViewFlag: false,
    is_Pay_info: false, //是否是优惠楼盘
    isLike: '',
    subscribeFlag: false,
    imagePath: '',
    painterSuccess: '',
    discountTip: false,
    loadImageNum: 2, //默认加载的图片数量
  },

  analyticPageView: function (eventName = 'e_page_quit') {
    var analyticProperties = this.analyticProperties();
    if (eventName != 'e_page_view') {
      var viewTime = (Date.parse(new Date()) - this.data.startViewTime) / 1000;
      analyticProperties.view_time = viewTime;
    }
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.project_name = this.data.info.name;
    analytic.sensors.track(eventName, analyticProperties);
  },

  analyticProperties: function () {
    return {
      fromPage: 'p_project_details',
      project_id: this.data.projectId,
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
    this.setData({
      isPageShow: false,
    });
  },

  /* 问题1  一共有几个投放的页面
  1.查看 代码options.scene 然后 看看那些是分包 就知道 有多少个是生成二维码 投放的
  2.让测试 弄二维码 然后通过ide 扫描进入  看看是否正常
  问题2 扫描二维码 进入的时候 要查看  scene  之外 还有别的参数吗 
  1.scene 带入跳转中   url?scene= api.scene
   */

  onLoad: function (options) {
    reportPerformance.setInitTime(2003);
    let projectId = '';
    let _this = this;
    if (options && options.q) {
      var url = decodeURIComponent(options.q);
      var query = tool.parseQueryString(url);
      if (query) {
        projectId = query.project_id;
      }
    } else if (options.projectId) {
      projectId = options.projectId;
    } else if (options.scene) {
      let scene = decodeURIComponent(options.scene);
      let params = scene.split(',');
      let id = params[0].split('_')[1];
      projectId = id;
      params.forEach(function (item) {
        if (item.indexOf('e_') != -1 && item.split('_')[1] == 1) {
          wx.makePhoneCall({
            phoneNumber: getApp().commonData.channel.phone,
            fail(res) {
              console.log('拨打电话失败', res);
            },
          });
          return;
        }
      });
    }
    var screenWidth = wx.getSystemInfoSync().windowWidth;
    if (screenWidth == 0) {
      screenWidth = 375;
    }
    if (projectId != null && projectId.length > 0) {
      this.setData({
        projectId: projectId,
        screenWidth: screenWidth,
        loadingHidden: false,
        userInfo: {
          project_id: projectId,
        },
      });
      this.fetchProjectImages();
      this.fetchProjectDetail();
    }
    wx.showShareMenu({
      withShareTicket: true,
    });
    this.analyticPageView('e_page_view');
    setTimeout(() => {
      _this.data.ePageViewFlag = true;
    }, 500);
  },

  fetchProjectImages: function () {
    var _this = this;
    app
      .request('/v1/project/image', {
        project_id: _this.data.projectId,
      })
      .then((d) => {
        var imageList = [];
        var data = d.data;
        var list = data.list;
        if (list == undefined) return;
        for (var index = 0; index < list.length; index++) {
          var model = list[index];
          var images = model.img_list;
          for (var i = 0; i < images.length; i++) {
            imageList = imageList.concat(images[i].url);
          }
        }
        _this.setData({
          imageList: imageList,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  },
  fetchProjectDetail: function () {
    var _this = this;
    app
      .request('/v1/project/index', {
        project_id: _this.data.projectId,
      })
      .then((d) => {
        var data = d.data;
        var info = data.info;
        if (info.lat && info.lng) {
          let pointObj = coordtransform.bd09togcj02(info.lng, info.lat);
          info.lng = pointObj.lng;
          info.lat = pointObj.lat;
        }
        // 和当前城市不是一个，切换城市
        if (
          info.city_info != undefined ||
          JSON.stringify(info.city_info) !== '{}'
        ) {
          if (info.city_info.city_id != app.commonData.city.city_id) {
            app.commonData.city = info.city_info;
            location.cityChanged(info.city_info)
          }
        }

        var _expandItemList = [];
        if (!tool.isEmptyObject(info)) {
          _expandItemList.push({
            title: '主推户型',
            value: info.main_room_type.join(' '),
          });
          _expandItemList.push({
            title: '开&nbsp;发&nbsp;商&nbsp;',
            value: info.developer,
          });
          _expandItemList.push({
            title: '入住时间',
            value: info.come_in_time,
          });
          _expandItemList.push({
            title: '交房时间',
            value: info.live_date,
          });
          _expandItemList.push({
            title: '产权年限',
            value: info.property_right,
          });
          _expandItemList.push({
            title: '物业公司',
            value: info.property_services,
          });
          _expandItemList.push({
            title: '物&nbsp;业&nbsp;费&nbsp;',
            value:
              info.manage_fee == 0 || info.manage_fee.length == 0
                ? '待补充'
                : info.manage_fee + '元／m²＊月',
          });
          _expandItemList.push({
            title: '供&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;暖',
            value: info.heating,
          });
          _expandItemList.push({
            title: '水&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;电',
            value: info.water_electricity,
          });
          _expandItemList.push({
            title: '车&nbsp;位&nbsp;比&nbsp;',
            value: info.car_space,
          });
          _expandItemList.push({
            title: '装&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;修',
            value: info.decorate,
          });
          _expandItemList.push({
            title: '类&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;型',
            value: info.project_type.name,
          });
          _expandItemList.push({
            title: '容&nbsp;积&nbsp;率&nbsp;',
            value: info.far,
          });
          _expandItemList.push({
            title: '绿&nbsp;化&nbsp;率&nbsp;',
            value: info.greening,
          });

          if (data.license && data.license.license_desc) {
            _expandItemList.push({
              title: '预&nbsp;售&nbsp;证&nbsp;',
              value: data.license.license_desc.value || '待补充',
            });
          }

          if (!tool.isEmptyObject(info.review)) {
            // 非空对象
            info.review.isExpand = false;
            info.review.fromModule = '1'; //咨询师点评模块
          }

          if (!tool.isEmptyObject(areaReview)) {
            areaReview.isExpand = false;
            areaReview.fromModule = '2'; //区域点评模块
          }
        }

        if (_this.data.isPageShow) {
          wx.setNavigationBarTitle({
            title: info.name,
          });
        }

        var _subscribeList = [];
        if (
          data.special_car != undefined &&
          data.special_car.txt != undefined &&
          data.special_car.txt.length > 0
        ) {
          var contactOptype = '900069';
          if (info.pay_info) {
            this.setData({
              is_Pay_info: true,
            });

            contactOptype = '900132';
            if (info.pay_info.length > 15) {
              info.pay_info = info.pay_info.slice(0, 15) + '…';
            }
            _subscribeList.push({
              title: '楼盘优惠',
              content: info.pay_info,
              icon:
                'http://imgs.julive.com/l?p=eyJpbWdfcGF0aCI6IlwvbWluaW1ncy9iYW5uZXJfYmFjazEucG5nIn0gICA=',
              type: 0,
              btn: '领优惠',
            });
          }

          if (data.special_car.txt.length > 15) {
            info.pay_info = data.special_car.txt.slice(0, 15) + '…';
          }
          _subscribeList.push({
            title: this.data.is_Pay_info == true ? '居理专车看房' : '专车看房',
            content: data.special_car.txt,
            icon: '../../../image/banner_back2.png',
            type: 1,
            btn: '立即预约',
          });
        }
        if (data.group.length > 0) {
          _subscribeList.push({
            title: '群聊',
            content: '',
            icon: data.group[0].img,
            type: 2,
            url: data.group[0].url,
            id: data.group[0].id,
          });
        }

        var qa = data.qa;
        if (qa !== undefined && qa.qa_list.length > 0) {
          var oneQa = qa.qa_list[0];
          var answer =
            oneQa.answer_list.length > 0 ? oneQa.answer_list[0].answer : {};
          WxParse.wxParse('content', 'html', answer.content, _this);
          var content = tool.parseContent(_this.data.content);
          answer.content = content;
        }

        var isFavorite = false;
        if (info.is_favorite != undefined && info.is_favorite == 2) {
          isFavorite = true;
        }

        var areaReview = {};
        if (
          data.area_review != undefined &&
          data.area_review.bench_employee_info != undefined
        ) {
          areaReview = data.area_review;
          areaReview.employee_info = data.area_review.bench_employee_info;
        }

        bmksearch.search(info.lat, info.lng, function (res) {
          var values = [];
          var trafficResult = [];
          _this.data.optionsList.forEach((item) => {
            var option = item.key;
            var mapresult = res[option];
            if (option == 'traffic') {
              trafficResult = mapresult.wxMarkerData;
            }
            item.resultCount =
              mapresult.wxMarkerData.length > 0
                ? mapresult.wxMarkerData.length - 1
                : 0;
            values.push(item);
          });
          _this.setData({
            optionsList: values,
            markers: trafficResult,
          });
        });

        if (data.security && data.security.detail.length > 0) {
          data.security.detail.forEach((item, index) => {
            item.textList = item.desc.split('\n');
            if (index == 0) {
              item.flag = true;
              data.security.btn_txt = item.button_text;
              data.security.text_top = item.textList[0] ? item.textList[0] : '';
              data.security.text_btm = item.textList[1] ? item.textList[1] : '';
              data.security.record = '0';
            } else {
              item.flag = false;
            }
          });
        }
        _this.setData(
          {
            info: info,
            specialCar: data.special_car ? data.special_car.txt : '',
            qa: data.qa || {
              total: 0,
            },
            recommendList: data.see_other,
            expandItemList: _expandItemList,
            juliveServiceUrl: data.juli_service_url
              ? data.juli_service_url
              : '',
            loadingHidden: true,
            subscribeList: _subscribeList,
            isFavorite: isFavorite,
            areaReview: areaReview,
            contactOptype: contactOptype,
            security: data.security || '',
            isLike: info.check_favorite == 1 ? true : false,
          },
          () => {
            // 上报给微信页面加载+请求后渲染时长
            reportPerformance.sendMsg(2003, true);
          }
        );
        _this.moveTranslate();
      })
      .catch((error) => {
        console.log(error);
      });
  },

  moveTranslate: function () {
    this.setData({
      slideup: true,
      slidedown: false,
    });
    toastTimer = setTimeout(
      function () {
        this.setData({
          slideup: false,
          slidedown: true,
        });
      }.bind(this),
      3500
    );
  },

  clickCloseAnimation: function () {
    this.setData({
      slideup: false,
      slidedown: true,
    });

    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.fromModule = 'm_bottom';
    analyticProperties.project_id = this.data.projectId;
    analyticProperties.fromItem = 'i_project_bottom_popup_close';
    analytic.sensors.track(
      'e_click_project_bottom_popup_close',
      analyticProperties
    );
  },

  didSwiperSlideImage: function (e) {
    var index = e.currentTarget.dataset.index;
    let _num = index < 1 ? 2 : 2 + parseInt(index / 2) * 2;

    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.fromModule = 'm_project_info';
    if (this.data.info.review.id) {
      analyticProperties.comment_id = this.data.info.review.id;
    }
    if (this.data.info.review.employee_info) {
      analyticProperties.adviser_id = this.data.info.review.employee_info.employee_id;
    }
    analyticProperties.img_url = this.data.imageList[index];
    analyticProperties.fromItemIndex = String(index);
    analytic.sensors.track('e_slide_project_picture', analyticProperties);

    this.setData({
      curImageIndex: e.detail.current + 1,
      loadImageNum: _num,
    });
  },

  attentionSuccessCallback: function (e) {
    var isFavorite = e.detail.status == '1';
    this.setData({
      isFavorite: isFavorite,
    });
  },

  didTapSlideImage: function (e) {
    var index = e.currentTarget.dataset.index;
    wx.previewImage({
      urls: this.data.imageList,
      current: this.data.imageList[index],
    });
    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.fromModule = 'm_project_info';
    if (this.data.info.review.id) {
      analyticProperties.comment_id = this.data.info.review.id;
    }
    if (this.data.info.review.employee_info) {
      analyticProperties.adviser_id = this.data.info.review.employee_info.employee_id;
    }
    analyticProperties.img_url = this.data.imageList[index];
    analyticProperties.fromItemIndex = String(index);
    analyticProperties.fromItem = 'i_zoom_in_picture';
    analytic.sensors.track('e_click_zoom_in_picture', analyticProperties);
  },

  didClickNearbyMap: function (e) {
    wx.navigateTo({
      url:
        '/nearbySubPK/pages/nearbyMap/nearbyMap?projectId=' +
        this.data.projectId +
        '&lat=' +
        this.data.info.lat +
        '&lng=' +
        this.data.info.lng +
        '&address=' +
        this.data.info.address +
        '&projectName=' +
        this.data.info.name,
    });

    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = 'p_surrounding_analysis';
    analyticProperties.fromModule = 'm_project_info';
    analyticProperties.project_id = this.data.projectId;
    analyticProperties.fromItem = 'i_project_address';
    analytic.sensors.track('e_click_project_address', analyticProperties);
  },

  didClickExpandView: function (e) {
    var analyticProperties = this.analyticProperties();
    var event = 'e_click_unfold';
    var fromItem = 'i_unfold';
    if (this.data.isExpand) {
      event = 'e_click_fold';
      fromItem = 'i_fold';
    }
    if (this.data.info.review.id) {
      analyticProperties.comment_id = this.data.info.review.id;
    }
    if (this.data.info.review.employee_info) {
      analyticProperties.adviser_id = this.data.info.review.employee_info.employee_id;
    }
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.fromItem = fromItem;
    analyticProperties.fromModule = 'm_project_info';
    analytic.sensors.track(event, analyticProperties);

    this.setData({
      isExpand: !this.data.isExpand,
    });
  },

  //变价通知-----添加subscribeFlag
  didTapChangePriceView: function () {
    this.setData({
      loginUserInfo: {
        op_type: '900135',
        project_id: this.data.projectId,
      },
    });
    var toModule = '';
    let _this = this;
    subscribe_type = 6;
    if (app.commonData.user.userId) {
      _this.getTemplateIds(function (ids) {
        wx.requestSubscribeMessage({
          tmplIds: ids,
          success(res) {
            _this.didSubscribeAnalytic(res, ids);
            toModule = 'm_leave_phone_success_window';
            app
              .request('/v1/user/add-sub-type', {
                obj_id: _this.data.projectId,
                sub_type: '3',
                status: '1',
              })
              .then((d) => {});
          },
          fail() {
            _this.makeOrder();
          },
        });
      });
    } else {
      toModule = 'm_login_window';
      this.setData({
        showLoginModal: true,
        loginTitle: '订阅价格变动通知',
        loginContent:
          '价格变动这么快？！一键订阅，涨价降价第一时间通知您，帮您找准买房时机！',
        loginButtonTitle: '确认',
        popType: 1,
        subscribeFlag: true,
      });
    }
    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.fromPage = analyticProperties.fromPage;
    analyticProperties.op_type = '900135';
    analyticProperties.toModule = toModule;
    analyticProperties.fromModule = 'm_project_info';
    analyticProperties.fromItem = 'i_leave_phone_entry';
    analyticProperties.fromItemIndex = '1';
    analyticProperties.login_state = app.commonData.user.userId ? '1' : '2';
    analyticProperties.project_id = this.data.projectId;
    analytic.sensors.track('e_click_leave_phone_entry', analyticProperties);
  },

  didTapOpenTimeView: function () {
    let _this = this;
    _this.setData({
      loginUserInfo: {
        op_type: '900133',
        project_id: this.data.projectId,
      },
    });
    var toModule = '';
    subscribe_type = 5;
    if (app.commonData.user.userId) {
      _this.getTemplateIds(function (ids) {
        wx.requestSubscribeMessage({
          tmplIds: ids,
          success(res) {
            _this.didSubscribeAnalytic(res, ids);
            toModule = 'm_leave_phone_success_window';
            app
              .request('/v1/user/add-sub-type', {
                obj_id: _this.data.projectId,
                sub_type: '4',
                status: '1',
              })
              .then((d) => {});
          },
          fail() {
            _this.makeOrder();
          },
        });
      });
    } else {
      toModule = 'm_login_window';
      this.setData({
        showLoginModal: true,
        loginTitle: '获取开盘通知',
        loginContent: '楼盘总是悄无声息的开盘？一键订阅，让您抢占买房先机！',
        loginButtonTitle: '确认',
        popType: 1,
        subscribeFlag: true,
      });
    }
    var analyticProperties = this.analyticProperties();
    analyticProperties.fromPage = analyticProperties.fromPage;
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.op_type = '900133';
    analyticProperties.toModule = toModule;
    analyticProperties.fromModule = 'm_project_info';
    analyticProperties.fromItem = 'i_leave_phone_entry';
    analyticProperties.fromItemIndex = '0';
    analyticProperties.project_id = this.data.projectId;
    analyticProperties.login_state = app.commonData.user.userId ? '1' : '2';
    analytic.sensors.track('e_click_leave_phone_entry', analyticProperties);
  },

  onBannerSwiperChange: function (e) {
    this.setData({
      currentBannerIndex: e.detail.current,
    });
  },

  didTapDiscountBanenr: function (e) {
    var item = e.currentTarget.dataset.item;
    if (item.type == 2) {
      if (item.url.length > 0) {
        route.transfer(item.url);
      }
      var analyticProperties = this.analyticProperties();
      analyticProperties.fromItem = 'i_banner';
      analyticProperties.to_url = item.url;
      analyticProperties.banner_id = item.id;
      analyticProperties.fromModule = 'm_service';
      analyticProperties.fromItemIndex = this.data.subscribeList.length - 1;
      analytic.sensors.track('e_click_banner', analyticProperties);
    } else {
      var op_type = '900070';
      if (item.type == 1) {
        op_type = '900071';
      }
      this.setData({
        loginUserInfo: {
          op_type: op_type,
          project_id: this.data.projectId,
        },
        subscribeFlag: false,
      });
      var toModule = '';
      if (app.commonData.user.userId) {
        let type = 1;
        let flag = false;
        if (item.type == 0) {
          type = 2;
        } else if (item.type === 1) {
          flag = true;
        }
        this.makeOrder(type, flag);
        toModule = 'm_leave_phone_success_window';
      } else {
        toModule = 'm_login_window';
        var loginTitle = '悦享优惠';
        var loginContent = this.data.info.pay_info;
        var loginButtonTitle = '享优惠';
        var popType = 2;
        let contentDown = '';
        if (item.type == 1) {
          loginTitle = '免费专车看房';
          loginContent = '公交太累，打车太贵，看房团还要等位';
          contentDown =
            '居理全程0元1对1专车看房，人均节省827元路费，全城好房一趟看完';
          loginButtonTitle = '确认';
          popType = 1;
        }
        this.setData({
          showLoginModal: true,
          loginTitle: loginTitle,
          loginContent: loginContent,
          loginButtonTitle: loginButtonTitle,
          popType: popType,
          loginContentDown: contentDown,
        });
      }
      var analyticProperties = this.analyticProperties();
      analyticProperties.toPage = analyticProperties.fromPage;
      analyticProperties.op_type = op_type;
      analyticProperties.toModule = toModule;
      analyticProperties.fromItem = 'i_leave_phone_entry';
      analytic.sensors.track('e_click_leave_phone_entry', analyticProperties);
    }
  },

  // onEvaluationSwiperChange: function(e) {
  //   this.setData({
  //     currentEvaluationIndex: e.detail.current
  //   });
  // },

  didTapProjectCellView: function (e) {
    var opType = e.currentTarget.dataset.opType;

    let _id = e.currentTarget.dataset.id;
    if (getApp().abTest.minprogram_version == 'B') {
      wx.navigateTo({
        url: `/pages/web/web?url=${getApp().commonData.m_domain_project}${_id}.html`
      });
    } else {
      wx.navigateTo({
        url: '../detail/projectDetail?projectId=' + _id,
      });
    }
    var analyticProperties = this.analyticProperties();
    var index = e.currentTarget.dataset.index;
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.fromModule = 'm_project_recommend';
    analyticProperties.fromItem = 'i_project_card';
    analyticProperties.fromItemIndex = String(index);
    analyticProperties.to_project_id = e.currentTarget.dataset.id;
    analytic.sensors.track('e_click_project_card', analyticProperties);
  },

  didTapDynamicList: function () {
    wx.navigateTo({
      url:
        '/dynamicSubPK/pages/list/dynamicList?projectId=' +
        this.data.projectId +
        '&projectName=' +
        this.data.info.name,
    });

    var analyticProperties = this.analyticProperties();
    analyticProperties.fromModule = 'm_project_dynamic_list';
    analyticProperties.fromItem = 'i_view_dynamic';
    analyticProperties.toPage = 'p_project_dynamic';
    analytic.sensors.track('e_click_view_dynamic', analyticProperties);
  },

  didTapDynamicItem: function (e) {
    var dynamic = e.currentTarget.dataset.dynamic;
    if (e.target.id == 'image-container') return;
    wx.navigateTo({
      url:
        '/dynamicSubPK/pages/detail/dynamicDetail?projectId=' +
        this.data.projectId +
        '&dynamicId=' +
        dynamic.id +
        '&type=' +
        dynamic.type +
        '&projectName=' +
        this.data.info.name,
    });

    var analyticProperties = this.analyticProperties();
    analyticProperties.fromModule = 'm_project_dynamic_list';
    analyticProperties.fromItem = 'i_project_dynamic_card';
    analyticProperties.toPage = 'p_project_dynamic_details';
    analyticProperties.project_dynamic_id = dynamic.id;
    analytic.sensors.track('e_click_project_dynamic_card', analyticProperties);
  },

  didTapHouseTypeListView: function (e) {
    wx.navigateTo({
      url:
        '/houseTypeSubPK/pages/list/houseTypeList?projectId=' +
        this.data.projectId +
        '&projectName=' +
        this.data.info.name,
    });

    var analyticProperties = this.analyticProperties();
    analyticProperties.fromModule = 'm_view_more';
    analyticProperties.fromItem = 'i_house_type_list_entry';
    analyticProperties.toPage = 'p_house_type_list';
    analytic.sensors.track('e_click_house_type_list_entry', analyticProperties);
  },

  didNearByAnalyticView: function (e) {
    wx.navigateTo({
      url:
        '/nearbySubPK/pages/nearbyAnalytic/nearbyAnalytic?projectId=' +
        this.data.projectId,
    });

    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = 'p_surrounding_analysis';
    analyticProperties.project_id = this.data.projectId;
    analyticProperties.fromModule = 'm_surrounding_analysis';
    analyticProperties.fromItem = 'i_surrounding_analysis_entry';
    analyticProperties.periphery_type = '2';
    analytic.sensors.track(
      'e_click_surrounding_analysis_entry',
      analyticProperties
    );
  },

  didTapMap: function () {
    wx.navigateTo({
      url:
        '/nearbySubPK/pages/nearbyMap/nearbyMap?projectId=' +
        this.data.projectId +
        '&lat=' +
        this.data.info.lat +
        '&lng=' +
        this.data.info.lng +
        '&address=' +
        this.data.info.address +
        '&projectName=' +
        this.data.info.name,
    });

    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = 'p_surrounding_analysis_map';
    analyticProperties.project_id = this.data.projectId;
    analyticProperties.fromModule = 'm_surrounding_analysis';
    analyticProperties.fromItem = 'i_map';
    analytic.sensors.track('e_click_map', analyticProperties);
  },

  didTapOption: function (e) {
    var index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url:
        '/nearbySubPK/pages/nearbyAnalytic/nearbyAnalytic?projectId=' +
        this.data.projectId +
        '&index=' +
        index,
    });

    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = 'p_surrounding_analysis';
    analyticProperties.project_id = this.data.projectId;
    analyticProperties.fromModule = 'm_surrounding_analysis';
    analyticProperties.fromItem = 'i_surrounding_analysis_entry';
    analyticProperties.periphery_type = String(index + 2);
    analytic.sensors.track(
      'e_click_surrounding_analysis_tag',
      analyticProperties
    );
  },

  didTapHouseTypeCell: function (e) {
    var houseType = e.currentTarget.dataset.houseType;
    var index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url:
        '/houseTypeSubPK/pages/detail/houseTypeDetail?houseId=' +
        houseType.house_type_id,
    });

    var analyticProperties = this.analyticProperties();
    analyticProperties.fromModule = 'm_house_type';
    analyticProperties.fromItem = 'i_house_type_card';
    analyticProperties.toPage = 'p_house_type_details';
    analyticProperties.fromItemIndex = String(index);
    analyticProperties.house_type_id = houseType.house_type_id;
    analytic.sensors.track('e_click_house_type_card', analyticProperties);
  },

  didTapQaListView: function (e) {
    wx.navigateTo({
      url: '/pages/information/information?projectId=' + this.data.projectId,
    });
    var analyticProperties = this.analyticProperties();
    analyticProperties.fromModule = 'm_qa_card';
    analyticProperties.fromItem = 'i_project_qa_entry';
    analyticProperties.toPage = 'p_project_qa';
    analyticProperties.project_id = this.data.projectId;
    analytic.sensors.track('e_click_project_qa_entry', analyticProperties);
  },

  didTapQaCell: function (e) {
    var qa = e.currentTarget.dataset.qa;
    wx.navigateTo({
      url:
        '/questionRelateSubPK/pages/detail/questionDetail?projectId=' +
        this.data.projectId +
        '&qaId=' +
        qa.question.id,
    });

    var analyticProperties = this.analyticProperties();
    analyticProperties.fromModule = 'm_qa_card';
    analyticProperties.fromItem = 'i_question_card';
    analyticProperties.toPage = 'p_qa_details';
    if (qa.question.id) {
      analyticProperties.question_id = [qa.question.id];
    }
    var answer = qa.answer_list.length > 0 ? qa.answer_list[0].answer : {};
    analyticProperties.answer_id = answer.id;
    analyticProperties.project_id = this.data.projectId;
    analytic.sensors.track('e_click_question_card', analyticProperties);
  },

  didTapAskButton: function (e) {
    wx.navigateTo({
      url: '/questionRelateSubPK/pages/ask/questionAsk?op_type=' + '900211',
    });
    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = 'p_ask_someone';
    analyticProperties.fromModule = 'm_qa_card';
    analyticProperties.fromItem = 'i_ask';
    analyticProperties.project_id = this.data.projectId;
    analytic.sensors.track('e_click_ask', analyticProperties);
  },

  didTapEmployeeReviewExpand: function (e) {
    var review = e.currentTarget.dataset.review;
    // 当前是展开状态，即‘点击收起’
    let analyticProperties = this.analyticProperties();
    if (review.isExpand) {
      analytic.sensors.track('e_click_fold', {
        fromPage: analyticProperties.fromPage,
        toPage: analyticProperties.fromPage,
        fromModule:
          review.fromModule == '1'
            ? 'm_adviser_comment'
            : 'm_surrounding_analysis',
        fromItem: 'i_fold',
        adviser_id: review.employee_info.employee_id,
        comment_id: review.id,
        project_id: review.project_id ? review.project_id : this.data.projectId,
      });
    } else {
      // ‘点击展开’
      analytic.sensors.track('e_click_unfold', {
        fromPage: analyticProperties.fromPage,
        toPage: analyticProperties.fromPage,
        fromModule:
          review.fromModule == '1'
            ? 'm_adviser_comment'
            : 'm_surrounding_analysis',
        fromItem: 'i_unfold',
        adviser_id: review.employee_info.employee_id,
        comment_id: review.id,
        project_id: review.project_id ? review.project_id : this.data.projectId,
      });
    }

    review.isExpand = !review.isExpand;
    if (review.fromModule == '1') {
      this.data.info.review = review;
      this.setData({
        info: this.data.info,
      });
    } else {
      this.setData({
        areaReview: review,
      });
    }
  },

  didClickEmployeeReview: function () {
    wx.navigateTo({
      url:
        '/otherRelateSubPK/pages/employee/employeeReviewList?projectId=' +
        this.data.projectId,
    });
    var analyticProperties = this.analyticProperties();
    analyticProperties.fromModule = 'm_adviser_comment';
    analyticProperties.fromItem = 'i_project_comment_entry';
    analyticProperties.toPage = 'p_project_adviser_comment';
    analyticProperties.adviser_id = this.data.info.review.employee_info.employee_id;
    analytic.sensors.track('e_click_adviser_comment_entry', analyticProperties);
  },

  didTapPreviewImage: function (e) {
    var images = e.currentTarget.dataset.images;
    var index = e.currentTarget.dataset.imageIndex;
    wx.previewImage({
      urls: images,
      current: images[index],
    });
  },

  didTapConsultButton: function (e) {
    var employeeId = e.currentTarget.dataset.employeeId;
    var review = e.currentTarget.dataset.review;
    var toModule = '';
    this.setData({
      loginUserInfo: {
        op_type: review.fromModule == '1' ? '900076' : '900131',
        project_id: this.data.projectId,
        adviser_id: employeeId,
      },
      subscribeFlag: false,
    });
    if (app.commonData.user.userId) {
      this.makeOrder();
      toModule = 'm_leave_phone_success_window';
    } else {
      this.setData({
        showLoginModal: true,
        loginTitle: '请先登录',
        loginContent: '登录后将提供给你更个性化的服务',
        loginButtonTitle: '确认',
        popType: 1,
      });
      toModule = 'm_login_window';
    }

    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.op_type = review.fromModule == '1' ? '900076' : '900131';
    analyticProperties.adviser_id = employeeId;
    analyticProperties.toModule = toModule;
    analyticProperties.fromModule =
      review.fromModule == '1' ? 'm_adviser_comment' : 'm_surrounding_analysis';
    analyticProperties.fromItem = 'i_leave_phone_entry';
    analytic.sensors.track('e_click_leave_phone_entry', analyticProperties);
  },

  didClickBrandItem: function () {
    route.transfer(this.data.juliveServiceUrl);

    var analyticProperties = this.analyticProperties();
    analyticProperties.to_url = this.data.juliveServiceUrl;
    analyticProperties.toPage = 'p_weview';
    analyticProperties.fromItem = 'i_julive_service_introduction';
    analytic.sensors.track(
      'e_click_julive_service_introduction',
      analyticProperties
    );
  },

  loginSuccessCallback: function (e) {
    // 详情页 点击收藏 未登陆的用户 返回没有操作
    if (e == undefined) return;
    let type = 1;
    if (e && !!e.detail.popType && e.detail.popType === '2') {
      type = 2;
    }
    let _this = this;
    _this.setData({
      showLoginModal: false,
    });
    if (_this.data.subscribeFlag == true) {
      _this.getTemplateIds(function (ids) {
        wx.requestSubscribeMessage({
          tmplIds: ids,
          success(res) {
            if (res[ids] == 'accept') {
              _this.addSubscribe();
              _this.makeOrder(type);
            } else {
              _this.makeOrder(type, false, false);
            }
          },
        });
      });
    } else {
      _this.makeOrder(type);
    }
  },

  cancelCallback: function () {
    this.setData({
      showLoginModal: false,
      showContact: false,
      showAlert: false,
    });
  },

  showLoginCallback: function () {
    this.setData({
      showContact: true,
    });
  },

  showAlertCallback: function () {
    this.setData({
      showAlert: true,
    });
  },

  //noConfirmPop：取消订阅的时候 不弹窗 有确认留电
  makeOrder: function (type = 1, flag = false, noConfirmPop) {
    if (noConfirmPop !== false) {
      wx.showLoading({
        title: '预约中...',
      });
    }
    var _this = this;
    order.makeOrder(
      {
        project_id: this.data.projectId,
        op_type: _this.data.loginUserInfo.op_type,
      },
      _this.data.loginUserInfo,
      function () {
        wx.hideLoading();
        var alertTitle = '预约成功';
        if (_this.data.loginUserInfo.op_type == '900070') {
          alertTitle = '优惠到手';
        }
        let text = flag ? '安排看房行程' : '解答疑问';
        let _state = noConfirmPop !== false ? true : false;
        _this.setData({
          showOrderSuccessAlert: _state,
          popType: type,
          alertTitle: alertTitle,
          alertContent: `您已用手机号${app.commonData.user.mobile}预约了咨询服务，稍后咨询师将来电为您${text}，请注意接听电话`,
        });
      }
    );
  },

  onShareAppMessage: function () {
    var _this = this;
    return {
      title: this.data.info.name,
      path:
        'pages/project/detail/projectDetail?projectId=' + this.data.projectId,
      complete(res) {
        // share result
        var transpond_result = '2';
        if (res.errMsg === 'shareAppMessage:ok') {
          transpond_result = '1';
        }
        // share type
        var transpond_differentiate = '1';
        if (res.shareTickets && res.shareTickets.length > 0) {
          transpond_differentiate = '2';
        }

        var analyticProperties = _this.analyticProperties();
        analyticProperties.fromItem = 'i_transpond';
        analyticProperties.transpond_result = transpond_result;
        analyticProperties.transpond_differentiate = transpond_differentiate;
        analytic.sensors.track('e_click_transpond', analyticProperties);
      },
    };
  },
  didTapDynamicChange() {
    let _this = this;
    this.setData({
      loginUserInfo: {
        op_type: '900210',
        project_id: this.data.projectId,
      },
    });
    subscribe_type = 4;
    if (app.commonData.user.userId) {
      _this.getTemplateIds(function (ids) {
        //添加订阅
        wx.requestSubscribeMessage({
          tmplIds: ids,
          success(res) {
            _this.didSubscribeAnalytic(res, ids);
          },
          fail() {
            _this.makeOrder();
          },
        });
      });
    } else {
      this.setData({
        showLoginModal: true,
        loginTitle: '楼盘动态',
        loginContent: '楼盘动态及时通过短信和推送通知您',
        loginButtonTitle: '确认',
        popType: 1,
        subscribeFlag: true,
      });
    }
    var analyticProperties = this.analyticProperties();
    analyticProperties.fromPage = analyticProperties.fromPage;
    analyticProperties.fromModule = 'm_project_dynamic';
    analyticProperties.fromItem = 'i_leave_phone_entry';
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.op_type = '900210';
    analyticProperties.login_state = app.commonData.user.userId ? '1' : '2';
    analytic.sensors.track('e_click_leave_phone_entry', analyticProperties);
  },
  didTapAlertWiw() {
    this.setData({
      alertWiwShow: false,
    });
  },
  // didClickdidTaploadAlt() {
  //   this.setData({
  //     alertWiwShow: true
  //   })
  //   var analyticProperties = this.analyticProperties();
  //   analyticProperties.fromPage = analyticProperties.fromPage;
  //   analyticProperties.fromModule = 'm_project_basic_information';
  //   analyticProperties.fromItem = 'i_security';
  //   analyticProperties.toPage = analyticProperties.fromPage;
  //   analyticProperties.toModule = 'm_security_note_window'
  //   analytic.sensors.track('e_click_tab', analyticProperties);
  // },
  didTapOneStopMore() {
    route.transfer(this.data.security.toUrl);
    var analyticProperties = this.analyticProperties();
    analyticProperties.fromPage = analyticProperties.fromPage;
    analyticProperties.fromModule = 'm_julive_security';
    analyticProperties.fromItem = 'i_view_more';
    analyticProperties.toPage = 'p_webview';
    analyticProperties.to_url = this.data.security.toUrl;
    analytic.sensors.track('e_click_view_more', analyticProperties);
  },
  didTapOneStopImg(e) {
    let index = e.currentTarget.dataset.index;
    let data = this.data.security;
    let detail = data.detail;
    let text_top = `security.text_top`;
    let text_btm = `security.text_btm`;
    let btn_txt = `security.btn_txt`;
    let a = `security.detail[0].flag`;
    let b = `security.detail[1].flag`;
    let c = `security.detail[2].flag`;
    if (data.record == index) return;
    switch (index) {
      case 0:
        this.setData({
          [text_top]: detail[0].textList[0],
          [text_btm]: detail[0].textList[1],
          [btn_txt]: detail[0].button_text,
          [a]: true,
          [b]: false,
          [c]: false,
        });
        break;
      case 1:
        this.setData({
          [text_top]: detail[1].textList[0],
          [text_btm]: detail[1].textList[1],
          [btn_txt]: detail[1].button_text,
          [a]: false,
          [b]: true,
          [c]: false,
        });
        break;
      case 2:
        this.setData({
          [text_top]: detail[2].textList[0],
          [text_btm]: detail[2].textList[1],
          [btn_txt]: detail[2].button_text,
          [a]: false,
          [b]: false,
          [c]: true,
        });
        break;
      default:
        console.log('err at oneStop');
    }
    data.record = index;
    var analyticProperties = this.analyticProperties();
    analyticProperties.fromModule = 'm_julive_security';
    analyticProperties.fromItem = 'i_julive_service_icon';
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.fromItemIndex = index;
    analyticProperties.tab_id = String(index + 1);
    analytic.sensors.track('e_click_julive_service_icon', analyticProperties);
  },
  //之前的一站式购房的 帮我找房按钮，现在是跳转至app
  didTapOneStopBtn() {
    //   let index = String(this.data.security.record);
    //   var analyticProperties = this.analyticProperties();
    //   analyticProperties.toPage = analyticProperties.fromPage;
    //   analyticProperties.fromModule = 'm_julive_security';
    //   switch (index) {
    //     case '0':
    //       let url = this.data.security.detail[0].to_url;
    //       route.transfer(url);
    //       analyticProperties.fromItem = 'i_help_find_room_entry';
    //       analyticProperties.toPage = 'p_webview';
    //       analyticProperties.to_url = url;
    //       analytic.sensors.track(
    //         'e_click_help_find_room_entry',
    //         analyticProperties
    //       );
    //       break;
    //     case '1':
    //       wx.switchTab({
    //         url: '../../specialCar/specialCar'
    //       });
    //       analyticProperties.fromItem = 'i_reservation_car_entry';
    //       analyticProperties.toPage = 'p_reservation_car_see_house';
    //       analyticProperties.fromItemIndex = index;
    //       analytic.sensors.track(
    //         'e_click_reservation_car_entry',
    //         analyticProperties
    //       );
    //       break;
    //     case '2':
    //       this.setData({
    //         loginUserInfo: {
    //           op_type: '900464',
    //           project_id: this.data.projectId,
    //           fromItemIndex: '2',
    //           fromModule: 'm_julive_security'
    //         }
    //       });
    //       analyticProperties.fromItem = 'i_leave_phone_entry';
    //       analyticProperties.op_type = '900210';
    //       analyticProperties.fromItemIndex = '2';
    //       analyticProperties.login_state = app.commonData.user.userId ? '1' : '2';
    //       analytic.sensors.track('e_click_leave_phone_entry', analyticProperties);
    //       this.setData({
    //         subscribeFlag: false
    //       });
    //       if (app.commonData.user.userId) {
    //         this.makeOrder();
    //       } else {
    //         this.setData({
    //           showLoginModal: true,
    //           loginTitle: '我要咨询',
    //           loginContent:
    //             '现在房价行情如何？哪个区域、楼盘值得买？我有没有资质...',
    //           loginButtonTitle: '确认',
    //           popType: 1,
    //           contentDown: '更多问题，居理咨询师帮您答疑解惑',
    //           contentFooter:
    //             'tip:居理咨询师100%毕业于本科院校，高学历高素质，给您不一样的服务体验'
    //         });
    //       }
    //       break;
    //     default:
    //       console.log('err at oneStop');
    //   }
  },

  didClickMoreProjectList() {
    wx.switchTab({
      url: '../list/projectList',
    });
    this.setData({
      loginUserInfo: {
        project_id: this.data.projectId,
      },
    });
    analytic.sensors.track('e_click_view_more', {
      fromPage: this.analyticProperties().fromPage,
      fromModule: 'm_hot_project',
      fromItem: 'i_view_more',
      toPage: 'p_project_list',
      project_id: this.data.projectId,
    });
  },
  //分享
  didClickShare(e) {
    let _this = this;
    if (_this.data.painterSuccess != '') {
      _this.setData({
        showPainter: true,
        imagePath: this.data.painterSuccess,
      });
      return;
    }
    clearTimeout(toastTimer);
    let paintInfo = {
      project_id: this.data.projectId,
    };
    let projectDetail = this.data.info;
    let price = '',
      priceUnit = '';
    projectDetail.price_info.map((item) => {
      if (item.price_type == 2) {
        price = item.value;
        priceUnit = item.unit;
      }
    });
    let statusColor = util.statusColor(projectDetail.status.value);
    let _share = projectDetail.share;
    let _shareContent = {
      stateName: projectDetail.status.name,
      stateBackground: statusColor.split('-')[0],
      stateColor: statusColor.split('-')[1],
      price: price == '' ? '售价待定' : price,
      priceUnit: price == '售价待定' ? '' : priceUnit,
    };
    let shareContent = Object.assign(_share, _shareContent);
    _this.setData({
      slideup: false,
      slidedown: false,
      paintInfo: paintInfo,
      template: new Card().palette(shareContent),
    });
    setTimeout(function () {
      _this.setData({
        showPainter: true,
      });
      wx.hideLoading();
    }, 2200);

    analytic.sensors.track('e_click_share', {
      fromPage: this.analyticProperties().fromPage,
      fromModule: e.currentTarget.dataset.position
        ? 'm_project_info'
        : 'm_bottom_bar',
      fromItem: 'i_share',
      toPage: 'p_project_details',
      project_id: this.data.projectId,
    });
  },
  shareImagePath: function (e) {
    this.setData({
      painterSuccess: e.detail.imagePath,
      // imagePath: e.detail.imagePath
    });
  },
  dismissShare: function () {
    this.setData({
      showPainter: false,
      template: {},
    });
  },
  onShareAppMessage: function () {
    this.setData({
      showPainter: false,
    });
    return {
      title: '一手楼盘动态，实时播报',
      path:
        'pages/project/detail/projectDetail?projectId=' + this.data.projectId,
    };
  },
  //获取消息模版
  getTemplateIds(callback) {
    app
      .request('/v2/subscribe/get-subscribe-template-ids', {
        sub_type: subscribe_type,
      })
      .then((res) => {
        if (res.code == 0) {
          callback(res.data);
        }
      });
  },
  addCancelFavorite() {
    app
      .request('/v2/favorite/favorite', {
        type: 1,
        obj_id: this.data.projectId,
      })
      .then((res) => {
        if (res.code == 0) {
          let _tip = this.data.isLike == false ? '取消关注成功' : '关注成功';
          wx.showToast({
            title: _tip,
            icon: 'none',
            duration: 2000,
          });
        }
      });
  },
  addSubscribe() {
    app
      .request('/v2/subscribe/subscribe', {
        obj_type: 1,
        obj_id: this.data.projectId,
        sub_type: subscribe_type,
      })
      .then((res) => {
        console.log(res);
      });
  },
  didClickLike(e) {
    let _this = this;
    if (app.commonData.user.userId) {
      if (_this.data.isLike == false) {
        subscribe_type = e.currentTarget.dataset.position ? '1' : '2';
        _this.getTemplateIds(function (ids) {
          //添加收藏
          _this.setData({
            isLike: true,
          });
          //添加订阅
          wx.requestSubscribeMessage({
            tmplIds: ids,
            success(res) {
              _this.didLikeSubscribeAnalytic(res, ids);
            },
            fail(res) {
              console.log('订阅的res', res);
              let _tip =
                _this.data.isLike == false ? '取消关注成功' : '关注成功';
              wx.showToast({
                title: _tip,
                icon: 'none',
                duration: 2000,
              });
            },
          });
        });
        this.analyticClickLike(e.currentTarget.dataset.position, 1);
      } else if (_this.data.isLike == true) {
        _this.setData({
          isLike: false,
        });
        _this.addCancelFavorite();
        this.analyticClickLike(e.currentTarget.dataset.position, 2);
      }
    } else {
      wx.navigateTo({
        url: '/loginSubPK/pages/register/register',
      });
      notification.addNotification(
        'loginSuccess',
        _this.loginSuccessNotice,
        _this
      );
      _this.setData({
        subscribeFlag: true,
      });
      this.analyticClickLike(e.currentTarget.dataset.position, 2);
    }
  },
  didLikeSubscribeAnalytic(res, ids) {
    let _this = this;
    analytic.sensors.track('e_module_exposure', {
      fromPage: _this.analyticProperties().fromPage,
      fromModule: 'm_subscribe_notice_window',
      toPage: _this.analyticProperties().fromPage,
      project_id: _this.data.projectId,
    });
    _this.addCancelFavorite();
    let tab_ids_accept = [];
    let tab_ids_refuse = [];
    for (let i = 0; i < ids.length; i++) {
      if (res[ids[i]] == 'accept') {
        tab_ids_accept.push(ids[i]);
      } else {
        tab_ids_refuse.push(ids[i]);
      }
    }
    if (tab_ids_refuse.length == ids.length) {
      analytic.sensors.track('e_click_window_button', {
        fromPage: _this.analyticProperties().fromPage,
        fromModule: 'm_subscribe_notice_window',
        fromItem: 'i_window_button',
        toPage: _this.analyticProperties().fromPage,
        project_id: _this.data.projectId,
        button_id: 1,
      });
    } else {
      analytic.sensors.track('e_click_window_button', {
        fromPage: _this.analyticProperties().fromPage,
        fromModule: 'm_subscribe_notice_window',
        fromItem: 'i_window_button',
        toPage: _this.analyticProperties().fromPage,
        project_id: _this.data.projectId,
        button_id: 2,
        tab_ids: tab_ids_accept,
      });
    }
    for (let i = 0; i < ids.length; i++) {
      if (res[ids[i]] == 'accept') {
        _this.addSubscribe();
        return;
      }
    }
  },
  didSubscribeAnalytic(res, ids) {
    let _this = this;
    analytic.sensors.track('e_module_exposure', {
      fromPage: _this.analyticProperties().fromPage,
      fromModule: 'm_subscribe_notice_window',
      toPage: _this.analyticProperties().fromPage,
      project_id: _this.data.projectId,
    });
    if (res[ids] == 'accept') {
      _this.addSubscribe();
      _this.makeOrder();
      analytic.sensors.track('e_click_window_button', {
        fromPage: _this.analyticProperties().fromPage,
        fromModule: 'm_subscribe_notice_window',
        fromItem: 'i_window_button',
        toPage: _this.analyticProperties().fromPage,
        project_id: _this.data.projectId,
        button_id: 2,
        tab_ids: ids,
      });
    } else {
      _this.makeOrder(1, false, false);
      analytic.sensors.track('e_click_window_button', {
        fromPage: _this.analyticProperties().fromPage,
        fromModule: 'm_subscribe_notice_window',
        fromItem: 'i_window_button',
        toPage: _this.analyticProperties().fromPage,
        project_id: _this.data.projectId,
        button_id: 1,
      });
    }
  },
  analyticClickLike(position, like) {
    //点击 关注 的埋点
    analytic.sensors.track('e_click_follow', {
      fromPage: this.analyticProperties().fromPage,
      fromModule: position ? 'm_project_info' : 'm_bottom_bar',
      fromItem: 'i_follow',
      toPage: 'p_project_details',
      project_id: this.data.projectId,
      login_state: app.commonData.user.userId ? '1' : '2',
      follow_action: app.commonData.user.userId == 2 ? '1' : like,
    });
  },
  loginSuccessNotice() {
    wx.showToast({
      title: '登陆成功',
      icon: 'none',
      duration: 2000,
    });
  },
  didClickFindHouse() {
    route.transfer(this.data.info.find_house_img.url);
    analytic.sensors.track('e_click_help_find_room', {
      fromPage: this.analyticProperties().fromPage,
      fromModule: 'm_floating_window',
      fromItem: 'i_help_find_room',
      toPage: 'e_click_help_find_room',
      project_id: this.data.projectId,
      to_url: this.data.info.find_house_img.url,
    });
  },
  didClickDiscountTip() {
    this.setData({
      discountTip: true,
    });
    analytic.sensors.track('e_click_note_entry', {
      fromPage: this.analyticProperties().fromPage,
      fromModule: 'm_julive_service',
      fromItem: 'i_note_entry',
      toPage: this.analyticProperties().fromPage,
      project_id: this.data.projectId,
    });
  },
  didClickCloseShowTip() {
    this.setData({
      discountTip: false,
    });
  },
  //跳转 app，banner
  OpenApp() {
    analytic.sensors.track('e_click_open_app', {
      fromPage: this.analyticProperties().fromPage,
      fromModule: 'm_hot_project',
      fromItem: 'i_open_app',
      toPage: 'p_online_service',
      project_id: this.data.projectId,
    });
  },
  didClickToApp() {
    analytic.sensors.track('e_click_open_app', {
      fromPage: this.analyticProperties().fromPage,
      fromModule: 'm_julive_security',
      fromItem: 'i_open_app',
      toPage: 'p_online_service',
      project_id: this.data.projectId,
    });
  },
});
