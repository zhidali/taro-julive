/*
 * @author: zhidl
 * @Date: 2020-08-21 14:17:30
 * @description: 首页立即查询模块
 * @LastEditTime: 2020-09-08 11:01:28
 * @LastEditors: zhidl
 */
const app = getApp();
const analytic = require('../../../../analytic/analytic');
import {
  userDiscount
} from '../../../../api/common';
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 接口下发对应筛选项
    apiAllFilter: {
      type: Object,
      value: {},
      observer(newVal) {
        this.setAllFilter(newVal);
      }
    },
    // 传递默认选中项目
    defaultFilter: {
      type: Object,
      value: {}
    },
    // 版本实验
    abTest: {
      type: Object,
      value: {},
      observer(newVal) {
        // 找房服务A版本勾选， 
        this.setData({
          isCheckedService: (newVal.p_home_strategy == 'A' || newVal.p_home_strategy_01 == 'A') ? true : false
        })
      }
    }
  },
  options: {
    // 受父文件css 影响 
    addGlobalClass: true,
  },
  /**
   * 组件的初始数据
   */
  data: {
    // 接口数据
    allFilter: {},
    // 是否显示区域板块复层
    isShowRegionMark: false,
    // 是否显示户型总价复层
    isShowHouseTypeMark: false,
    // 如果无接口数据不可操作
    noClick: true,
    // 区域 数组
    region: [],
    currentRegionIdx: 0,
    // 板块 数组
    plate: [],
    // 居室 数组,
    houseType: [],
    // 总价 字符串  1,1111 | 0,22 | 33,0
    totalPrice: [0, 0],
    totalPriceMin: '',
    totalPriceMax: '',
    // 克隆接口下发全量
    cloneAllFilter: '',
    // 区域文字
    regionText: '',
    // 户型不限文字
    houseTypeText: '',
    // 总价不限文字
    totalPriceText: '',
    // 选中板块数据 
    plateObj: {},
    // 是否有未关闭居理订单  true有 false没有
    userHasOrder: false,
    // 是否选中找房服务
    isCheckedService: false,
  },
  observers: {
    'isShowRegionMark,isShowHouseTypeMark'(isShowRegionMark, isShowHouseTypeMark) {
      if (isShowRegionMark || isShowHouseTypeMark) {
        app.dialogMapData('set', 'home-findHouse');
      }
    }
  },
  attached() {
    // 初始化进入组件
    this.setData({
      userHasOrder: app.commonData.userHasOrder
    })
    app.watchCommonData('userHasOrder', (newv) => {
      this.setData({
        userHasOrder: newv
      })
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 接口过来数据
    setAllFilter(allFilter) {
      if (JSON.stringify(allFilter) != '{}') {
        this.data.noClick = false;
        this.setData({
          allFilter
        }, () => {
          this.renderFilter('default');
        })
      } else {
        this.data.noClick = true;
      }
    },
    // 调用户型 总价浮层
    showHouseTypeMark(e) {
      if (this.data.noClick) {
        return
      }
      this.setData({
        isShowHouseTypeMark: true
      })
      let {type} = e.currentTarget.dataset;
      // 8863 
      analytic.sensors.track('e_click_filter_entry', {
        fromPage: 'p_home',
        fromModule: 'm_quick_find_room',
        fromItem: 'i_filter_entry',
        toPage: 'p_home',
        click_position: type == 'houseType' ? '2' : '3'
      });
     },
    // 调用区域板块浮层
    showRegionMark() {
      if (this.data.noClick) {
        return
      }
      this.setData({
        isShowRegionMark: true
      })
      // 8863 
      analytic.sensors.track('e_click_filter_entry', {
        fromPage: 'p_home',
        fromModule: 'm_quick_find_room',
        fromItem: 'i_filter_entry',
        toPage: 'p_home',
        click_position: '1'
      });
    },
    /**
     * @description: 核心渲染函数
     * @param {string} type default 或者 close  default为初始化使用， close 关闭状态使用
     */
    renderFilter(type) {
      let {
        allFilter,
        currentRegionIdx,
        defaultFilter
      } = this.data;
      let region = []; // 区域 & 板块
      let noHasRegion = []; // 不包含不限
      let houseType = []; // 户型
      let plate = []; // 板块
      let totalPrice = []; // 总价
      let totalPriceMin = '';
      let totalPriceMax = '';
      if (JSON.stringify(allFilter) == '{}') {
        return;
      }
      if (type == 'close') {
        allFilter = JSON.parse(this.data.cloneAllFilter);
      }



      if (type == 'default') {
        Object.keys(allFilter).forEach((k) => {
          allFilter[k].value && allFilter[k].value.forEach((item) => {
            if (typeof item == 'object') {
              item.isChecked = false;
            }
          })
          if(k == 'c'){
            allFilter[k].checkedArr = [];
          }
        })
      }

      if (type == 'default' || type == 'close') {

        Object.keys(defaultFilter).forEach((k) => {
          // 区域
          if (k == 'a' || k == 'd') {
            defaultFilter[k].forEach((value) => {
              allFilter[k].value && allFilter[k].value.forEach((item) => {
                if (value == item.value) {
                  item.isChecked = true
                }
              })
            })
          }
          // 总价
          if (k == 'c' && !Array.isArray(defaultFilter[k])) {
            let arr = defaultFilter[k].split(',');
            if (arr[1] == '0' || arr[1] * 1 > allFilter.c.value[1] * 1) {
              arr[1] = allFilter.c.value[1]
            }
            allFilter[k].checkedArr = arr;
          }
        })

        // 赋值总价数据
        if (allFilter.c && allFilter.c.value) {
          totalPriceMin = allFilter.c.value[0];
          totalPriceMax = allFilter.c.value[1];
          
          totalPrice = allFilter.c.checkedArr;
          if (allFilter.c.checkedArr.length == 0) {
            totalPrice = [totalPriceMin, totalPriceMax];
          }
        }
        this.setData({
          totalPrice,
          totalPriceMin,
          totalPriceMax
        })
      }

      // 赋值区域数据
      if (allFilter.a && allFilter.a.value) {
        region = allFilter.a.value.map((item) => {
          // 板块
          let districtArr = [];
          if (item.plate) {
            districtArr = item.plate.map((v) => {
              return {
                trade_area: v.trade_area,
                district_id: v.district_id,
                id: v.id,
                isChecked: v.isChecked || false
              }
            })
          }
          return {
            name: item.name,
            value: item.value,
            isChecked: item.isChecked || false,
            plate: districtArr
          }
        })

        // 默认选中不限
        noHasRegion = region.filter((item) => {
          return item.value != '0' && item.isChecked
        })
        region.forEach(item => {
          if (item.value == '0') {
            item.isChecked = noHasRegion.length == 0
          }
        });
      }
      // 赋值板块数据
      if (region.length) {
        let arr = [];
        
        if (noHasRegion.length == 0 && currentRegionIdx == 0) {
          let plateCj = {};

          plateCj = region.filter((item) => {
              return item.value == '0' && Array.isArray(item.plate)
            })[0] || {};
          plate = plateCj.plate;
        } else {
          let plateCj = {};
          // 当前选中
          plateCj = region.filter((item, idx) => {
            return currentRegionIdx == idx && Array.isArray(item.plate)
          })[0] || {};
          plate = plateCj.plate;
        }
        
        // 默认选中不限
        if(Array.isArray(plate)){
          arr = plate.filter((item) => {
            return item.id != '0' && item.isChecked
          })
          plate.forEach((item) => {
            if (item.id == '0') {
              item.isChecked = arr.length == 0
            }
          })
        }
      }
      // 赋值户型数据
      if (allFilter.d && allFilter.d.value) {
        let arr = [];

        houseType = allFilter.d.value.map((item) => {
          return {
            isChecked: item.isChecked || false,
            name: item.name,
            value: item.value
          }
        })

        arr = houseType.filter((item) => {
          return item.isChecked && item.value != '0'
        })

        houseType.forEach((item) => {
          if (item.value == '0') {
            item.isChecked = !arr.length
          }
        })

      }

      this.setData({
        allFilter,
        plate,
        region,
        houseType,
        currentRegionIdx
      }, () => {
        if (type == 'default') {
          this.data.cloneAllFilter = JSON.stringify(this.data.allFilter);
          this.submitFilter('default');
        }
      })
    },
    preventTouchMove() {},
    // 改变区域
    changeRegion(e) {
      let {
        index,
        item
      } = e.currentTarget.dataset;
      let {
        allFilter,
        region
      } = this.data;
      // 当前区域下的板块
      let plates = [];
      if (item.value == '0') {
        region.forEach((item) => {
          item.isChecked = false;
          item.plate && item.plate.forEach((v) => {
            v.isChecked = false;
          })
        })
      }
      plates = item.plate.filter((item) => {
        return item.id != '0' && item.isChecked;
      })

      if (plates.length == 0) {
        region[index].isChecked = !region[index].isChecked;
      } else {
        region[index].isChecked = true;
      }



      // 获取当前点击区域
      this.data.currentRegionIdx = index;
      allFilter.a.value = region;

      this.data.region = region;
      this.data.allFilter = allFilter;
      this.renderFilter();

    },
    // 改变板块
    changePlate(e) {
      let {
        index,
        item
      } = e.currentTarget.dataset;
      let {
        allFilter,
        region,
        currentRegionIdx,
        plate
      } = this.data;

      if (item.id == '0') {
        plate.forEach((item) => {
          item.isChecked = false;
        })
      }
      // 板块互斥
      plate[index].isChecked = !plate[index].isChecked;

      if (item.id != '0' && plate[index].isChecked) {
        region[currentRegionIdx].isChecked = true;
      }

      region[currentRegionIdx].plate = plate;
      allFilter.a.value = region;
      this.data.plate = plate;
      this.data.region = region;
      this.data.allFilter = allFilter;
      this.renderFilter();
    },
    // 清空区域板块
    clearRegion() {
      let {
        allFilter,
        region,
        plate
      } = this.data;
      region.forEach((item) => {
        item.isChecked = false;
        item.plate && item.plate.forEach((v) => {
          v.isChecked = false;
        })
      })

      this.data.region = region;
      this.data.currentRegionIdx = 0;
      allFilter.a.value = region;
      this.renderFilter();
    },
    // 改变户型
    changeHouseType(e) {
      let {
        index,
        item
      } = e.currentTarget.dataset;
      let {
        allFilter,
        houseType
      } = this.data;
      if (item.value == '0') {
        houseType.forEach((v) => {
          v.isChecked = false;
        })
      }
      houseType[index].isChecked = !houseType[index].isChecked;
      this.data.houseType = houseType;
      allFilter.d.value = houseType;
      this.data.allFilter = allFilter;
      this.renderFilter();
    },
    // 滑动最小
    minMove(e) {
      let {
        totalPrice
      } = this.data;
      totalPrice[0] = e.detail.lowValue
      this.setData({
        totalPrice
      })

    },
    // 滑动最大
    maxMove(e) {
      let {
        totalPrice
      } = this.data;
      totalPrice[1] = e.detail.heighValue
      this.setData({
        totalPrice
      })
    },
    // 清空户型， 价格
    clearHouseType() {
      let {
        allFilter,
        houseType,
        totalPriceMin,
        totalPriceMax
      } = this.data;
      houseType.forEach((item) => {
        item.isChecked = false
      })
      this.data.houseType = houseType;
      allFilter.d.value = houseType;
      // allFilter.c.default = [totalPriceMin, totalPriceMax];
      allFilter.c.checkedArr = [totalPriceMin, totalPriceMax];
      this.data.allFilter = allFilter;
      this.selectComponent("#price-slider").reset()
      this.renderFilter();
      this.setData({
        totalPrice: [totalPriceMin, totalPriceMax]
      })
    },
    // 确定点击
    submitFilter(type) {

      let appFilter = {};
      let {
        houseType,
        region,
        totalPrice,
        allFilter,
        totalPriceMin,
        totalPriceMax
      } = this.data;
      let regionArr = region.filter((item) => {
        return item.value != '0' && item.isChecked
      }).map((item) => {
        return item.value
      })

      if (regionArr.length > 0) {
        appFilter.a = regionArr;
      }

      // 户型
      let houseTypeArr = houseType.filter((item) => {
        return item.value != '0' && item.isChecked
      }).map((item) => {
        return item.value
      })
      if (houseTypeArr.length > 0) {
        appFilter.d = houseTypeArr;
      }
      // 总价
      if (totalPrice[0] != '0' || totalPrice[1] != '0') {
        let str = '';
        str += totalPrice[0];

        if (totalPriceMax * 1 == totalPrice[1] * 1) {
          str += ',0'
        } else {
          str += `,${totalPrice[1]}`
        }
        if (str != '0,0') {
          appFilter.c = str;
        }
      }

      // 关闭区域模块 户型模块
      this.setData({
        isShowRegionMark: false,
        isShowHouseTypeMark: false
      })

      // 板块数据 用于首页上交埋点
      let plateObj = {};
      let plateArr = allFilter.a.value.filter((item) => {
        return item.isChecked && item.value != '0'
      })
      plateArr.forEach((item) => {
        let pArr = item.plate.filter((v_plate) => {
          return v_plate.isChecked && v_plate.id != 0
        })
        if (pArr.length > 0) {
          plateObj[item.value] = [];
          pArr.forEach((v_plate) => {
            plateObj[item.value].push(v_plate.id)
          })
        }
      })

      this.setNames();
      this.data.plateObj = plateObj;
      if (type != 'default') {
        this.triggerEvent('submit', {
          appFilter,
          plateObj
        });

        
        // 8864
        analytic.sensors.track('e_click_quick_filter', {
          fromPage: 'p_home',
          fromModule: 'm_quick_find_room',
          fromItem: 'i_quick_filter',
          toPage: 'p_home',
          district: appFilter.a || [],
          house_type: appFilter.d || [],
          total_budget: appFilter.c || '',
          plate_id: JSON.stringify(plateObj)
        });
      }
      
    },
    // 设置文案 
    setNames() {
      // 区域文字
      let regionText = '';
      // 户型不限文字
      let houseTypeText = '';
      // 总价不限文字
      let totalPriceText = '';
      let {
        allFilter,
        totalPrice,
        totalPriceMin,
        totalPriceMax
      } = this.data;
      // 区域文案
      let regionTextTextArr = [];
      allFilter.a && allFilter.a.value.forEach((item) => {
        if (item.isChecked && item.value != '0') {
          let text = item.name;
          if (item.plate) {
            let plateArr = item.plate.filter((v_plate) => {
              return v_plate.isChecked && v_plate.id != 0
            })
            if (plateArr.length > 0) {
              text += '('
            }
            plateArr.forEach((v_plate, i_plate) => {

              if (i_plate != 0) {
                text += '/'
              }
              text += v_plate.trade_area
              if (i_plate == plateArr.length - 1) {
                text += ')'
              }
            })
          }
          regionTextTextArr.push(text)
        }
      })
      regionText = regionTextTextArr.length == 0 ? '' : regionTextTextArr.join(' | ');

      // 总价文案
      if (totalPrice[1] * 1 != totalPriceMax * 1) {
        totalPriceText = `${totalPrice[0]}-${totalPrice[1]}万`
      } else {
        totalPriceText += totalPrice[0]
        if (totalPrice[0] != '0') {
          totalPriceText += '万'
        }
        totalPriceText += '-不限'
      }
      if (totalPriceText == '0-不限') {
        totalPriceText = ''
      }
      // 户型文案
      allFilter.d && allFilter.d.value && allFilter.d.value.forEach((item) => {
        if (item.isChecked && item.value != '0') {
          houseTypeText += ` | ${item.name}`
        }
      })
      if (houseTypeText != '') {
        houseTypeText = houseTypeText.substring(3, houseTypeText.length)
      }
      this.setData({
        regionText,
        houseTypeText,
        totalPriceText
      })
    },


    // 关闭遮罩层
    closeMark() {
      this.setData({
        isShowRegionMark: false,
        isShowHouseTypeMark: false
      }, () => {
        app.dialogMapData('close');
        this.renderFilter('close');
      })
    },
    // 查找房源登陆成功
    async allowLogin(e) {
      let {
        defaultFilter,
        plateObj
      } = this.data;
      try {
        if (app.commonData.login_status) {
          wx.showLoading({
            title: '预约中...',
          });
          let res = await userDiscount({
            op_type: '900207'
          });
          wx.hideLoading();
          if (res.code == 0) {
            // 8867
            analytic.sensors.track('e_click_confirm_leave_phone', {
              fromPage: 'p_home',
              fromModule: 'm_quick_find_room',
              fromItem: 'i_confirm_leave_phone',
              toPage: 'p_home',
              op_type: '900207',
              leave_phone_state: '1',
              order_id: res.data.order_id,
              business_type: res.data.business_type,
              district: defaultFilter.a || [],
              house_type: defaultFilter.d || [],
              total_budget: defaultFilter.c || '',
              plate_id: JSON.stringify(plateObj)
            });
            // 进入楼盘列表页面  列表页面弹出留电成功弹窗
            app.dialogMapData('set', 'list-orderSuccess');
            wx.switchTab({
              url: '/pages/project/list/projectList',
            });
          }
        }
      } catch (e) {
        console.log(e);
      }

    },
    // 点击查找房源
    async findHouse() {
      let {
        defaultFilter,
        isCheckedService,
        userHasOrder,
        plateObj
      } = this.data;

      // 8868
      analytic.sensors.track('e_click_view_project', {
        fromPage: 'p_home',
        fromModule: 'm_quick_find_room',
        fromItem: 'i_view_project',
        toPage: 'p_home',
        district: defaultFilter.a,
        house_type: defaultFilter.d,
        total_budget: defaultFilter.c,
        login_state: app.commonData.login_status ? 1 : 2,
        is_select: isCheckedService ? 1 : 2,
        is_show: !userHasOrder ? 1 : 2,
        plate_id: JSON.stringify(plateObj)
      });
      // 留电 入口
      
      if (!userHasOrder) { // 显示
        if (isCheckedService) { // 勾选
          // 8866
          analytic.sensors.track('e_click_leave_phone_entry', {
            fromPage: 'p_home',
            fromModule: 'm_quick_find_room',
            fromItem: 'i_leave_phone_entry',
            toPage: 'p_home',
            op_type: '900207',
            district: defaultFilter.a,
            house_type: defaultFilter.d,
            total_budget: defaultFilter.c,
            login_state: app.commonData.login_status ? 1 : 2,
            is_select: isCheckedService ? 1 : 2,
            is_show: !userHasOrder ? 1 : 2,
            plate_id: JSON.stringify(plateObj)
          });
          if (app.commonData.login_status) { // 已登录

            wx.showLoading({
              title: '预约中...',
            });
            let res = await userDiscount({
              op_type: '900207'
            });
            wx.hideLoading();
            if (res.code == 0) {
              // 8867
              analytic.sensors.track('e_click_confirm_leave_phone', {
                fromPage: 'p_home',
                fromModule: 'm_quick_find_room',
                fromItem: 'i_confirm_leave_phone',
                toPage: 'p_home',
                op_type: '900207',
                leave_phone_state: '1',
                order_id: res.data.order_id,
                business_type: res.data.business_type,
                district: defaultFilter.a,
                house_type: defaultFilter.d,
                total_budget: defaultFilter.c,
                plate_id: JSON.stringify(plateObj)
              });
              // 留电成功
              app.dialogMapData('set', 'list-orderSuccess');
              wx.switchTab({
                url: '/pages/project/list/projectList',
              });
            }
          }
        } else { // 不勾选
          app.dialogMapData('set', 'list-service');
          wx.switchTab({
            url: '/pages/project/list/projectList',
          });
        }
      } else { // 不显示
        wx.switchTab({
          url: '/pages/project/list/projectList',
        });
      }
    },

    // 取消登录
    findHouseCancelLogin() {
      wx.showToast({
        title: "登录失败",
        icon: "none",
        duration: 1500
      });
    },

    // 切换找房服务
    changeService() {
      // 8865
      analytic.sensors.track('e_click_checkbox', {
        fromPage: 'p_home',
        fromModule: 'm_quick_find_room',
        fromItem: 'i_checkbox',
        toPage: 'p_home',
        select_status: this.data.isCheckedService ? '0' : '1'
      });

      let {
        isCheckedService
      } = this.data;
      this.setData({
        isCheckedService: !isCheckedService
      })
    }
  }
})