const analytic = require('../../../analytic/analytic.js');

var __init_complete__ = false;
// 存储this 调用列表页方法
var __target = null;
var __bindName = '';
var __selector = null;
var __pageName = '';
var __scrollFixed = false;

// 区域
var districtKeys = []; //区域左边栏
var districtValues = {}; // 区域右边栏
var districtSelect = {}; // 区域被选中的值

// 价格
var priceKeys = []; // 价格左边栏
var priceValues = []; // 价格右边栏
var priceSelect = {}; // 价格被选中值
var minPriceValue = ''; // 自定义输入价格最小值
var maxPriceValue = ''; // 自定义输入价格最大值
var customInputPrice = ''; // 自定义输入价格组合

// 户型
var houseTypeList = [];
var houseTypeSelectList = [];

// 更多选项
var moreGroupValues = {};
var moreGroupKeys = [];
var moreValueSelect = {};

// 排序
var sortList = [];
var sortSelectValue = '';

var barItemList = []; // 筛选栏选项
var selectBarItemIndex = -1; // 筛选栏点击位置
var barFixed = false;
var barFixedTop = 0;
var barHeight = 92;
var filterShow = false; // 下拉选项是否展示
var barShow = false; // 筛选栏是否展示，由于数据问题导致的不显示，非view层的控制
var pageBarShow = true; // 这个指随着页面滑动的bar，view层的控制
var sortShow = false; // 展示排序选项

var districtClickIs = false;
var priceClickIs = false;
var houseTypeClickIs = false;

/**
 *
 * data 筛选栏json数据
 * target 目标控制器
 **/
/**
 * @description: 主函数入口区
 * @param {string} bindName dropdown
 * @param {object} data 筛选栏json数据 接口/v1/project/assigned  filter字段
 * @param {func} selector 刷新列表函数
 * @param {string} pageName 页面名称 用于埋点
 * @param {object} target 楼盘列表页this 便于调用projectList.js 方法 data变量
 */
function dropdown(bindName, data = {}, selector, pageName, target) {
  __init_complete__ = true;
  __bindName = bindName;
  __selector = selector;
  __pageName = pageName;
  var that = target;
  __target = target;
  var transData = {}; //存放转化后的数据
  // 无json数据 不显示筛选栏
  if (JSON.stringify(data) == '{}') {
    barShow = false;
    __setData({
      barShow: barShow,
    });
    return;
  }
  barShow = true;
  selectBarItemIndex = -1;
  barItemList = ['区域', '价格', '户型', '更多'];
  barFixed = false;
  transData['barShow'] = barShow;
  transData['barItemList'] = barItemList;
  transData['selectBarItemIndex'] = selectBarItemIndex;
  transData['barFixed'] = barFixed;
  transData['barFixedTop'] = barFixedTop;
  transData['barHeight'] = barHeight;

  filterShow = false;
  transData['filterShow'] = filterShow;

  sortShow = false;
  transData['sortShow'] = sortShow;

  sortList = data.s && data.s.value ? data.s.value : [];
  sortList.forEach((item) => {
    item.checked = false;
  });
  transData['sortList'] = sortList;

  var hk = __houseTypeKey();
  houseTypeList = data[hk] && data[hk].value ? data[hk].value : [];
  houseTypeList.forEach((item) => {
    item.checked = false;
  });
  transData['houseTypeList'] = houseTypeList;
  houseTypeSelectList = [];
  transData['houseTypeSelectList'] = houseTypeSelectList;

  // 区域
  districtKeys = [];
  districtValues = {};
  districtSelect = {};
  var dks = __distictKeys();
  dks.forEach((item) => {
    if (data[item] && data[item].value) {
      districtKeys.push({
        key: item,
        name: data[item].name,
      });
      var values = data[item].value;
      districtValues[item] = values;
    }
  });
  transData['districtKeys'] = districtKeys;
  transData['districtValues'] = districtValues;
  // 默认选中第一个
  var keyItem = districtKeys[0];
  var valueItem = districtValues[keyItem.key][0];
  districtSelect = {
    selectKey: keyItem.key,
    selectValue: {
      key: keyItem.key,
      value: valueItem.value,
      name: valueItem.name,
    },
  };
  transData['districtSelect'] = districtSelect;

  priceKeys = [];
  priceValues = {};
  priceSelect = {};
  minPriceValue = '';
  maxPriceValue = '';
  customInputPrice = '';

  var pks = __priceKeys();
  pks.forEach((item) => {
    if (data[item] && data[item].value) {
      priceKeys.push({
        key: item,
        name: data[item].name,
      });
      priceValues[item] = data[item].value;
    }
  });
  transData['priceKeys'] = priceKeys;
  transData['priceValues'] = priceValues;
  transData['minPriceValue'] = minPriceValue;
  transData['maxPriceValue'] = maxPriceValue;
  // 默认选中第一个
  var keyItem = priceKeys[0];
  var valueItem = priceValues[keyItem.key][0];
  priceSelect = {
    selectKey: keyItem.key,
    selectValue: {
      key: keyItem.key,
      value: valueItem.value,
      name: valueItem.name,
    },
  };
  transData['priceSelect'] = priceSelect;

  // 更多
  moreGroupKeys = [];
  moreGroupValues = {};
  moreValueSelect = {};

  var mks = [
    { key: 'e', multiselect: true },
    { key: 'l', multiselect: false },
    { key: 'j', multiselect: false },
    { key: 'h', multiselect: true },
  ];
  mks.forEach((item) => {
    if (data[item.key] && data[item.key].value) {
      moreGroupKeys.push({
        key: item.key,
        name: data[item.key].name,
        multiselect: item.multiselect,
      });
      var values = data[item.key].value;
      values.forEach((it) => {
        it.checked = false;
      });
      if (item.key == 'h') {
        __target.setData({
          featureList: values,
        });
      }
      moreGroupValues[item.key] = values;
    }
  });
  transData['moreGroupKeys'] = moreGroupKeys;
  transData['moreGroupValues'] = moreGroupValues;
  transData['moreValueSelect'] = moreValueSelect;

  var bindData = {};
  bindData[bindName] = transData;
  __target.setData(bindData);

  // bind action
  that.prevent = prevent;
  that.didTapDropdownMask = didTapDropdownMask;
  that.didTapBarItem = didTapBarItem;
  that.didTapBarSortItem = didTapBarSortItem;

  that.didTapMultiFilterKey = didTapMultiFilterKey;
  that.didTapMultiFilterValue = didTapMultiFilterValue;

  that.onMinPriceInput = onMinPriceInput;
  that.onMaxPriceInput = onMaxPriceInput;
  that.didTapPriceConfirm = didTapPriceConfirm;

  that.didTapHouseTypeItem = didTapHouseTypeItem;
  that.didClickMoreItem = didClickMoreItem;

  that.didTapClearButton = didTapClearButton;
  that.didTapConfirmButton = didTapConfirmButton;

  that.didClickSortItem = didClickSortItem;
}

