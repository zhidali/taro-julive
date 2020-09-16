/*
 * @Author: limengge
 * @Date: 2020-02-10 22:01:38
 * @LastEditTime: 2020-09-02 10:17:13
 * @LastEditors: limengge
 * @Description:
 */
const config = {
  'pages/home/home': 'p_home',
  'pages/project/list/projectList': 'p_project_list',
  'pages/project/detail/projectDetail': 'p_project_details',
  'pages/mine/mine': 'p_user_center',
  'pages/report/firstReport/firstReport': 'p_report_first_details',
  'houseTypeSubPK/pages/list/houseTypeList': 'p_house_type_list',
  'houseTypeSubPK/pages/detail/houseTypeDetail': 'p_house_type_details',
  'otherRelateSubPK/pages/employee/employeeReviewList': 'p_project_adviser_comment',
  'dynamicSubPK/pages/list/dynamicList': 'p_project_dynamic',
  'dynamicSubPK/pages/detail/dynamicDetail': 'p_project_dynamic_details',
  'questionRelateSubPK/pages/detail/questionDetail': 'p_qa_details',
  'otherRelateSubPK/pages/city/cityList': 'p_select_city',
  'questionRelateSubPK/pages/ask/questionAsk': 'p_ask_someone',
  'otherRelateSubPK/pages/specialCar/specialCar': 'p_reservation_car_see_house',
  'otherRelateSubPK/pages/essayDetail/detail': 'p_article_details',
  'nearbySubPK/pages/nearbyMap/nearbyMap': 'p_surrounding_analysis_map',
  'nearbySubPK/pages/nearbyAnalytic/nearbyAnalytic': 'p_surrounding_analysis',
  'loginSubPK/pages/phoneNumberLogin/phoneNumberLogin': 'p_phone_login',
  'loginSubPK/pages/register/register': 'p_choose_login',
  'myRelateSubPK/pages/getReport/getReport': 'p_get_first_call_report',
  'pages/web/web': 'p_webview',
  'pages/information/information': 'p_julive_info_agency',
  'dipperSubPK/pages/singleProject/singleProject': 'p_single_project_analysis',
  'dipperSubPK/pages/multiProject/multiProject': 'p_multi_project_analysis',
  'dipperSubPK/pages/cityReport/cityReport': 'p_knowledge_article',
  'dipperSubPK/pages/recordBox/recordBox': 'p_user_housing_treasured_book',
  'dipperSubPK/pages/navigationMap/navigationMap': 'p_commuting_route',
  'dipperSubPK/pages/orderConfig/orderConfig': 'p_buy_house_demand',
  'dipperSubPK/pages/clientMessage/clientMessage': 'p_feedback',
  'dipperSubPK/pages/recommendMap/recommendMap': 'p_recommend_project',
  'myRelateSubPK/pages/myFavorite/myFavorite': 'p_my_follow'

};

function currentPage() {
  let pages = getCurrentPages();
  if(pages.length == 0){
    return;
  }
  let _currentPage = pages[pages.length - 1];
  return config[_currentPage.route] || _currentPage.route;
}

function targetPage(path) {
  if (path && path.length > 0) {
    return config[path];
  }
}

module.exports = {
  currentPage,
  targetPage
};