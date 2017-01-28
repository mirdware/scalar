const encodeURIComponent = window.encodeURIComponent;

function manage(resource, method, data, hasQueryString) {
  let xmlHttp = resource.xhr;
  let headers = resource.headers;
  let url = formatURL(resource.url, data);
  data = data? serialize(data): null;
  if (hasQueryString && data) {
    url += '?' + data;
    data = null;
  }
  xmlHttp.open(method, url, true);
  for (let header in headers) {
    xmlHttp.setRequestHeader(header, headers[header]);
  }
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
  let res = [];
  for(let key in data) {
    if(typeof data[key] !== 'function') {
      res.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
  }
  return res.join('&');
}

function solve(xmlHttp, resolve, reject) {
  if (xmlHttp.readyState === 4) {
    let status = xmlHttp.status;
    let content = xmlHttp.getResponseHeader('Content-Type');
    let response = /(aplication|text)\/xml/.test(content)?
      xmlHttp.responseXML:
      xmlHttp.responseText;
    if (content === 'application/json') {
      response = JSON.parse(response);
    }
    (status >= 200 && status <= 299)?
      resolve(response):
      reject(response, status);
  }
}

export class Resource {
  constructor(url) {
    this.url = url;
    this.xhr = new XMLHttpRequest();
    this.headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest'
    };
  }

  get(data) {
    return manage(this, 'GET', data, true);
  }

  post(data) {
    return manage(this, 'POST', data);
  }

  put(data) {
    return manage(this, 'PUT', data);
  }

  delete(data) {
    return manage(this, 'DELETE', data, true);
  }

  request(method, data, hasQueryString) {
    return manage(this, method, data, hasQueryString);
  }
}
