export class Resource {
    constructor(url) {
        this.url = url;
        this.xhr = new XMLHttpRequest();
    }

    get(data = {}) {
        return resourceHandler(this.xhr, formatURL(this.url, data), 'GET', data);
    }

    post(data = {}) {
        return resourceHandler(this.xhr, formatURL(this.url, data), 'POST', data);
    }

    put(data = {}) {
        return resourceHandler(this.xhr, formatURL(this.url, data), 'PUT', data);
    }

    delete(data = {}) {
        return resourceHandler(this.xhr, formatURL(this.url, data), 'DELETE', data);
    }
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

function resourceHandler(xmlHttp, url, method, data) {
    return new Promise((resolve, reject) => {
        xmlHttp.onreadystatechange = (data) => {
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
        };
        data = formatQuery(data);
        if (method == 'GET') {
            url = url+'?'+data;
            data = null;
        }
        xmlHttp.open(method, url, true);
        xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xmlHttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xmlHttp.send(data);
    });
}

function formatQuery(obj) {
    if(typeof obj !== 'object') {
        return obj;
    }
    let res = [];
    for(let key in obj) {
        let typeData = typeof obj[key];
        if(typeData === 'string' || typeData === 'number' || typeData === 'boolean') {
            res.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
        }
    }
    return res.join('&');
}
