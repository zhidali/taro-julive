export default class projectNewsPalette {
  palette(essay) {
    return {
      width: '680rpx',
      height: '862rpx',
      borderRadius: '16rpx',
      views: [
        {
          type: 'text',
          text: '分享你一篇楼市好文!',
          css: {
            top: '56rpx',
            left: '40rpx',
            fontSize: '36rpx',
            color: '#3E4A59'
          }
        },
        {
          type: 'image',
          url: essay.cover_img,
          css: {
            width: '600rpx',
            height: '240rpx',
            left: '40rpx',
            top: '120rpx',
            borderRadius: '8rpx',
            mode: 'scaleToFill'
          }
        },
        {
          type: 'text',
          text: essay.title,
          css: {
            top: '394rpx',
            fontSize: '28rpx',
            color: '#3E4A59',
            left: '40rpx',
            lineHeight: '48rpx',
            width: '600rpx',
            maxLines: 2
          }
        },
        {
          type: 'text',
          text: essay.share_content,
          css: {
            top: '488rpx',
            fontSize: '24rpx',
            color: '#818E9D',
            lineHeight: '40rpx',
            left: '40rpx',
            width: '600rpx',
            maxLines: 2
          }
        },
        {
          type: 'image',
          url: essay.author_avatar,
          css: {
            left: '40rpx',
            top: '580rpx',
            width: '48rpx',
            height: '48rpx',
            borderRadius: '24rpx'
          }
        },
        {
          type: 'text',
          text: essay.author_name,
          css: {
            left: '116rpx',
            top: '586rpx',
            fontSize: '24rpx',
            color: '#A3AEBB',
            width: '300rpx',
            maxLines: 1
          }
        },
        {
          type: 'text',
          text: essay.publish_time,
          css: {
            top: '592rpx',
            right: '40rpx',
            color: '#A3AEBB',
            fontSize: '24rpx'
          }
        },
        {
          type: 'rect',
          css: {
            width: '600rpx',
            height: '2rpx',
            color: '#F3F6F9',
            left: '40rpx',
            top: '660rpx'
          }
        },
        {
          type: 'text',
          text: '长按识别二维码',
          css: {
            fontSize: '20rpx',
            color: '#A3AEBB',
            left: '348rpx',
            top: '736rpx'
          }
        },
        {
          type: 'text',
          text: '阅读全文',
          css: {
            fontSize: '20rpx',
            color: '#A3AEBB',
            left: '410rpx',
            top: '770rpx'
          }
        },
        {
          type: 'image',
          url: essay.qr_code,
          css: {
            width: '140rpx',
            height: '140rpx',
            left: '510rpx',
            top: '690rpx'
          }
        }
      ]
    };
  }
}
