const analytic = require('../../../../analytic/analytic.js');
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    littleKingKong: {
      type: Array,
      value: []
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
    //--------------点击金刚位 跳转-----------
    clickLittleKing(e) {
      let {
        item,
        index
      } = e.currentTarget.dataset;
      let key = Object.keys(item.filter)[0];
      let value = key ? item.filter[key] : '';
      app.globalData.filter = {
        [key]: [{
          key,
          value,
        }, ],
      };
      if(!key){
        app.globalData.newFilter = {}
      } else {
        app.globalData.newFilter = {[key]: [value]}
      }
      // 5456
      analytic.sensors.track('e_click_main_navigation', {
        fromPage: 'p_home',
        fromModule: 'm_main_navigation',
        fromItem: 'i_main_navigation',
        button_title: item.name,
        fromItemIndex: index,
        main_navigation_id: '',
        to_url: item.url,
        level: '',
      });

      wx.switchTab({
        url: '/pages/project/list/projectList',
      });
    },
  }
})