function didTapBarItem(e) {
  var index = e.currentTarget.dataset.index;
  if (selectBarItemIndex == index) {
    filterShow = !filterShow;
  } else {
    filterShow = true;
  }

  if (filterShow) {
    selectBarItemIndex = index;
    if (selectBarItemIndex == 0) {
      districtClickIs = false;
    } else if (selectBarItemIndex == 1) {
      priceClickIs = false;
    } else if (selectBarItemIndex == 2) {
      houseTypeClickIs = false;
      houseTypeList.forEach((item) => {
        item.checked = houseTypeSelectList.indexOf(item) != -1;
      });
    } else if (selectBarItemIndex == 3) {
      moreGroupKeys.forEach((item) => {
        var values = moreGroupValues[item.key];
        var selectValues = moreValueSelect[item.key];
        if (!selectValues || selectValues.length == 0) {
          values.forEach((valueItem) => {
            // valueItem.checked = false;
          });
        } else {
          values.forEach((valueItem) => {
            valueItem.checked = selectValues.indexOf(valueItem) != -1;
          });
        }
      });
    }
  } else {
    selectBarItemIndex = -1;
  }
  barFixed = filterShow || __scrollFixed;
  sortShow = false;

  __setData({
    sortShow: sortShow,
    filterShow: filterShow,
    barFixed: barFixed,
    selectBarItemIndex: selectBarItemIndex,
    houseTypeList: houseTypeList,
    moreGroupValues: moreGroupValues,
  });

  var analyticProperties = __analyticProperties();
  analyticProperties.fromItem = 'i_filter_bar';
  analyticProperties.fromItemIndex = String(index);
  var barItemList = ['区域', '价格', '户型', '更多'];
  analyticProperties.button_title = barItemList[index];
  analytic.sensors.track('e_click_filter_bar', analyticProperties);
}

function didTapBarSortItem(e) {
  sortShow = !sortShow;
  barFixed = sortShow || __scrollFixed;
  filterShow = false;
  __setData({
    sortShow: sortShow,
    barFixed: barFixed,
    filterShow: filterShow,
  });

  var analyticProperties = __analyticProperties();
  analyticProperties.fromItem = 'i_sort_entry';
  analyticProperties.toModule = 'm_sort_window';
  analytic.sensors.track('e_click_sort_entry', analyticProperties);
}

