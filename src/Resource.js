let worker;
if (Worker) {
  const blob = new Blob(['self.onmessage=function(e){a(e.data,self.postMessage)};a=' + sendRequest]);
  worker = new Worker(window.URL.createObjectURL(blob));
}

function sendRequest(request, callback) {
  function serialize(data) {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }
    return formData;
  }

  function formatQueryString(queryString) {
    const res = [];
    for (const key in queryString) {
      if(typeof queryString[key] !== 'function') {
        res.push(encodeURIComponent(key) + '=' + encodeURIComponent(queryString[key]));
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
  
  let { headers, data, queryString, url } = request;
  const xhr = new XMLHttpRequest();
  data = headers['Content-Type'] === 'application/json' ? JSON.stringify(data) : serialize(data);
  url = formatURL(url, queryString) + formatQueryString(queryString)
  xhr.open(request.method, url, true);
  for (const header in headers) {
    xhr.setRequestHeader(header, headers[header]);
  }
  xhr.send(data);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      const { responseURL } = xhr;
      callback({
        content: xhr.getResponseHeader('Content-Type'),
        status: xhr.status,
        xml: xhr.responseXML,
        text: xhr.responseText,
        url: responseURL,
        redirect: responseURL !== url
      });
    }
  };
}

function solve(xhr, resolve, reject) {
  const { status, content, url } = xhr;
  let response;
  if (/(application|text)\/xml/.test(content)) {
    response = xhr.xml;
  } else {
    response = xhr.text;
    if (content && content.indexOf('application/json') !== -1) {
      response = JSON.parse(response);
    } else if (status < 300 && xhr.redirect) {
      return window.location = url;
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
