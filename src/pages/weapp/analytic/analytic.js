const sensors = require("./sensorsSDK/sensorsdata.min.js");
const page = require("./julivePage.js");
const julive_local_config = require("../julive-local-config.js");

// TODO func e 更改
function e(t, n, o) {
  if (t[n]) {
    const tt = Object.assign({}, {...t});
    var e = tt[n];
    //debugger
    tt[n] = function (tt) {
      o.call(this, tt, n);
      e.call(this, tt);
    };
  } else {
    tt[n] = function (tt) {
      o.call(this, tt, n);
    };
  }
}

var p = App;
App = function(t) {
  e(t, "onLaunch", appLaunch);
  p(t);
};

function appLaunch(res) {
  registerSuperPropertites();
}

function registerSuperPropertites() {
  var superProperties = {};
  superProperties = {
    product_id: julive_local_config.appid,
    $app_version: julive_local_config.versionName,
    fromItemIndex: "-1",
    comjia_platform_id: julive_local_config.comjiaPlatformId
  };
  sensors.registerApp(superProperties);
}

module.exports = { sensors, page };
