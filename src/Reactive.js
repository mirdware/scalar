import { Template } from './Template';

function copyProperties(target, source) {
  let keys = Reflect.ownKeys(source);
  for (let i = 0, key; key = keys[i]; i++) {
    if (key !== 'constructor' && key !== 'prototype' && key !== 'name') {
      let desc = Object.getOwnPropertyDescriptor(source, key);
      Object.defineProperty(target, key, desc);
    }
  }
}

function bindData(observer, domElement) {
  let prop = domElement.getAttribute("data-bind");
  if (!observer[prop]) {
    observer[prop] = new Property();
  }
  observer[prop].addElement(domElement);
}

export class Observer {
  constructor() {
    this.elements = [];
  }

  addElement(domElement) {
    let dataBinds = domElement.querySelectorAll('[data-bind]');
    this.elements.push(domElement);
    for (let i = 0, bind; bind = dataBinds[i]; i++) {
      bindData(this, bind);
    }
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
      value = property.tpl.render(value)
    }
    element[attr] = value;
  });
}

export class Property extends Observer {
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
