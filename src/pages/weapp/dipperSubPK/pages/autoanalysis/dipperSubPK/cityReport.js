//  解读文章页
var cityReportObj = {}
const a = 'event';
const b = 'fromPage';
const c = 'fromModule';
const d = 'fromItem';
const e = 'toPage';
const f = 'toModule';
const fromPage = 'p_knowledge_article'

function cityReport() {
  cityReportObj[4031] = {
    [a]: 'e_click_housing_treasured_book',
    [b]: fromPage,
    [c]: 'm_foating_window',
    [d]: 'i_housing_treasured_book',
    [e]: 'p_user_housing_treasured_book'
  }
  cityReportObj[4030] = {
    [a]: 'e_click_dial_adviser_call',
    [b]: fromPage,
    [c]: 'm_bottom_bar',
    [d]: 'i_dial_adviser_call',
    [e]: 'p_knowledge_article'
  }
  cityReportObj[4029] = {
    [a]: 'e_click_collection',
    [b]: fromPage,
    [c]: 'm_bottom_bar',
    [d]: 'i_collection',
    [e]: 'p_knowledge_article'
  }
  cityReportObj[4028] = {
    [a]: 'e_click_share',
    [b]: fromPage,
    [c]: 'm_bottom_bar',
    [d]: 'i_share',
    [e]: 'p_knowledge_article'
  }
  cityReportObj[4027] = {
    [a]: 'e_click_share',
    [b]: fromPage,
    [c]: 'm_bottom_bar',
    [d]: 'i_see_service_card ',
    [e]: 'p_knowledge_article'
  }
  cityReportObj[4026] = {
    [a]: 'e_click_view_service_describe',
    [b]: fromPage,
    [c]: 'm_exclusive_adviser',
    [d]: 'i_service_describe',
    [e]: 'p_knowledge_article'
  }
  cityReportObj[4025] = {
    [a]: 'e_click_like',
    [b]: fromPage,
    [c]: 'm_exclusive_adviser',
    [d]: 'i_like',
    [e]: 'p_knowledge_article'
  }
  cityReportObj[3932] = {
    [a]: 'e_click_skip',
    [b]: fromPage,
    [c]: 'm_login_layer',
    [d]: 'i_skip',
    [e]: fromPage
  }
  cityReportObj[3931] = {
    [a]: 'e_click_confirm_login',
    [b]: fromPage,
    [c]: 'm_login_layer',
    [d]: 'i_confirm_login',
    [e]: fromPage
  }
  cityReportObj[4833] = {
    [a]: 'e_click_app_download',
    [b]: fromPage,
    [c]: 'm_bottom_bar',
    [d]: 'i_app_download',
    [e]: fromPage
  }
  cityReportObj[4666] = {
    [a]: 'e_click_reward_entry',
    [b]: fromPage,
    [d]: 'i_reward_entry',
    [e]: 'p_input_money_window'
  }
  cityReportObj[4659] = {
    [a]: 'e_click_two_dimensional_code',
    [b]: fromPage,
    [c]: 'm_top_bar',
    [d]: 'i_two_dimensional_code',
    [e]: fromPage
  }
  cityReportObj[4659] = {
    [a]: 'e_click_two_dimensional_code',
    [b]: fromPage,
    [c]: 'm_top_bar',
    [d]: 'i_two_dimensional_code',
    [e]: fromPage
  }
  cityReportObj[4656] = {
    [a]: 'e_click_dial_adviser_entry',
    [b]: fromPage,
    [c]: 'm_top_bar',
    [d]: 'i_dial_adviser_call',
    [e]: fromPage
  }
  cityReportObj[4653] = {
    [a]: 'e_click_adviser_card',
    [b]: fromPage,
    [c]: 'm_top_bar',
    [e]: 'p_exclusive_adviser_details'
  }
  cityReportObj[4028] = {
    [a]: 'e_click_share',
    [b]: fromPage,
    [c]: 'm_top_bar',
    [d]: 'i_share',
    [e]: fromPage
  }
  //  5535 和5534 是一个  区别fromModule
  cityReportObj[5535] = { 
    [a]: 'e_video_finished',
    [b]: fromPage,
    [e]: fromPage
  }
  //  5530 和5528 是一个  区别fromModule
  cityReportObj[5530] = {
    [a]: 'e_video_play',
    [b]: fromPage,
    [e]: fromPage
  }
  //  5531 和5529 是一个  区别fromModule
  cityReportObj[5531] = {
    [a]: 'e_video_pause',
    [b]: fromPage,
    [e]: fromPage
  }
  cityReportObj[5533] = {
    [a]: 'e_click_close_full_screen',
    [b]: fromPage,
    [c]: 'm_video_full_screen',
    [d]: 'i_close_full_screen',
    [e]: fromPage,
    [f]: 'm_video_card'
  }
  cityReportObj[5532] = {
    [a]: 'e_click_full_screen',
    [b]: fromPage,
    [c]: 'm_video_card',
    [d]: 'i_full_screen',
    [e]: fromPage,
    [f]: 'm_video_full_screen'
  }
  cityReportObj[5536] = {
    [a]: 'e_module_exposure',
    [b]: fromPage,
    [c]: 'm_recommend',
    [e]: fromPage,
  }
  cityReportObj[5537] = {
    [a]: 'e_click_project_card',
    [b]: fromPage,
    [c]: 'm_recommend',
    [d]: 'i_project_card',
    [e]: 'p_project_details',
  }
  return cityReportObj
}

module.exports = {
  cityReport: cityReport
}