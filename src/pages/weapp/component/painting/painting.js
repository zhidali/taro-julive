// component/painting.js
const util = require("../../utils/util.js");
const analytic = require("../../analytic/analytic.js");
const app = getApp();

Component({
  properties: {
    showPainter: {
      type: Boolean,
      value: false,
      observer: function(newVal, oldVal, changedPath) {
        if (newVal === false) {
          wx.hideLoading();
        }
      }
    },
    module: {
      type: String,
      value: ""
    },
    template: {
      type: Object,
      value: {},
      observer: function(newVal, oldVal, changedPath) {
        if (!util.isEmptyObject(newVal)) {
          wx.showLoading({
            title: "加载中..."
          });
        }
      }
    },
    palette: {
      type: Object,
      value: {}
    },
    paintInfo: {
      type: Object,
      value: {},
      observer: function(newVal, oldVal, changedPath) {
        if (util.isEmptyObject(newVal)) {
          this.data.paintInfo = {};
        }
      }
    }
  },

  data: {
    isIos: app.globalData.isIos,
    showBigPainter: false,
    imagePath: "",
    popSettingShow: false
  },

  methods: {
    analyticProperties() {
      var analyticProperties = {};
      var _this = this;
      Object.keys(this.data.paintInfo).map(function(key, index) {
        analyticProperties[key] = _this.data.paintInfo[key];
      });
      return analyticProperties;
    },
    /**
     * 弹出框蒙层截断touchmove事件
     */
    preventTouchMove: function() {},

    didClosePainter: function() {
      this.onDismiss();
    },

    onDismiss: function(e) {
      this.setData({
        showPainter: false,
        showBigPainter: false,
        template: {}
      });
      wx.hideLoading();
      this.triggerEvent("dismissCallback", {});
    },

    onImgErr(e) {
      wx.hideLoading();
      wx.showModal({
        content: "加载失败！请重试",
        title: "",
        showCancel: false,
        confirmColor: "#48B3E2"
      });
      this.onDismiss();
    },

    onImgOK(e) {
      this.setData({
        imagePath: e.detail.path
      });
      wx.hideLoading();
      this.triggerEvent("shareImagePath", {
        imagePath: e.detail.path
      });
      if (this.data.paintInfo.pageName != "essayPage") return;
      var analyticProperties = this.analyticProperties();
      analyticProperties.save_status = 1;
      analytic.sensors.track("e_module_exposure", analyticProperties);
    },

    didClickSaveImage() {
      wx.showLoading({
        title: "保存中..."
      });
      this.saveImage(this.data.imagePath);
    },

    saveImage(filePath) {
      var _this = this;
      wx.saveImageToPhotosAlbum({
        filePath: filePath,
        success(res) {
          wx.hideLoading();
          wx.showModal({
            content: "保存成功！请从相册分享图片到朋友圈~",
            title: "",
            showCancel: false,
            confirmColor: "#48B3E2"
          });
          _this.onDismiss();

          if (_this.data.paintInfo.pageName != "essayPage") return;
          var analyticProperties = _this.analyticProperties();
          analyticProperties.fromItem = "i_save";
          analyticProperties.save_status = 1;
          analytic.sensors.track("e_click_save", analyticProperties);
        },
        fail(res) {
          wx.hideLoading();
          if (
            (_this.data.isIos == true &&
              res.errMsg == "saveImageToPhotosAlbum:fail auth deny") ||
            (_this.data.isIos == false &&
              res.errMsg == "saveImageToPhotosAlbum:fail:auth denied")
          ) {
            _this.setData({
              showPainter: false,
              template: {}
            });
          } else {
            _this.setData({
              popSettingShow: true
            });
            if (_this.data.paintInfo.pageName != "essayPage") return;
            var analyticProperties = _this.analyticProperties();
            analyticProperties.fromItem = "i_save";
            analyticProperties.save_status = 2;
            analytic.sensors.track("e_click_save", analyticProperties);
          }
        }
      });
    },
    didClickCliseTip() {
      this.setData({
        popSettingShow: false
      });
    },
    didCloseSetting() {
      this.setData({
        popSettingShow: false
      });
    },

    shareFriend() {
      if (this.data.paintInfo.pageName != "essayPage") return;
      var analyticProperties = this.analyticProperties();
      analyticProperties.toPage = analyticProperties.fromPage;
      analyticProperties.fromItem = "i_share_entry";
      analytic.sensors.track("e_click_share_entry", analyticProperties);
    }
  }
});