function didTapMultiFilterKey(e) {
  var type = e.currentTarget.dataset.type;
  var key = e.currentTarget.dataset.key;
  if (type === 'district') {
    districtSelect.selectKey = key;
    __setData({
      districtSelect: districtSelect,
    });
  } else {
    if (key != priceSelect.selectKey) {
      priceSelect.selectKey = key;
      __setData({
        priceSelect: priceSelect,
        minPriceValue: '',
        maxPriceValue: '',
      });
    } else {
      priceSelect.selectKey = key;
      __setData({
        priceSelect: priceSelect,
      });
    }
  }
}

function didTapMultiFilterValue(e) {
  var type = e.currentTarget.dataset.type;
  var key = e.currentTarget.dataset.selectKey;
  var item = e.currentTarget.dataset.item;
  var selectValue = {
    key: key,
    value: item.value,
    name: item.name,
  };

  if (type === 'district') {
    districtClickIs = true;
    districtSelect.selectKey = key;
    districtSelect.selectValue = selectValue;
    var barItemString = '区域';
    if (item.value !== '0') {
      barItemString = item.name;
    }
    barItemList.splice(0, 1, barItemString);
    __dissmissAndSetData({
      districtSelect: districtSelect,
      barItemList: barItemList,
    });
  } else {
    priceClickIs = true;
    priceSelect.selectKey = key;
    priceSelect.selectValue = selectValue;
    var barItemString = '价格';
    if (item.value !== '0') {
      barItemString = item.name;
    }
    barItemList.splice(1, 1, barItemString);
    minPriceValue = '';
    maxPriceValue = '';
    customInputPrice = '';
    __dissmissAndSetData({
      priceSelect: priceSelect,
      barItemList: barItemList,
      minPriceValue: minPriceValue,
      maxPriceValue: maxPriceValue,
    });
  }
  __refresh();
}

function onMinPriceInput(e) {
  minPriceValue = e.detail.value;
  __setData({
    minPriceValue: minPriceValue,
  });
}

function onMaxPriceInput(e) {
  maxPriceValue = e.detail.value;
  __setData({
    maxPriceValue: maxPriceValue,
  });
}

function didTapPriceConfirm(e) {
  if (minPriceValue.length == 0) {
    wx.showToast({
      title: '请输入最小值',
      icon: 'none',
    });
    return;
  }

  if (maxPriceValue.length == 0) {
    wx.showToast({
      title: '请输入最大值',
      icon: 'none',
    });
    return;
  }

  if (minPriceValue.length > 0 && maxPriceValue.length > 0) {
    if (parseInt(minPriceValue * 10000) >= parseInt(maxPriceValue * 10000)) {
      wx.showToast({
        title: '最大价格不能比最小价格小',
        icon: 'none',
      });
      return;
    }

    priceSelect.selectValue = {};
    customInputPrice = minPriceValue + ',' + maxPriceValue;
    var barItemString = minPriceValue + '-' + maxPriceValue + '万';
    barItemList.splice(1, 1, barItemString);
    __dissmissAndSetData({
      barItemList: barItemList,
      priceSelect: priceSelect,
    });
  }
  __refresh();
}

function didTapHouseTypeItem(e) {
  var tapItem = e.currentTarget.dataset.item;
  if (tapItem.value === '0') {
    houseTypeList.forEach((item) => {
      if (item.value != '0') {
        item.checked = false;
      }
    });
  } else {
    houseTypeList.forEach((item) => {
      if (item.value === tapItem.value) {
        item.checked = !item.checked;
      }
    });
  }
  __setData({
    houseTypeList: houseTypeList,
  });
}

function didClickMoreItem(e) {
  var keyItem = e.currentTarget.dataset.keyItem;
  var valueItem = e.currentTarget.dataset.valueItem;
  var values = moreGroupValues[keyItem.key];
  if (valueItem.checked) {
    valueItem.checked = false;
  } else {
    if (valueItem.value === '0' || !keyItem.multiselect) {
      // 不限或者只支持单选
      values.forEach((item) => {
        item.checked = false;
      });
    } else {
      if (keyItem.multiselect) {
        // 如果是多选，需要把不限干掉
        for (var index = 0; index < values.length; index++) {
          var item = values[index];
          if (item.value === '0') {
            item.checked = false;
            break;
          }
        }
      }
    }
    valueItem.checked = true;
  }
  for (var index = 0; index < values.length; index++) {
    var item = values[index];
    if (item.value === valueItem.value) {
      item.checked = valueItem.checked;
      break;
    }
  }
  moreGroupValues[keyItem.key] = values;
  __setData({
    moreGroupValues: moreGroupValues,
  });
}

