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
    observer[prop] = new Observer();
  }
  observer[prop].addElement(domElement);
}

function observe(observer, fn) {
  observer.elements.forEach(fn);
  return observer;
}

export class Observer {
  constructor() {
    this.elements = [];
  }

  get() {
    return this.value;
  }

  set(value) {
    let observer = this;
    if (value.then) {
      value.then((data) => observer.set(data));
      return observer;
    }
    let template = observer.template;
    value = template? template.render(value): value;
    observer.elements.forEach((element) => element[element.nodeName === 'INPUT'? 'value': 'innerHTML'] = value);
    observer.value = value;
    return observer;
  }

  addElement(domElement) {
    let observer = this;
    let dataBinds = domElement.querySelectorAll('[data-bind]');
    observer.elements.push(domElement);
    for (let i = 0, bind; bind = dataBinds[i]; i++) {
      bindData(observer, bind);
    }
    return observer;
  }

  setTemplate(tpl) {
    let observer = this;
    observer.template = tpl;
    return observer;
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
