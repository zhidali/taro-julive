const QQMapWX = require('./qqmap-wx-jssdk.min.js')
const backColor = ['#47B3E3', '#0AD487', '#5DAAF8', '#378EB5', '#08CED9', '#A3DBE1', '#E09230', '#FFCF2B', '#E3CF47', '#E9B488']
const qqmapsdk = new QQMapWX({
  key: 'EVQBZ-PH3WJ-OJXFR-FYUZI-TZ7J7-3AFFD' // 必填
});

let startPointList;
let idx = 0;
let mode
let secondDestinationFlag = true;

function direction(mode, startPoint, destination, _this, index, leg, type) {
   let isMultiPage = true
  if (_this.route === "dipperSubPK/pages/multiProject/multiProject"){
    isMultiPage = false
  }
  /**
   * mode =>'driving'（驾车）、'walking'（步行）、'bicycling'（骑行），不填默认：'driving', 、'transit'（公交） 默认：'driving'
   * from参数不填默认当前地址
   */
      let itemStartPoint = {
        latitude: startPoint.lat,
        longitude: startPoint.lng
    }
  if (mode == 'transit'){
    console.log(`num:${index}`)
  }
  qqmapsdk.direction({
    mode: mode,
    from: itemStartPoint,
    to: destination,
    success: function(res) {
      if (res.status != 0) return;
      try {
        if (mode === 'driving') {
          var ret = res;
          var coors = ret.result.routes[0].polyline;
          var pl = [];
          //坐标解压（返回的点串坐标，通过前向差分进行压缩）
          var kr = 1000000;
          for (var i = 2; i < coors.length; i++) {
            coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
          }
          //将解压后的坐标放入点串数组pl中
          for (var i = 0; i < coors.length; i += 2) {
            pl.push({
              latitude: coors[i],
              longitude: coors[i + 1]
            })
          }
          if (pl.length > 3) {
            pl.push({
              latitude: destination.latitude,
              longitude: destination.longitude,
            })
          }
          if (type === 'A') {
            _this.data.polylineA.driving.push({
              points: pl,
              color: backColor[index],
              width: index == 0 && isMultiPage ? 10 : 5
            })
          } else {
            _this.data.polylineB.driving.push({
              points: pl,
              color: backColor[index],
              width: index == 0 && isMultiPage  ? 10 : 5
            })
          }
          if ((leg - 1) == index && type === 'A') {
            _this.setData({
              polyline: _this.data.polylineA.driving
            })
            console.log(_this.data.polylineA.driving)
            }
          } else {
            var ret = res.result.routes[0];
            var count = ret.steps.length;
            var pl = [];
            var coors = [];
            //获取各个步骤的polyline
            for (var i = 0; i < count; i++) {
              if (ret.steps[i].mode == 'WALKING' && ret.steps[i].polyline) {
                coors.push(ret.steps[i].polyline);
              }
              if (ret.steps[i].mode == 'TRANSIT' && ret.steps[i].lines[0].polyline) {
                coors.push(ret.steps[i].lines[0].polyline);
              }
            }
            //坐标解压（返回的点串坐标，通过前向差分进行压缩）
            var kr = 1000000;
            for (var i = 0; i < coors.length; i++) {
              for (var j = 2; j < coors[i].length; j++) {
                coors[i][j] = Number(coors[i][j - 2]) + Number(coors[i][j]) / kr;
              }
            }
            //定义新数组，将coors中的数组合并为一个数组
            var coorsArr = [];
            for (var i = 0; i < coors.length; i++) {
              coorsArr = coorsArr.concat(coors[i]);
            }
            //将解压后的坐标放入点串数组pl中
            for (var i = 0; i < coorsArr.length; i += 2) {
              pl.push({
                latitude: coorsArr[i],
                longitude: coorsArr[i + 1]
              })
            }

            if (pl.length > 3) {
              pl.push({
                latitude: destination.latitude,
                longitude: destination.longitude,
              })
            }
            if (type === 'A') {
              _this.data.polylineA.transit.push({
                points: pl,
                color: backColor[index],
                width: index == 0 && isMultiPage  ? 10 : 5
              })
            } else {
              _this.data.polylineB.transit.push({
                points: pl,
                color: backColor[index],
                width: index == 0 && isMultiPage  ? 10 : 5
              })
            }
          }
        

      } catch (e) {
        console.log(e)
      }
    },
    fail: function(error) {
      console.error(error);
    },
    complete: function(res) {
      if (res.status != 0) {
        console.log(type,mode,index)
        let modeType = mode == 'driving' ? 'driving' : 'transit'

        if (type === 'A') {
          _this.data.polylineA[modeType].push({
            points: [{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }],
            color: backColor[index],
            width: index == 0 && isMultiPage  ? 10 : 5
          })
          if ((leg - 1) == index && mode == 'driving') {
            _this.setData({
              polyline: _this.data.polylineA.driving
            })
          }
        } else {
          _this.data.polylineB[modeType].push({
            points: [{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }],
            color: backColor[index],
            width: index == 0 && isMultiPage  ? 10 : 5
          })
        }


      }
      if ('driving' === mode && idx <startPointList.length){ 
        idx++;
        if (idx === startPointList.length) {
          mode = 'transit'
          idx = -1
        } else {
          setTimeout(()=>{
            
          },100)
          direction('driving', startPointList[idx], destination, _this, idx, startPointList.length, type)
        } 

      } 
      if ('transit' === mode && idx < (startPointList.length-1) ){
        idx++;
        console.log(idx)
        setTimeout(() => {
          direction('transit', startPointList[idx], destination, _this, idx, startPointList.length, type)
        }, 100)
        if (idx == (startPointList.length - 1) && _this.data.secondDestination && secondDestinationFlag){
          secondDestinationFlag =false 
          let startPointList = _this.data.secondDestination.startPointList
          let destination = _this.data.secondDestination.destination
          
          setTimeout(()=>{
            mapPolyline('driving', startPointList, destination, _this, 'B')
          },2000)
 
        }
      }
    }
  });

}

function mapPolyline(trafficMode,startPoint, destination, _this, type) {
  destination = {
    latitude: destination.lat,
    longitude: destination.lng
  }
  if (type === 'A'){
    // 默认为一新的page实列 生成 ->初始化
    secondDestinationFlag = true;
  }
  startPointList = startPoint 
  idx = 0
  direction(trafficMode, startPointList[idx], destination, _this, idx, startPointList.length, type)
}

function includePoints(points) {
  const map = wx.createMapContext('map')
  let arr = []
  points.forEach(item => {
    arr.push({
      latitude: item.latitude,
      longitude: item.longitude
    })
  })
  map.includePoints({
    padding: [40],
    points: arr,
    success: function(res) {
      console.log(res)
    },
    fail: function(res) {
      console.log(res)
    }
  })
}
module.exports = {
  mapPolyline: mapPolyline,
  includePoints: includePoints
}