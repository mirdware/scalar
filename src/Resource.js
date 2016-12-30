export class Resource {
  constructor(url) {
    this.url = url;
    this.xhr = new XMLHttpRequest();
  }

  get(data = {}) {
    let url = formatURL(this.url, data, true);
    return manage(this.xhr, url, 'GET', null);
  }

  post(data = {}) {
    let url = formatURL(this.url, data);
    return manage(this.xhr, url, 'POST', serialize(data));
  }

  put(data = {}) {
    let url = formatURL(this.url, data);
    return manage(this.xhr, url, 'PUT', serialize(data));
  }

  delete(data = {}) {
    let url = formatURL(this.url, data, true);
    return manage(this.xhr, url, 'DELETE', null);
  }
}

function manage(xmlHttp, url, method, data) {
  xmlHttp.open(method, url, true);
  xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xmlHttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xmlHttp.send(data);
  return new Promise((resolve, reject) => {
    xmlHttp.onreadystatechange = (res) => solve(xmlHttp, resolve, reject);
  });
}

function formatURL(url, data, hasQueryString) {
  for (let key in data) {
    let variable = '/{' + key + '}';
    if (url.indexOf(variable) !== -1) {
      url = url.replace(variable, '/' + data[key]);
      delete data[key];
    }
  }
  url = url.replace(/\/\{(\w+)\}/gi, '');
  if (hasQueryString) {
    data = serialize(data);
    if (data) url += '?' + data;
    data = null;
  }
  return url;
}

function serialize(obj) {
  if(typeof obj !== 'object') {
    return obj;
  }
  let res = [];
  for(let key in obj) {
    let value = obj[key];
    if(typeof value !== 'function') {
      res.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    }
  }
  return res.join('&');
}

function solve(xmlHttp, resolve, reject) {
  if (xmlHttp.readyState === 4) {
    let status = xmlHttp.status;
    let response = xmlHttp.responseText;
    try {
      response = JSON.parse(response);
    } catch (ex) {}
    if (status >= 200 && status <= 299) {
      resolve(response);
    } else {
      reject(response, status);
    }
  }
}