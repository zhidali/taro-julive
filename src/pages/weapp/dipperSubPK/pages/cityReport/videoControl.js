//  为什么不用component   因为 wx 自带bug  wx.createVideoContext  在component 里面 无法和video 产生联动 
// videoContext  是 上下文 wx.VideoContext 对象。
// dipperSubPK/pages/component/videoNative/videoNative.js
const autoanalysis = require('../autoanalysis/autoanalysis.js')
const app = getApp();

let _this_ = {};
let videoData = {
  videoPlayStatus: false,
  fullScreen: false,
  isPlayFinish: false,
  videoDuration: 0,
  videoCurrentTime: 0,
  controls: true,
  maskStatus: {
    initPlayFlag: true,
    wifiWarnFlag: false,
    againPlayFlag: false
  }
};
let basicsObj
let play_action

function videoControlInit(target) {
  _this_ = target
  // _this_.data.videoData = videoData
  _this_._didClickVideoPlay = _didClickVideoPlay
  _this_._didClickWifiVideoPlay = _didClickWifiVideoPlay
  _this_._didClickVideoAgainPlay = _didClickVideoAgainPlay
  _this_._didClickVideoPause = _didClickVideoPause
  _this_._bindplay = _bindplay
  _this_._bindpause = _bindpause
  _this_._bindended = _bindended
  _this_._bindtimeupdate = _bindtimeupdate
  _this_._bindfullscreenchange = _bindfullscreenchange
  _this_._bindwaiting = _bindwaiting
  _this_._bindprogress = _bindprogress
  _this_._videoErrorCallback = _videoErrorCallback
  _this_._resetData = _resetData
  _this_._unloadSendPoints = _unloadSendPoints
  console.log(videoData)
  _this_.setData({
    videoData: videoData
  })
  basicsObj = {
    order_id: _this_.data.o_id,
    adviser_id: _this_.data.employee.id,
    material_id: _this_.data.share_id,
    city_id: app.commonData.city.city_id,
    article_type: _this_.data.plate_id,
    video_url: _this_.data.src
  }
  setTimeout(() => {
    let keyName = 'videoData.controls'
    _this_.setData({
      [keyName]: false
    })
  }, 600)
}

function _didClickVideoPlay() {
  wx.getNetworkType({
    success(res) {
      const networkType = res.networkType
      if (networkType != 'wifi' && app.globalData.firstNotWifi) {
        let replaceName = 'videoData.maskStatus.initPlayFlag'
        let playImgName = 'videoData.maskStatus.wifiWarnFlag'
        app.globalData.firstNotWifi = false
        _this_.setData({
          [replaceName]: false,
          [playImgName]: true
        })
      } else {
        play_action = 1
        _this_.videoContext.play();
        let controls = "videoData.controls"
        let replaceName = 'videoData.maskStatus.initPlayFlag'
        let vidPlaySta = 'videoData.videoPlayStatus'
        _this_.setData({
          [replaceName]: false,
          [vidPlaySta]: true,
          [controls]: true
        })
      }
    }
  })

}

function _didClickWifiVideoPlay() {
  play_action = 1
  _this_.videoContext.play();
  let controls = "videoData.controls"
  let replaceName = 'videoData.maskStatus.wifiWarnFlag'
  let vidPlaySta = 'videoData.videoPlayStatus'
  _this_.setData({
    [replaceName]: false,
    [vidPlaySta]: true,
    [controls]: true
  })
}

function _didClickVideoAgainPlay() {
  play_action = 2
  _this_.videoContext.play();
  let replaceName = 'videoData.maskStatus.againPlayFlag'
  let vidPlaySta = 'videoData.videoPlayStatus'
  let controls = "videoData.controls"
  _this_.setData({
    [replaceName]: false,
    [vidPlaySta]: true,
    [controls]: true
  })
}

function _didClickVideoPause() {
  _this_.videoContext.pause();
  _this_.data.videoData.videoPlayStatus = false
  let fromModule = _this_.data.videoData.fullScreen ? 'm_video_full_screen' : 'm_video_card'
  let obj = Object.assign({}, basicsObj, {
    fromModule: fromModule,
    play_time_all: _this_.data.videoData.videoCurrentTime,
    video_time: _this_.data.videoData.videoDuration,
    pause_action: '1'
  })
  autoanalysis.elementTracker('cityReport', obj, 5531)
}

