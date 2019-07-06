function manage(resource, method, data, queryString) {
  const { xhr, headers } = resource;
  data = formatData(data, headers);
  xhr.open(
    method,
    formatURL(resource.url, queryString) + formatQueryString(queryString),
    resource.async
  );
  for (let header in headers) {
    xhr.setRequestHeader(header, headers[header]);
  }
  xhr.send(data);
  return new Promise((resolve, reject) => {
    xhr.onreadystatechange = () => solve(xhr, resolve, reject);
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
    const variable = '/{' + key + '}';
    if (url.indexOf(variable) !== -1) {
      url = url.replace(variable, '/' + data[key]);
      delete data[key];
    }
  }
  return url.replace(/\/\{(\w+)\}/gi, '');
}

function serialize(data) {
  const res = [];
  for (let key in data) {
    if(typeof data[key] !== 'function') {
      res.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
  }
  return res.join('&');
}

function solve(xhr, resolve, reject) {
  if (xhr.readyState === 4) {
    const { status } = xhr;
    const content = xhr.getResponseHeader('Content-Type').split(';');
    let response = /(aplication|text)\/xml/.test(content) ?
      xhr.responseXML :
      xhr.responseText;
    if (content[0] === 'application/json') {
      response = JSON.parse(response);
    }
    (status >= 200 && status <= 299) ?
      resolve(response) :
      reject(response, status);
  }
}

export default class Resource {
  constructor(url) {
    this.url = url;
    this.xhr = new XMLHttpRequest();
    this.async = true;
    this.headers = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    };
  }

  get(queryString) {
    return manage(this, 'GET', null, queryString);
  }

  post(dataBody, queryString) {
    return manage(this, 'POST', dataBody, queryString)
  }

  put(dataBody, queryString) {
    return manage(this, 'PUT', dataBody, queryString);
  }

  delete(queryString) {
    return manage(this, 'DELETE', null, queryString);
  }

  request (method, opt = {}) {
    return manage(this, method, opt.dataBody, opt.queryString);
  }
}
