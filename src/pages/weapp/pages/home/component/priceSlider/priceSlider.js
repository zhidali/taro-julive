const wxPromisify = fn => {
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        resolve(res)
      }

      obj.fail = function (res) {
        reject(res)
      }

      fn(obj)
    })
  }
}
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    /** slider 最小值 */
    min: {
      type: Number
    },
    /** slider 最大值 */
    max: {
      type: Number
    },
    /** 预选选择的小值*/
    minValue: {
      type: Number
    },
    /** 预选选择的大值 */
    maxValue: {
      type: Number
    },
    /** 未选择进度条颜色 */
    backgroundColor:{
      type: String
    },
    /** 已选择进度条颜色 */
    selectedColor:{
      type: String
    }
  },


  /**
   * 组件的初始数据
   */
  data: {
    min: 0,
    max: 100,
    leftValue: 0,
    rightValue: 100,
    totalLength: 0,
    bigLength: 0,
    ratio: 0.5,
    sliderLength: 28,
    containerLeft: 0 //标识整个组件，距离屏幕左边的距离
  },

  /**
   * 组件的方法列表
   */
  methods: {
    reset: function () {
      this.setData({
        rightValue: this.data.totalLength,
        leftValue: 0,
      })
    },
    /**
    * 设置左边滑块的值
    */
    _propertyLeftValueChange: function () {

      let minValue = this.data.minValue / this.data.max * this.data.bigLength
      let min = this.data.min / this.data.max * this.data.bigLength
      this.setData({
        leftValue: minValue - min
      })
    },

    /**
     * 设置右边滑块的值
     */
    _propertyRightValueChange: function () {
      let right = this.data.maxValue / this.data.max * this.data.bigLength + this.data.sliderLength
      this.setData({
        rightValue: right
      })
    },

    /**
     * 左边滑块滑动
     */
    _minMove: function (e) {
      let obj = e.changedTouches[0] || {}
      let pagex = obj.pageX / this.data.ratio - this.data.containerLeft - this.data.sliderLength / 2

      if (pagex + this.data.sliderLength >= this.data.rightValue) {
        pagex = this.data.rightValue - this.data.sliderLength
      } else if (pagex <= 0) {
        pagex = 0
      }

      this.setData({
        leftValue: pagex
      })

      let lowValue = parseInt(pagex / this.data.bigLength * parseInt(this.data.max - this.data.min) + this.data.min)
      var myEventDetail = { lowValue: lowValue }
      this.triggerEvent('changeMin', myEventDetail)
    },

    /**
     * 右边滑块滑动
     */
    _maxMove: function (e) {
      let obj = e.changedTouches[0] || {}
      let pagex = obj.pageX / this.data.ratio - this.data.containerLeft - this.data.sliderLength / 2
      if (pagex <= this.data.leftValue + this.data.sliderLength) {
        pagex = this.data.leftValue + this.data.sliderLength
      } else if (pagex >= this.data.totalLength) {
        pagex = this.data.totalLength
      }

      this.setData({
        rightValue: pagex
      })

      pagex = pagex - this.data.sliderLength
      let heighValue = parseInt(pagex / this.data.bigLength * (this.data.max - this.data.min) + this.data.min)
      var myEventDetail = { heighValue: heighValue }
      this.triggerEvent('changeMax', myEventDetail)
    }
  },

  ready: function () {
    let that = this;
    const getSystemInfo = wxPromisify(wx.getSystemInfo)
    const queryContainer = wxPromisify(wx.createSelectorQuery().in(this).select(".container").boundingClientRect)
    wxPromisify(wx.getSystemInfo)()
      .then(res => {
        let ratio = res.windowWidth / 750
        that.setData({
          ratio: ratio,
        })
      })
      .then(() => {
        var query = wx.createSelectorQuery().in(this)
        query.select(".container").boundingClientRect(function (res) {
          that.setData({
            totalLength: res.width / that.data.ratio - that.data.sliderLength,
            bigLength: res.width / that.data.ratio - that.data.sliderLength * 2,
            rightValue: res.width / that.data.ratio - that.data.sliderLength,
            containerLeft: res.left / that.data.ratio
          })

        /**
         * 设置初始滑块位置
         */
        that._propertyLeftValueChange()
        that._propertyRightValueChange()
        }).exec()
      })
  },
  
})
