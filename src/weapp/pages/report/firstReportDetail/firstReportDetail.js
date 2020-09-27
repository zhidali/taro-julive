var WxParse = require('../../../utils/wxParse/wxParse.js');

Component({
  properties: {
    showModal: {
      type: Boolean,
      value: false
    },
    blockTitle: {
      type: String,
      value: ''
    },
    title: {
      type: String,
      value: ''
    },
    content: {
      type: Object,
      value: ''
    },
    
    downloadList: {
      type: Array,
      value: []
    }
  },

  data: {
  },

  methods: {
    didClosePopView:function() {
      this.setData({
        showModal: false,
        blockTitle: '',
        title: '',
        content: '',
        downloadList: []
      });
      this.triggerEvent("closePopViewCallback", {});
    },
    
    /**
    * 弹出框蒙层截断touchmove事件
    */
    preventTouchMove:function() {

    },

    // 图片点击事件
    wxParseImgTap:function(e) {
      var that = this;
      var nowImgUrl = e.target.dataset.src;
      var tagFrom = e.target.dataset.from;
      if(typeof (tagFrom) != 'undefined' && tagFrom.length > 0) {
        wx.previewImage({
          current: nowImgUrl, // 当前显示图片的http链接
          urls: that.data.content.imageUrls // 需要预览的图片http链接列表
        })
      }
    },
    
    didClickDownload:function(e) {
      var downloadModel = e.currentTarget.dataset.downloadModel;
      wx.showLoading({
        title: '下载中...'
      })
      wx.downloadFile({
        url: downloadModel.path,
        success: function (res) {
          wx.hideLoading()
          wx.showToast({
            title: '下载成功',
            icon:'success'
          })
          if (res.statusCode === 200) {
            wx.openDocument({
              filePath: res.tempFilePath
            })
          }
        },fail:function(error) {
          console.log(error)
          wx.hideLoading()
        }
      })
    }
  }
})
