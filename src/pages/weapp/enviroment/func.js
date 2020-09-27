import {
  versonTest,
  getConf,
  getLocationApi
} from '../api/common';

const analytic = require('../analytic/analytic.js');
const notification = require("../utils/notification.js");
export default class Func {
  constructor(app) {
    let obj = {
      getAbtest: this.getAbtest,
      dialogMapData: this.dialogMapData,
      setConf: this.setConf,
      getLocation: this.getLocation
    }
    Object.assign(app, obj);
  }
  /**
   * @description:  拉取conf接口 获取abtest
   * @param {string} key abtest key值
   */
  async getAbtest(key = '') {
    console.log(this, 'getAbtest getAbtest');
    let timer = null;
    try {
      return new Promise(async (resolve, reject) => {
        let resolveObj = this.abTest;
        if (Object.keys(resolveObj).length <= 0 && this.flagTest) {
          this.flagTest = false;
          const ab = await versonTest();
          if (ab.code != 0) {
            this.abTest = {};
            resolveObj = {};
          }
          if (ab.code == 0) {
            // 缓存abtest
            this.abTest = ab.data.abtest;
            resolveObj = ab.data.abtest;
            analytic.sensors.track('e_page_view_abtest', {
              abtest_name: 'p_project_list_optimization',
              abtest_value: ab.data.abtest.p_project_list_optimization || ''
            });

            if (ab.data.abtest.p_home_strategy) {
              analytic.sensors.track('e_page_view_abtest', {
                abtest_name: 'p_home_strategy',
                abtest_value: ab.data.abtest.p_home_strategy
              });
            }

            if (ab.data.abtest.p_home_strategy_01) {
              analytic.sensors.track('e_page_view_abtest', {
                abtest_name: 'p_home_strategy_01',
                abtest_value: ab.data.abtest.p_home_strategy_01
              });
            }

            analytic.sensors.track('e_page_view_abtest', {
              abtest_name: 'help_find_home_optimization',
              abtest_value: ab.data.abtest.help_find_home_optimization || ''
            });
            // this.abTest.p_project_list_optimization = "B";
            // this.abTest.p_home_strategy="A"
          }
        }

        timer = setInterval(() => {
          if (Object.keys(this.abTest).length != 0) {
            clearInterval(timer);
            timer = null;
            if (key == '') {
              resolve(this.abTest);
            }
            if (key != '') {
              resolve(this.abTest[key]);
            }
          }
        }, 50)
      })
    } catch (e) {
      console.log(e);
    }
  }
  /**
   * @description: 设置当前城市弹窗 弹出
   * @param {String} type  set get status close dialog
   * @param {String} dialogKey 弹窗对应标示
   */
  dialogMapData(type, dialogKey = 'none') {
    // home-subscribe   首页订阅弹窗
    // home-ground  首页cms配置落地页面弹窗
    // home-orderSuccess 首页留电成功弹窗
    // home-findHouse 首页查找房源弹出
    // home-filter 首页filter弹出

    // list-findhouse  列表页面帮我找房
    // list-service 列表升级服务
    // list-orderSuccess 列表页面留电成功弹窗
    // list-ground 列表页面 cms配置弹窗


    // wx-login 微信授权弹窗

    // 设置 获取 状态
    let typeStatus = ['set', 'get', 'status', 'close', 'dialog']
    // 弹窗标示符 数组
    let arr = ['home-subscribe', 'home-ground', 'home-orderSuccess', 'home-findHouse', 'home-filter', 'list-findhouse', 'list-service', 'list-orderSuccess', 'list-ground', 'wx-login'];
    // arr 中不包含 dialogKey 直接return
    if (arr.indexOf(dialogKey) == -1 && dialogKey != 'none' && type != 'dialog') {
      return;
    }
    if (typeStatus.indexOf(type) == -1) {
      return;
    }
    let key = `city_${this.commonData.city.city_id}`;
    let dialogMap = this.globalData.dialogMap;

    // 如果无值 新创建
    if (!dialogMap.has(key)) {
      let obj = {
        // 当前弹出状态
        currentStatus: type == 'set' ? true : false,
        // 当前需弹出名
        currentDialog: type == 'set' ? dialogKey : ''
      }

      // 获取为0
      if (type == 'get') {
        return 0
      }
      if (type == 'status') {
        return false
      }
      if (type == 'close') {
        return false
      }
      if (type == 'dialog') {
        return obj.currentDialog
      }
      arr.forEach((item) => {
        // 如果为set 表示弹出1
        if (type == 'set' && item == dialogKey) {
          obj[item] = 1;
        } else {
          obj[item] = 0;
        }
      })
      dialogMap.set(key, obj);

    } else {
      let dialogMapValue = dialogMap.get(key);

      if (type == 'set' && arr.indexOf(dialogKey) != -1) {
        dialogMapValue.currentStatus = true;
        dialogMapValue[dialogKey]++;
        dialogMapValue.currentDialog = dialogKey;
        dialogMap.set(key, dialogMapValue);
      }

      if (type == 'get') {
        return dialogMapValue[dialogKey]
      }

      if (type == 'status') {
        return dialogMapValue.currentStatus
      }

      if (type == 'close') {
        dialogMapValue.currentStatus = false;
        dialogMapValue.currentDialog = '';
        dialogMap.set(key, dialogMapValue);
      }
      if (type == 'dialog') {
        return dialogMapValue.currentDialog;
      }
    }
  }
  // 获取渠道id
  async setConf() {
    console.log(this, 'setConf setConf');
    try {
      let params = {
        city_id: this.commonData.city.city_id,
        channel_id: this.commonData.channel.channel_id || ''
      };
      const conf = await getConf(params);
      if (conf.code == 0) {
        // 若没有拿到投放页的channel_id 则取接口的channel_id
        if (!this.commonData.channel.channel_id) {
          this.commonData.channel.channel_id = String(conf.data.channel.channel_id);
          wx.setStorage({
            key: 'julive_channelId',
            data: String(conf.data.channel.channel_id)
          })
        }
        // 400电话
        this.commonData.channel.phone = conf.data.channel.phone;

        // 注入埋点channel_id
        analytic.sensors.registerApp({
          channel_id: this.commonData.channel.channel_id,
        });

        // 存入m站跳转域名
        this.commonData.m_domain_project = conf.data.m_domain_project;
      }
    } catch (e) {
      console.log(e);
    }
  }
  // 
  /**
   * @description: 根据经纬度 获取城市id name
   * @param {string} lat 纬度
   * @param {string} lng 经度
   */
  async getLocation(lat, lng) {
    let cityInfo = {
      city_name: '北京',
      city_id: '2'
    }
    try {
      let res = await getLocationApi({
        lat,
        lng
      })
      if (res.code == 0) {
        let data = res.data;
        // 避免用户 缓存已存在沈阳，然后二次打开小程序  fetchCityInfo  后重新触发 

        if (this.commonData.city.city_id && data.city_id === this.commonData.city.city_id) {
          return
        };
        this.commonData.city = data;
        this.enviroment.setCityInfo(data);

        //需要通知首页。列表页面刷新数据,首页列表页面的方法名字是一样的
        if (this.globalData.commonQrInfo) {
          let pages = getCurrentPages()
          let currentPage = pages[pages.length - 1];
          currentPage.refreshPage()
        }
      } else {
        // 接口失败 设置默认城市
        if(!this.commonData.city.city_id){
          this.commonData.city = cityInfo;
          this.enviroment.setCityInfo(cityInfo);
        }
        notification.postNotificationName("CityLocateComplete", {});
      }
    } catch (e) {
      // 接口失败 设置默认城市
      if(!this.commonData.city.city_id){
        this.commonData.city = cityInfo;
        this.enviroment.setCityInfo(cityInfo);
      }
      notification.postNotificationName("CityLocateComplete", {});
    }
  }
}