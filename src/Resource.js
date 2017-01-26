function manage(resource, method, data, hasQueryString) {
  let xmlHttp = resource.xhr;
  let url = formatURL(resource.url, data);
  data = serialize(data);
  if (hasQueryString) {
    if (data) url += '?' + data;
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

function serialize(data) {
  if (typeof data !== 'object') {
    return data;
  }
  let res = [];
  for(let key in data) {
    let value = data[key];
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

export class Resource {
  constructor(url) {
    this.url = url;
    this.xhr = new XMLHttpRequest();
  }

  get(data = {}) {
    return manage(this, 'GET', data, true);
  }

  post(data = {}) {
    return manage(this, 'POST', data);
  }

  put(data = {}) {
    return manage(this, 'PUT', data);
  }

  delete(data = {}) {
    return manage(this, 'DELETE', data, true);
  }
}
