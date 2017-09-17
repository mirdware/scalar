import { Template } from './Template';

let evtMount = new Event('mount');

function bindData(observer, domElement, events) {
  let prop = domElement.getAttribute("data-bind");
  if (!observer[prop]) {
    observer[prop] = new Property(events);
  }
  observer[prop].addElement(domElement);
}

function bindEvent(component, element, events) {
  for (let el in events) {
    let fn = events[el];
    if (typeof fn === 'function') {
      element.addEventListener(el, fn.bind(component), true);
      setTimeout(() => element.dispatchEvent(evtMount), 1);
    } else {
      let elements = element.querySelectorAll(el);
      for(let i=0; el = elements[i]; i++) {
        bindEvent(component, el, fn);
      }
    }
  }
}

function copyProperties(target, source) {
  let keys = Reflect.ownKeys(source);
  for (let i = 0, key; key = keys[i]; i++) {
    if (key !== 'constructor' && key !== 'prototype' && key !== 'name') {
      let desc = Object.getOwnPropertyDescriptor(source, key);
      Object.defineProperty(target, key, desc);
    }
  }
}

export class Observer {
  constructor() {
    this.elements = [];
  }

  addElement(domElement, events) {
    let dataBinds = domElement.querySelectorAll('[data-bind]');
    this.elements.push(domElement);
    for (let i = 0, bind; bind = dataBinds[i]; i++) {
      bindData(this, bind, events);
    }
    bindEvent(this, domElement, events);
    return this;
  }

  static mix(mixin) {
    copyProperties(Observer, mixin);
    copyProperties(Observer.prototype, mixin.prototype);
    return Observer;
  }
}

function changeContent(property, value) {
  property.value = value;
  property.elements.forEach((element) => {
    let attr = element.nodeName === 'INPUT'? 'value': 'innerHTML';
    if (attr === 'innerHTML' && property.tpl) {
      element[attr] = property.tpl.render(value);
      for (let i = 0, element; element = property.elements[i]; i++) {
        bindEvent(property, element, property.events);
      };
    } else {
      element[attr] = value;
    }
  });
}

export class Property extends Observer {
  constructor (events) {
    super();
    this.events = events;
  }

  get() {
    return this.value;
  }

  set(value) {
    value.then?
      value.then((data) => changeContent(this, data)):
      changeContent(this, value);
    return this;
  }

  setTemplate(template) {
    this.tpl = new Template(template);
    return this;
  }
}
