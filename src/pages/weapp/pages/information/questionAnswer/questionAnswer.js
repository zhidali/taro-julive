const app = getApp();
var WxParse = require('../../../utils/wxParse/wxParse.js');
var tool = require('../../../utils/util.js');
var notification = require('../../../utils/notification.js');
var analytic = require('../../../analytic/analytic.js');
let appPage = getApp();

Component({
  properties: {
    projectId: {
      type: String,
      value: '',
    },
  },

  data: {
    ePageViewFlag: false,
    loadingHidden: false,
    questionList: [],
    tagList: [],
    activeIndex: 0,
    headerViewHeight: 0,
    fixedFilterView: false,
    searchMode: false,
    searchWord: '',
    page: 1,
    hasMore: false,
    share: {},
    barTypeData: {
      isShow: false,
      type: 1,
    }, // 登录条
    loginBackType: {
      flag: false,
    },
  },

  lifetimes: {
    attached: function () {
      this.fetchQAList(true);
      this.data.startViewTime = Date.parse(new Date());
      notification.addNotification('CityHadChanged', this.fetchQAList, this);
      // 只弹出一次
      if (appPage.globalData.questionAnswerLoginOnce || app.commonData.user.userId)
        return;
      this.setData({
        ['barTypeData.isShow']: true,
      });
    },

    //组件实例被从页面节点树移除时执行
    detached() {
      var analyticProperties = {};
      var viewTime = (Date.parse(new Date()) - this.data.startViewTime) / 1000;
      analyticProperties.view_time = viewTime;
      analyticProperties.fromPage = 'p_julive_info_agency';
      analyticProperties.toPage = 'p_julive_info_agency';
      analyticProperties.tab_id = '2';
      analytic.sensors.track('e_page_quit_details', analyticProperties);
    },
  },

  methods: {
    analyticProperties() {
      return {
        fromPage: 'p_qa_home',
      };
    },

    fetchQAList: function (isRefresh = true, observer) {
      var _this = this;
      if (observer) {
        _this = observer;
      }
      if (isRefresh) {
        _this.data.page = 1;
      } else {
        _this.data.page++;
      }
      var tag = 0;
      if (_this.data.activeIndex < _this.data.tagList.length) {
        tag = _this.data.tagList[_this.data.activeIndex].value;
      }
      app
        .request('/v1/qa/index', {
          project_id: _this.data.projectId,
          keyword: _this.data.searchWord,
          type: tag,
          page: _this.data.page,
        })
        .then((d) => {
          wx.stopPullDownRefresh();
          if (d.data == undefined && d.data.list == undefined) {
            _this.setData({
              tagList: [],
              questionList: [],
              share: {},
              hasMore: false,
            });
          } else {
            var qalist = d.data.list;
            for (var qaIndex = 0; qaIndex < qalist.length; qaIndex++) {
              var oneQa = qalist[qaIndex];
              var answer =
                oneQa.answer_list != undefined && oneQa.answer_list.length > 0 ?
                oneQa.answer_list[0].answer : {};
              WxParse.wxParse('content', 'html', answer.content, _this);
              var content = tool.parseContent(_this.data.content);
              answer.content = content;
            }

            var filters = [];
            d.data.tag.forEach((item) => {
              filters.push(item.show_txt);
            });

            _this.setData({
              tagList: d.data.tag,
              filters: filters,
              questionList: isRefresh ?
                qalist : _this.data.questionList.concat(qalist),
              share: d.data.share,
              hasMore: d.data.has_more == 1,
              loadingHidden: true,
            });
            if (_this.data.page == 1) {
              _this.timeoutId = setTimeout(function () {
                var query = wx.createSelectorQuery().in(_this);
                query
                  .select('.question-ask-header-view')
                  .boundingClientRect(function (res) {
                    if (res) {
                      _this.setData({
                        headerViewHeight: res.height,
                      });
                    } else {
                      _this.setData({
                        headerViewHeight: 0,
                      });
                    }
                    delete _this.timeoutId;
                  })
                  .exec();
              }, 1000);
            }
          }
        })
        .catch((error) => {
          wx.stopPullDownRefresh();
        });
    },

    didTapQaCell: function (e) {
      var qa = e.currentTarget.dataset.qa;
      var index = e.currentTarget.dataset.index;
      wx.navigateTo({
        url: '/questionRelateSubPK/pages/detail/questionDetail?qaId=' +
          qa.question.id,
      });

      // analytic
      var analyticProperties = this.analyticProperties();
      analyticProperties.toPage = 'p_qa_details';
      analyticProperties.fromItem = 'i_question_card';
      analyticProperties.fromItemIndex = String(index);
      analyticProperties.question_id = [qa.question.id];
      var answer =
        qa.answer_list != undefined && qa.answer_list.length > 0 ?
        qa.answer_list[0].answer : {};
      analyticProperties.answer_id = answer.id;
      analyticProperties.tag_id = this.data.tagList[
        this.data.activeIndex
      ].value;
      analytic.sensors.track('e_click_question_card', analyticProperties);
    },

    filterSelectCallback: function (e) {
      this.setData({
        activeIndex: e.detail.index,
        scrollLeft: e.detail.index * 50,
      });
      this.fetchQAList(true);
    },

    didTapMenuItem: function (e) {
      var item = e.currentTarget.dataset.item;
      var index = e.currentTarget.dataset.index;
      this.setData({
        activeIndex: index,
      });
      this.fetchQAList(true);

      // analytic
      var analyticProperties = this.analyticProperties();
      analyticProperties.toPage = analyticProperties.fromPage;
      analyticProperties.fromModule = 'm_title_bar';
      analyticProperties.fromItem = 'i_select_tab';
      analyticProperties.fromItemIndex = String(index);
      analyticProperties.tag_id = item.value;
      analytic.sensors.track('e_click_select_tab', analyticProperties);
    },

    didTapAskButton: function (e) {
      var clickLocation = e.currentTarget.dataset.clickLocation;
      wx.navigateTo({
        url: '/questionRelateSubPK/pages/ask/questionAsk',
      });

      // analytic
      var analyticProperties = this.analyticProperties();
      analyticProperties.toPage = 'p_ask_someone';
      analyticProperties.fromModule = clickLocation;
      analyticProperties.fromItem = 'i_ask';
      analytic.sensors.track('e_click_ask', analyticProperties);
    },

    didTapSearchButton: function (e) {
      this.setData({
        searchMode: true,
      });
      // analytic
      var analyticProperties = this.analyticProperties();
      analyticProperties.toPage = analyticProperties.fromPage;
      analyticProperties.fromModule = 'm_title_bar';
      analyticProperties.fromItem = 'i_click_search_entry';
      analytic.sensors.track('e_click_search_entry', analyticProperties);
    },

    didCancelSearchButton: function (e) {
      this.setData({
        searchMode: false,
        searchWord: '',
      });
      this.fetchQAList(true);
      // analytic
      var analyticProperties = this.analyticProperties();
      analyticProperties.toPage = analyticProperties.fromPage;
      analyticProperties.fromModule = 'm_title_bar';
      analyticProperties.fromItem = 'i_cancel';
      analytic.sensors.track('e_click_cancel', analyticProperties);
    },

    inputSearchChange: function (e) {
      this.setData({
        searchWord: e.detail.value,
      });
    },

    onSearchConfirm: function (e) {
      if (this.data.searchWord.length == 0) return;
      this.fetchQAList(true);
      // analytic
      var analyticProperties = this.analyticProperties();
      analyticProperties.toPage = analyticProperties.fromPage;
      analyticProperties.fromModule = 'm_title_bar';
      analyticProperties.fromItem = 'i_keyboard_confirm';
      analyticProperties.query = this.data.searchWord;
      analytic.sensors.track('e_click_keyboard_confirm', analyticProperties);
    },

    // 悬浮
    didClickToApp() {
      analytic.sensors.track('e_click_open_app', {
        fromPage: this.analyticProperties().fromPage,
        fromModule: 'm_floating_window',
        fromItem: 'i_open_app',
        toPage: 'p_online_service',
      });
    },
    didClickAsk() {
      wx.navigateTo({
        url: '/questionRelateSubPK/pages/ask/questionAsk',
      });
      analytic.sensors.track('e_click_ask', {
        fromPage: this.analyticProperties().fromPage,
        fromModule: 'm_floating_window',
        fromItem: 'i_ask',
        toPage: 'p_ask_someone',
      });
    },
    didPageScroll: function (event) {
      if (this.data.headerViewHeight == 0) return;
      if (event.scrollTop > this.data.headerViewHeight) {
        if (this.data.fixedFilterView) return;
        this.setData({
          fixedFilterView: true,
        });
      } else {
        if (!this.data.fixedFilterView) return;
        this.setData({
          fixedFilterView: false,
        });
      }
    },
    didReachBottom() {
      if (this.data.hasMore) {
        this.fetchQAList(false);
      }
    },

    //关闭 一键登录出
    didClickCloseBarType() {
      let _this = this;
      this.setData({
          ['barTypeData.animation']: true,
        },
        () => {
          let timer = setTimeout(() => {
            _this.setData({
              ['barTypeData.isShow']: false,
            });
            clearTimeout(timer);
          }, 1500);
        }
      );
      appPage.globalData.questionAnswerLoginOnce = true;
    },
    //点击微信登录。允许或者拒绝 回调
    passBackGetPhoneNumberBtn(e) {
      if (e.detail.markType === '261') {
        analytic.sensors.track('e_click_onekey_login', {
          fromPage: 'p_julive_info_agency',
          toPage: 'p_julive_info_agency',
          fromModule: 'm_onekey_tip_window',
          fromItem: 'i_onekey_login',
          tab_id: '2'
        });
      }
    },
    //微信登录 拒绝后回调 和允许后调用完fast-login 回调，允许loginStatus=true
    passBackFastLoginCallBack(e) {
      let {
        loginStatus
      } = e.detail;
      if (loginStatus) {
        this.data.loginBackType.flag = false;
        this.setData({
          ['barTypeData.isShow']: false,
        });
        app.commonData.mineTabPurchase = true;
        //如果是一键登录弹窗
        if (e.detail.markType == "261") {
          wx.showModal({
            content: '领取成功，可在我的查看',
            showCancel: false,
            complete: () => {
              if (app.commonData.userHasOrder) return;
              wx.navigateTo({
                url: '/myRelateSubPK/pages/getReport/getReport',
              });
              analytic.sensors.track('e_click_report_entry', {
                fromPage: 'p_julive_info_agency',
                fromModule: 'm_onekey_tip_window',
                fromItem: 'i_report_entry',
                toPage: 'p_buy_house_report',
                tab_id: '2'
              });
            }
          });
          analytic.sensors.track('e_click_confirm_login', {
            fromPage: 'p_julive_info_agency',
            toPage: 'p_julive_info_agency',
            fromModule: 'm_onekey_tip_window',
            fromItem: 'i_confirm_login',
            tab_id: '2'
          });
        } else {
          this.makeOrder();
        }
      }
    },
  },
});