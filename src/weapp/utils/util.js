const formatTime = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return (
    [year, month, day].map(formatNumber).join('/') +
    ' ' +
    [hour, minute, second].map(formatNumber).join(':')
  );
};

const formatDate = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return [year, month, day].map(formatNumber).join('-');
};

const formatNumber = n => {
  n = n.toString();
  return n[1] ? n : '0' + n;
};

const dateStruct = date => {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    date: date.getDate(),
    day: formatDay(date.getDay()),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds()
  };
};

const dateTimeStruct = date => {
  let _year = date.getFullYear();
  let _month =
    date.getMonth() + 1 <= 9
      ? '0' + (date.getMonth() + 1)
      : date.getMonth() + 1;
  let _date = date.getDate() <= 9 ? '0' + date.getDate() : date.getDate();
  return `${_year}${_month}${_date}-`;
};

const formatDay = day => {
  switch (day) {
    case 0:
      return '星期日';
      break;
    case 1:
      return '星期一';
      break;
    case 2:
      return '星期二';
      break;
    case 3:
      return '星期三';
      break;
    case 4:
      return '星期四';
      break;
    case 5:
      return '星期五';
      break;
    case 6:
      return '星期六';
      break;
    default:
      return '';
      break;
  }
};

const parseContent = content => {
  var text = '';
  if (content.nodes == undefined) {
    if (content.text != undefined && content.text.length > 0) {
      return content.text;
    }
    return '';
  }

  for (var index = 0; index < content.nodes.length; index++) {
    var node = content.nodes[index];
    text += parseContent(node);
  }
  return text;
};

const disposeEmptyText = text => {
  if (text == null) {
    return '';
  } else {
    return text;
  }
};

const parseQueryString = url => {
  var obj = {};
  if (url && url.length > 0) {
    var keyvalue = [];
    var key = '',
      value = '';
    var paraString = url.substring(url.indexOf('?') + 1, url.length).split('&');
    for (var i in paraString) {
      keyvalue = paraString[i].split('=');
      key = keyvalue[0];
      value = keyvalue[1];
      obj[key] = value;
    }
  }
  return obj;
};

const parsePathString = url => {
  var path = '';
  if (url && url.length > 0) {
    if (url.indexOf('?') == -1) {
      path = url;
    } else {
      path = url.substring(0, url.indexOf('?'));
    }
  }
  return path;
};

const isEmptyObject = obj => {
  if (obj === undefined || obj === null) return true;
  return JSON.stringify(obj) === '{}';
};

const wxPromisify = fn => {
  return function(obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function(res) {
        resolve(res);
      };
      obj.fail = function(res) {
        reject(res);
      };
      fn(obj);
    });
  };
};
module.exports = {
  dateStruct: dateStruct,
  formatTime: formatTime,
  formatDate: formatDate,
  parseContent: parseContent,
  parsePathString: parsePathString,
  disposeEmptyText: disposeEmptyText,
  parseQueryString: parseQueryString,
  isEmptyObject: isEmptyObject,
  wxPromisify: wxPromisify,
  dateTimeStruct: dateTimeStruct
};
