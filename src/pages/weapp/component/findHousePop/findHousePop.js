/*
 * @Author: limengge
 * @Date: 2020-05-22 10:12:54
 * @LastEditTime: 2020-08-10 11:29:06
 * @LastEditors: zhidl
 * @Description: In User Settings Edit
 * @FilePath: /julive/component/findHousePop/findHousePop.js
 */

const analytic = require('../../analytic/analytic.js');

Component({
  properties: {
    showFindHousePop: {
      type: Boolean,
      value: '',
    },
    popupObj: {
      type: Object,
      value: {},
    },
    userLoginStatus: {
      type: Boolean,
      value: false,
    },
    helpFindOptimizationABtest:{
      type:String,
      value:''
    }
  },

  data: {
    selectShowA: false,
    selectShowC: false,
    selectShowAValue: '0',
    selectShowCValue: '0',
  },
  attached: function () {},

  methods: {
    preventTouchMove: function (e) {
      e.preventDefault();
      e.stopPropagation();
    },

    hideModal() {
      this.setData({
        showFindHousePop: false,
      });
      this.triggerEvent('closeFindHouseCallback');
    },

    //咨询按钮
    onConfirm(e) {
      this.triggerEvent('clickFindHouseCallback', {});
    },

    //筛选完的回调方法
    clickSetTextCallback(data) {
      this.triggerEvent('clickGetSelectCallback', data.detail);
    },
    //留电登录的回调
    GetPhoneNumberBtn(data) {
      this.triggerEvent('ClickGetPhoneNumberBtn', data.detail);
    },
    FastLoginCallBack(data) {
      this.triggerEvent('FastLoginCallBack', data.detail);
    },
  },
});
