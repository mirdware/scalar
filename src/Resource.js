let worker;
if (Worker) {
  const blob = new Blob(['self.onmessage=function(e){a(e.data,self.postMessage)};a=' + sendRequest]);
  worker = new Worker(window.URL.createObjectURL(blob));
}

function sendRequest(request, callback) {  
  function formatQueryString(queryString) {
    const res = [];
    for (const key in data) {
      if(typeof data[key] !== 'function') {
        res.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
      }
    }
    queryString = res.join('&');
    return queryString ? '?' + queryString : queryString;
  }
  
  function formatURL(url, data) {
    for (const key in data) {
      const variable = '/{' + key + '}';
      if (url.indexOf(variable) !== -1) {
        url = url.replace(variable, '/' + data[key]);
        delete data[key];
      }
    }
    return url.replace(/\/\{(\w+)\}/gi, '');
  }
  
  let { headers, data, queryString } = request;
  const xhr = new XMLHttpRequest();
  if (headers['Content-Type'] === 'application/x-www-form-urlencoded') {
    data = serialize(data);
  }
  if (headers['Content-Type'] === 'application/json') {
    data = JSON.stringify(data);
  }
  xhr.open(
    request.method,
    formatURL(request.url, queryString) + formatQueryString(queryString),
    true
  );
  for (const header in headers) {
    xhr.setRequestHeader(header, headers[header]);
  }
  xhr.send(data);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      const { status, responseXML, responseText } = xhr;
      const content = xhr.getResponseHeader('Content-Type');
      callback({ status, responseXML, responseText, content });
    }
  };
}

function solve(xhr, resolve, reject) {
  const { status, content } = xhr;
  let response;
  if (/(application|text)\/xml/.test(content)) {
    response = xhr.responseXML;
  } else {
    response = xhr.responseText;
    if (content.indexOf('application/json') !== -1) {
      response = JSON.parse(response);
    }
  }
  (status > 399) ?
  reject(response, status) :
  resolve(response);
}

function manage(resource, method, data, queryString) {
  resource.method = method;
  resource.data = data;
  resource.queryString = queryString;
  return new Promise((resolve, reject) => {
    if (worker) {
      worker.postMessage(resource);
      worker.onmessage = (e) => solve(e.data, resolve, reject);
    } else {
      sendRequest(resource, (res) => solve(res, resolve, reject));
    }
  });
}

export default class Resource {
  constructor(url) {
    this.url = url;
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