function didTapClearButton(e) {
  var itemModule = '';
  var type = e.target.dataset.type;
  if (type === 'house-type') {
    // 户型
    houseTypeList.forEach((item) => {
      item.checked = false;
    });
    __setData({
      houseTypeList: houseTypeList,
    });
    itemModule = 'm_house_type';
  } else {
    // 更多
    moreGroupKeys.forEach((item) => {
      var values = moreGroupValues[item.key];
      values.forEach((valueItem) => {
        valueItem.checked = false;
      });
    });
    __setData({
      moreGroupValues: moreGroupValues,
    });
    itemModule = 'm_more_filter';
  }

  // analytic
  var analyticProperties = __analyticProperties();
  analyticProperties.fromItem = 'i_clear';
  analyticProperties.fromModule = itemModule;
  analyticProperties.project_type = __moreSelectValuesByKey('project_type');
  analyticProperties.features = __moreSelectValuesByKey('features');
  analyticProperties.sale_status = __moreSelectValuesByKey('sale_status');
  analytic.sensors.track('e_click_clear', analyticProperties);
}

function didTapConfirmButton(e) {
  let type;
  if (e == 'more') {
    // 下面联动筛选栏使用
    type = e;
  } else {
    type = e.target.dataset.type;
  }
  if (type === 'house-type') {
    houseTypeClickIs = true;
    // 户型
    var barItemString = '户型';
    var currentSelectName = '';
    var count = 0;
    houseTypeSelectList = [];
    var values = [];
    houseTypeList.forEach((item) => {
      if (item.checked) {
        houseTypeSelectList.push(item);
        values.push(item.value);
        count++;
        currentSelectName = item.name;
      }
    });
    if (count >= 1) {
      barItemString = `户型(${count})`;
    }
    barItemList.splice(2, 1, barItemString);
    __dissmissAndSetData({
      houseTypeList: houseTypeList,
      houseTypeSelectList: houseTypeSelectList,
      barItemList: barItemList,
    });

    // analytic
    var analyticProperties = __analyticProperties();
    analyticProperties.fromItem = 'i_affirm';
    analyticProperties.fromModule = 'm_house_type';
    analyticProperties.house_type = values;
    analytic.sensors.track('e_click_affirm', analyticProperties);
  } else {
    // 更多
    var count = 0;
    var barItemString = '更多';
    moreValueSelect = {};
    moreGroupKeys.forEach((item) => {
      var values = moreGroupValues[item.key];
      values.forEach((valueItem) => {
        if (valueItem.checked) {
          var arr = moreValueSelect[item.key];
          if (!arr) {
            arr = [];
          }
          arr.push(valueItem);
          moreValueSelect[item.key] = arr;
          if (valueItem.value !== '0') count++;
        }
      });
      //  下面联动筛选栏使用
      if (type == 'more') {
        __target.setData({
          featureList: moreGroupValues['h'],
        });
      }
    });
    if (count > 0) {
      barItemString = '更多(' + count + ')';
    }
    barItemList.splice(3, 1, barItemString);
    __dissmissAndSetData({
      moreValueSelect: moreValueSelect,
      barItemList: barItemList,
    });

    // analytic
    var analyticProperties = __analyticProperties();
    analyticProperties.fromItem = 'i_affirm';
    analyticProperties.fromModule = 'm_more_filter';
    analyticProperties.project_type = __moreSelectValuesByKey('project_type');
    analyticProperties.features = __moreSelectValuesByKey('features');
    analyticProperties.sale_status = __moreSelectValuesByKey('sale_status');
    analyticProperties.brand_developer = __moreSelectValuesByKey(
      'brand_developer'
    );
    analytic.sensors.track('e_click_affirm', analyticProperties);
  }
  __refresh();
}

function didClickSortItem(e) {
  var sortItem = e.currentTarget.dataset.item;
  var index = e.currentTarget.dataset.index;
  for (var index = 0; index < sortList.length; index++) {
    var item = sortList[index];
    if (item.value == sortItem.value) {
      item.checked = !item.checked;
      if (item.checked) {
        sortSelectValue = item.value;
      }
    } else {
      item.checked = false;
    }
  }
  __dissmissAndSetData({
    sortList: sortList,
  });
  __refresh();

  var analyticProperties = __analyticProperties();
  analyticProperties.fromItem = 'i_filter_sort';
  analyticProperties.filter_sort = sortSelectValue;
  analyticProperties.fromItemIndex = String(index);
  analytic.sensors.track('e_click_filter_sort', analyticProperties);
}

function didTapDropdownMask() {
  selectBarItemIndex = -1;
  filterShow = false;
  sortShow = false;
  barFixed = __scrollFixed;
  __setData({
    filterShow: filterShow,
    sortShow: sortShow,
    barFixed: barFixed,
    selectBarItemIndex: selectBarItemIndex,
  });
}

function prevent() {
  // do nothing, just prevent touch in overlayer
}

