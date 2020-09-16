export default class projectNewsPalette {
  palette(
    projectNews,
    nickName,
    avatarUrl,
    stateBackground,
    stateColor,
    totalPrice
  ) {
    var heightDifference = 180;
    var contentLines = 4;
    if (projectNews.image_list.length > 0) {
      heightDifference = 0;
      contentLines = 2;
    }
    var views = [
      {
        type: "image",
        url:
          "https://comjia-img.oss-cn-beijing.aliyuncs.com/minimgs/icon_project_news_palette.jpg",
        css: {
          top: "0rpx",
          width: "680rpx",
          height: "240rpx",
          mode: "scaleToFill"
        }
      },
      {
        type: "rect",
        css: {
          top: "165rpx",
          left: "25rpx",
          width: "628rpx",
          height: 554 - heightDifference + "rpx",
          color: "white",
          boxShadow: true
        }
      },
      {
        type: "rect",
        css: {
          top: "155rpx",
          left: "20rpx",
          width: "638rpx",
          height: 574 - heightDifference + "rpx",
          color: "white",
          borderRadius: "16rpx"
        }
      },
      {
        type: "image",
        url: projectNews.project_info.index_img,
        css: {
          top: "185rpx",
          left: "40rpx",
          width: "128rpx",
          height: "92rpx",
          borderRadius: "4rpx"
        }
      },
      {
        type: "text",
        text: projectNews.project_info.name,
        css: {
          top: "182rpx",
          left: "184rpx",
          color: "#3E4A59",
          fontSize: "24rpx",
          fontWeight: "bold",
          width: "270rpx",
          maxLines: 1
        }
      },
      {
        type: "text",
        text: "总价：" + totalPrice,
        css: {
          top: "220rpx",
          left: "184rpx",
          color: "#3E4A59",
          fontSize: "18rpx",
          width: "270rpx",
          maxLines: 1
        }
      },
      {
        type: "text",
        text:
          "单价：" +
          projectNews.project_info.card_price.value +
          projectNews.project_info.card_price.unit,
        css: {
          top: "246rpx",
          left: "184rpx",
          color: "#3E4A59",
          fontSize: "18rpx",
          width: "270rpx",
          maxLines: 1
        }
      },
      {
        type: "rect",
        css: {
          width: "56rpx",
          height: "30rpx",
          right: "40rpx",
          top: "178rpx",
          borderRadius: "4rpx",
          color:
            "linear-gradient(0deg, " +
            stateBackground +
            " 100%, " +
            stateBackground +
            " 100%)"
        }
      },
      {
        type: "text",
        text: projectNews.project_info.status.name,
        css: {
          right: "48rpx",
          top: "180rpx",
          fontSize: "20rpx",
          lineHeight: "32rpx",
          color: stateColor
        }
      },
      {
        type: "text",
        text: projectNews.project_info.trade_area_desc,
        css: {
          top: "240rpx",
          right: "40rpx",
          color: "#77808A",
          fontSize: "20rpx",
          width: "180rpx",
          align: "right",
          maxLines: 1
        }
      },
      {
        type: "text",
        text: projectNews.title,
        css: {
          top: "300rpx",
          left: "40rpx",
          color: "#3E4A59",
          fontSize: "24rpx",
          fontWeight: "bold",
          width: "598rpx",
          maxLines: 1
        }
      },
      {
        type: "text",
        text: projectNews.main_text,
        css: {
          top: "341rpx",
          left: "40rpx",
          width: "598rpx",
          color: "#3E4A59",
          fontSize: "20rpx",
          lineHeight: "40rpx",
          maxLines: contentLines
        }
      }
    ];

    if (projectNews.image_list.length > 0) {
      views = views.concat({
        type: "image",
        url: projectNews.image_list[0],
        css: {
          top: "428rpx",
          left: "40rpx",
          width: "598rpx",
          height: "240rpx",
          mode: "scaleToFill",
          borderRadius: "8rpx"
        }
      });
    }
    views = views.concat([
      {
        type: "text",
        text: projectNews.date,
        css: {
          top: 684 - heightDifference + "rpx",
          left: "40rpx",
          fontSize: "18rpx",
          color: "#A3AEBB"
        }
      },
      {
        type: "image",
        url: avatarUrl,
        css: {
          top: 796 - heightDifference + "rpx",
          left: "40rpx",
          width: "36rpx",
          height: "36rpx",
          borderRadius: "18rpx"
        }
      },
      {
        type: "text",
        text: nickName + " 推荐",
        css: {
          top: 800 - heightDifference + "rpx",
          left: "84rpx",
          fontSize: "20rpx",
          width: "290rpx",
          maxLines: "1",
          color: "#3E4A59"
        }
      },
      {
        type: "text",
        text: "长按识别二维码了解更多详情",
        css: {
          top: 794 - heightDifference + "rpx",
          right: "174rpx",
          width: "120rpx",
          fontSize: "16rpx",
          color: "#A3AEBB",
          lineHeight: "32rpx",
          align: "right"
        }
      },
      {
        type: "image",
        url: "https://imgs.julive.com/l?p=eyJpbWdfcGF0aCI6IlwvbWluaW1ncy9xcmNvZGUucG5nP3dhdGVybWFyayx0XzAifQ==",
        css: {
          top: 754 - heightDifference + "rpx",
          right: "38rpx",
          width: "116rpx",
          height: "116rpx"
        }
      }
    ]);
    return {
      width: "679rpx",
      height: 896 - heightDifference + "rpx",
      background: "#fff",
      views: views
    };
  }

  paletteBigImage(projectNews, nickName, avatarUrl, statusColor, totalPrice) {
    var heightDifference = 240;
    var contentLines = 4;
    if (projectNews.image_list.length > 0) {
      heightDifference = 0;
      contentLines = 2;
    }

    return {
      width: "750rpx",
      height: 1234 - heightDifference + "rpx",
      background: "#fff",
      views: [
        {
          type: "image",
          url:
            "https://comjia-img.oss-cn-beijing.aliyuncs.com/minimgs/icon_project_news_palette.jpg",
          css: {
            width: "750rpx",
            height: "320rpx",
            mode: "scaleToFill"
          }
        },
        {
          type: "rect",
          css: {
            top: "218rpx",
            left: "33rpx",
            width: "684rpx",
            height: 750 - heightDifference + "rpx",
            color: "white",
            boxShadow: true
          }
        },
        {
          type: "rect",
          css: {
            top: "208rpx",
            left: "28rpx",
            width: "694rpx",
            height: 770 - heightDifference + "rpx",
            color: "white",
            borderRadius: "16rpx"
          }
        },
        {
          type: "image",
          url: projectNews.project_info.index_img,
          css: {
            top: "248rpx",
            left: "52rpx",
            width: "144rpx",
            height: "112rpx",
            borderRadius: "8rpx"
          }
        },
        {
          type: "text",
          text: projectNews.project_info.name,
          css: {
            top: "250rpx",
            left: "220rpx",
            color: "#3E4A59",
            fontSize: "32rpx",
            fontWeight: "bold",
            width: "340rpx",
            maxLines: 1
          }
        },
        {
          type: "text",
          text: "总价：" + totalPrice,
          css: {
            top: "290rpx",
            left: "220rpx",
            color: "#3E4A59",
            fontSize: "24rpx",
            width: "340rpx",
            maxLines: 1
          }
        },
        {
          type: "text",
          text:
            "单价：" +
            projectNews.project_info.card_price.value +
            projectNews.project_info.card_price.unit,
          css: {
            top: "322rpx",
            left: "220rpx",
            color: "#3E4A59",
            fontSize: "24rpx",
            width: "340rpx",
            maxLines: 1
          }
        },
        {
          type: "rect",
          css: {
            top: "250rpx",
            right: "52rpx",
            width: "68rpx",
            height: "32rpx",
            color: statusColor,
            borderRadius: "8rpx"
          }
        },
        {
          type: "text",
          text: projectNews.project_info.status.name,
          css: {
            top: "251rpx",
            right: "61rpx",
            color: "#ffffff",
            fontSize: "24rpx",
            maxLines: 1
          }
        },
        {
          type: "text",
          text: projectNews.project_info.trade_area_desc,
          css: {
            top: "322rpx",
            right: "52rpx",
            color: "#77808A",
            fontSize: "20rpx",
            width: "145rpx",
            maxLines: 1
          }
        },
        {
          type: "text",
          text: projectNews.title,
          css: {
            top: "400rpx",
            left: "52rpx",
            width: "646rpx",
            color: "#3E4A59",
            fontSize: "32rpx",
            fontWeight: "bold",
            width: "646rpx",
            maxLines: 1
          }
        },
        {
          type: "text",
          text: projectNews.main_text,
          css: {
            top: "456rpx",
            left: "52rpx",
            width: "646rpx",
            color: "#3E4A59",
            fontSize: "28rpx",
            lineHeight: "48rpx",
            maxLines: contentLines
          }
        },
        {
          type: "image",
          url: projectNews.image_list[0],
          css: {
            top: "568rpx",
            left: "52rpx",
            width: "646rpx",
            height: "320rpx",
            mode: "scaleToFill",
            borderRadius: "16rpx"
          }
        },
        {
          type: "text",
          text: projectNews.date,
          css: {
            top: 912 - heightDifference + "rpx",
            left: "52rpx",
            fontSize: "24rpx",
            color: "#A3AEBB"
          }
        },
        {
          type: "image",
          url: avatarUrl,
          css: {
            top: 1084 - heightDifference + "rpx",
            left: "48rpx",
            width: "48rpx",
            height: "48rpx",
            borderRadius: "24rpx"
          }
        },
        {
          type: "text",
          text: nickName + " 推荐",
          css: {
            top: 1090 - heightDifference + "rpx",
            left: "112rpx",
            fontSize: "28rpx",
            width: "260rpx",
            maxLines: "1",
            color: "#3E4A59"
          }
        },
        {
          type: "text",
          text: "长按识别二维码了解更多详情",
          css: {
            top: 1075 - heightDifference + "rpx",
            left: "380rpx",
            width: "150rpx",
            fontSize: "20rpx",
            lineHeight: "40rpx",
            color: "#A3AEBB"
          }
        },
        {
          type: "image",
          url: "https://imgs.julive.com/l?p=eyJpbWdfcGF0aCI6IlwvbWluaW1ncy9xcmNvZGUucG5nP3dhdGVybWFyayx0XzAifQ==",
          css: {
            top: 1028 - heightDifference + "rpx",
            right: "50rpx",
            width: "156rpx",
            height: "156rpx"
          }
        }
      ]
    };
  }
}
