const app = getApp();
const WxParse = require('../../../utils/wxParse/wxParse.js');
const tool = require('../../../utils/util.js');
const analytic = require('../../../analytic/analytic.js');
import {
  viewProject
} from '../../../api/common';

Page({
  data: {
    loadingHidden: false,
    total: 0,
    qa: {},
    answer: {},
    relateProjectList: [],
    relateQaList: [],
    qaId: '',
    projectId: '',
    share: {},
    startViewTime: 0,
    ePageViewFlag: false,
  },

  onLoad: function (options) {
    var qaId = '';
    var projectId = '';
    if (options && options.q) {
      var url = decodeURIComponent(options.q);
      var query = tool.parseQueryString(url);
      if (query) {
        projectId = query.project_id;
        qaId = query.qa_id;
      }
    } else {
      qaId = options.qaId ? options.qaId : '';
      projectId = options.projectId ? options.projectId : '';
    }

    this.setData({
      qaId: qaId,
      projectId: projectId,
    });
    this.fetchQADetail();
    this.analyticPageView('e_page_view');
    setTimeout(() => {
      this.data.ePageViewFlag = true;
    }, 500);
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
  },

  analyticPageView: function (eventName = 'e_page_quit') {
    // analytic
    // 以秒为单位,所以除以1000
    var analyticProperties = this.analyticProperties();
    if (eventName != 'e_page_view') {
      var viewTime = (Date.parse(new Date()) - this.data.startViewTime) / 1000;
      analyticProperties.view_time = viewTime;
    }
    analyticProperties.question_id = [this.data.qaId];
    analyticProperties.toPage = analyticProperties.fromPage;
    analytic.sensors.track(eventName, analyticProperties);
  },

  analyticProperties() {
    return {
      fromPage: 'p_qa_details',
    };
  },

  fetchQADetail: function () {
    var _this = this;
    _this.setData({
      loadingHidden: false,
    });
    app
      .request('/v1/qa/detail', {
        q_id: _this.data.qaId,
        project_id: _this.data.projectId,
      })
      .then((d) => {
        if (d.code == 0) {
          var answer = d.data.list.answer_list[0];
          WxParse.wxParse('content', 'html', answer.answer.content, _this);
          answer.answer.content = _this.data.content;
          _this.setData({
            total: d.data.total,
            qa: d.data.list,
            answer: answer,
            relateProjectList: d.data.relate_project,
            relateQaList: d.data.relate_qa,
            share: d.data.share,
            loadingHidden: true,
          });
          var title =
            _this.data.projectId.length > 0 ?
            '问问-' + d.data.project.project_name :
            '买房问问';
          wx.setNavigationBarTitle({
            title: title,
          });
        } else {
          _this.setData({
            loadingHidden: true,
          });
        }
      })
      .catch((error) => {
        console.log(error);
        _this.setData({
          loadingHidden: true,
        });
      });
  },

  didClickQaList: function () {
    wx.switchTab({
      url: '/pages/information/information',
    });
    app.globalData.informationPageIndex = 1;
    // analytic
    var employeeId = this.data.answer.employee_info.employee_id;
    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = 'p_qa_home';
    analyticProperties.fromItem = 'i_view_more';
    analyticProperties.question_id = [this.data.qaId];
    analyticProperties.adviser_id = employeeId;
    analyticProperties.answer_id = this.data.answer.answer.id;
    if (this.data.projectId) {
      analyticProperties.project_id = this.data.projectId;
    }
    analytic.sensors.track('e_click_view_more', analyticProperties);
  },

  didTapProjectCellView: async function (e) {
    var index = e.currentTarget.dataset.index;
    let _id = e.currentTarget.dataset.id;
    if (!_id) {
      wx.showToast({
        title: '跳转失败',
        icon: "none",
        duration: 2000
      });
      return
    }
    try {
      await viewProject({
        project_id: _id
      });
      wx.navigateTo({
        url: `/pages/web/web?url=${app.commonData.m_domain_project}${_id}.html`
      });
    } catch (e) {
      console.log(e)
    }
    // analytic
    var employeeId = this.data.answer.employee_info.employee_id;
    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = 'p_project_details';
    analyticProperties.fromItem = 'i_project_card';
    analyticProperties.fromItemIndex = String(index);
    analyticProperties.question_id = [this.data.qaId];
    analyticProperties.adviser_id = employeeId;
    analyticProperties.to_project_id = e.currentTarget.dataset.id;
    analyticProperties.answer_id = this.data.answer.answer.id;
    if (this.data.projectId) {
      analyticProperties.project_id = this.data.projectId;
    }
    analytic.sensors.track('e_click_project_card', analyticProperties);
  },

  didTapQuestionCell: function (e) {
    var question = e.currentTarget.dataset.question;
    var index = e.currentTarget.dataset.index;
    this.setData({
      qaId: question.id,
    });
    this.fetchQADetail();

    // analytic
    var employeeId = this.data.answer.employee_info.employee_id;
    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = 'p_qa_details';
    analyticProperties.fromItem = 'i_question_card';
    analyticProperties.fromItemIndex = String(index);
    analyticProperties.question_id = [this.data.qaId];
    analyticProperties.adviser_id = employeeId;
    analyticProperties.to_question_id = [question.id];
    analyticProperties.answer_id = this.data.answer.answer.id;
    if (this.data.projectId) {
      analyticProperties.project_id = this.data.projectId;
    }
    analytic.sensors.track('e_click_question_card', analyticProperties);
  },

  didClickAskEmployeeButton: function (e) {
    var employeeId = this.data.answer.employee_info.employee_id;
    wx.navigateTo({
      url: '/questionRelateSubPK/pages/ask/questionAsk?projectId=' +
        this.data.projectId +
        '&employeeId=' +
        employeeId,
    });

    // analytic
    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = 'p_ask_adviser';
    analyticProperties.fromModule = 'm_adviser_card';
    analyticProperties.fromItem = 'i_ask';
    analyticProperties.question_id = [this.data.qaId];
    analyticProperties.adviser_id = employeeId;
    analyticProperties.answer_id = this.data.answer.answer.id;
    if (this.data.projectId) {
      analyticProperties.project_id = this.data.projectId;
    }
    analytic.sensors.track('e_click_ask', analyticProperties);
  },

  didClickAskButton: function () {
    wx.navigateTo({
      url: '/questionRelateSubPK/pages/ask/questionAsk?projectId=' +
        this.data.projectId,
    });

    // analytic
    var analyticProperties = this.analyticProperties();
    analyticProperties.toPage = 'p_ask_someone';
    analyticProperties.fromModule = 'm_bottom';
    analyticProperties.fromItem = 'i_ask';
    analyticProperties.question_id = [this.data.qaId];
    analyticProperties.answer_id = this.data.answer.answer.id;
    analyticProperties.adviser_id = this.data.answer.employee_info.employee_id;
    if (this.data.projectId) {
      analyticProperties.project_id = this.data.projectId;
    }
    analytic.sensors.track('e_click_ask', analyticProperties);
  },

  onShareAppMessage: function (e) {
    var share_location = '1';
    if (e.from === 'button') {
      share_location = '2';
    }

    var city = app.commonData.city;
    var _this = this;
    return {
      title: this.data.share.title,
      path: 'questionRelateSubPK/pages/detail/questionDetail?qaId=' +
        this.data.qaId +
        '&projectId=' +
        this.data.projectId +
        '&city_id=' +
        city.city_id +
        '&city_name=' +
        city.city_name,
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
        analyticProperties.share_location = share_location;
        analyticProperties.question_id = [_this.data.qaId];
        analyticProperties.answer_id = _this.data.answer.answer.id;
        analyticProperties.adviser_id =
          _this.data.answer.employee_info.employee_id;
        if (_this.data.projectId) {
          analyticProperties.project_id = _this.data.projectId;
        }
        analytic.sensors.track('e_click_transpond', analyticProperties);
      },
    };
  },
  // 不执行
  CustomerCenter() {
    console.log(' didClickCustomer');
    analytic.sensors.track('e_click_open_app', {
      fromPage: this.analyticProperties().fromPage,
      fromItem: 'i_open_app',
      toPage: 'p_online_service',
      question_id: [this.data.qaId],
      click_position: '1',
    });
  },
  OpenApp() {
    analytic.sensors.track('e_click_open_app', {
      fromPage: this.analyticProperties().fromPage,
      fromItem: 'i_open_app',
      toPage: 'p_online_service',
      question_id: [this.data.qaId],
      click_position: '2',
    });
  }
});