function _bindpause() {
  _this_.data.videoData.videoPlayStatus = false
  let fromModule = _this_.data.videoData.fullScreen ? 'm_video_full_screen' : 'm_video_card'
  let obj = Object.assign({}, basicsObj, {
    fromModule: fromModule,
    play_time_all: _this_.data.videoData.videoCurrentTime,
    video_time: _this_.data.videoData.videoDuration,
    pause_action: '1'
  })
  autoanalysis.elementTracker('cityReport', obj, 5531)
  // 重复后 播放为play_action2   只有点击暂停后才能在播放  
  play_action = 1
}

function _bindplay() {
  if (this.data.videoData.isPlayFinish) {
    this.data.videoData.isPlayFinish = false
  }
  _this_.data.videoData.videoPlayStatus = true

  let fromModule = _this_.data.videoData.fullScreen ? 'm_video_full_screen' : 'm_video_card'
  let obj = Object.assign({}, basicsObj, {
    fromModule: fromModule,
    video_time: _this_.data.videoData.videoDuration,
    play_action: play_action
  })
  autoanalysis.elementTracker('cityReport', obj, 5530)

}



function _bindended(e) {
  _this_.data.videoData.isPlayFinish = true
  if (_this_.data.videoData.fullScreen) {
    _this_.videoContext.exitFullScreen()
  }
  let replaceName = 'videoData.maskStatus.againPlayFlag'
  let controls = "videoData.controls"
  _this_.setData({
    [replaceName]: true,
    [controls]: false
  })
  let fromModule = _this_.data.videoData.fullScreen ? 'm_video_full_screen' : 'm_video_card'
  let obj = Object.assign({}, basicsObj, {
    fromModule: fromModule,
    video_time: _this_.data.videoData.videoDuration
  })
  autoanalysis.elementTracker('cityReport', obj, 5535)
}

function _bindtimeupdate(e) {
  if (!_this_.data.videoData.videoDuration) {
    let time = e.detail.duration
    this.data.videoData.videoDuration = time
    let replaceName = 'videoData.showVideoDuration'
    let replaceTime = formatTime(time)
    _this_.setData({
      [replaceName]: replaceTime
    })
  }
  this.data.videoData.videoCurrentTime = e.detail.currentTime
}

function _bindfullscreenchange(e) {
  _this_.data.videoData.fullScreen = e.detail.fullScreen
  console.log('fullScrenn')
  console.log(_this_.data.videoData.fullScreen)
  let obj = Object.assign({}, basicsObj, {
    play_time_all: _this_.data.videoData.videoCurrentTime,
    video_time: _this_.data.videoData.videoDuration
  })
  if (_this_.data.videoData.fullScreen) {
    _this_.setData({
      videoFullScreen: false
    })
    autoanalysis.elementTracker('cityReport', obj, 5532)
  } else {
    autoanalysis.elementTracker('cityReport', obj, 5533)
    _this_.setData({
      videoFullScreen: true
    })
  }



}

function _bindwaiting() {
  console.log('缓冲')
}

function _bindprogress(e) {
  console.log(e)
}

function _videoErrorCallback(e) {
  console.log('播放出错')
  console.log(e)
}

function _resetData() {
  videoData = {
    videoPlayStatus: false,
    fullScreen: false,
    isPlayFinish: false,
    videoDuration: 0,
    videoCurrentTime: 0,
    controls: false,
    maskStatus: {
      initPlayFlag: true,
      wifiWarnFlag: false,
      againPlayFlag: false
    }
  };
}

function _unloadSendPoints() {
  let fromModule = _this_.data.videoData.fullScreen ? 'm_video_full_screen' : 'm_video_card'
  let obj = Object.assign({}, basicsObj, {
    fromModule: fromModule,
    play_time_all: _this_.data.videoData.videoCurrentTime,
    video_time: _this_.data.videoData.videoDuration,
    pause_action: '2'
  })
  autoanalysis.elementTracker('cityReport', obj, 5531)
}

function formatTime(time) {
  let m = parseInt(time / 60).toString().padStart(1, '0');
  let s = parseInt(time % 60)
  return `${m}:${s}`
}
module.exports = videoControlInit