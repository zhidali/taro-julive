/*
 * @author: wangshuaixue
 * @Date: 2020-08-17 15:38:38
 * @description: 列表页 楼盘卡片B
 * @LastEditTime: 2020-09-10 17:12:37
 */
import {
  favorite
} from '../../../../../api/projectList';
const app = getApp();
Component({
  externalClasses: ['my-class'],

  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的属性列表
   * 用于组件自定义设置 
   */
  properties: {
    // 当前楼盘卡片数据
    projectData: {
      type: Object,
      value: {}
    },
    // 当前楼盘索引
    index: {
      type: Number,
      value: 0
    },
    // 来源模块
    fromModule: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 显示轮播点点
    indicatorDots: true,
    // 当前索引
    currentBannerIndex: 0,
    // 登录状态 true已登录,不显示授权登录  false未登录,显示授权登录
    loginStatus: false,
    // 点击收藏时的登录状态
    currentLogin: false
  },


  // 组件生命周期函数-在组件实例进入页面节点树时执行)
  attached() {
    // 初始化进入拉取缓存判断
    this.setData({
      loginStatus: app.commonData.login_status ? true : false
    })
    app.watchCommonData('login_status', (newv) => {
      this.setData({
        loginStatus: newv ? true : false
      })
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {

    // 允许登陆
    allowLogin(e) {
      this.data.isLike = true;
      this.changeCollect()
    },
    // 取消登陆
    cancelLogin() {
      // 收藏失败
      this.triggerEvent('changeCollect', {
        // 2 取消收藏 1收藏
        state: this.data.projectData.is_collect ,
        // 登录状态 true 登录成功 false登录失败
        login: false,
        projectId: this.data.projectData.project_id,
        cardIndex: this.data.index,
        fromModule: this.data.fromModule
      });
      wx.showToast({
        title: "登录失败",
        icon: "none",
        duration: 2000
      })
    },
    // 点击
    clickLogin() {
      // 如果登录状态，收藏状态取目标状态值
      let currCollect = this.data.projectData.is_collect == 1 ? 2 : 1;
      
      // 点击收藏
      this.triggerEvent('clickCollect', {
        // 2 取消收藏 1收藏
        state: app.commonData.login_status ? currCollect : 1,
        // 登录状态 true 登录成功 false登录失败
        login: app.commonData.login_status,
        projectId: this.data.projectData.project_id,
        cardIndex: this.data.index,
        fromModule: this.data.fromModule
      });
      this.setData({
        currentLogin: this.data.loginStatus
      })
      if (app.commonData.login_status) {
        this.changeCollect();
      }
    },
    // 加载错误
    errLoad(e) {
      let {
        projectData
      } = this.data;
      var default_img = e.currentTarget.dataset.img;
      var index = e.currentTarget.dataset.index;
      projectData.img_list[index].url = default_img;
      this.setData({
        projectData
      })
    },

    // 楼盘卡片滑动
    projectSwiperChange(e) {
      this.setData({
        currentBannerIndex: e.detail.current
      })
    },
    // 改变收藏
    async changeCollect(e) {
      try {
        let {
          is_collect,
          project_id
        } = this.data.projectData;
        let state = '';
        if (is_collect == 1 && !this.data.currentLogin) {
          state = '1'
        } else {
          state = is_collect == 1 ? '2' : '1';
        }

        // 1收藏 2取消收藏
        let params = {
          project_id: project_id,
          status: state
        }
        let {
          data,
          code
        } = await favorite(params);
        if (code == 0) {
          let newData = this.data.projectData;
          newData.is_collect = params.status;
          this.setData({
            projectData: newData
          })
          if (data.user_has_fav == 1) {
            wx.showToast({
              title: '已收藏',
              icon: "none",
              duration: 2000
            });
          } else {
            wx.showToast({
              title: params.status == 1 ? "收藏成功" : '取消收藏',
              icon: "none",
              duration: 2000
            });

            let obj = {
              state: params.status,
              login: true,
              projectId: project_id,
              cardIndex: this.data.index,
              fromModule: this.data.fromModule
            }
            this.triggerEvent('changeCollect', obj);

          }
        } else {
          // 收藏失败
          this.triggerEvent('changeCollect', {
            state: params.status,
            login: true,
            projectId: project_id,
            cardIndex: this.data.index,
            fromModule: this.data.fromModule
          });
        }
      } catch (e) {
        // 收藏失败
        this.triggerEvent('changeCollect', {
          state: 2,
          login: false,
          projectId: this.data.projectData.project_id,
          cardIndex: this.data.index,
          fromModule: this.data.fromModule
        });
        console.log(e)
      }
    }
  }
})