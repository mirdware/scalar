export class Resource {
  constructor(url) {
    this.url = url;
    this.xhr = new XMLHttpRequest();
  }

  get(data = {}) {
    return manage(this.xhr, formatURL(this.url, data), 'GET', data);
  }

  post(data = {}) {
    return manage(this.xhr, formatURL(this.url, data), 'POST', data);
  }

  put(data = {}) {
    return manage(this.xhr, formatURL(this.url, data), 'PUT', data);
  }

  delete(data = {}) {
    return manage(this.xhr, formatURL(this.url, data), 'DELETE', data);
  }
}

function manage(xmlHttp, url, method, data) {
  data = formatQuery(data);
  if (method == 'GET') {
    url = url+'?'+data;
    data = null;
  }
  xmlHttp.open(method, url, true);
  xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xmlHttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xmlHttp.send(data);
  return new Promise((resolve, reject) => {
    xmlHttp.onreadystatechange = (res) => solve(xmlHttp, resolve, reject);
  });
}

function formatURL(url, data) {
  for (let key in data) {
    let variable = '/{' + key + '}';
    if (url.indexOf(variable) !== -1) {
      url = url.replace(variable, '/' + data[key]);
      delete data[key];
    }
  }
  return url.replace(/\/\{(\w+)\}/gi, '');
}

function formatQuery(obj) {
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