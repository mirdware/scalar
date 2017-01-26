function observe(observer, fn) {
  observer.elements.forEach(fn);
  return observer;
}

function copyProperties(target, source) {
  for (let key of Reflect.ownKeys(source)) {
    if (key !== "constructor" && key !== "prototype" && key !== "name") {
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

  setAttribute(name, attr) {
    return observe(this, (element) => element[name] = attr);
  }

  addClass(ClassName) {
    return observe(this, (element) => element.classList.add(ClassName));
  }

  removeClass(ClassName) {
    return observe(this, (element) => element.classList.remove(ClassName));
  }

  toggleClass(ClassName) {
    return observe(this, (element) => element.classList.toggle(ClassName));
  }

  static mix(mixin) {
    copyProperties(Observer, mixin);
    copyProperties(Observer.prototype, mixin.prototype);
    return Observer;
  }
}

export class Property extends Observer {
  get() {
    return this.value;
  }

  set(value) {
    let property = this;
    if (value.then) {
      value.then((data) => property.set(data));
      return property;
    }
    property.value = value;
    property.elements.forEach((element) => {
        let attr = element.nodeName === 'INPUT'? 'value': 'innerHTML';
        if (attr === 'innerHTML' && property.tpl) {
          value = property.tpl.render(value)
        }
        element[attr] = value;
    });
    return property;
  }

  setTemplate(template) {
    this.tpl = template;
    return this;
  }
}
