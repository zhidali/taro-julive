// 购房宝典买
var recordBox = {};
const a = 'event';
const b = 'fromPage';
const c = 'fromModule';
const d = 'fromItem';
const e = 'toPage';
const fromPage = 'p_user_housing_treasured_book'
function record() { 
recordBox[3994] = {
  [a]: 'e_click_article_card',
  [b]: fromPage,
  [d]: 'i_article_card',
  [e]: 'p_knowledge_article'
}
recordBox[3993] = {
  [a]: 'e_slide_collection_card',
  [b]: fromPage,
  [d]: 'i_collection_card',
  [e]: fromPage
}
recordBox[3983] = {
  [a]: 'e_click_cancel_collection',
  [b]: fromPage,
  [d]: 'i_cancel_collection',
  [e]: fromPage
}
recordBox[3982] = {
  [a]: 'e_click_tab',
  [b]: fromPage,
  [c]: 'm_title_bar',
  [d]: 'i_tab',
  [e]: fromPage
}
recordBox[3981] = {
  [a]: 'e_click_dial_adviser_call',
  [b]: fromPage,
  [c]: 'm_button_bar',
  [d]: 'i_dial_adviser_call',
  [e]: fromPage
}
recordBox[3980] = {
  [a]: 'e_click_multi_project_analysis_card',
  [b]: fromPage,
  [d]: 'i_multi_project_analysis_card',
  [e]: 'p_multi_project_analysis'
}
recordBox[3979] = {
  [a]: 'e_click_single_project_analysis_card',
  [b]: fromPage,
  [d]: 'i_single_project_analysis_card',
  [e]: 'p_single_project_analysis'
}
recordBox[3974] = {
  [a]: 'e_click_single_project_analysis_card',
  [b]: fromPage,
  [d]: 'i_single_project_analysis_card',
  [e]: 'p_webview'
}
recordBox[3973] = {
  [a]: 'e_click_see_report_card',
  [b]: fromPage,
  [d]: 'i_see_report_card',
  [e]: 'p_webview'
}
recordBox[3972] = {
  [a]: 'e_click_subscription_remind_card',
  [b]: fromPage,
  [d]: 'i_subscription_remind_card',
  [e]: 'p_webview'
}
recordBox[3971] = {
  [a]: 'e_click_sign_remind_card',
  [b]: fromPage,
  [d]: 'i_sign_remind_card',
  [e]: 'p_webview'
}
recordBox[3930] = {
  [a]: 'e_click_see_report_card',
  [b]: fromPage,
  [d]: 'i_see_report_card',
  [e]: 'p_webview'
} 
  return recordBox
}
module.exports = {
  record:record
}
