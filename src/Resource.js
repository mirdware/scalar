function sendRequest(request, callback) {
  function serialize(data) {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }
    return formData;
  }

  function formatQueryString(data) {
    let queryString = '';
    for (const key in data) {
      queryString += encodeURIComponent(key) + '=' + encodeURIComponent(data[key]) + '&';
    }
    return queryString ? '?' + queryString.substring(0, queryString.length - 1) : queryString;
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
  
  let { headers, data, queryString, url } = request;
  const xhr = new XMLHttpRequest();
  data = headers['Content-Type'] === 'application/json' ? JSON.stringify(data) : serialize(data);
  url = formatURL(url, queryString) + formatQueryString(queryString);
  xhr.open(request.method, url, true);
  for (const header in headers) {
    xhr.setRequestHeader(header, headers[header]);
  }
  xhr.send(data);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      const content = xhr.getResponseHeader('Content-Type');
      const { responseURL } = xhr;
      let response = xhr.responseText;
      if (content) {
        if (content.indexOf('application/json') !== -1) {
          response = JSON.parse(response);
        } else if (/(application|text)\/xml/.test(content)) {
          response = xhr.responseXML;
        }
      }
      callback({
        response,
        url: responseURL,
        status: xhr.status,
        redirect: request.redirect && responseURL !== url
      });
    }
  };
}

function solve(xhr, resolve, reject) {
  const { status, response } = xhr;
  if (xhr.redirect) {
    return window.location = xhr.url;
  }
  (status > 399) ?
  reject(response, status) :
  resolve(response, status);
}

function manage(resource, method, data, queryString) {
  resource.method = method;
  resource.data = data;
  resource.queryString = queryString;
  return new Promise((resolve, reject) => {
    if (Worker) {
      const blob = new Blob(['self.onmessage=function(e){(' + sendRequest + ')(e.data,self.postMessage)}']);
      const worker = new Worker(window.URL.createObjectURL(blob));
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
    this.redirect = true;
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
