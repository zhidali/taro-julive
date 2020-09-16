const reportPerformance = {}
import { BASE_URL } from '../network/config'
let isProduction = false
if (BASE_URL.indexOf('test') == -1) {
  isProduction =  true
} 

const _ = {}
_.info = {
  '2001': {
    initTime: '',
    finishTime: '',
    flag: true
  },
  '2002': {
    initTime: '',
    finishTime: '',
    flag: true
  },
  '2003': {
    initTime: '',
    finishTime: '',
    flag: true
  }
}

reportPerformance.setInitTime = function (id) {
  id = String(id)
  if (!this._.info[id]) return
  this._.info[id].initTime = (new Date()).valueOf()
}

reportPerformance.sendMsg = function (id, flag = false) {
  // * 需要使用 canIUse 判断接口是否可用
  if (wx.canIUse('reportPerformance') && this._.info[id] && this._.info[id].flag) {
    let finishTime = (new Date()).valueOf()
    let val = finishTime - this._.info[id].initTime
    wx.reportPerformance(id, val)
    this._.info[id].finishTime = finishTime
    this._.info[id].flag = flag
  }
}

reportPerformance._ = _

module.exports = reportPerformance