// help function
function __dissmissAndSetData(data = {}) {
  filterShow = false;
  selectBarItemIndex = -1;
  sortShow = false;
  data.filterShow = filterShow;
  data.selectBarItemIndex = selectBarItemIndex;
  data.sortShow = false;
  __setData(data);
}

function __setData(data = {}) {
  if (!__target || !__bindName) return;
  var transData = __target.data[__bindName];
  for (var attr in data) {
    transData[attr] = data[attr];
  }
  var bindData = {};
  bindData[__bindName] = transData;
  __target.setData(bindData);
}

function __refresh() {
  __selector();
}

function __distictKeys() {
  return ['a', 'b', 'i', 'x'];
}

function __priceKeys() {
  return ['f', 'c'];
}

function __houseTypeKey() {
  return 'd';
}

function __moreKeys() {
  return ['e', 'l', 'j', 'h'];
}

function __analyticProperties() {
  return {
    fromPage: __pageName,
    toPage: __pageName,
    fromModule: 'm_filter',
  };
}

function __filterItemKey2AnalyticKey(key) {
  var map = {
    a: 'district',
    b: 'subway',
    i: 'loop',
    x: 'nearby',
    f: 'unit_price',
    c: 'whole_price',
    e: 'project_type',
    d: 'house_type',
    h: 'features',
    j: 'sale_status',
    l: 'brand_developer',
  };
  return map[key] || '';
}

function __analyticKey2FilterItemKey(key) {
  var map = {
    district: 'a',
    subway: 'b',
    loop: 'i',
    nearby: 'x',
    unit_price: 'f',
    whole_price: 'c',
    project_type: 'e',
    house_type: 'd',
    features: 'h',
    sale_status: 'j',
    brand_developer: 'l',
  };
  return map[key] || '';
}

function __moreSelectValuesByKey(key) {
  if (!key || key.length == 0) return [];
  key = __analyticKey2FilterItemKey(key);
  var values = moreValueSelect[key];
  if (!values || values.length == 0) return [];
  var result = [];
  values.forEach((item) => {
    if (item.value !== 0) {
      result.push(item.value);
    }
  });
  return result;
}

function __isEmptyObject(obj) {
  if (obj === undefined || obj === null) return true;
  return JSON.stringify(obj) === '{}';
}

function deleteScreenItem(item) {
  if (__distictKeys().indexOf(item.key) != -1) {
    // 区域筛选
    if (districtKeys.length > 0) {
      var keyItem = districtKeys[0];
      var valueItem = districtValues[keyItem.key][0];
      districtSelect = {
        selectKey: keyItem.key,
        selectValue: {
          key: keyItem.key,
          value: valueItem.value,
          name: valueItem.name,
        },
      };
    } else {
      districtSelect = {};
    }
    var barItemString = '区域';
    barItemList.splice(0, 1, barItemString);
    __setData({
      districtSelect: districtSelect,
      barItemList: barItemList,
    });
  } else if (__priceKeys().indexOf(item.key) != -1) {
    // 价格选中
    if (priceKeys.length > 0) {
      var keyItem = priceKeys[0];
      var valueItem = priceValues[keyItem.key][0];
      priceSelect = {
        selectKey: keyItem.key,
        selectValue: {
          key: keyItem.key,
          value: valueItem.value,
          name: valueItem.name,
        },
      };
    } else {
      priceSelect = {};
    }
    var barItemString = '价格';
    barItemList.splice(1, 1, barItemString);
    __setData({
      priceSelect: priceSelect,
      barItemList: barItemList,
    });
  } else if (item.key === 'custome_price') {
    // 自定义输入价格
    var barItemString = '价格';
    barItemList.splice(1, 1, barItemString);
    minPriceValue = '';
    maxPriceValue = '';
    customInputPrice = '';
    __setData({
      barItemList: barItemList,
      minPriceValue: minPriceValue,
      maxPriceValue: maxPriceValue,
    });
  } else if (item.key === __houseTypeKey()) {
    // 户型选择
    if (houseTypeSelectList.length > 0) {
      for (var index = 0; index < houseTypeSelectList.length; index++) {
        var houseItem = houseTypeSelectList[index];
        if (houseItem.value === item.value) {
          houseTypeSelectList.splice(index, 1);
          break;
        }
      }
      var barItemString = '户型';
      if (houseTypeSelectList.length > 1) {
        barItemString = '多选';
      } else if (houseTypeSelectList.length == 1) {
        barItemString = houseTypeSelectList[0].name;
      }
      barItemList.splice(2, 1, barItemString);
      __setData({
        barItemList: barItemList,
        houseTypeSelectList: houseTypeSelectList,
      });
    }
  } else if (__moreKeys().indexOf(item.key) != -1) {
    // 更多选择
    var count = 0;
    var barItemString = '更多';
    var arr = moreValueSelect[item.key];
    for (var index = 0; index < arr.length; index++) {
      var moreItem = arr[index];
      if (moreItem.value === item.value) {
        arr.splice(index, 1);
        break;
      }
    }
    for (var prop in moreValueSelect) {
      moreValueSelect[prop].forEach((moreItem) => {
        if (moreItem.value !== '0') count++;
      });
    }
    if (count > 0) {
      barItemString = '更多(' + count + ')';
    }
    barItemList.splice(3, 1, barItemString);
    __setData({
      moreValueSelect: moreValueSelect,
      barItemList: barItemList,
    });
  }
  __refresh();
}

