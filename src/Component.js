let collection = [];
let props = {};
let observers = {};
let id = 0;
let evtMount = new Event('mount');

export class Component {
    constructor(selector, events) {
        this.elements = document.querySelectorAll(selector);
        this.id = (++id)+selector;
        this.events = events || {};
        initInternalVars(this.id);
        for (let i=0, element; element = this.elements[i]; i++) {
            let props = element.querySelectorAll('[data-bind]');
            for(let j=0, binding; binding = props[j]; j++) {
                bindData(binding, this);
            }
        }
    }

    compose() {
        if (this.elements.length) {
            for (let i=0, element; element = this.elements[i]; i++) {
                bindEvent(element, this.events, this);
            }
        }
    }

    static add(component) {
        if (!(component instanceof Component)) {
            throw 'Not is a instance of Component';
        }
        collection.push(component);
        return Component;
    }

    static execute() {
        for (let i=0, component; component = collection[i]; i++) {
            component.compose();
        }
    }
}

function bindEvent(element, events, component) {
    for (let el in events) {
        let fn = events[el];
        if (typeof fn === 'function') {
            fn = fn.bind(component);
            element.addEventListener(el, fn, true);
            element.dispatchEvent(evtMount);
        } else {
            let elements = element.querySelectorAll(el);
            for(let i=0; el = elements[i]; i++) {
                bindEvent(el, fn, component);
            }
        }
    }
}

function bindData(domElement, obj) {
    let id = obj.id;
    let bind = domElement.getAttribute("data-bind").split(":");
    let domAttr = bind[0].trim();
    let itemAttr = bind[1].trim();
    let prop = props[id][itemAttr];
    let observer = observers[id];
    let method = (itemAttr + '').replace(/^([a-z])|\s+([a-z])/g, ($1) => {
        return $1.toUpperCase();
    });
    if (!prop) {
        obj['set'+method] = (newValue) => {
            prop = newValue;
            for (let i=0, fn; fn = observer[i]; i++) {
                fn(newValue);
            }
            return obj;
        }
        obj['get'+method] = () => {
            return prop;
        }
    }
    observer.push((newValue) => {
        domElement[domAttr] = newValue;
    });
    prop = domElement[domAttr];
}

function initInternalVars(id) {
    if (!props[id]) {
        props[id] = {};
    }
    if (!observers[id]) {
        observers[id] = [];
    }
}
