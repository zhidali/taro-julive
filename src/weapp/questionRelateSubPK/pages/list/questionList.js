const app = getApp();
// const location = require("../../../location/location.js");
var WxParse = require("../../../utils/wxParse/wxParse.js");
var tool = require("../../../utils/util.js");
var analytic = require("../../../analytic/analytic.js");

Page({
  data: {
    loadingHidden: false,
    questionList: [],
    tagList: [],
    activeIndex: 0,
    projectId: "",
    fixedFilterView: false,
    searchMode: false,
    searchWord: "",
    page: 1,
    hasMore: false,
    share: {},
    startViewTime: 0,
    ePageViewFlag: false
  },

  onLoad: function(options) {
    var projectId = "";
    if (options && options.q) {
      var url = decodeURIComponent(options.q);
      var query = tool.parseQueryString(url);
      if (query) {
        projectId = query.project_id;
      }
    } else {
      projectId = options.projectId ? options.projectId : "";
    }

    this.setData({
      projectId: projectId
    });
    this.fetchQAList(true);

    wx.showShareMenu({
      withShareTicket: true
    });
    this.analyticPageView("e_page_view");
    setTimeout(() => {
      this.data.ePageViewFlag = true;
    }, 500);
  },

  onShow: function() {
    this.data.startViewTime = Date.parse(new Date());
    if (this.data.ePageViewFlag) {
      this.analyticPageView("e_page_view");
    }
  },

  onHide: function() {
    this.analyticPageView();
  },

  onUnload: function() {
    this.analyticPageView();
  },

  analyticPageView: function(eventName = "e_page_quit") {
    // analytic
    // 以秒为单位,所以除以1000
    var analyticProperties = this.analyticProperties();
    if (eventName != "e_page_view") {
      var viewTime = (Date.parse(new Date()) - this.data.startViewTime) / 1000;
      analyticProperties.view_time = viewTime;
    }
    analyticProperties.toPage = analyticProperties.fromPage;
    analytic.sensors.track(eventName, analyticProperties);
  },

  analyticProperties() {
    return {
      fromPage: "p_project_qa",
      project_id: this.data.projectId
    };
  },

  fetchQAList: function(isRefresh) {
    if (isRefresh) {
      this.setData({
        loadingHidden: false,
        page: 1
      });
    } else {
      this.data.page++;
    }

    var _this = this;
    var tag = 0;
    if (this.data.activeIndex < this.data.tagList.length) {
      tag = this.data.tagList[this.data.activeIndex].value;
    }
    app
      .request("/v1/qa/index", {
        project_id: _this.data.projectId,
        keyword: _this.data.searchWord,
        type: tag,
        page: _this.data.page
      })
      .then(d => {
        var qalist = d.data.list;
        for (var qaIndex = 0; qaIndex < qalist.length; qaIndex++) {
          var oneQa = qalist[qaIndex];
          var answer =
            oneQa.answer_list != undefined && oneQa.answer_list.length > 0
              ? oneQa.answer_list[0].answer
              : {};
          WxParse.wxParse("content", "html", answer.content, _this);
          var content = tool.parseContent(_this.data.content);
          answer.content = content;
        }

        _this.setData({
          loadingHidden: true,
          tagList: d.data.tag,
          questionList: isRefresh
            ? qalist
            : _this.data.questionList.concat(qalist),
          share: d.data.share,
          hasMore: d.data.has_more == 1
        });
        wx.stopPullDownRefresh();
        var title =
          _this.data.projectId.length > 0
            ? "问问-" + d.data.project_name
            : "买房问问";
        wx.setNavigationBarTitle({
          title: title
        });
      })
      .catch(error => {
        console.log(error);
        wx.stopPullDownRefresh();
      });
  },

  onReachBottom: function() {
    if (this.data.hasMore) {
      this.fetchQAList(false);
    }
  },

  didTapQaCell: function(e) {
    var qa = e.currentTarget.dataset.qa;
    var index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url:
        "/questionRelateSubPK/pages/detail/questionDetail?projectId=" +
        this.data.projectId +
        "&qaId=" +
        qa.question.id
    });

    // analytic
    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = "p_qa_details";
    analyticProperties.fromItem = "i_question_card";
    analyticProperties.fromItemIndex = String(index);
    analyticProperties.question_id = [qa.question.id];
    var answer =
      qa.answer_list != undefined && qa.answer_list.length > 0
        ? qa.answer_list[0].answer
        : {};
    analyticProperties.answer_id = answer.id;
    analyticProperties.project_id = this.data.projectId;
    analyticProperties.tag_id = this.data.tagList[this.data.activeIndex].value;
    analytic.sensors.track("e_click_question_card", analyticProperties);
  },

  didTapMenuItem: function(e) {
    var item = e.currentTarget.dataset.item;
    var index = e.currentTarget.dataset.index;
    this.setData({
      activeIndex: index
    });
    this.fetchQAList(true);

    // analytic
    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.fromModule = "m_title_bar";
    analyticProperties.fromItem = "i_select_tab";
    analyticProperties.fromItemIndex = String(index);
    analyticProperties.project_id = this.data.projectId;
    analyticProperties.tag_id = item.value;
    analytic.sensors.track("e_click_select_tab", analyticProperties);
  },

  didTapAskButton: function(e) {
    var clickLocation = e.currentTarget.dataset.clickLocation;
    wx.navigateTo({
      url: "/questionRelateSubPK/pages/ask/questionAsk?projectId=" + this.data.projectId
    });

    // analytic
    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = "p_ask_someone";
    analyticProperties.fromModule = clickLocation;
    analyticProperties.fromItem = "i_ask";
    analyticProperties.project_id = this.data.projectId;
    analytic.sensors.track("e_click_ask", analyticProperties);
  },

  didTapSearchButton: function(e) {
    this.setData({
      searchMode: true
    });

    // analytic
    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.fromModule = "m_title_bar";
    analyticProperties.fromItem = "i_click_search_entry";
    analyticProperties.project_id = this.data.projectId;
    analytic.sensors.track("e_click_search_entry", analyticProperties);
  },

  didCancelSearchButton: function(e) {
    this.setData({
      searchMode: false,
      searchWord: ""
    });
    this.fetchQAList(true);

    // analytic
    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.fromModule = "m_title_bar";
    analyticProperties.fromItem = "i_cancel";
    analyticProperties.project_id = this.data.projectId;
    analytic.sensors.track("e_click_cancel", analyticProperties);
  },

  inputSearchChange: function(e) {
    this.setData({
      searchWord: e.detail.value
    });
  },

  onSearchConfirm: function(e) {
    if (this.data.searchWord.length == 0) return;
    this.fetchQAList(true);

    // analytic
    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = analyticProperties.fromPage;
    analyticProperties.fromModule = "m_title_bar";
    analyticProperties.fromItem = "i_keyboard_confirm";
    analyticProperties.query = this.data.searchWord;
    analyticProperties.project_id = this.data.projectId;
    analytic.sensors.track("e_click_keyboard_confirm", analyticProperties);
  },

  onPageScroll: function(event) {
    var scrollTop = event.scrollTop;
    var headerHeight = wx.getSystemInfoSync().windowHeight * 0.36;
    var rate = wx.getSystemInfoSync().windowWidth / 750;
    headerHeight = headerHeight * rate + 80;
    if (scrollTop > headerHeight) {
      if (this.data.fixedFilterView) return;
      this.setData({
        fixedFilterView: true
      });
    } else {
      if (!this.data.fixedFilterView) return;
      this.setData({
        fixedFilterView: false
      });
    }
  },

  onShareAppMessage: function(e) {
    var share_location = "1";
    if (e.from === "button") {
      share_location = "2";
    }

    var city = app.commonData.city;
    var _this = this;
    return {
      title: this.data.share.title,
      path:
        "/questionRelateSubPK/pages/list/questionList?projectId=" +
        this.data.projectId +
        "&city_id=" +
        city.city_id +
        "&city_name=" +
        city.city_name,
      complete(res) {
        // share result
        var transpond_result = "2";
        if (res.errMsg === "shareAppMessage:ok") {
          transpond_result = "1";
        }
        // share type
        var transpond_differentiate = "1";
        if (res.shareTickets && res.shareTickets.length > 0) {
          transpond_differentiate = "2";
        }

        var analyticProperties = _this.analyticProperties();
        analyticProperties.fromItem = "i_transpond";
        analyticProperties.transpond_result = transpond_result;
        analyticProperties.transpond_differentiate = transpond_differentiate;
        analyticProperties.share_location = share_location;
        analytic.sensors.track("e_click_transpond", analyticProperties);
      }
    };
  }
});
