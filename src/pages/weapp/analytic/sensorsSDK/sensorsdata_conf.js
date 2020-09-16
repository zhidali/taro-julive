import { BASE_URL } from '../../network/config'
const julive_local_config = require('../../julive-local-config.js');

let server_url = ''

if (BASE_URL.indexOf('test') != -1) {
  server_url = 'http://test.uarp.julive.com:80/sa?project=default'
} else {
  server_url = 'https://uarp.julive.com/sa?project=production'
}

var conf = {
  // 神策分析注册在APP全局函数中的变量名，在非app.js中可以通过getApp().sensors(你这里定义的名字来使用)
  name: 'julive',
  appid: julive_local_config.wxappid,
  // 神策分析数据接收地址, test is 'project=default', release is 'project=production'
  // 神策分析数据接收地址现在由后台控制
  server_url: server_url,
  // 传入的字符串最大长度限制
  max_string_length: 300,
  // 发送事件的时间使用客户端时间还是服务端时间
  use_client_time: false,
  // 是否允许修改onShareMessage里return的path，用来增加（用户id，分享层级，当前的path），在app onshow中自动获取这些参数来查看具体分享来源，层级等
  allow_amend_share_path: true,

  show_log: true,
  // 是否自动采集如下事件
  autoTrack: {
    //$MPLaunch
    appLaunch: true,
    //$MPShow
    appShow: true,
    //$MPHide
    appHide: true,
    //$MPViewScreen
    pageShow: true,
    // $MPShare
    pageShare: true //是否采集 $MPShare 事件，true 代表开启。
  }
};

module.exports = conf;