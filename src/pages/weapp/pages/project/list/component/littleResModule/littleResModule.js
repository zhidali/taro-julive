const analytic = require('../../../../../analytic/analytic');
Component({
  externalClasses: ['my-class'],

  options: {
      addGlobalClass: true,
  },
  /**
   * 组件的属性列表
   */
  properties: {
    littleResData: {
      type: Array,
      value: []
    },
    // 楼盘列表长度
    projectListLength: {
      type: Number,
      value: 0
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
    // 点击删除筛选
    filterLittleRes(e) {
      let removeData = {};
      let analyticObj = {
        fromPage: analytic.page.currentPage(),
        fromModule: 'm_little_filter_guide',
        toPage: analytic.page.currentPage(),
      }
      if(e.currentTarget.dataset.remove === 'single') {
        removeData = {
          key: e.currentTarget.dataset.key,
          value: e.currentTarget.dataset.value
        }
        // 9167埋点
        analyticObj.fromItem = 'i_delete_filter';
        analyticObj.filter_id = e.currentTarget.dataset.name;
        analytic.sensors.track('e_click_delete_filter', analyticObj);
      } else {
        // 9168埋点 点击重置
        analyticObj.fromItem = 'i_reset';
        analytic.sensors.track('e_click_reset', analyticObj);
      }
      this.triggerEvent('filterLittleRes', removeData);
    }
  }
})
