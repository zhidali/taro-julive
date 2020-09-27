//  解读文章页
const navigationMapObj = {}
const a = 'event';
const b = 'fromPage';
const c = 'fromModule';
const d = 'fromItem';
const e = 'toPage';
const fromPage = 'p_commuting_route'

function navigationMap() {
  navigationMapObj[4842] = {
    [a]: 'e_click_route',
    [b]: fromPage,
    [e]: fromPage
  }
  navigationMapObj[4663] = {
    [a]: 'e_click_destination_tab',
    [b]: fromPage,
    [d]: 'i_destination_tab',
    [e]: fromPage
  }
  navigationMapObj[4111] = {
    [a]: 'e_click_drive_button',
    [b]: fromPage,
    [d]: 'i_drive_button',
    [e]: fromPage
  }
  navigationMapObj[4110] = {
    [a]: 'e_click_bus_button',
    [b]: fromPage,
    [d]: 'i_bus_button',
    [e]: fromPage
  }
  return navigationMapObj
}

module.exports = {
  navigationMap: navigationMap
}