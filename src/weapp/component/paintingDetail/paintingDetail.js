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
    paintInfo: {
      type: Object,
      value: {},
      observer: function(newVal, oldVal, changedPath) {
        if (util.isEmptyObject(newVal)) {
          this.data.paintInfo = {};
        }
      }
    },
    successImage: {
      type: String,
      value: ""
    }
  },
  data: {
    isIpx: app.globalData.isIpx,
    isIos: app.globalData.isIos,
    popSettingShow: false
  },

  methods: {
    /**
     * 弹出框蒙层截断touchmove事件
     */
    preventTouchMove: function() {},

    didClosePainter: function() {
      this.onDismiss();
    },

    //绘画 成功后获取图片路径
    onImgOK(e) {
      wx.hideLoading();
      this.setData({
        imagePath: e.detail.path
      });
      this.triggerEvent("shareImagePath", {
        imagePath: e.detail.path
      });
      analytic.sensors.track("e_module_exposure", {
        fromPage: "p_project_details",
        fromModule: "m_project_poster_window",
        toPage: "p_project_details",
        project_id: this.data.paintInfo.project_id
      });
    },
    //失败
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
    onDismiss: function(e) {
      this.setData({
        showPainter: false,
        template: {}
      });
      wx.hideLoading();
      this.triggerEvent("dismissCallback", {});
    },
    // save btn
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
          _this.setData({
            showPainter: false,
            template: {}
          });
          wx.showToast({
            title: "保存成功！请从相册分享图片到朋友圈~",
            icon: "none",
            duration: 2000
          });

          analytic.sensors.track("e_click_save", {
            fromPage: "p_project_details",
            fromModule: "m_project_poster_window",
            fromItem: "i_save",
            toPage: "p_project_details",
            project_id: _this.data.paintInfo.project_id,
            save_status: 1
          });
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
            analytic.sensors.track("e_click_window_button", {
              fromPage: "p_project_details",
              fromModule: "m_save_picture",
              fromItem: "i_window_button",
              toPage: "p_project_details",
              project_id: _this.data.paintInfo.project_id,
              button_id: 1 //1拒绝 2允许
            });
          } else {
            _this.setData({
              popSettingShow: true
              // showPainter: false,
              // template: {}
            });
          }
          analytic.sensors.track("e_click_save", {
            fromPage: "p_project_details",
            fromModule: "m_project_poster_window",
            fromItem: "i_save",
            toPage: "p_project_details",
            project_id: _this.data.paintInfo.project_id,
            save_status: 2
          });
        }
      });
    },
    shareFriend() {
      analytic.sensors.track("e_click_share_enrty", {
        fromPage: "p_project_details",
        fromModule: "m_project_poster_window",
        fromItem: "i_share_entry",
        project_id: this.data.paintInfo.project_id
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
    }
  }
});
