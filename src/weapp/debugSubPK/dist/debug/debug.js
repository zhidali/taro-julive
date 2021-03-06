"use strict";
var util = require("../utils/util.js");
const julive_local_config = require("../../../julive-local-config.js");
Page({
  data: {
    logs: [],
    tools: []
  },
  onLoad: function() {
    this.setData({
      tools: this.getTools()
    })
    this.setData({
      versionBuild: julive_local_config.versionBuild
    })
  },
  getTools: function() {
    return [{
      type: "common",
      title: "常用工具",
      tools: [{
        title: "App信息",
        image: "../assets/img/appinfo-icon.png",
        path: "../appInformation/appInformation"
      }, {
        title: "位置模拟",
        image: "../assets/img/gps-icon.png",
        path: "../positionSimulation/positionSimulation"
      }, {
        title: "缓存管理",
        image: "../assets/img/save-icon.png",
        path: "../storage/storage"
      }, {
        title: "H5任意门",
        image: "../assets/img/h5door-icon.png",
        path: "../h5door/h5door"
      }, {
        title: "更新版本",
        image: "../assets/img/update-version-icon.png",
        type: "function",
        path: "onUpdate"
      }]
    }]
  },
  onUpdate: function() {
    var o = wx.getUpdateManager();
    o.onCheckForUpdate(function(t) {
      t || wx.showModal({
        title: "更新提示",
        content: "当前已经是最新版本"
      })
    }), o.onUpdateReady(function() {
      wx.showModal({
        title: "更新提示",
        content: "新版本已经准备好，是否重启应用？",
        success: function(t) {
          t.confirm && o.applyUpdate()
        }
      })
    }), o.onUpdateFailed(function() {})
  },
  openSetting: function() {
    wx.openSetting({
      success: function(t) {
        console.log(t)
      }
    })
  },
  onRedirect: function(t) {
    var o = t.currentTarget.dataset.type,
      n = t.currentTarget.dataset.path;
    "function" === o ? this[n]() : util.goToLink(n)
  }
});