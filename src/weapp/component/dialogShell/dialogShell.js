// component/dialogShell/dialogShell.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 是否需要 删除图片
    hasImg: {
      type: Boolean,
      value: true
    },
    // 默认close 携带参数
    params: {
      type: Object,
      value: {}
    },
  },
  options: {
    addGlobalClass: true,
    // 启用插槽
    multipleSlots: true
  },
  externalClasses: ['my-class', 'wrap-class'],
  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    preventTouchMove() {

    },
    closeDialog() {
      this.triggerEvent('close', this.data.params)
    }
  }
})
