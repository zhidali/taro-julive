const sensors = require("../analytic/sensorsSDK/sensorsdata.min.js");



let _ = {};
let autoanalysis = {};

autoanalysis.reportAbTest = function (val = 'B') {
  let ob = this._.info.properties.isReportAbTest
  if (!ob) return 
  ob = false
  sensors.track('e_page_view_abtest', {
    abtest_name: 'p_home_optimization',
    abtest_value: val
  });
}

_.info = {
  properties: {
    isReportAbTest:true
  }
}

autoanalysis._ = _;
module.exports = autoanalysis;