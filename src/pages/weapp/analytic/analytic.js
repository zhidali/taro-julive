const sensors = require("./sensorsSDK/sensorsdata.min.js");
const page = require("./julivePage.js");
const julive_local_config = require("../julive-local-config.js");

function e(t, n, o) {
  if (t[n]) {
    var e = t[n];
    t[n] = function(t) {
      o.call(this, t, n);
      e.call(this, t);
    };
  } else {
    t[n] = function(t) {
      o.call(this, t, n);
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
