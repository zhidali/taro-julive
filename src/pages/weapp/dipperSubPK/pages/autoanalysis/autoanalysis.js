
const record = require('./dipperSubPK/recordBox.js')
const cityReport = require('./dipperSubPK/cityReport.js')
const singleProject = require('./dipperSubPK/singleProject.js')
const multiProject = require('./dipperSubPK/multiProject.js')
const employeDetails = require('./dipperSubPK/employeDetails.js')
const navigationMap = require('./dipperSubPK/navigationMap.js')
const analytic = require('../../../analytic/analytic.js');
let arr = [record.record, cityReport.cityReport, singleProject.singleProject, multiProject.multiProject, employeDetails.employeDetails, navigationMap.navigationMap]

let list = []

arr.forEach(item=>{
  list.push({
    name: item.name,
    result: item()
  })
})
console.log(list)

function elementTracker(name, temporaryObj, num) {
  let buryPoint ;
  list.findIndex((item) => {
    if (item.name == name) {
      buryPoint = item.result;
       return
    }
  })
  let pack = Object.assign({},buryPoint[num],temporaryObj)
  console.log(`------------------对应埋点ID:${num}低调分割线---------------------`)
  pack.timestamp = new Date().getTime()
  console.log(pack)
  console.log(`------------------对应埋点ID:${num}华丽结束线---------------------`)
  analytic.sensors.track(buryPoint[num].event, pack);
}

module.exports = {
  elementTracker: elementTracker
}