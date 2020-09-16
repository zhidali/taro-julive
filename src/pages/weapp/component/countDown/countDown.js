// dynamicSubPK/pages/houseDynamic/template/countDown.js
/*
 * @Author: kangxue
 * @Date: 2020-05-26
 * @Description: 倒计时组件
 */
var timer = 0;
var interval = 1000;
Component({
  externalClasses: ['count-down', 'time', 'unit'],
  /**
   * 组件的属性列表
   */
  properties: {
    // 倒计时时间戳
    target: {
      type: String,
    },
    // 格式
    format: {
      type: Function,
      default: null,
    },
  },

  attached: function () {
    //组件创建时
    this.setData(
      {
        lastTime: this.properties.target, //根据 target 初始化组件的lastTime属性
      },
      () => {
        //开启定时器
        this.tick();
        //判断是否有format属性 如果设置按照自定义format处理页面上显示的时间 没有设置按照默认的格式处理
        if (typeof this.properties.format === 'object') {
          this.defaultFormat(this.data.lastTime);
        }
      }
    );
  },
  
  detached: function () {
    //组件销毁时清除定时器 防止爆栈
    clearTimeout(timer);
  },
  /**
   * 组件的初始数据
   */
  data: {
    d: 0, //天
    h: 0, //时
    m: 0, //分
    s: 0, //秒
    result: '', //自定义格式返回页面显示结果
    lastTime: '', //倒计时的时间戳
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 时分秒小于0时展示补0
    fixedZero: function (val) {
      return val * 1 < 10 ? '0' + val : val;
    },
    //默认处理时间格式
    defaultFormat: function (time) {
      const day = 24 * 60 * 60 * 1000;
      const hours = 60 * 60 * 1000;
      const minutes = 60 * 1000;

      const d = Math.floor(time / day);
      let h = Math.floor((time - d * day) / hours);
      let m = Math.floor((time - d * day - h * hours) / minutes);
      let s = Math.floor((time - d * day - h * hours - m * minutes) / 1000);
      h = this.fixedZero(h);
      m = this.fixedZero(m);
      s = this.fixedZero(s);
      this.setData({
        d,
        h,
        m,
        s,
      });
    },

    //定时事件
    tick: function () {
      let { lastTime } = this.data;

      timer = setTimeout(() => {
        if (lastTime < interval) {
          clearTimeout(timer);
          this.setData(
            {
              lastTime: 0,
              result: '',
            },
            () => {
              this.defaultFormat(lastTime);
              if (this.onEnd) {
                this.onEnd();
              }
            }
          );
        } else {
          lastTime -= interval;
          this.setData(
            {
              lastTime,
              result: this.properties.format
                ? this.properties.format(lastTime)
                : '',
            },
            () => {
              this.defaultFormat(lastTime);
              this.tick();
            }
          );
        }
      }, interval);
    },

    //时间结束回调事件
    onEnd: function () {
      this.triggerEvent('onEnd');
    },
  },
});
