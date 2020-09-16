let audio;
const imgList = ['audio_play0.png', 'audio_stop.png'];
const autoanalysis = require('../autoanalysis/autoanalysis.js');
let _this

function init(target, url) {
  if (!url) return;
  _this = target
  _this.initAudioData = initAudioData(url)
  _this.timeTirculation = timeTirculation
  _this.audioPlay = audioPlay
  _this.timeSliderChanged = timeSliderChanged
  _this.formatTime = formatTime
  _this.onUnload = function() {
    console.log('onUnload')
    _this.analyticPageView()
    _this.timeTirculation(true)
    audio.stop()
    audio.destroy()
  }
  _this.onHide = function() {
    console.log('onHide')
    audio.pause()
    _this.analyticPageView()
    _this.timeTirculation(true)
  }
}

function timeTirculation(flag) {
  if (flag) {
    clearInterval(_this.data.evenLoop)
    if (_this.data.audioImg != 'audio_play0.png') {
      _this.setData({
        audioImg: imgList[0],
      })
    }
    return;
  }
  _this.data.evenLoop = setInterval(() => {
    _this.data.currentDuration++;
    if (_this.data.currentDuration >= _this.data.totalDuration) {
      _this.data.currentDuration = _this.data.totalDuration
      _this.data.flag = true
      _this.audioPlay()
    }
    _this.setData({
      currentDuration: _this.data.currentDuration,
      sliderValue: parseInt(_this.data.currentDuration / _this.data.totalDuration * 100),
      farmatCurrentDuration: _this.formatTime(_this.data.currentDuration)
    })
  }, 1000)
}

function formatTime(value) {
  var secondTime = parseInt(value);
  var minuteTime = 0;
  var hourTime = 0;
  if (secondTime > 60) {
    minuteTime = parseInt(secondTime / 60);
    secondTime = parseInt(secondTime % 60);
    if (minuteTime > 60) {
      hourTime = parseInt(minuteTime / 60);
      minuteTime = parseInt(minuteTime % 60);
    }
  }
  var result = parseInt(secondTime) > 9 ? parseInt(secondTime) : '0' + parseInt(secondTime)

  if (minuteTime > 0) {
    result = "" + parseInt(minuteTime) + ":" + result;
  } else {
    result = "00:" + result;
  }
  if (hourTime > 0) {
    result = "" + parseInt(hourTime) + ":" + result;
  }
  return result
}

function audioPlay() {
  if (_this.data.flag) {
    audio.pause()
    _this.timeTirculation(true)
    _this.setData({
      audioImg: imgList[0],
      flag: false
    })
    if (_this.__route__.indexOf('multiProject') > 1) {
      autoanalysis.elementTracker('multiProject', {
        'project_ids': this.data.project_ids,
        'order_id': this.data.o_id,
        'adviser_id': this.data.employee.id,
        'material_id': this.data.share_id,
        'play_time': this.data.currentDuration
      }, 3953)
    } else {
      autoanalysis.elementTracker('singleProject', {
        'project_id': _this.data.projectId,
        'order_id': _this.data.o_id,
        'adviser_id': _this.data.employee.id,
        'material_id': _this.data.share_id,
        'play_time': _this.data.currentDuration
      }, 3934)
    }

  } else {
    audio.play()
    _this.setData({
      audioImg: imgList[1]
    })
    _this.timeTirculation()
    _this.data.flag = true
    if (_this.__route__.indexOf('multiProject') > 1) {
      autoanalysis.elementTracker('multiProject', {
        'project_ids': this.data.project_ids,
        'order_id': this.data.o_id,
        'adviser_id': this.data.employee.id,
        'material_id': this.data.share_id
      }, 3952)
    } else {
      autoanalysis.elementTracker('singleProject', {
        'project_id': _this.data.projectId,
        'order_id': _this.data.o_id,
        'adviser_id': _this.data.employee.id,
        'material_id': _this.data.share_id
      }, 3933)
    }
  }
}

function timeSliderChanged(e) {
  let x = audio.duration * (e.detail.value / 100)
  audio.seek(x)
  _this.setData({
    currentDuration: parseInt(x),
    farmatCurrentDuration: _this.formatTime(parseInt(x))
  })
}

function initAudioData(url) {
  console.log('每次进入')
  audio = wx.createInnerAudioContext();
  audio.src = url
  audio.onCanplay(() => {
    if (!_this.data.totalDuration) {
      _this.audioTimer = setInterval(() => {
        audio.duration;
        if (audio.duration > 0) {
          _this.setData({
            totalDuration: parseInt(audio.duration),
            formatTotalDuration: _this.formatTime(audio.duration)
          })
          clearInterval(_this.audioTimer);
        }
      }, 1000)
    }
  })
  audio.onPause(() => {
    console.log('停止')
  })
  audio.onWaiting(() => {
    console.log('缓冲')
    _this.data.onWaitingFlag = true
    _this.timeTirculation(_this.data.onWaitingFlag)
    _this.setData({
      flag: false
    })
  })
  audio.onTimeUpdate(() => {
    if (_this.data.onWaitingFlag) {
      console.log('缓冲后进入')
      _this.data.onWaitingFlag = false
      _this.timeTirculation()
      _this.setData({
        flag: true,
        audioImg: imgList[1]
      })
    }
  })
}

module.exports = {
  init: init
}