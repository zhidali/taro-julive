function formatSeconds(value) {
  let secon = parseInt(value); // 秒
  let min = 0; // 分
  if (secon > 60) {
    min = parseInt(secon / 60);
    secon = parseInt(secon % 60);
  }
  return {
    min,
    secon
  };
}

function formatH(value) {
  let secon = parseInt(value); // 秒
  let min = 0; // 分
  let h = 0; // 小时
  let d = 0; // 天
  if (secon > 60) {
    min = parseInt(secon / 60);
    secon = parseInt(secon % 60);
    if (min >= 60) {
      h = parseInt(min / 60);
      min = parseInt(min % 60);
      if (h >= 24) {
        d = parseInt(h / 24);
        h = parseInt(h % 24);
      }
    }
  }
  return {
    min,
    secon,
    h,
    d
  };
}

function Appendzero(para) {
  if (para) {
    if (para < 10) {
      return '0' + '' + para;
    } else {
      return para;
    }
  } else {
    return '00';
  }
}

Component({
  externalClasses: ['my-class'],
  /**
   * 组件的属性列表
   */
  properties: {
    seconds: {
      type: Number,
      optionalTypes: [Number, String],
      value: 0,
      observer: function(newVal, oldVal){
        clearInterval(this.data.timer);
        this.setTime(newVal);
      }
    },
    // 默认zero 携带参数
    params: {
      type: Object,
      value: {}
    },
    // 是否隐藏
    hidden: {
      type: Boolean,
      value: false
    }
  },
  options: {
    addGlobalClass: true,
  },
  attached() {},
  detached() {
    clearInterval(this.data.timer);
  },
  /**
   * 组件的初始数据
   */
  data: {
    timer: null,
    time: 0,
    // 渲染文本
    textObj: {
      d: '',
      h: '',
      min: '',
      s: ''
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    setTime(seconds) {
      // 不能转译为数字的 设置为0
      if (isNaN(seconds)) {
        this.setData({
          time: 0
        })
      } else {
        this.setData({
          time: parseInt(seconds)
        })
      }
      this.setText(seconds);
  
      this.data.timer = setInterval(() => {
        this.setData({
          time: --this.data.time
        }, () => {
          this.setText(this.data.time);
          // 倒计时为0 ， 清除
          if (this.data.time == 0) {
            this.clearTimer();
            clearInterval(this.data.timer);
          }
        })
      }, 1000)
    },
    // 倒计时归0 发送事件
    clearTimer() {
      this.triggerEvent('zero', this.data.params)
    },
    /**
     * @description: 格式化倒计时
     * @param {number} seconds 秒数
     */
    setText(seconds) {
      let timeInfo = formatH(seconds);
      let min = Appendzero(timeInfo.min) ? Appendzero(timeInfo.min) : '00';
      let s = Appendzero(timeInfo.secon) ? Appendzero(timeInfo.secon) : '00';
      let h = Appendzero(timeInfo.h) ? Appendzero(timeInfo.h) : '00';
      let d = timeInfo.d;
      let textObj = {
        d,
        h,
        min,
        s
      }
      this.setData({
        textObj
      })
    }
  },

})