// return 'filter' result for searching
function dropdownFilter() {
  var filter = {};

  if (districtSelect.selectValue) {
    var districtKey = districtSelect.selectValue.key;
    var districtValue = districtSelect.selectValue.value;
    if (districtKey && districtValue && districtValue !== '0') {
      filter[districtKey] = districtValue;
    }
  }

  if (customInputPrice.length > 0) {
    var priceKey = priceSelect.selectKey;
    if (priceKey === 'f') {
      filter['f'] = customInputPrice;
    } else {
      filter['c'] = customInputPrice;
    }
  } else {
    if (priceSelect.selectValue) {
      var priceKey = priceSelect.selectValue.key;
      var priceValue = priceSelect.selectValue.value;
      if (priceKey && priceValue && priceValue !== '0') {
        filter[priceKey] = priceValue;
      }
    }
  }

  if (houseTypeSelectList.length > 0) {
    var values = [];
    houseTypeSelectList.forEach((item) => {
      if (item.value !== '0') {
        values.push(item.value);
      }
    });
    if (values.length > 0) {
      filter['d'] = values;
    }
  }

  for (var attr in moreValueSelect) {
    var values = [];
    moreValueSelect[attr].forEach((item) => {
      if (item.value !== '0') {
        values.push(item.value);
      }
    });
    if (values.length > 0) {
      filter[attr] = values;
    }
  }

  if (sortSelectValue.length > 0) {
    filter['s'] = sortSelectValue;
  }
  return filter;
}

// return properties for analytic  lmg
function filter2analytic() {
  var analyticProperties = {};
  if (districtSelect.selectValue) {
    var districtKey = districtSelect.selectValue.key;
    var districtValue = districtSelect.selectValue.value;
    if (districtKey && districtValue && districtClickIs == true) {
      var key = __filterItemKey2AnalyticKey(districtKey);
      if (key && key.length > 0) {
        analyticProperties[key] = [districtValue];
      }
    }
  }

  if (customInputPrice.length > 0) {
    var priceKey = priceSelect.selectKey;
    if (priceKey == 'c') {
      analyticProperties.input_total_price = customInputPrice;
    } else {
      let _customInputPrice = customInputPrice.split(',');
      analyticProperties.input_unit_price =
        parseInt(_customInputPrice[0]) * 10000 +
        ',' +
        parseInt(_customInputPrice[1]) * 10000;
    }
  } else {
    if (priceSelect.selectValue) {
      var priceKey = priceSelect.selectValue.key;
      var priceValue = priceSelect.selectValue.value;
      if (priceKey && priceValue && priceClickIs == true) {
        var key = __filterItemKey2AnalyticKey(priceKey);
        analyticProperties[key] = [priceValue];
      }
    }
  }
  if (houseTypeClickIs == true && houseTypeSelectList.length == 0) {
    analyticProperties.house_type = ['0'];
  }
  if (houseTypeSelectList.length > 0) {
    var values = [];
    houseTypeSelectList.forEach((item) => {
      values.push(item.value);
    });
    if (values.length > 0) {
      analyticProperties.house_type = values;
    }
  }

  for (var attr in moreValueSelect) {
    var values = [];
    moreValueSelect[attr].forEach((item) => {
      values.push(item.value);
    });
    if (values.length > 0) {
      analyticProperties[__filterItemKey2AnalyticKey(attr)] = values;
    }
  }

  analyticProperties.filter_sort = sortSelectValue;
  return analyticProperties;
}

