const encodeURIComponent = window.encodeURIComponent;

function manage(resource, method, data, queryString) {
  let xmlHttp = resource.xhr;
  let headers = resource.headers;
  data = formatData(data, headers);  
  xmlHttp.open(
    method,
    formatURL(resource.url, queryString) + formatQueryString(queryString),
    resource.async
  );
  for (let header in headers) {
    xmlHttp.setRequestHeader(header, headers[header]);
  }
  xmlHttp.send(data);
  return new Promise((resolve, reject) => {
    xmlHttp.onreadystatechange = (res) => solve(xmlHttp, resolve, reject);
  });
}

function formatData(data, headers) {
  if (headers['Content-Type'] === 'application/x-www-form-urlencoded') {
    return serialize(data);
  }
  if (headers['Content-Type'] === 'application/json') {
    return JSON.stringify(data);
  }
  return data;
}

function formatQueryString(queryString) {
  queryString = serialize(queryString);
  if (queryString) {
    queryString = '?' + queryString;
  }
  return queryString;
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
  for (let key in data) {
    if(typeof data[key] !== 'function') {
      res.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
  }
  return res.join('&');
}

function solve(xmlHttp, resolve, reject) {
  if (xmlHttp.readyState === 4) {
    let status = xmlHttp.status;
    let content = xmlHttp.getResponseHeader('Content-Type').split(';');
    let response = /(aplication|text)\/xml/.test(content)?
      xmlHttp.responseXML:
      xmlHttp.responseText;
    if (content[0] === 'application/json') {
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
    this.async = true;
    this.headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest'
    };
  }

  get(queryString) {
    return manage(this, 'GET', null, queryString);
  }

  post(dataBody, queryString) {
    return manage(this, 'POST', dataBody, queryString);
  }

  put(dataBody, queryString) {
    return manage(this, 'PUT', dataBody, queryString);
  }

  delete(queryString) {
    return manage(this, 'DELETE', null, queryString);
  }

  request(method, opt) {
    return manage(this, method, opt.dataBody, opt.queryString);
  }
}
