
import { request } from "../network/request";
const beforehandRequest = {}
const _ = {}

_.info = {
  projectList: {
    selfFlag: true,
    otherFlag: true,
    isUse: true,
    response: ''
  }
}

beforehandRequest.getObjAttribute = function (key) {
  return this._.info[key]
}

beforehandRequest.setObjAttribute = function (key, _key, val) {
  this._.info[key][_key] = val
  console.log(val)
  console.log(_key)
  console.log(this._.info[key])
}

beforehandRequest.sendRequest = async function (url, params, key)  {
  let res = await request(url,params)
  console.log(res)
  this._.info[key].response = res
  console.log(this._.info[key])
}

beforehandRequest._ = _

module.exports = beforehandRequest