function filter2screenItems() {
  var screenItems = [];
  if (districtSelect.selectValue) {
    var districtKey = districtSelect.selectValue.key;
    var districtValue = districtSelect.selectValue.value;
    if (districtKey && districtValue && districtValue !== '0') {
      screenItems.push({
        key: districtKey,
        name: districtSelect.selectValue.name,
        value: districtValue,
      });
    }
  }

  if (customInputPrice.length > 0) {
    var priceKey = priceSelect.selectKey;
    if (priceKey) {
      var name = minPriceValue + '-' + maxPriceValue + '万';
      if (maxPriceValue == '0') {
        name = '>' + minPriceValue + '万';
      }
      screenItems.push({
        key: 'custome_price',
        name: name,
        value: customInputPrice,
      });
    }
  } else {
    if (priceSelect.selectValue) {
      var priceKey = priceSelect.selectValue.key;
      var priceValue = priceSelect.selectValue.value;
      if (priceKey && priceValue && priceValue !== '0') {
        screenItems.push({
          key: priceKey,
          name: priceSelect.selectValue.name,
          value: priceSelect.selectValue.value,
        });
      }
    }
  }

  if (houseTypeSelectList.length > 0) {
    houseTypeSelectList.forEach((item) => {
      if (item.value !== '0') {
        screenItems.push({
          key: __houseTypeKey(),
          name: item.name,
          value: item.value,
        });
      }
    });
  }

  for (var attr in moreValueSelect) {
    var values = moreValueSelect[attr];
    values.forEach((item) => {
      if (item.value !== '0') {
        screenItems.push({
          key: attr,
          name: item.name,
          value: item.value,
        });
      }
    });
  }
  return screenItems;
}

function isShow() {
  return filterShow || sortShow;
}

function dismiss() {
  filterShow = false;
  selectBarItemIndex = -1;
  sortShow = false;
  __setData({
    filterShow: filterShow,
    selectBarItemIndex: selectBarItemIndex,
    sortShow: sortShow,
  });
}

function setBarFixed(isFixed) {
  if (isFixed == barFixed) return;
  __scrollFixed = isFixed;
  barFixed = isFixed;
  __setData({
    barFixed: isFixed,
  });
}

function setBarFixedTop(top) {
  if (top == barFixedTop) return;
  barFixedTop = top;
  __setData({
    barFixedTop: top,
  });
}

function setPageBarShow(show) {
  if (show == pageBarShow) return;
  pageBarShow = show;
  __setData({
    pageBarShow: show,
  });
}

//flag 首页寻找楼盘 选择价格 跳转楼盘列表页使用
function setFilter(filter, homeToProjectFlag) {
  if (!__init_complete__) return;
  if (__isEmptyObject(filter)) {
    __refresh();
    return;
  }
  this.clearAllFilter();
  var _this = this;
  __target.setData({
    featureList: __target.data.featureList,
  });
  Object.keys(filter).map(function (key, index) {
    // 区域(单选)
    try {
      if (__distictKeys().indexOf(key) != -1) {
        var item = filter[key];
        if (typeof item != `object`) {
          item = filter[key].length > 0 ? filter[key][0] : {};
        } else {
          item = item[0];
        }
        if (!__isEmptyObject(item) && item.value != '0') {
          if (
            __hasObject(item, districtValues[key]) != -1 &&
            __hasObject(item, districtValues[key]) < districtValues[key].length
          ) {
            var index = __hasObject(item, districtValues[key]);
            var distictItem = districtValues[key][index];
            distictItem.key = key;
            districtSelect = {
              selectKey: distictItem.key,
              selectValue: {
                key: distictItem.key,
                value: distictItem.value,
                name: distictItem.name,
              },
            };
            var barItemString = distictItem.name;
            barItemList.splice(0, 1, barItemString);
            __setData({
              districtSelect: districtSelect,
              barItemList: barItemList,
            });
          }
        }
      } else if (__priceKeys().indexOf(key) != -1) {
        var price = filter[key];
        // 单价格自定义
        if (typeof price === `string`) {
          if (price && price.length > 0) {
            priceSelect.selectValue = {};
            if (homeToProjectFlag) {
              priceSelect.selectKey = key;
            }
            var prices = price.split(',');
            minPriceValue = prices[0];
            maxPriceValue = prices[1];
            customInputPrice = minPriceValue + ',' + maxPriceValue;
            var barItemString = minPriceValue + '-' + maxPriceValue + '万';
            if (maxPriceValue == '0') {
              barItemString = '>' + minPriceValue + '万';
            }
            barItemList.splice(1, 1, barItemString);
            __setData({
              barItemList: barItemList,
              priceSelect: priceSelect,
              minPriceValue: minPriceValue,
              maxPriceValue: maxPriceValue,
            });
          }
        } else {
          // 非自定义价格
          var priceList = priceValues[key];
          price.forEach((item) => {
            if (
              __hasObject(item, priceList) != -1 &&
              __hasObject(item, priceList) < priceList.length
            ) {
              var index = __hasObject(item, priceList);
              var selectItem = priceList[index];
              priceSelect = {
                selectKey: key,
                selectValue: {
                  key: key,
                  value: selectItem.value,
                  name: selectItem.name,
                },
              };
              var barItemString = selectItem.name;
              barItemList.splice(1, 1, barItemString);
              __setData({
                barItemList: barItemList,
                priceSelect: priceSelect,
              });
            }
          });
        }
      } else if (__houseTypeKey().indexOf(key) != -1) {
        // 户型
        var items = filter[key];
        if (items && items.length > 0) {
          var barItemString = '户型';
          var currentSelectName = '';
          var count = 0;
          houseTypeSelectList = [];
          var values = [];
          items.forEach((item) => {
            if (__hasObject(item, houseTypeList) != -1) {
              var index = __hasObject(item, houseTypeList);
              var houseTypeItem = houseTypeList[index];
              houseTypeItem.checked = true;
              houseTypeSelectList.push(houseTypeItem);
              count++;
              currentSelectName = houseTypeItem.name;
            }
          });

          if (count > 1) {
            barItemString = '多选';
          } else if (count === 1) {
            barItemString = currentSelectName;
          }
          barItemList.splice(2, 1, barItemString);
          __dissmissAndSetData({
            houseTypeList: houseTypeList,
            houseTypeSelectList: houseTypeSelectList,
            barItemList: barItemList,
          });
        }
      } else if (__moreKeys().indexOf(key) != -1) {
        // 更多
        var items = filter[key];
        if (items && items.length > 0) {
          items.forEach((item) => {
            var valueItems = moreGroupValues[item.key];
            var index = __hasObject(item, valueItems);
            if (index != -1) {
              var valueItem = valueItems[index];
              valueItem.checked = true;
              if (key === 'h' && __target.data.featureList.length > 0) {
                //  场景携带参数 进入列表页  实现联动
                __target.setData({
                  featureList: __target.data.featureList,
                });
              }
            }
          });
          var count = 0;
          var barItemString = '更多';
          moreValueSelect = {};
          moreGroupKeys.forEach((item) => {
            var values = moreGroupValues[item.key];
            values.forEach((valueItem) => {
              if (valueItem.checked) {
                var arr = moreValueSelect[item.key];
                if (!arr) {
                  arr = [];
                }
                arr.push(valueItem);
                moreValueSelect[item.key] = arr;
                if (valueItem.value !== '0') count++;
              }
            });
          });
          if (count > 0) {
            barItemString = '更多(' + count + ')';
          }
          barItemList.splice(3, 1, barItemString);
          __dissmissAndSetData({
            moreValueSelect: moreValueSelect,
            barItemList: barItemList,
          });
        }
      }
    } catch (e) {
      console.log(e);
    }
  });
  __refresh();
}

