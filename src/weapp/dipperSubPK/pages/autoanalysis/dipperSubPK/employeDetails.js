const employeDetailsObj = {}
const a = 'event';
const b = 'fromPage';
const c = 'fromModule';
const d = 'fromItem';
const e = 'toPage';
const fromPage = 'p_exclusive_adviser_details'
// 不常用 
const xl = "fromItemIndex"

function employeDetails() {
  employeDetailsObj[3932] = {
    [a]: 'e_click_skip',
    [b]: fromPage,
    [c]: 'm_login_layer',
    [d]: 'i_skip',
    [e]: fromPage
  }
  employeDetailsObj[3931] = {
    [a]: 'e_click_confirm_login',
    [b]: fromPage,
    [c]: 'm_login_layer',
    [d]: 'i_confirm_login',
    [e]: fromPage
  }
  employeDetailsObj[4840] = {
    [a]: 'e_click_two_dimensional_code',
    [b]: fromPage,
    [c]: 'm_two_dimensional_code',
    [e]: fromPage
  }
  employeDetailsObj[4838] = {
    [a]: 'e_click_share',
    [b]: fromPage,
    [c]: 'm_bottom_bar',
    [d]: 'i_share',
    [e]: fromPage
  }
  employeDetailsObj[4669] = {
    [a]: 'e_click_dial_adviser_call',
    [b]: fromPage,
    [c]: 'm_bottom_bar',
    [d]: 'i_dial_adviser_call',
    [e]: fromPage
  }
  employeDetailsObj[4668] = {
    [a]: 'e_click_poke_me_adviser',
    [b]: fromPage,
    [c]: 'm_adviser_info',
    [d]: 'i_poke_me_adviser',
    [e]: fromPage
  }
  // 曝光使用一个埋点
  employeDetailsObj[5838] = {
    [a]: 'e_module_exposure',
    [b]: fromPage,
    [e]: fromPage
  }
  return employeDetailsObj
}

module.exports = {
  employeDetails: employeDetails
}