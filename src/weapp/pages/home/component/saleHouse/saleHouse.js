const analytic = require('../../../../analytic/analytic.js');
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 热销楼盘
    hotHouse: {
      type: Array,
      value: [],
      observer(newVal) {
        if(newVal.length){
          this.exposureHotHouse();
        }
      }
    },
    // 特价楼盘
    saleHouse: {
      type: Array,
      value: [],
      observer(newVal) {
        if(newVal.length){
          this.exposureOfferHouse();
        }
      }
    },
    // 新开楼盘
    openTimeHouse: {
      type: Array,
      value: [],
      observer(newVal) {
        if(newVal.length){
          this.exposureOpenTimeHouse();
        }
      }
    },
    // weekend
    weekend: {
      type: Number,
      optionalTypes: [Number, String],
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    goListPage: [-1] // 判断是否可以跳转到列表页面
  },
  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的方法列表
   */
  methods: {
    lookMoreHouse(e) {
      let {
        key,
        direction
      } = e.currentTarget.dataset;
      let billboard_type = '';
      if (key == 'hot') {
        // 热销
        billboard_type = '1';
        // 默认列表页
        app.globalData.filter = {
          all: 'all',
        };
      } else if (key == 'sale') {
        // 特价
        billboard_type = '2';
        // 优惠楼盘
        app.globalData.filter = {
          h: [{
            key: 'h',
            value: 'h21',
          }, ],
        };
      } else if (key == 'open-time') {
        // 新开楼盘
        billboard_type = '3';
        // 近期开盘
        app.globalData.filter = {
          h: [{
            key: 'h',
            value: 'h20',
          }, ],
        };
      }
      if (
        this.data.goListPage[this.data.goListPage.length - 1] != -1 &&
        e.detail.dx == 0
      ) {
        // 8876
        this.setData({
          goListPage: [-1],
        });
        analytic.sensors.track('e_click_view_more', {
          fromPage: 'p_home',
          toPage: 'p_project_list',
          fromModule: 'm_billboard',
          fromItem: 'i_view_more',
          click_position: '2',
          billboard_type,
        });
        wx.switchTab({
          url: '../project/list/projectList',
        });
      }
      // 滑动安全距离为40
      if (e.detail.dx > 40 && direction == 'right') {
        this.data.goListPage[1] = e.detail.dx;
      }
      if (direction != 'right') {
        // 8876
        analytic.sensors.track('e_click_view_more', {
          fromPage: 'p_home',
          toPage: 'p_project_list',
          fromModule: 'm_billboard',
          fromItem: 'i_view_more',
          click_position: '1',
          billboard_type,
        });
        wx.switchTab({
          url: '../project/list/projectList',
        });
      }
    },
    goH5houseDetails(e) {
      let {
        index,
        key,
        item
      } = e.currentTarget.dataset;
      let billboard_type = '';
      if (key == 'hot') {
        // 热销
        billboard_type = '1';
      } else if (key == 'sale') {
        // 特价
        billboard_type = '2';
      } else if (key == 'open-time') {
        // 新开楼盘
        billboard_type = '3';
      }
      // 8877
      analytic.sensors.track('e_click_project_card', {
        fromPage: 'p_home',
        toPage: 'p_project_details',
        fromModule: 'm_billboard',
        fromItem: 'i_project_card',
        project_id: item.project_id,
        fromItemIndex: index,
        billboard_type,
      });
      wx.navigateTo({
        url: `/pages/web/web?url=${getApp().commonData.m_domain_project}${e.currentTarget.dataset.item.project_id}.html`
      });
    },

    // 曝光热销楼盘
    exposureHotHouse() {
      let Observer = this.createIntersectionObserver();
      Observer.relativeToViewport({
        bottom: -181,
      }).observe(`.hot-house-wrap`, () => {
        Observer.disconnect();
        // 8922
        analytic.sensors.track('e_module_exposure', {
          fromPage: 'p_home',
          fromModule: 'm_billboard',
          toPage: 'p_home',
          billboard_type: '1',
        });
      });
    },
    // 曝光特价房源
    exposureOfferHouse() {
      let Observer = this.createIntersectionObserver() || {};
      Observer.relativeToViewport({
        bottom: -181,
      }).observe(`.offer-house-wrap`, () => {
        Observer.disconnect();
        // 8922
        analytic.sensors.track('e_module_exposure', {
          fromPage: 'p_home',
          fromModule: 'm_billboard',
          toPage: 'p_home',
          billboard_type: '2',
        });
      });
    },
    // 曝光新开楼盘房源
    exposureOpenTimeHouse() {
      let Observer = this.createIntersectionObserver();
      Observer.relativeToViewport({
        bottom: -181,
      }).observe(`.opentime-house-wrap`, () => {
        Observer.disconnect();
        // 8922
        analytic.sensors.track('e_module_exposure', {
          fromPage: 'p_home',
          fromModule: 'm_billboard',
          toPage: 'p_home',
          billboard_type: '3',
        });
      });
    },
  }
})