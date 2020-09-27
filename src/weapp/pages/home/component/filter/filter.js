/*
 * @author: zhidl
 * @Date: 2020-08-14 21:07:29
 * @description: 列表页 首页筛选模块
 * @LastEditTime: 2020-09-15 11:18:50
 * @LastEditors: Please set LastEditors
 */
const app = getApp();
const analytic = require('../../../../analytic/analytic');

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
      value: {},
      observer(newObj) {

      }
    },
    position: {
      type: String,
      value: 'relative'
    },
    top: {
      type: Number,
      value: 0
    },
    abTest: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 筛选栏头部数据
    filterTab: {
      // 区域
      region: {
        // 名字
        name: '区域',
        // 区域映射当前项
        values: [
          // 区域
          {
            key: 'a',
            isMore: true
          },
          // 地铁
          {
            key: 'b',
            isMore: true
          },
          // 环线
          {
            key: 'i',
            isMore: true
          },
          // 附近
          {
            key: 'x',
            isMore: false
          }
        ],
        // 样式分类
        layout: 'A',
        // 初始化默认选择
        clickChild: 'a',
        // 当前选中个数
        num: 0
      },
      // 价格
      price: {
        name: '价格',
        values: [
          // 总价
          {
            key: 'c',
            min: '',
            max: '',
            isMore: true
          },
          // 单价
          {
            key: 'f',
            min: '',
            max: '',
            isMore: true
          },
        ],
        layout: 'A',
        clickChild: 'c',
        num: 0
      },
      // 户型
      housetype: {
        name: '户型',
        values: [
          // 面积
          {
            key: 'g',
            min: '',
            max: '',
            isMore: true
          },
          // 居室
          {
            key: 'd',
            isMore: true
          },
        ],
        clickChild: 'g',
        num: 0,
        layout: 'A'
      },
      // 更多
      more: {
        name: '更多',
        values: [
          // 'e', 'l', 'j', 'h'
          // 类型
          {
            key: 'e',
            isMore: true
          },
          // 售卖情况
          {
            key: 'j',
            isMore: true
          },
          // 开盘时间
          {
            key: 'n',
            isMore: true
          },
          // 特色
          {
            key: 'h',
            isMore: true
          },
          // 品牌开发商
          {
            key: 'l',
            isMore: true
          }
        ],
        num: 0,
        layout: 'B'
      },
      // 排序
      sort: {
        name: '排序',
        values: [{
          key: 's',
          isMore: false
        }],
        num: 0,
        layout: 'C'
      }
    },
    // 复制input原有值
    cloneInput: {
      unitMin: '',
      unitMax: '',
      totalMin: '',
      totalMax: '',
      areaMin: '',
      areaMax: ''
    },
    // 当前切换筛选项tab key
    currentClickKey: '',
    // 当前切换筛选项tab item
    currentClickItem: {},
    // 全量filter 接口下发
    allFilter: {},
    // 左侧滚动条渲染内容
    scrollLeft: [
      // {
      //   key: 'a',
      //   name: '区域',
      //   values: [],
      //   isChecked: false
      // }
    ],
    // 右侧滚动条渲染内容
    scrollRight: [
      // {
      //   name: v.name,
      //   value: v.value,
      //   isChecked: false
      // }
    ],
    // 更多内容渲染数据
    moreData: [],
    // 排序渲染内容
    sortData: [],
    // 控制是否需要禁止点击
    noClick: true,
    // 深度克隆
    cloneAllFilter: {},
    filterWrapTop: 0,
    // 列表页面路径
    listPagePath: 'pages/project/list/projectList',
    // home | list  home页面 或者 list页面  埋点判断
    pageList: 'home',
    city_id: ''
  },
  // currentClickKey
  observers: {
    currentClickKey(newv) {
      if (newv != '') {
        app.dialogMapData('set', 'home-filter');
      }
    }
  },
  attached() {
    let pages = getCurrentPages();
    if(pages[pages.length - 1].route == 'pages/project/list/projectList'){
      this.data.pageList = 'list'
    } else if(pages[pages.length - 1].route == 'pages/home/home'){
      this.data.pageList = 'home'
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 初始化设置 filter
    setAllFilter(allFilter) {
      // 是否需要刷新筛选组件s
      if (JSON.stringify(allFilter) != '{}') {
        // console.log(allFilter, 'allFilter');
        this.data.noClick = false;
        this.setData({
          allFilter,
          currentClickItem: this.data.filterTab[this.data.currentClickKey] || ''
        }, () => {
          this.renderFilter('default');
        })
      } else {
        this.data.noClick = true;
      }
    },
    // 切换一级筛选栏
    tabItems(e) {
      // 若报错 禁止点击
      if (this.data.noClick) {
        return
      }
      let {
        key,
        item
      } = e.currentTarget.dataset;
      
      if (this.data.currentClickKey == key) {
        this.setData({
          currentClickKey: ''
        })
        app.dialogMapData('close');
        this.renderFilter('close');
        return;
      }
      
      // 切换城市默认二级菜单
      if(this.data.city_id != app.commonData.city.city_id){
        this.setData({
          ['filterTab.region.clickChild'] : 'a',
          ['filterTab.price.clickChild'] : 'c',
          ['filterTab.housetype.clickChild'] : 'g'
        })
      }
      // 显示下拉选项
      this.setData({
        currentClickKey: key,
        city_id: app.commonData.city.city_id
      }, () => {

        // 列表页面筛选组件置顶 单独处理
        let pages = getCurrentPages();
        if (pages[pages.length - 1].route == this.data.listPagePath) {
          this.setData({
            filterWrapTop: this.data.position == 'relative' ? -104 : 0
          })
        }

        let click_position = '';
        switch(key){
          case 'region':
            click_position = '1';
            break;
          case 'price':  
            click_position = '2';
            break;
          case 'housetype':
            click_position = '3';
            break;
          case 'more':
            click_position = '4';
            break;
          default:
            click_position = '';
        }

        
        if(this.data.pageList == 'list'){ // list页面埋点

          if(key != 'sort'){
            // 9186
            analytic.sensors.track('e_click_filter_entry', {
              fromPage: 'p_project_list',
              fromModule: 'm_filter',
              fromItem: 'i_filter_entry',
              toPage: 'p_project_list',
              click_position
            });
          } else {
            // 2542
            analytic.sensors.track('e_click_sort_entry', {
              fromPage: 'p_project_list',
              fromModule: 'm_filter',
              fromItem: 'i_sort_entry',
              toPage: 'p_project_list'
            });
          }
        } else { // home页面
          if(key != 'sort'){
            // 8880
            analytic.sensors.track('e_click_filter_entry', {
              fromPage: 'p_home',
              fromModule: 'm_filter',
              fromItem: 'i_filter_entry',
              toPage: 'p_home',
              click_position
            });
          } else {
            // 8882
            analytic.sensors.track('e_click_sort_entry', {
              fromPage: 'p_home',
              fromModule: 'm_filter',
              fromItem: 'i_sort_entry',
              toPage: 'p_home'
            });
          }
        }
        
        this.triggerEvent('clickKey', {
          key
        });
        this.renderFilter('copy');
      })
    },
    /**
     * @description: // 外部调用传递 currentClickKey 数值
     * @param {string} key值 region ｜ price ｜ housetype ｜ more ｜ sort
     */
    filterKey(key, defaultChild = '') {
      // 若报错 禁止点击
      if (this.data.noClick) {
        return
      }
      let obj = {
        currentClickKey: key
      }
      if (defaultChild != '') {
        obj[`filterTab.${key}.clickChild`] = defaultChild
      }
      // 显示下拉选项
      this.setData(obj, () => {
        this.renderFilter();
      })
    },
    // 切换二级筛选栏
    tabTwoItem(e) {
      let {
        index,
        item
      } = e.currentTarget.dataset;
      let {
        scrollLeft,
        filterTab,
        currentClickKey
      } = this.data;

      filterTab[currentClickKey].clickChild = item.key;


      let scrollRight = [];
      // 切换scrollLeft 
      let cloneLeft = scrollLeft.map((v, i) => {
        let obj = v;
        obj.isChecked = (index == i)
        return obj
      })
      // 查找对应scrollRight
      scrollRight = cloneLeft.filter((item, idx) => {
        return item.isChecked
      })[0].values;

      this.data.scrollLeft = cloneLeft;
      this.data.scrollRight = scrollRight;
      this.data.filterTab = filterTab;
      this.renderFilter();
    },
    // 选中每一个小项
    checkedSmall(e) {
      let {
        index,
        item
      } = e.currentTarget.dataset;
      // 不限为选中时， 不能进行点击
      if (item.value == '0' && item.isChecked) {
        return;
      }
      let {
        scrollRight,
        allFilter,
        scrollLeft,
        currentClickKey,
        filterTab
      } = this.data;

      // 若单选 或者 选择不限
      if (!item.isMore || item.value == '0') {
        scrollRight.forEach((v, i) => {
          v.isChecked = false;
        })
      }
      scrollRight[index].isChecked = !scrollRight[index].isChecked;

      // 更改allFilter源头
      let leftKey = scrollLeft.filter((v, i) => {
        return v.isChecked
      })[0].key;
      allFilter[leftKey].value = scrollRight;

      // 区域下面互斥单独处理
      if (currentClickKey == 'region') {
        let areaArr = [];
        filterTab[currentClickKey].values.forEach((v, i) => {
          areaArr.push(v.key);
        })
        areaArr.splice(areaArr.indexOf(leftKey), 1);

        areaArr.forEach((k, i) => {
          allFilter[k] && allFilter[k].value.forEach((v) => {
            v.isChecked = false
          })
        })
      }

      // 价格跟输入框互斥
      if (currentClickKey == 'price' && scrollRight[index].isChecked) {
        filterTab.price.values.forEach((v) => {
          if (v.key == leftKey) {
            v.min = '';
            v.max = '';
          }
        })
      }
      // 面积与输入框互斥
      if (currentClickKey == 'housetype' && scrollRight[index].isChecked) {
        filterTab.housetype.values.forEach((v) => {
          if (v.key == leftKey) {
            v.min = '';
            v.max = '';
          }
        })
      }

      this.data.scrollRight = scrollRight;
      this.data.allFilter = allFilter;
      this.data.filterTab = filterTab;
      this.renderFilter();
    },
    // 单价输入框
    unitPriceIpt(e) {
      let {
        type
      } = e.currentTarget.dataset;
      let {
        filterTab,
        allFilter
      } = this.data;

      filterTab.price.values[1][type] = e.detail.value.replace(/[^0-9]/g, '');
      allFilter.f.value.forEach((v) => {
        v.isChecked = false;
      })

      this.data.allFilter = allFilter;
      this.data.filterTab = filterTab;
      this.renderFilter();
    },
    // 总价输入框
    totalPriceIpt(e) {
      let {
        type
      } = e.currentTarget.dataset;
      let {
        filterTab,
        allFilter
      } = this.data;
      filterTab.price.values[0][type] = e.detail.value.replace(/[^0-9]/g, '');
      allFilter.c.value.forEach((v) => {
        v.isChecked = false;
      })
      this.data.allFilter = allFilter;
      this.data.filterTab = filterTab;
      this.renderFilter();
    },
    // 面积输入框
    areaIpt(e) {
      let {
        type
      } = e.currentTarget.dataset;
      let {
        filterTab,
        allFilter
      } = this.data;
      filterTab.housetype.values[0][type] = e.detail.value.replace(/[^0-9]/g, '');
      allFilter.g.value.forEach((v) => {
        v.isChecked = false;
      })
      this.data.allFilter = allFilter;
      this.data.filterTab = filterTab;
      this.renderFilter();
    },
    // 切换更多选项
    checkedMoreItem(e) {
      let {
        items,
        index,
        idx,
        item
      } = e.currentTarget.dataset;
      let {
        moreData,
        allFilter
      } = this.data;

      // 若单选 或者 选择不限
      if (!items.isMore || item.value == '0') {
        moreData[index].values.forEach((v, i) => {
          v.isChecked = false;
        })
      }
      moreData[index].values[idx].isChecked = !moreData[index].values[idx].isChecked;

      // 改变根源allFilter
      moreData.forEach((v, i) => {
        if (v.key == items.key) {
          allFilter[items.key].value = moreData[i].values;
        }
      });
      this.data.moreData = moreData;
      this.data.allFilter = allFilter;
      this.renderFilter();
    },
    // 清空当前筛选项
    clearCurrentFilter() {
      let {
        scrollRight,
        allFilter,
        scrollLeft,
        currentClickKey,
        moreData
      } = this.data;

      // 区域清空
      if (currentClickKey == 'region' || currentClickKey == 'price' || currentClickKey == 'housetype') {
        scrollRight.forEach((v, i) => {
          v.isChecked = false;
        })
        // 更改allFilter源头
        let leftKey = scrollLeft.filter((v, i) => {
          return v.isChecked
        })[0].key;
        allFilter[leftKey].value = scrollRight;
        this.data.scrollRight = scrollRight;
        this.data.allFilter = allFilter;
        this.data.scrollLeft = scrollLeft;
      }


      // 更多清空
      if (currentClickKey == 'more') {
        moreData.forEach((v, i) => {
          v.values.forEach((it, idx) => {
            it.isChecked = false
          })
          allFilter[v.key].value = v.values;
        });
        this.data.moreData = moreData;
        this.data.allFilter = allFilter;
      }
      this.renderFilter();
    },
    // 切换排序
    checkedSort(e) {
      let {
        index,
        item
      } = e.currentTarget.dataset;
      let {
        sortData,
        allFilter
      } = this.data;

      if (!item.isMore || item.value == '0') {
        sortData.forEach((v, i) => {
          v.isChecked = false;
        })
      }
      sortData[index].isChecked = !sortData[index].isChecked;
      allFilter.s.value = sortData;
      this.data.sortData = sortData;
      this.data.allFilter = allFilter;
      this.renderFilter();
      this.submitFilter();
    },
    /**
     * @description: 核心渲染函数
     * @param {string} type default 或者 close  default为初始化使用， close 关闭状态使用 copy
     * @param {string} moduleClick 是否是模块点击，此参数是为了模块点击埋点使用
     */
    renderFilter(type, moduleClick) {
      try {
        let {
          allFilter,
          filterTab,
          currentClickKey,
          defaultFilter,
          cloneInput
        } = this.data;
        let scrollLeft = [];
        let scrollRight = [];
        let moreData = [];
        let sortData = [];
        if (type == 'close') {
          this.triggerEvent('clearFiltertop');
          // 筛选项赋原有值
          allFilter = JSON.parse(JSON.stringify(this.data.cloneAllFilter));

          // 给input 赋值原有值
          filterTab.price.values[1].min = cloneInput.unitMin;
          filterTab.price.values[1].max = cloneInput.unitMax;
          filterTab.price.values[0].min = cloneInput.totalMin;
          filterTab.price.values[0].max = cloneInput.totalMax;
          filterTab.housetype.values[0].min = cloneInput.areaMin;
          filterTab.housetype.values[0].max = cloneInput.areaMax;

        }
        if (type == 'default') {

          Object.keys(allFilter).forEach((k) => {
            allFilter[k].value && allFilter[k].value.forEach((item) => {
              item.isChecked = false
            })
          })

          if (defaultFilter.c == undefined) {
            filterTab.price.values[0].min = '';
            filterTab.price.values[0].max = '';
          }
          if (defaultFilter.f == undefined) {
            filterTab.price.values[1].min = '';
            filterTab.price.values[1].max = '';
          }
          if (defaultFilter.g == undefined) {
            filterTab.housetype.values[0].min = '';
            filterTab.housetype.values[0].max = '';
          }
        }
        // 父组件传递值， 默认选中
        if ((type == 'default' || type == 'close') && JSON.stringify(defaultFilter) != '{}') {
          Object.keys(defaultFilter).forEach((k) => {
            // 总价
            if (k == 'c' && !Array.isArray(defaultFilter[k])) {
              let arr = defaultFilter[k].split(',');
              filterTab.price.values[0].min = arr[0] == '0' ? '' : arr[0];
              filterTab.price.values[0].max = arr[1] == '0' ? '' : arr[1];
            }
            // 单价
            if (k == 'f' && !Array.isArray(defaultFilter[k])) {
              let arr = defaultFilter[k].split(',');
              filterTab.price.values[1].min = arr[0] == '0' ? '' : arr[0];
              filterTab.price.values[1].max = arr[1] == '0' ? '' : arr[1];
            }
            // 面积
            if (k == 'g' && !Array.isArray(defaultFilter[k])) {
              let arr = defaultFilter[k].split(',');
              filterTab.housetype.values[0].min = arr[0] == '0' ? '' : arr[0];
              filterTab.housetype.values[0].max = arr[1] == '0' ? '' : arr[1];
            }

            // 数组属性
            if (Array.isArray(defaultFilter[k])) {
              defaultFilter[k].forEach((item_v) => {
                allFilter[k].value && allFilter[k].value.forEach((item_k) => {
                  if (item_v == item_k.value) {
                    item_k.isChecked = true
                  }
                })
              })
            }

            // 字符串类型
            if (defaultFilter[k] && !Array.isArray(defaultFilter[k]) && k != 'c' && k != 'f' && k != 'g') {
              allFilter[k].value && allFilter[k].value.forEach((item_k) => {
                if (defaultFilter[k] == item_k.value) {
                  item_k.isChecked = true
                }
              })
            }

          })
        }

        if (currentClickKey == 'region' || currentClickKey == 'price' || currentClickKey == 'housetype') {
          // 整理左侧渲染数据
          scrollLeft = filterTab[currentClickKey].values.map((v, i) => {
            let item = allFilter[v.key] ? allFilter[v.key] : {};
            if (JSON.stringify(item) == '{}') {
              return {}
            } else {
              let values = item.value.map((it, idx) => {
                return {
                  name: it.name,
                  value: it.value,
                  isChecked: it.isChecked ? it.isChecked : false,
                  isMore: v.isMore,
                  key: v.key
                }
              })
              let obj = {};
              if (v.key == 'c' || v.key == 'f' || v.key == 'g') {
                obj.min = v.min;
                obj.max = v.max;
              }
              return Object.assign({
                key: v.key,
                name: item.name,
                values,
                isChecked: filterTab[currentClickKey].clickChild == v.key,
                min: 'none',
                max: 'none'
              }, obj)
            }
          }).filter((v) => {
            return JSON.stringify(v) != '{}'
          })

          // 整理右侧渲染数据
          let checkRight = scrollLeft.filter((item, idx) => {
            return item.isChecked
          })[0] || {values: []};
          scrollRight = checkRight.values;

          // 选中不限
          let isCheckedAll = scrollRight.filter((v, i) => {
            return v.value != '0'
          }).some((v) => {
            return v.isChecked
          })
          // 判断输入框有无值
          let iptHasValue = false;

          if (checkRight.min == '' && checkRight.max == '') {
            iptHasValue = false;
          } else {
            iptHasValue = true;
          }
          if (checkRight.min == 'none' && checkRight.max == 'none') {
            iptHasValue = false;
          }

          scrollRight.forEach((v) => {
            if (v.value == '0') {
              v.isChecked = !isCheckedAll && !iptHasValue;
            }
          })
        }
        if (currentClickKey == 'more') {
          // 整理更多数据
          moreData = filterTab[currentClickKey].values.map((v, i) => {
            let item = allFilter[v.key] ? allFilter[v.key] : {};
            let values = []
            if(Array.isArray(item.value)){
              values = item.value.map((it, idx) => {
                let obj = {
                  name: it.name,
                  value: it.value,
                  isChecked: it.isChecked ? it.isChecked : false,
                  isMore: v.isMore
                }
                if (v.key == 'h') {
                  obj.style = it.style
                }
  
                return obj
              })
            }

            // 选中不限
            let isCheckedAll = values.filter((v, i) => {
              return v.value != '0'
            }).some((v) => {
              return v.isChecked
            })
            values.forEach((v) => {
              if (v.value == '0') {
                v.isChecked = !isCheckedAll;
              }
            })

            return {
              key: v.key,
              name: item.name,
              values,
              isMore: v.isMore
            }
          })

          let arr = moreData.filter((v) => {
            return v.key == 'h'
          })[0];
          allFilter.h && (allFilter.h.value = arr.values);
        }

        if (currentClickKey == 'sort') {
          sortData = filterTab[currentClickKey].values.map((v, i) => {
            let item = allFilter[v.key] ? allFilter[v.key] : {value:[]};
            let values = item.value.map((it, idx) => {
              return {
                name: it.name,
                value: it.value,
                isChecked: it.isChecked ? it.isChecked : false,
                isMore: v.isMore
              }
            })

            // 选中不限
            let isCheckedAll = values.filter((v, i) => {
              return v.value != '0'
            }).some((v) => {
              return v.isChecked
            })
            values.forEach((v) => {
              if (v.value == '0') {
                v.isChecked = !isCheckedAll;
              }
            })
            return {
              name: item.name,
              values
            }
          })[0].values
        }

        // 加入单选多选
        let values = [];
        for (let k in filterTab) {
          values = values.concat(filterTab[k].values)
        }
        values.forEach((v, i) => {
          if (allFilter[v.key]) {
            Object.assign(allFilter[v.key], v)
          }
        })
        // 联动快捷筛选栏
        let quick_filter = JSON.parse(JSON.stringify(allFilter.quick_filter || {value: []}))
        Object.keys(allFilter).forEach((k) => {
          if (k != 'quick_filter') {
            allFilter[k].value && allFilter[k].value.forEach((item) => {
              quick_filter.value && quick_filter.value.forEach((qucik) => {
                if (item.value == qucik.value) {
                  qucik.isChecked = item.isChecked
                }
              })
            })
          }
        })

        allFilter.quick_filter = quick_filter;

        let scrollL = [];
        scrollLeft.forEach((item) => {
          if (item.values.length != 0) {
            scrollL.push(item);
          }
        })
        this.setData({
          allFilter,
          scrollLeft: scrollL,
          scrollRight,
          moreData,
          sortData,
          currentClickItem: filterTab[currentClickKey] || '',
          filterTab
        }, () => {
          if (type == 'default') {
            // this.data.cloneAllFilter = JSON.parse(JSON.stringify(this.data.allFilter));
            this.submitFilter('default');
          }
          if (moduleClick) {
            this.submitFilter('click');
          }
          // 展开下拉筛选 存储原本展开值
          if(type == 'copy' || type == 'default'){
            this.data.cloneAllFilter = JSON.parse(JSON.stringify(this.data.allFilter));
            this.data.cloneInput = Object.assign({}, {
              unitMin: filterTab.price.values[1].min,
              unitMax: filterTab.price.values[1].max,
              totalMin: filterTab.price.values[0].min,
              totalMax: filterTab.price.values[0].max,
              areaMin: filterTab.housetype.values[0].min,
              areaMax: filterTab.housetype.values[0].max
            })
          }
        })
      } catch (e) {
        console.log(e);
      }
    },
    // 提交筛选项
    // type default click
    submitFilter(type) {
      // 需存储
      let appFilter = {};
      let {
        allFilter,
        filterTab
      } = this.data;

      for (let k in allFilter) {
        if (allFilter[k] && allFilter[k].value && Array.isArray(allFilter[k].value)) {
          let isAll = allFilter[k].value.filter((v, i) => {
            return v.value != '0'
          }).some((v) => {
            return v.isChecked
          })
          // 排除不限的数组
          let noHasAll = allFilter[k].value.filter((v, i) => {
            return v.value != '0'
          })
          // 判断是否为不限
          if (isAll) {
            // 判断是否为多选
            if (allFilter[k].isMore) {
              appFilter[k] = []
              noHasAll.forEach((v, i) => {
                // 选中push
                if (v.isChecked) {
                  appFilter[k].push(v.value);
                }
              })
            } else {
              appFilter[k] = ''
              noHasAll.forEach((v, i) => {
                // 选中赋值
                if (v.isChecked) {
                  appFilter[k] = v.value;
                }
              })
            }
          }
        }

      }

      // 判断总价
      // c
      if ((filterTab.price.values[0].max != '') && filterTab.price.values[0].min * 1 > filterTab.price.values[0].max * 1) {
        wx.showToast({
          icon: 'none',
          title: '最大总价需大于最小总价'
        })
        return;
      }
      if (filterTab.price.values[0].max != '' && filterTab.price.values[0].max * 1 == 0) {
        wx.showToast({
          icon: 'none',
          title: '最大总价不能为0'
        })
        return;
      }
      // 判断单价
      // f
      if ((filterTab.price.values[1].max != '') && filterTab.price.values[1].min * 1 > filterTab.price.values[1].max * 1) {
        wx.showToast({
          icon: 'none',
          title: '最大单价需大于最小单价'
        })
        return;
      }
      if (filterTab.price.values[1].max != '' && filterTab.price.values[1].max * 1 == 0) {
        wx.showToast({
          icon: 'none',
          title: '最大单价不能为0'
        })
        return;
      }
      // 判断面积
      if ((filterTab.housetype.values[0].max != '') && filterTab.housetype.values[0].min * 1 > filterTab.housetype.values[0].max * 1) {
        wx.showToast({
          icon: 'none',
          title: '最大面积需大于最小面积'
        })
        return;
      }
      if (filterTab.housetype.values[0].max != '' && filterTab.housetype.values[0].max * 1 == 0) {
        wx.showToast({
          icon: 'none',
          title: '最大面积不能为0'
        })
        return;
      }
      // c 总价处理
      if (filterTab.price.values[0].min || filterTab.price.values[0].max) {
        if (filterTab.price.values[0].min * 1 == 0 && filterTab.price.values[0].max * 1 != 0) {
          appFilter.c = `0,${filterTab.price.values[0].max}`
        }
        if (filterTab.price.values[0].min * 1 != 0 && filterTab.price.values[0].max * 1 != 0) {
          appFilter.c = `${filterTab.price.values[0].min},${filterTab.price.values[0].max}`
        }
        if (filterTab.price.values[0].min * 1 != 0 && filterTab.price.values[0].max * 1 == 0) {
          appFilter.c = `${filterTab.price.values[0].min},0`
        }
      }

      // f单价处理
      if (filterTab.price.values[1].min || filterTab.price.values[1].max) {
        if (filterTab.price.values[1].min * 1 == 0 && filterTab.price.values[1].max * 1 != 0) {
          appFilter.f = `0,${filterTab.price.values[1].max}`
        }
        if (filterTab.price.values[1].min * 1 != 0 && filterTab.price.values[1].max * 1 != 0) {
          appFilter.f = `${filterTab.price.values[1].min},${filterTab.price.values[1].max}`
        }
        if (filterTab.price.values[1].min * 1 != 0 && filterTab.price.values[1].max * 1 == 0) {
          appFilter.f = `${filterTab.price.values[1].min},0`
        }
      }

      // g面积处理
      if (filterTab.housetype.values[0].min || filterTab.housetype.values[0].max) {
        if (filterTab.housetype.values[0].min * 1 == 0 && filterTab.housetype.values[0].max * 1 != 0) {
          appFilter.g = `0,${filterTab.housetype.values[0].max}`
        }
        if (filterTab.housetype.values[0].min * 1 != 0 && filterTab.housetype.values[0].max * 1 == 0) {
          appFilter.g = `${filterTab.housetype.values[0].min},0`
        }
        if (filterTab.housetype.values[0].min * 1 != 0 && filterTab.housetype.values[0].max * 1 != 0) {
          appFilter.g = `${filterTab.housetype.values[0].min},${filterTab.housetype.values[0].max}`
        }
      }

      this.setData({
        filterWrapTop: 0
      })
      this.triggerEvent('clearFiltertop');
      // 移除快速筛选
      if (appFilter.quick_filter) {
        delete appFilter.quick_filter
      }
      // 存储公共变量 appFilter
      app.globalData.newFilter = JSON.parse(JSON.stringify(appFilter));

      // 计算个数
      this.getNums(appFilter);
      this.triggerEvent('submit', {
        appFilter,
        isClick: !(this.data.currentClickKey == '') || type == 'click'
      });
      // 关闭下拉选项
      this.setData({
        currentClickKey: ''
      })
      if (type != 'default') {
        app.dialogMapData('close');
      }
    },
    // 回显 标题文字
    getNums(appFilter) {
      let {
        filterTab,
        allFilter
      } = this.data;
      let defaultNames = ['区域', '价格', '户型', '更多', '排序'];

      // 创建二维数组
      let filterArr = [];
      for (let k in filterTab) {
        let arr = [];
        filterTab[k].values.forEach((v, i) => {
          arr.push(v.key)
        })
        filterArr.push(arr);
      }

      // 相对应数量
      let numArr = filterArr.map((item) => {
        let num = 0;
        item.forEach((v) => {
          if (appFilter[v] instanceof Array) {
            num += appFilter[v].length
          } else {
            if (appFilter[v]) {
              num += 1
            }
          }
        })
        return num;
      })
      // 数量为1 相对应name
      let namesArr = filterArr.map((item) => {
        let name = '';
        item.forEach((v) => {
          allFilter[v] && allFilter[v].value.forEach((it) => {
            if (it.isChecked && it.value != '0') {
              name = it.name;
            }
          })
        })
        return name;
      })


      // 设置标题名字
      Object.keys(filterTab).forEach((v, i) => {
        filterTab[v].num = numArr[i]
        // 排除 排序 价格文案
        if (i != 4 && i != 1) {
          if (filterTab[v].num == 0) {
            filterTab[v].name = defaultNames[i]
          } else if (filterTab[v].num == 1) {
            filterTab[v].name = namesArr[i]
          } else {
            filterTab[v].name = defaultNames[i] + `(${filterTab[v].num})`;
          }

          // 更多回显文案单独处理
          if (i == 3) {
            filterTab[v].name = filterTab[v].num == 0 ? defaultNames[i] : defaultNames[i] + `(${filterTab[v].num})`
          }
        }
      })
      // 单一选择第二筛选项 回显
      let tabName = filterArr.map((item, i) => {
        let arr = [];
        item.forEach((v) => {
          let name = '';
          let num = 0;
          allFilter[v] && allFilter[v].value.forEach((k) => {
            name = allFilter[v].name;
            if (k.isChecked && k.value != '0') {
              num++;
            }

            // 总价特殊处理
            if (v == 'c' && appFilter.c != undefined && !Array.isArray(appFilter.c)) {
              name = '总价';
              num = 1;
            }

            if (v == 'f' && appFilter.f && !Array.isArray(appFilter.f)) {
              name = '单价';
              num = 1;
            }

            if (v == 'g' && appFilter.g && !Array.isArray(appFilter.g)) {
              name = '面积';
              num = 1;
            }
          })

          let obj = {
            name: name + '(' + num + ')',
            num
          }
          arr.push(obj);
        })
        return arr;
      })

      let singleTabName = tabName.map((item) => {
        return item.filter((v) => {
          return v.num != 0
        })
      })

      Object.keys(filterTab).forEach((v, i) => {
        if (i != 3 && i != 4) {
          if (singleTabName[i].length == 1 && singleTabName[i][0].num != 1) {
            filterTab[v].name = singleTabName[i][0].name;
          }
        }
      })

      // 设置价格标题名字
      // 总价 c
      let totalPriceText = '';
      // 单价 f
      let unitPriceText = '';
      // 面积 g
      let areaText = '';
      if (appFilter.c && !(appFilter.c instanceof Array)) {
        let arr = appFilter.c.split(',');
        if (arr[0] == '0') {
          totalPriceText = `<${arr[1]}万元`
        }
        if (arr[1] == '0') {
          totalPriceText = `>${arr[0]}万元`
        }
        if (arr[0] == arr[1]) {
          totalPriceText = `${arr[0]}万元`
        }
        if (arr[0] != '0' && arr[1] != '0') {
          totalPriceText = `${arr[0]}-${arr[1]}万元`
        }
      }

      if (appFilter.f && !(appFilter.f instanceof Array)) {
        let arr = appFilter.f.split(',');
        if (arr[0] == '0') {
          unitPriceText = `<${arr[1]}元`
        }
        if (arr[1] == '0') {
          unitPriceText = `>${arr[0]}元`
        }
        if (arr[0] == arr[1]) {
          unitPriceText = `${arr[0]}元`
        }
        if (arr[0] != '0' && arr[1] != '0') {
          unitPriceText = `${arr[0]}-${arr[1]}元`
        }
      }
      if (appFilter.g && !(appFilter.g instanceof Array)) {
        let arr = appFilter.g.split(',');
        if (arr[0] * 1 == '0') {
          areaText = `<${arr[1]}㎡`
        }
        if (arr[1] * 1 == '0') {
          areaText = `>${arr[0]}㎡`
        }
        if (arr[0] == arr[1]) {
          areaText = `${arr[0]}㎡`
        }
        if (arr[0] * 1 != '0' && arr[1] * 1 != '0') {
          areaText = `${arr[0]}-${arr[1]}㎡`
        }
      }
      // 面积赋值
      if (numArr[2] == 1 && areaText != '') {
        filterTab.housetype.name = areaText;
      }


      // 判断价格选中数量 进行设置名字
      if (numArr[1] == 0) {
        filterTab.price.name = '价格'
      } else if (numArr[1] == 1) {
        if ((appFilter.c && !(appFilter.c instanceof Array)) || (appFilter.f && !(appFilter.f instanceof Array))) {
          filterTab.price.name = totalPriceText || unitPriceText
        } else {
          ['c', 'f'].forEach((v) => {
            allFilter[v] && allFilter[v].value.forEach((it) => {
              if (it.isChecked && it.value != '0') {
                filterTab.price.name = it.name;
              }
            })
          })
        }
      } else {
        filterTab.price.name = singleTabName[1].length == 1 ? singleTabName[1][0].name : '价格' + `(${numArr[1]})`
      }



      this.setData({
        filterTab
      })

    },
    // 快速筛选
    checkedQuick(e) {
      let {
        index,
        item,
      } = e.currentTarget.dataset;
      let {
        allFilter,
        abTest,
        moreData
      } = this.data;
      // 点击快捷筛选通知 点击埋点使用
      if (!item.isChecked) {
        this.triggerEvent('quickFilter', {
          index: index,
          value: item.value
        });
      }

      // B C 实验
      if (abTest.p_project_list_optimization != 'A') {
        let value = item.value;
        let key = item.key;
        let ff = allFilter[key];
        ff && ff.value.forEach((item_v) => {
          if (item_v.value == value) {
            item_v.isChecked = !item_v.isChecked
          }
          
        })
        console.log(ff)
        // allFilter.quick_filter.value[index].isChecked = !allFilter.quick_filter.value[index].isChecked;
        allFilter[key] = ff;

        this.data.allFilter = allFilter;
        this.renderFilter();
        this.submitFilter('click');
        
      } else { // A实验

        allFilter.h.value[index].isChecked = !allFilter.h.value[index].isChecked;
        this.data.allFilter = allFilter;
        this.renderFilter();
        this.submitFilter('click');
      }
      
      
    },
    // 关闭筛选项目
    closeMark() {
      app.dialogMapData('close');
      this.setData({
        currentClickKey: ''
      }, () => {
        this.setData({
          filterWrapTop: 0
        })
        this.renderFilter('close');
      })
    },
    preventTouchMove() {
      return;
    }
  }
})