export default class projectDetailPalette {
  palette(shareContent) {
    var views = [
      {
        type: 'image',
        url:
          'http://imgs.julive.com/l?p=eyJpbWdfcGF0aCI6IlwvbWluaW1ncy9kZXRhaWxfc2hhcmUtdG9wLnBuZyJ9ICAg',
        css: {
          top: '0rpx',
          width: '622rpx',
          height: '220rpx',
        },
      },
      {
        type: 'text',
        text: shareContent.show_user_view,
        css: {
          top: '254rpx',
          left: '32rpx',
          color: '#FF5C47',
          fontSize: '28rpx',
          maxLines: 1,
        },
        id: 'look_num',
      },
      {
        type: 'text',
        text: '个买房人，正在查看【' + shareContent.project_name + '】这个楼盘',
        css: {
          top: '258rpx',
          color: '#3E4A59',
          fontSize: '20rpx',
          width: '498rpx',
          left: ['40rpx', 'look_num'],
          maxLines: 1,
        },
      },
      //阴影
      {
        type: 'rect',
        css: {
          width: '558rpx',
          height: '328rpx',
          top: '306rpx',
          left: '32rpx',
          borderRadius: '8rpx',
          shadow: '0 0 12rpx rgba(0, 0, 0, 0.08)',
        },
      },
      //楼盘图片
      {
        type: 'image',
        url: shareContent.show_img,
        css: {
          top: '306rpx',
          left: '32rpx',
          width: '558rpx',
          height: '328rpx',
          borderRadius: '8rpx',
        },
      },
      {
        type: 'image',
        url: '/image/detail_share_bg.png',
        css: {
          top: '562rpx',
          left: '32rpx',
          width: '558rpx',
          height: '72rpx',
        },
      },
      {
        type: 'text',
        text: shareContent.dynamc_content,
        css: {
          top: '580rpx',
          left: '48rpx',
          color: '#3E4A59',
          width: '532rpx',
          height: '72rpx',
          lineHeight: '72rpx',
          fontSize: '28rpx',
          fontFamily: 'PingFangSC-Medium,PingFang SC',
          maxLines: 1,
          fontWeight: 'bold',
        },
      },
      //二维码
      {
        type: 'image',
        url: shareContent.qr_code,
        css: {
          top: '678rpx',
          left: '23rpx',
          width: '158rpx',
          height: '158rpx',
        },
      },
      {
        type: 'text',
        text: shareContent.project_name,
        css: {
          top: '666rpx',
          left: '224rpx',
          color: '#3E4A59',
          width: '280rpx',
          height: '40rpx',
          lineHeight: '40rpx',
          fontSize: '28rpx',
          fontFamily: 'PingFangSC-Semibold,PingFang SC',
          maxLines: 1,
          fontWeight: 'bold',
        },
      },
      {
        type: 'text',
        text: '价格：',
        css: {
          top: '722rpx',
          left: '224rpx',
          color: '#77808A',
          fontSize: '24rpx',
          fontFamily: 'PingFangSC-Regular,PingFang SC',
        },
      },
      {
        type: 'text',
        text: shareContent.price,
        css: {
          top: '712rpx',
          left: '304rpx',
          color: '#FA5F35',
          fontSize: '36rpx',
          fontFamily: 'PingFangSC-Semibold,PingFang SC',
        },
        id: 'price_detail',
      },
      {
        type: 'text',
        text: shareContent.priceUnit,
        css: {
          top: '722rpx',
          left: ['312rpx', 'price_detail'],
          color: '#FA5F35',
          fontSize: '24rpx',
          fontFamily: 'PingFangSC-Medium,PingFang SC',
        },
      },
      //在售状态
      {
        type: 'rect',
        css: {
          width: '64rpx',
          height: '36rpx',
          right: '32rpx',
          top: '670rpx',
          borderRadius: '4rpx',
          color:
            'linear-gradient(0deg, ' +
            shareContent.stateBackground +
            ' 100%, ' +
            shareContent.stateBackground +
            ' 100%)',
        },
      },
      {
        type: 'text',
        text: shareContent.stateName,
        css: {
          right: '42rpx',
          top: '674rpx',
          fontSize: '22rpx',
          lineHeight: '32rpx',
          color: shareContent.stateColor,
        },
      },

      {
        type: 'text',
        text: '面积：',
        css: {
          top: '766rpx',
          left: '224rpx',
          color: '#77808A',
          fontSize: '24rpx',
          fontFamily: 'PingFangSC-Regular,PingFang SC',
        },
      },
      {
        type: 'text',
        text: shareContent.acreage,
        css: {
          top: '764rpx',
          left: '304rpx',
          color: '#3E4A59',
          fontSize: '24rpx',
          fontFamily: 'PingFangSC-Regular,PingFang SC',
        },
      },
      {
        type: 'text',
        text: '区域：',
        css: {
          top: '810rpx',
          left: '224rpx',
          color: '#77808A',
          fontSize: '24rpx',
          fontFamily: 'PingFangSC-Regular,PingFang SC',
        },
      },
      {
        type: 'text',
        text: shareContent.trade_area_desc,
        css: {
          width: '270rpx',
          top: '810rpx',
          left: '304rpx',
          color: '#3E4A59',
          fontSize: '24rpx',
          fontFamily: 'PingFangSC-Regular,PingFang SC',
          maxLines: 1,
        },
      },
    ];

    views = views.concat([
      {
        type: 'image',
        url: '/image/img_l_xian@2x.png',
        css: {
          width: '96rpx',
          height: '2rpx',
          left: '32rpx',
          bottom: '48rpx',
        },
      },
      {
        type: 'text',
        text: '长按识别二维码，查看楼盘详情',
        css: {
          top: '874rpx',
          left: '144rpx',
          fontSize: '24rpx',
          color: '#00C0EB',
          fontWeight: 'bold',
        },
      },
      {
        type: 'rect',
        css: {
          width: '96rpx',
          height: '2rpx',
          right: '32rpx',
          bottom: '48rpx',
          color:
            'linear-gradient(270deg,rgba(0,192,235,1) 0%,rgba(0,192,235,0) 100%)',
        },
      },
    ]);
    return {
      width: '622rpx',
      height: '940rpx',
      background: '#fff',
      borderRadius: '8rpx',
      views: views,
    };
  }
}
