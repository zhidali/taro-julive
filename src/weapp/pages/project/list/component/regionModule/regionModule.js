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
    regionData: {
      type: Object,
      value: {}
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
    // 点击区域模块
    filterRegion(e) {
      // 9157埋点
      let analyticObj = {
        fromPage: 'p_project_list',
        fromModule: 'm_district_quick_filter',
        fromItem: 'i_select_tab',
        toPage: 'p_project_list',
        district: e.currentTarget.dataset.value !== 'more' ? [e.currentTarget.dataset.value] : ['1']
      }
      analytic.sensors.track('e_click_select_tab', analyticObj);
      this.triggerEvent('filterRegion', e.currentTarget.dataset.value);
    }
  }
})