function __hasObject(item, items) {
  var index = -1;
  for (var index = 0; index < items.length; index++) {
    var i = items[index];
    if (item.value === i.value) {
      index = index;
      break;
    }
  }
  return index;
}

function clearAllFilter() {
  // 默认选中第一个
  if (districtKeys.length > 0) {
    var keyItem = districtKeys[0];
    var valueItem = districtValues[keyItem.key][0];
    districtSelect = {
      selectKey: keyItem.key,
      selectValue: {
        key: keyItem.key,
        value: valueItem.value,
        name: valueItem.name,
      },
    };
  } else {
    districtSelect = {};
  }

  if (priceKeys.length > 0) {
    var keyItem = priceKeys[0];
    var valueItem = priceValues[keyItem.key][0];
    priceSelect = {
      selectKey: keyItem.key,
      selectValue: {
        key: keyItem.key,
        value: valueItem.value,
        name: valueItem.name,
      },
    };
  } else {
    priceSelect = {};
  }

  minPriceValue = '';
  maxPriceValue = '';
  customInputPrice = '';

  houseTypeSelectList = [];
  houseTypeList.forEach((item) => {
    item.checked = false;
  });
  moreValueSelect = {};
  moreGroupKeys.forEach((item) => {
    var values = moreGroupValues[item.key];
    values.forEach((valueItem) => {
      valueItem.checked = false;
    });
  });
  sortSelectValue = '';
  barItemList = ['区域', '价格', '户型', '更多'];
  __setData({
    districtSelect: districtSelect,
    priceSelect: priceSelect,
    minPriceValue: minPriceValue,
    maxPriceValue: maxPriceValue,
    customInputPrice: customInputPrice,
    houseTypeSelectList: houseTypeSelectList,
    moreValueSelect: moreValueSelect,
    sortSelectValue: sortSelectValue,
    barItemList: barItemList,
  });
}

module.exports = {
  dropdown: dropdown,
  isShow: isShow,
  dismiss: dismiss,
  setBarFixed: setBarFixed,
  setBarFixedTop: setBarFixedTop,
  setPageBarShow: setPageBarShow,
  deleteScreenItem: deleteScreenItem,
  clearAllFilter: clearAllFilter,
  setFilter: setFilter,
  dropdownFilter: dropdownFilter,
  filter2analytic: filter2analytic,
  filter2screenItems: filter2screenItems,
};
