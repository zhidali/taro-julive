/*
 * @Author: your name
 * @Date: 2020-07-20 22:00:20
 * @LastEditTime: 2020-09-25 18:30:01
 * @LastEditors: zhidl
 * @Description: In User Settings Edit
 * @FilePath: /julive/utils/utilGetQr.js
 */

// const enviroment = require('../enviroment/enviroment.js');
// const location = require('../location/location.js');
const analytic = require('../analytic/analytic.js');
async function getCommonQrInfo(id) {
  const app = getApp();
  const res = await app.request('/wxmini/v1/common/qr-info', {
    qr_id: id
  });

  let _obj = res.data.json;

  if (_obj.channel_id) {
    app.commonData.channel.channel_id = String(_obj.channel_id);
    analytic.sensors.registerApp({
      channel_id: _obj.channel_id,
    });
  }
  if (_obj.utm_source) {
    // enviroment.setChannel(_obj.utm_source);
    app.enviroment.setChannel(_obj.utm_source);
  }
  if (_obj.channel_put) {
    // enviroment.setChannelPut(_obj.channel_put);
    app.enviroment.setChannelPut(_obj.channel_put);
    analytic.sensors.registerApp({
      channel_put: _obj.channel_put
    });
  }
  if (_obj.city_id && _obj.city_name) {
    let city_name = decodeURIComponent(_obj.city_name);
    var city = {
      city_id: _obj.city_id,
      city_name: city_name,
    }
    app.commonData.city = city;
    // location.cityChanged(city)
    app.enviroment.setCityInfo(city);
  }
  return res.data.json;
}

module.exports = {
  getCommonQrInfo: getCommonQrInfo,
};