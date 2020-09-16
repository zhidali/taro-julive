/**
 * @description: 根据筛选项获取汉字
 * @param {object} filters assigned接口下发的 filter
 * @param {object} appFilter 存储全局变量联动的数据
 */
export function getFilterNames(filters, appFilter) {
  if (filters.quick_filter) {
    delete filters.quick_filter
  }
  // 映射相对应二维数组
  let filterArrMap = [
    ["a", "b", "i", "x"], // 区域
    ["c", "f"], // 价格
    ["g", "d"], // 户型
    ["e", "l", "j", "h", "n"], // 更多
    ["s"] // 排序
  ]
  // 汉字与value集合
  let commonObj = {
    // a: [{value:'', name: ''}]
  };
  for (let k in appFilter) {
    commonObj[k] = [];
    // 数组类型
    if (appFilter[k] instanceof Array) {
      filters[k].value.forEach((v, i) => {
        appFilter[k].forEach((it, idx) => {
          if (v.value == it) {
            commonObj[k].push({
              value: v.value,
              name: v.name,
              key: k
            })
          }
        })
      })
    } else {
      // 字符串类型
      if (k == 'c' || k == 'f' || k == 'g') {
        let text = '';
        let arr = appFilter[k].split(',');

        if (arr[0] == '0') {
          text = '<' + arr[1]
        }
        if (arr[1] == '0') {
          text = '>' + arr[0]
        }

        if (arr[0] != '0' && arr[1] != '0') {
          text = arr[0] + '-' + arr[1]
        }
        let dw = '';
        if (k == 'c') {
          dw = '万元'
        } else if (k == 'f') {
          dw = '元'
        } else if (k == 'g') {
          dw = '㎡'
        }

        commonObj[k].push({
          value: appFilter[k],
          name: text + dw,
          key: k
        })
      } else {
        filters[k] && Array.isArray(filters[k].value) && filters[k].value.forEach((v, i) => {
          if (v.value == appFilter[k]) {
            commonObj[k].push({
              value: v.value,
              name: v.name,
              key: k
            })
          }
        })
      }
    }

  }

  let commonArr = [];
  for (let n in commonObj) {
    commonObj[n].forEach((v) => {
      if (v.key != 's') { // 去除排序
        commonArr.push(v);
      }
    })
  }
  // 当前需求文案处理
  let na = filterArrMap.map((nameArr) => {
    let nameStr = '';
    nameArr.forEach((filter_k) => {
      if(filter_k != 's'){ // 去除排序
        commonObj[filter_k] && commonObj[filter_k].forEach((item, idx) => {
          nameStr += (item.name + '、')
        })
      }
    })
    if (nameStr.length) {
      nameStr = nameStr.substring(0, nameStr.length - 1)
    }
    return nameStr;
  })
  let currentNeedArr = [];
  na.forEach((item) => {
    if (item != '') {
      currentNeedArr.push(item);
    }
  })
  return {
    commonObj,
    commonArr,
    currentNeedArr
  };
}

/**
 * @description: 筛选项上报埋点
 * @param {object} appFilter 存储全局变量联动的数据
 */
export function tarckFilter(appFilter) {
  let obj = {}
  if(appFilter.a){ // 区域
    obj.district = appFilter.a
  }
  if(appFilter.b){ // 地铁
    obj.subway = appFilter.b
  }
  if(appFilter.i){ // 环线
    obj.loop = appFilter.i
  }
  if(appFilter.x){ // 附近
    obj.nearby = appFilter.x
  }
  if(appFilter.c && Array.isArray(appFilter.c)){ // 总价
    obj.whole_price = appFilter.c
  }
  if(appFilter.f && Array.isArray(appFilter.f)){ //单价
    obj.unit_price = appFilter.f
  }
  if(appFilter.c && typeof appFilter.c == 'string'){ // 总价输入框
    obj.input_total_price = appFilter.c
  }
  if(appFilter.f && typeof appFilter.f == 'string'){ //单价输入框
    obj.input_unit_price = appFilter.f
  }
  if(appFilter.d){ // 户型
    obj.house_type = appFilter.d
  }
  if(appFilter.e){ // 楼盘类型
    obj.project_type = appFilter.e
  }
  if(appFilter.h){ // 特色
    obj.features = appFilter.h
  }
  if(appFilter.l){ // 品牌开发商
    obj.brand_developer = appFilter.l
  }
  if(appFilter.j){ // 售卖状态
    obj.sale_status = appFilter.j
  }
  if(appFilter.g && Array.isArray(appFilter.g)){ // 面积
    obj.proportion = appFilter.g
  }
  if(appFilter.g && typeof appFilter.g  == 'string'){ // 面积输入框
    obj.input_proportion = appFilter.g
  }
  if(appFilter.n){ // 开盘时间
    obj.project_open_time = appFilter.n
  }
  if(appFilter.s){
    obj.filter_sort = appFilter.s
  }
  return obj
}