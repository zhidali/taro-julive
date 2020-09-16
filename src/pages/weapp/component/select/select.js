/*
 * @Author: your name
 * @Date: 2020-05-22 11:01:36
 * @LastEditTime: 2020-06-04 09:54:50
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /julive/component/select/select.js
 */
// Componet/Componet.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    propArray: {
      type: Array,
    },
    nowText: {
      type: String,
    },
    selectShow: {
      type: Boolean,
      value: false,
    },
    currentSelect: {
      type: String,
      value: '',
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    // selectShow: false, //初始option不显示
    selectText: '不限', //初始内容
    animationData: {}, //右边箭头的动画
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //option的显示与否
    selectToggle: function () {
      var nowShow = this.data.selectShow; //获取当前option显示的状态
      //创建动画
      var animation = wx.createAnimation({
        timingFunction: 'ease',
      });
      this.animation = animation;
      if (nowShow) {
        animation.rotate(0).step();
        this.setData({
          animationData: animation.export(),
        });
      } else {
        animation.rotate(180).step();
        this.setData({
          animationData: animation.export(),
        });
      }
      this.setData({
        selectShow: !nowShow,
      });
      this.triggerEvent('clickSelectCallback');
    },
    //设置内容
    setText: function (e) {
      var nowData = this.properties.propArray; //当前option的数据是引入组件的页面传过来的，所以这里获取数据只有通过this.properties
      var nowIdx = e.target.dataset.index; //当前点击的索引
      var Text = nowData[nowIdx].name; //当前点击的内容
      var Value = nowData[nowIdx].value; //当前点击的内容
      //再次执行动画，注意这里一定，一定，一定是this.animation来使用动画
      this.animation.rotate(0).step();
      this.setData({
        selectShow: false,
        selectText: Text,
        animationData: this.animation.export(),
      });
      this.triggerEvent('clickSetTextCallback', {
        value: Value,
        currentSelect: this.data.currentSelect,
      });
    },
  },
});
